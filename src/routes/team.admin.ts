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

  // Handle socialLinks - could be string or object
  let socialLinks = null;
  if (data.socialLinks) {
    if (typeof data.socialLinks === "string") {
      socialLinks = JSON.parse(data.socialLinks);
    } else {
      socialLinks = data.socialLinks;
    }
  }

  const member = await prisma.teamMember.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      position: data.position,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      imageUrl: data.imageUrl || "",
      socialLinks,
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

  // Handle socialLinks - could be string or object
  let socialLinks = null;
  if (data.socialLinks) {
    if (typeof data.socialLinks === "string") {
      socialLinks = JSON.parse(data.socialLinks);
    } else {
      socialLinks = data.socialLinks;
    }
  }

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
      socialLinks,
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

router.patch("/:id/publish", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      published: Boolean(req.body.published),
      updatedById: req.user!.userId,
    },
  });
  res.json(member);
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
