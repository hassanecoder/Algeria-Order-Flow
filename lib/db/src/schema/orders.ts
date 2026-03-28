import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerPhone2: text("customer_phone2"),
  wilaya: text("wilaya").notNull(),
  commune: text("commune").notNull(),
  address: text("address").notNull(),
  productName: text("product_name").notNull(),
  productId: integer("product_id"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  agentId: integer("agent_id"),
  customerId: integer("customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
