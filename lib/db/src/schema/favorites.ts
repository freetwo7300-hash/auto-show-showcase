import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const favoritesTable = pgTable("favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull(),
  car_id: text("car_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.user_id, t.car_id)]);

export const insertFavoriteSchema = createInsertSchema(favoritesTable).omit({ id: true, created_at: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;
