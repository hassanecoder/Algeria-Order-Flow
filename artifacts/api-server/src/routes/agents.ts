import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { agentsTable, ordersTable } from "@workspace/db/schema";
import { eq, like, and, sql, or } from "drizzle-orm";

const router: IRouter = Router();

async function enrichAgent(agent: typeof agentsTable.$inferSelect) {
  const stats = await db
    .select({
      totalDeliveries: sql<number>`sum(case when status = 'delivered' then 1 else 0 end)`,
      totalOrders: sql<number>`count(*)`,
      currentOrders: sql<number>`sum(case when status in ('confirmed', 'in_transit') then 1 else 0 end)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.agentId, agent.id));

  const s = stats[0];
  const totalDeliveries = Number(s?.totalDeliveries ?? 0);
  const totalOrders = Number(s?.totalOrders ?? 0);
  const successRate = totalOrders > 0 ? Math.round((totalDeliveries / totalOrders) * 100) : 0;

  return {
    ...agent,
    totalDeliveries,
    successRate,
    currentOrders: Number(s?.currentOrders ?? 0),
    createdAt: agent.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search, status } = req.query as Record<string, string>;
  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(agentsTable.status, status));
  if (search) {
    conditions.push(or(
      like(agentsTable.name, `%${search}%`),
      like(agentsTable.phone, `%${search}%`)
    ) as ReturnType<typeof eq>);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const agents = whereClause
    ? await db.select().from(agentsTable).where(whereClause).orderBy(sql`${agentsTable.createdAt} DESC`)
    : await db.select().from(agentsTable).orderBy(sql`${agentsTable.createdAt} DESC`);

  const enriched = await Promise.all(agents.map(enrichAgent));
  res.json({ agents: enriched, total: enriched.length });
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [agent] = await db.insert(agentsTable).values({
    name: body.name,
    phone: body.phone,
    wilaya: body.wilaya,
    status: body.status,
    notes: body.notes ?? null,
  }).returning();

  const enriched = await enrichAgent(agent);
  res.status(201).json(enriched);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const agent = await db.query.agentsTable.findFirst({ where: eq(agentsTable.id, id) });
  if (!agent) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichAgent(agent);
  res.json(enriched);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const [updated] = await db.update(agentsTable).set({
    name: body.name,
    phone: body.phone,
    wilaya: body.wilaya,
    status: body.status,
    notes: body.notes ?? null,
    updatedAt: new Date(),
  }).where(eq(agentsTable.id, id)).returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichAgent(updated);
  res.json(enriched);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(agentsTable).where(eq(agentsTable.id, id));
  res.status(204).send();
});

export default router;
