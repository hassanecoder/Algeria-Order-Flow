import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { eq, like, and, gte, lte, sql, or } from "drizzle-orm";
import { agentsTable } from "@workspace/db/schema";

const router: IRouter = Router();

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CMD-${year}${month}${day}-${rand}`;
}

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  let agentName: string | null = null;
  if (order.agentId) {
    const agent = await db.query.agentsTable.findFirst({ where: eq(agentsTable.id, order.agentId) });
    agentName = agent?.name ?? null;
  }
  return {
    ...order,
    unitPrice: Number(order.unitPrice),
    totalAmount: Number(order.totalAmount),
    shippingCost: Number(order.shippingCost),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    agentName,
  };
}

router.get("/", async (req, res) => {
  const { status, wilaya, agentId, search, dateFrom, dateTo, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offset = (pageNum - 1) * limitNum;

  const conditions: ReturnType<typeof eq>[] = [];

  if (status) conditions.push(eq(ordersTable.status, status));
  if (wilaya) conditions.push(eq(ordersTable.wilaya, wilaya));
  if (agentId) conditions.push(eq(ordersTable.agentId, parseInt(agentId)));
  if (dateFrom) conditions.push(gte(ordersTable.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(ordersTable.createdAt, new Date(dateTo)));

  let query = db.select().from(ordersTable);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(ordersTable);

  if (search) {
    const searchCondition = or(
      like(ordersTable.customerName, `%${search}%`),
      like(ordersTable.customerPhone, `%${search}%`),
      like(ordersTable.orderNumber, `%${search}%`),
      like(ordersTable.productName, `%${search}%`)
    )!;
    conditions.push(searchCondition as ReturnType<typeof eq>);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, countResult] = await Promise.all([
    whereClause
      ? query.where(whereClause).orderBy(sql`${ordersTable.createdAt} DESC`).limit(limitNum).offset(offset)
      : query.orderBy(sql`${ordersTable.createdAt} DESC`).limit(limitNum).offset(offset),
    whereClause
      ? countQuery.where(whereClause)
      : countQuery,
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const enriched = await Promise.all(orders.map(enrichOrder));

  res.json({
    orders: enriched,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/", async (req, res) => {
  const body = req.body;
  const totalAmount = (body.quantity * body.unitPrice) + body.shippingCost;
  const orderNumber = generateOrderNumber();

  const [order] = await db.insert(ordersTable).values({
    orderNumber,
    status: "pending",
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerPhone2: body.customerPhone2 ?? null,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    productName: body.productName,
    productId: body.productId ?? null,
    quantity: body.quantity,
    unitPrice: String(body.unitPrice),
    totalAmount: String(totalAmount),
    shippingCost: String(body.shippingCost),
    notes: body.notes ?? null,
    agentId: body.agentId ?? null,
    customerId: body.customerId ?? null,
  }).returning();

  const enriched = await enrichOrder(order);
  res.status(201).json(enriched);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await db.query.ordersTable.findFirst({ where: eq(ordersTable.id, id) });
  if (!order) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichOrder(order);
  res.json(enriched);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const totalAmount = (body.quantity * body.unitPrice) + body.shippingCost;

  const [updated] = await db.update(ordersTable).set({
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerPhone2: body.customerPhone2 ?? null,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    productName: body.productName,
    productId: body.productId ?? null,
    quantity: body.quantity,
    unitPrice: String(body.unitPrice),
    totalAmount: String(totalAmount),
    shippingCost: String(body.shippingCost),
    notes: body.notes ?? null,
    agentId: body.agentId ?? null,
    updatedAt: new Date(),
  }).where(eq(ordersTable.id, id)).returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichOrder(updated);
  res.json(enriched);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(ordersTable).where(eq(ordersTable.id, id));
  res.status(204).send();
});

router.patch("/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, notes } = req.body;

  const updateData: Partial<typeof ordersTable.$inferInsert> & { updatedAt?: Date; deliveredAt?: Date | null } = {
    status,
    updatedAt: new Date(),
  };

  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  }

  if (notes) {
    updateData.notes = notes;
  }

  const [updated] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichOrder(updated);
  res.json(enriched);
});

export default router;
