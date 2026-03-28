import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { gte, lte, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/summary", async (req, res) => {
  const { dateFrom, dateTo } = req.query as Record<string, string>;
  const conditions: ReturnType<typeof gte>[] = [];
  if (dateFrom) conditions.push(gte(ordersTable.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(ordersTable.createdAt, new Date(dateTo)));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [summary, todayStats] = await Promise.all([
    whereClause
      ? db.select({
          totalOrders: sql<number>`count(*)`,
          pendingOrders: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
          confirmedOrders: sql<number>`sum(case when status = 'confirmed' then 1 else 0 end)`,
          inTransitOrders: sql<number>`sum(case when status = 'in_transit' then 1 else 0 end)`,
          deliveredOrders: sql<number>`sum(case when status = 'delivered' then 1 else 0 end)`,
          returnedOrders: sql<number>`sum(case when status = 'returned' then 1 else 0 end)`,
          cancelledOrders: sql<number>`sum(case when status = 'cancelled' then 1 else 0 end)`,
          totalRevenue: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
          avgOrderValue: sql<number>`avg(case when status = 'delivered' then total_amount::numeric else null end)`,
        }).from(ordersTable).where(whereClause)
      : db.select({
          totalOrders: sql<number>`count(*)`,
          pendingOrders: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
          confirmedOrders: sql<number>`sum(case when status = 'confirmed' then 1 else 0 end)`,
          inTransitOrders: sql<number>`sum(case when status = 'in_transit' then 1 else 0 end)`,
          deliveredOrders: sql<number>`sum(case when status = 'delivered' then 1 else 0 end)`,
          returnedOrders: sql<number>`sum(case when status = 'returned' then 1 else 0 end)`,
          cancelledOrders: sql<number>`sum(case when status = 'cancelled' then 1 else 0 end)`,
          totalRevenue: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
          avgOrderValue: sql<number>`avg(case when status = 'delivered' then total_amount::numeric else null end)`,
        }).from(ordersTable),
    db.select({
      todayOrders: sql<number>`count(*)`,
      todayRevenue: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
    }).from(ordersTable).where(gte(ordersTable.createdAt, today)),
  ]);

  const s = summary[0];
  const t = todayStats[0];
  const total = Number(s?.totalOrders ?? 0);
  const delivered = Number(s?.deliveredOrders ?? 0);
  const returned = Number(s?.returnedOrders ?? 0);

  res.json({
    totalOrders: total,
    pendingOrders: Number(s?.pendingOrders ?? 0),
    confirmedOrders: Number(s?.confirmedOrders ?? 0),
    inTransitOrders: Number(s?.inTransitOrders ?? 0),
    deliveredOrders: delivered,
    returnedOrders: returned,
    cancelledOrders: Number(s?.cancelledOrders ?? 0),
    totalRevenue: Number(s?.totalRevenue ?? 0),
    deliveryRate: total > 0 ? Math.round((delivered / total) * 100 * 10) / 10 : 0,
    returnRate: total > 0 ? Math.round((returned / total) * 100 * 10) / 10 : 0,
    avgOrderValue: Number(s?.avgOrderValue ?? 0),
    todayOrders: Number(t?.todayOrders ?? 0),
    todayRevenue: Number(t?.todayRevenue ?? 0),
  });
});

router.get("/by-wilaya", async (_req, res) => {
  const stats = await db
    .select({
      wilaya: ordersTable.wilaya,
      totalOrders: sql<number>`count(*)`,
      deliveredOrders: sql<number>`sum(case when status = 'delivered' then 1 else 0 end)`,
      revenue: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.wilaya)
    .orderBy(sql`count(*) DESC`);

  res.json(stats.map(s => ({
    wilaya: s.wilaya,
    totalOrders: Number(s.totalOrders),
    deliveredOrders: Number(s.deliveredOrders),
    revenue: Number(s.revenue),
  })));
});

router.get("/by-status", async (_req, res) => {
  const stats = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const total = stats.reduce((sum, s) => sum + Number(s.count), 0);

  res.json(stats.map(s => ({
    status: s.status,
    count: Number(s.count),
    percentage: total > 0 ? Math.round((Number(s.count) / total) * 100 * 10) / 10 : 0,
  })));
});

router.get("/revenue-trend", async (req, res) => {
  const days = parseInt((req.query.days as string) ?? "30") || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const trend = await db
    .select({
      date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
      revenue: sql<number>`sum(case when status = 'delivered' then total_amount::numeric else 0 end)`,
      orders: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM-DD') ASC`);

  res.json(trend.map(t => ({
    date: t.date,
    revenue: Number(t.revenue),
    orders: Number(t.orders),
  })));
});

export default router;
