import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/", handleAsync(async (req, res) => {
  const logs = await prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 200 });
  res.json(logs);
}));

export default router;
