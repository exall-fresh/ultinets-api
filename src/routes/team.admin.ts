import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: "public/uploads" });

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  res.json(members);
}));

router.post("/", handleAsync(async (req: AuthenticatedRequest, res) => {
  const data = req.body;
  const member = await prisma.teamMember.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      position: data.position,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      imageUrl: data.imageUrl || "",
      socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : null,
      published: Boolean(data.published),
      order: Number(data.order || 0),
      createdById: req.user!.userId,
      updatedById: req.user!.userId,
    },
  });
  res.status(201).json(member);
}));

router.put("/:id", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      position: data.position,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      imageUrl: data.imageUrl,
      socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : null,
      published: Boolean(data.published),
      order: Number(data.order || 0),
      updatedById: req.user!.userId,
    },
  });
  res.json(updated);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.teamMember.delete({ where: { id } });
  res.json({ message: "Deleted" });
}));

router.post("/:id/upload-photo", upload.single("photo"), handleAsync(async (req: any, res) => {
  const id = Number(req.params.id);
  if (!req.file) return res.status(400).json({ message: "Photo required" });
  const member = await prisma.teamMember.update({
    where: { id },
    data: { imageUrl: `/uploads/${req.file.filename}` },
  });
  res.json(member);
}));

export default router;
