import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carsTable = pgTable("cars", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull().default(0),
  color: text("color").notNull(),
  body_type: text("body_type").notNull(),
  condition: text("condition").notNull().default("used"),
  status: text("status").notNull().default("for_sale"),
  description: text("description"),
  features: text("features").array(),
  images: text("images").array(),
  added_by: text("added_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCarSchema = createInsertSchema(carsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof carsTable.$inferSelect;
