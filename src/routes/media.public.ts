import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const files = await prisma.media.findMany({ orderBy: { uploadedAt: "desc" } });
  res.json(files);
}));

export default router;
