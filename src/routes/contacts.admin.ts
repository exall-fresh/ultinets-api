import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const items = await prisma.contactSubmission.findMany({ orderBy: { submittedAt: "desc" } });
  res.json(items);
}));

router.get("/:id", handleAsync(async (req, res) => {
  const item = await prisma.contactSubmission.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
}));

router.patch("/:id/status", handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  const updated = await prisma.contactSubmission.update({
    where: { id },
    data: { status: req.body.status },
  });
  res.json(updated);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  await prisma.contactSubmission.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Deleted" });
}));

export default router;
