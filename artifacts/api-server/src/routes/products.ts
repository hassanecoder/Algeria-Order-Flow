import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    defaultPrice: Number(p.defaultPrice),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(sql`${productsTable.createdAt} DESC`);
  res.json({ products: products.map(formatProduct), total: products.length });
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    sku: body.sku ?? null,
    defaultPrice: String(body.defaultPrice),
    stock: body.stock ?? null,
    category: body.category ?? null,
    description: body.description ?? null,
    active: body.active ?? true,
  }).returning();

  res.status(201).json(formatProduct(product));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const [updated] = await db.update(productsTable).set({
    name: body.name,
    sku: body.sku ?? null,
    defaultPrice: String(body.defaultPrice),
    stock: body.stock ?? null,
    category: body.category ?? null,
    description: body.description ?? null,
    active: body.active ?? true,
    updatedAt: new Date(),
  }).where(eq(productsTable.id, id)).returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(formatProduct(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
