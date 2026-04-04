import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const services = await prisma.service.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  res.json(services);
}));

router.get("/:slug", handleAsync(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { slug: String(req.params.slug) } });
  if (!service || !service.published) return res.status(404).json({ message: "Service not found" });
  res.json(service);
}));

export default router;
