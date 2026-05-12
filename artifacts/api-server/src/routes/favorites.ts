import { Router } from "express";
import { db, favoritesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getClerkUserId, type AuthedRequest } from "./auth";

const router = Router();

router.get("/favorites", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
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

router.post("/favorites/:carId", requireAuth, async (req, res) => {
  const carId = String(req.params.carId);
  const userId = (req as AuthedRequest).userId;
  try {
    await db.insert(favoritesTable).values({ user_id: userId, car_id: carId }).onConflictDoNothing();
    return res.status(201).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/favorites/:carId", requireAuth, async (req, res) => {
  const carId = String(req.params.carId);
  const userId = (req as AuthedRequest).userId;
  try {
    await db.delete(favoritesTable)
      .where(and(eq(favoritesTable.user_id, userId), eq(favoritesTable.car_id, carId)));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
