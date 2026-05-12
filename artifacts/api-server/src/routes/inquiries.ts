import { Router } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { eq, desc, and, count, SQL } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

function isAdmin(req: Parameters<typeof getAuth>[0]) {
  const auth = getAuth(req);
  const meta = auth?.sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  return meta?.role === "admin";
}

/* ── POST /api/inquiries — public ── */
router.post("/inquiries", async (req, res) => {
  try {
    const { car_id, name, email, phone, message } = req.body;
    if (!car_id || !name || !email || !phone || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [inquiry] = await db
      .insert(inquiriesTable)
      .values({
        car_id: String(car_id),
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        message: String(message).trim(),
      })
      .returning();
    return res.status(201).json(inquiry);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /api/inquiries/stats — admin ── */
router.get("/inquiries/stats", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const [total] = await db.select({ count: count() }).from(inquiriesTable);
    const [newC] = await db.select({ count: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "new"));
    const [responded] = await db.select({ count: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "responded"));
    const [closed] = await db.select({ count: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "closed"));
    return res.json({
      total: Number(total?.count ?? 0),
      new: Number(newC?.count ?? 0),
      responded: Number(responded?.count ?? 0),
      closed: Number(closed?.count ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /api/inquiries — admin, filterable by car_id + status ── */
router.get("/inquiries", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const { car_id, status } = req.query as Record<string, string | undefined>;
    const conds: SQL[] = [];
    if (car_id) conds.push(eq(inquiriesTable.car_id, car_id));
    if (status) conds.push(eq(inquiriesTable.status, status));
    const rows = conds.length
      ? await db.select().from(inquiriesTable).where(and(...conds)).orderBy(desc(inquiriesTable.created_at))
      : await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.created_at));
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PATCH /api/inquiries/:id — admin ── */
router.patch("/inquiries/:id", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const { id } = req.params;
    const { status, admin_notes } = req.body as { status?: string; admin_notes?: string };
    const validStatuses = ["new", "responded", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const patch: Partial<{ status: string; admin_notes: string }> = {};
    if (status) patch.status = status;
    if (admin_notes !== undefined) patch.admin_notes = String(admin_notes);
    const [updated] = await db
      .update(inquiriesTable)
      .set(patch)
      .where(eq(inquiriesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
