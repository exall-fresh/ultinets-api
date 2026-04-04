import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: "public/uploads" });

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });
  res.json(partners);
}));

router.post("/", handleAsync(async (req: AuthenticatedRequest, res) => {
  const data = req.body;
  const partner = await prisma.partner.create({
    data: {
      name: data.name,
      description: data.description || "",
      logo: data.logo || "",
      website: data.website || "",
      category: data.category || "",
      published: Boolean(data.published),
      order: Number(data.order || 0),
      createdById: req.user!.userId,
      updatedById: req.user!.userId,
    },
  });
  res.status(201).json(partner);
}));

router.put("/:id", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await prisma.partner.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      website: data.website,
      category: data.category,
      published: Boolean(data.published),
      order: Number(data.order || 0),
      updatedById: req.user!.userId,
    },
  });
  res.json(updated);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.partner.delete({ where: { id } });
  res.json({ message: "Deleted" });
}));

router.patch("/:id/publish", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const partner = await prisma.partner.update({
    where: { id },
    data: {
      published: Boolean(req.body.published),
      updatedById: req.user!.userId,
    },
  });
  res.json(partner);
}));

router.post("/:id/upload-logo", upload.single("logo"), handleAsync(async (req: any, res) => {
  const id = Number(req.params.id);
  if (!req.file) return res.status(400).json({ message: "Logo required" });
  const partner = await prisma.partner.update({
    where: { id },
    data: { logo: `/uploads/${req.file.filename}` },
  });
  res.json(partner);
}));

export default router;
