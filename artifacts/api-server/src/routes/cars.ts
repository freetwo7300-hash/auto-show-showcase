import { Router } from "express";
import { db, carsTable } from "@workspace/db";
import { eq, desc, and, gte, lte, SQL, count, avg } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "./auth";

const router = Router();

router.get("/cars/stats", async (req, res) => {
  try {
    const [total] = await db.select({ count: count() }).from(carsTable);
    const [forSale] = await db.select({ count: count() }).from(carsTable).where(eq(carsTable.status, "متاح"));
    const [sold] = await db.select({ count: count() }).from(carsTable).where(eq(carsTable.status, "مباع"));
    const brands = await db.selectDistinct({ brand: carsTable.brand }).from(carsTable);
    const [avgPriceRow] = await db.select({ avg: avg(carsTable.price) }).from(carsTable);
    return res.json({
      total: Number(total?.count ?? 0),
      for_sale: Number(forSale?.count ?? 0),
      sold: Number(sold?.count ?? 0),
      brands_count: brands.length,
      avg_price: Math.round(Number(avgPriceRow?.avg ?? 0)),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars", async (req, res) => {
  try {
    const { brand, body_type, condition, status, min_price, max_price, min_year, max_year } = req.query as Record<string, string>;
    const conditions: SQL[] = [];
    if (brand) conditions.push(eq(carsTable.brand, brand));
    if (body_type) conditions.push(eq(carsTable.body_type, body_type));
    if (condition) conditions.push(eq(carsTable.condition, condition));
    if (status) conditions.push(eq(carsTable.status, status));
    if (min_price) conditions.push(gte(carsTable.price, parseInt(min_price)));
    if (max_price) conditions.push(lte(carsTable.price, parseInt(max_price)));
    if (min_year) conditions.push(gte(carsTable.year, parseInt(min_year)));
    if (max_year) conditions.push(lte(carsTable.year, parseInt(max_year)));

    const cars = conditions.length
      ? await db.select().from(carsTable).where(and(...conditions)).orderBy(desc(carsTable.created_at))
      : await db.select().from(carsTable).orderBy(desc(carsTable.created_at));

    return res.json(cars);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cars", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  try {
    const { brand, model, year, price, mileage, color, body_type, condition, status, description, features, images } = req.body;
    const [car] = await db.insert(carsTable).values({
      brand, model, year, price, mileage: mileage ?? 0, color, body_type,
      condition: condition ?? "مستعمل",
      status: status ?? "متاح",
      description: description ?? null,
      features: features ?? null,
      images: images ?? null,
      added_by: userId,
    }).returning();
    return res.status(201).json(car);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/:id", async (req, res) => {
  const id = String(req.params.id);
  try {
    const [car] = await db.select().from(carsTable).where(eq(carsTable.id, id)).limit(1);
    if (!car) return res.status(404).json({ error: "Car not found" });
    return res.json(car);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/cars/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const userId = (req as AuthedRequest).userId;
  try {
    const [existing] = await db.select().from(carsTable).where(eq(carsTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Car not found" });
    if (existing.added_by && existing.added_by !== userId) return res.status(403).json({ error: "Forbidden" });

    const { brand, model, year, price, mileage, color, body_type, condition, status, description, features, images } = req.body;
    const patch: Partial<typeof carsTable.$inferInsert> = {};
    if (brand !== undefined) patch.brand = brand;
    if (model !== undefined) patch.model = model;
    if (year !== undefined) patch.year = year;
    if (price !== undefined) patch.price = price;
    if (mileage !== undefined) patch.mileage = mileage;
    if (color !== undefined) patch.color = color;
    if (body_type !== undefined) patch.body_type = body_type;
    if (condition !== undefined) patch.condition = condition;
    if (status !== undefined) patch.status = status;
    if (description !== undefined) patch.description = description;
    if (features !== undefined) patch.features = features;
    if (images !== undefined) patch.images = images;
    patch.updated_at = new Date();

    const [updated] = await db.update(carsTable).set(patch).where(eq(carsTable.id, id)).returning();
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cars/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const userId = (req as AuthedRequest).userId;
  try {
    const [existing] = await db.select().from(carsTable).where(eq(carsTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Car not found" });
    if (existing.added_by && existing.added_by !== userId) return res.status(403).json({ error: "Forbidden" });
    await db.delete(carsTable).where(eq(carsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
