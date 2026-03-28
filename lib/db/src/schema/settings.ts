import { pgTable, serial, text, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Mon Entreprise"),
  companyPhone: text("company_phone").notNull().default("0550000000"),
  defaultShippingCost: numeric("default_shipping_cost", { precision: 10, scale: 2 }).notNull().default("500"),
  currency: text("currency").notNull().default("DZD"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  autoConfirmOrders: boolean("auto_confirm_orders").notNull().default(false),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
