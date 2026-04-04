import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/", handleAsync(async (req, res) => {
  const settings = await prisma.setting.findMany();
  res.json(settings);
}));

router.put("/:key", handleAsync(async (req: AuthenticatedRequest, res) => {
  const key = req.params.key;
  const value = String(req.body.value);
  const type = req.body.type || "string";
  const userId = req.user!.userId;
  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) {
    const updated = await prisma.setting.update({
      where: { key },
      data: { value, type, updatedById: userId },
    });
    return res.json(updated);
  }
  const created = await prisma.setting.create({
    data: { key, value, type, updatedById: userId },
  });
  res.status(201).json(created);
}));

export default router;
