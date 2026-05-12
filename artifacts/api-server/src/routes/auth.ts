import { Router } from "express";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "salt_car_market").digest("hex");
}

function makeToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

function parseToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] ?? null;
  } catch {
    return null;
  }
}

export function getUserIdFromReq(req: any): string | null {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth?.startsWith("Bearer ")) return null;
  return parseToken(auth.slice(7));
}

router.post("/auth/register", async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) return res.status(400).json({ error: "Email already registered" });

    const [user] = await db.insert(usersTable).values({
      email,
      password_hash: hashPassword(password),
      display_name: display_name ?? null,
    }).returning();

    await db.insert(profilesTable).values({
      user_id: user.id,
      display_name: display_name ?? null,
    });

    const token = makeToken(user.id);
    return res.status(201).json({
      user: { id: user.id, email: user.email, display_name: user.display_name },
      token,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = makeToken(user.id);
    return res.json({
      user: { id: user.id, email: user.email, display_name: user.display_name },
      token,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.status(204).send();
});

router.get("/auth/me", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.json({ id: user.id, email: user.email, display_name: user.display_name });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
