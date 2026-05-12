import { Router } from "express";
import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  userId: string;
}

const router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

export function getClerkUserId(req: Request): string | null {
  return getAuth(req)?.userId ?? null;
}

router.get("/auth/me", (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ id: auth.userId });
});

export default router;
