import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: "public/uploads" });

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  res.json(services);
}));

router.get("/:id", handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json(service);
}));

router.post("/", handleAsync(async (req: AuthenticatedRequest, res) => {
  const data = req.body;
  const service = await prisma.service.create({
    data: {
      slug: data.slug,
      serviceName: data.serviceName,
      description: data.description || "",
      fullDescription: data.fullDescription || "",
      icon: data.icon || "",
      imageUrl: data.imageUrl || "",
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      published: Boolean(data.published),
      publishedAt: data.published ? new Date() : null,
      order: Number(data.order || 0),
      createdById: req.user!.userId,
      updatedById: req.user!.userId,
    },
  });
  res.status(201).json(service);
}));

router.put("/:id", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await prisma.service.update({
    where: { id },
    data: {
      slug: data.slug,
      serviceName: data.serviceName,
      description: data.description,
      fullDescription: data.fullDescription,
      icon: data.icon,
      imageUrl: data.imageUrl,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      published: Boolean(data.published),
      publishedAt: data.published ? new Date() : null,
      order: Number(data.order || 0),
      updatedById: req.user!.userId,
    },
  });
  res.json(updated);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.service.delete({ where: { id } });
  res.json({ message: "Deleted" });
}));

router.patch("/:id/publish", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const service = await prisma.service.update({
    where: { id },
    data: {
      published: Boolean(req.body.published),
      publishedAt: req.body.published ? new Date() : null,
      updatedById: req.user!.userId,
    },
  });
  res.json(service);
}));

router.post("/:id/upload-image", upload.single("image"), handleAsync(async (req: any, res) => {
  const id = Number(req.params.id);
  if (!req.file) return res.status(400).json({ message: "Image required" });
  const service = await prisma.service.update({
    where: { id },
    data: { imageUrl: `/uploads/${req.file.filename}` },
  });
  res.json(service);
}));

export default router;
