import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

async function ensureSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(settingsTable).values({
      companyName: "Mon Entreprise",
      companyPhone: "0550000000",
      defaultShippingCost: "500",
      currency: "DZD",
      lowStockThreshold: 10,
      autoConfirmOrders: false,
    });
    return (await db.select().from(settingsTable).limit(1))[0];
  }
  return existing[0];
}

router.get("/", async (_req, res) => {
  const settings = await ensureSettings();
  res.json({
    ...settings,
    defaultShippingCost: Number(settings.defaultShippingCost),
  });
});

router.put("/", async (req, res) => {
  const body = req.body;
  await ensureSettings();
  const [updated] = await db.update(settingsTable).set({
    companyName: body.companyName,
    companyPhone: body.companyPhone,
    defaultShippingCost: String(body.defaultShippingCost),
    currency: body.currency,
    lowStockThreshold: body.lowStockThreshold,
    autoConfirmOrders: body.autoConfirmOrders,
  }).returning();

  res.json({
    ...updated,
    defaultShippingCost: Number(updated.defaultShippingCost),
  });
});

export default router;
