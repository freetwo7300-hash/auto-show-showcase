import { Router } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

router.post("/inquiries", async (req, res) => {
  try {
    const { car_id, name, email, phone, message } = req.body;
    if (!car_id || !name || !email || !phone || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [inquiry] = await db.insert(inquiriesTable).values({
      car_id: String(car_id),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
    }).returning();
    return res.status(201).json(inquiry);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/inquiries", async (req, res) => {
  try {
    const auth = getAuth(req);
    const role = (auth?.sessionClaims?.publicMetadata as Record<string, unknown>)?.role;
    if (role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const carId = req.query.car_id ? String(req.query.car_id) : undefined;
    const rows = carId
      ? await db.select().from(inquiriesTable).where(eq(inquiriesTable.car_id, carId)).orderBy(desc(inquiriesTable.created_at))
      : await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.created_at));
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
