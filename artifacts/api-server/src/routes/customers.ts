import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable, ordersTable } from "@workspace/db/schema";
import { eq, like, and, sql, or } from "drizzle-orm";

const router: IRouter = Router();

async function enrichCustomer(customer: typeof customersTable.$inferSelect) {
  const stats = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      deliveredOrders: sql<number>`sum(case when status = 'delivered' then 1 else 0 end)`,
      returnedOrders: sql<number>`sum(case when status = 'returned' then 1 else 0 end)`,
      totalSpent: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.customerId, customer.id));

  const s = stats[0];
  return {
    ...customer,
    totalOrders: Number(s?.totalOrders ?? 0),
    deliveredOrders: Number(s?.deliveredOrders ?? 0),
    returnedOrders: Number(s?.returnedOrders ?? 0),
    totalSpent: Number(s?.totalSpent ?? 0),
    createdAt: customer.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search, wilaya, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offset = (pageNum - 1) * limitNum;

  const conditions: ReturnType<typeof eq>[] = [];
  if (wilaya) conditions.push(eq(customersTable.wilaya, wilaya));
  if (search) {
    conditions.push(or(
      like(customersTable.name, `%${search}%`),
      like(customersTable.phone, `%${search}%`)
    ) as ReturnType<typeof eq>);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [customers, countResult] = await Promise.all([
    whereClause
      ? db.select().from(customersTable).where(whereClause).orderBy(sql`${customersTable.createdAt} DESC`).limit(limitNum).offset(offset)
      : db.select().from(customersTable).orderBy(sql`${customersTable.createdAt} DESC`).limit(limitNum).offset(offset),
    whereClause
      ? db.select({ count: sql<number>`count(*)` }).from(customersTable).where(whereClause)
      : db.select({ count: sql<number>`count(*)` }).from(customersTable),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const enriched = await Promise.all(customers.map(enrichCustomer));

  res.json({
    customers: enriched,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [customer] = await db.insert(customersTable).values({
    name: body.name,
    phone: body.phone,
    phone2: body.phone2 ?? null,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    notes: body.notes ?? null,
  }).returning();

  const enriched = await enrichCustomer(customer);
  res.status(201).json(enriched);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const customer = await db.query.customersTable.findFirst({ where: eq(customersTable.id, id) });
  if (!customer) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichCustomer(customer);
  res.json(enriched);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const [updated] = await db.update(customersTable).set({
    name: body.name,
    phone: body.phone,
    phone2: body.phone2 ?? null,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    notes: body.notes ?? null,
    updatedAt: new Date(),
  }).where(eq(customersTable.id, id)).returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichCustomer(updated);
  res.json(enriched);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.status(204).send();
});

export default router;
