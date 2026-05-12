import { Router } from "express";
import { db, favoritesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUserIdFromReq } from "./auth";

const router = Router();

router.get("/favorites", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const rows = await db.select({ car_id: favoritesTable.car_id })
      .from(favoritesTable)
      .where(eq(favoritesTable.user_id, userId));
    return res.json(rows.map(r => r.car_id));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/favorites/:carId", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    await db.insert(favoritesTable).values({ user_id: userId, car_id: req.params.carId }).onConflictDoNothing();
    return res.status(201).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/favorites/:carId", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    await db.delete(favoritesTable)
      .where(and(eq(favoritesTable.user_id, userId), eq(favoritesTable.car_id, req.params.carId)));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
