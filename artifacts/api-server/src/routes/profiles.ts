import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "./auth";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.user_id, userId)).limit(1);
    if (!profile) {
      const [created] = await db.insert(profilesTable).values({ user_id: userId }).returning();
      return res.json(created);
    }
    return res.json(profile);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  try {
    const { display_name, phone } = req.body;
    const patch: Partial<typeof profilesTable.$inferInsert> = { updated_at: new Date() };
    if (display_name !== undefined) patch.display_name = display_name;
    if (phone !== undefined) patch.phone = phone;
    const existing = await db.select().from(profilesTable).where(eq(profilesTable.user_id, userId)).limit(1);
    if (existing.length === 0) {
      const [created] = await db.insert(profilesTable).values({ user_id: userId, ...patch }).returning();
      return res.json(created);
    }
    const [updated] = await db.update(profilesTable).set(patch).where(eq(profilesTable.user_id, userId)).returning();
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
