import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(pages);
}));

router.get("/:id", handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return res.status(404).json({ message: "Page not found" });
  res.json(page);
}));

router.post("/", handleAsync(async (req: AuthenticatedRequest, res) => {
  const data = req.body;
  const page = await prisma.page.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description || "",
      content: data.content || "",
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      published: Boolean(data.published),
      publishedAt: data.published ? new Date() : null,
      createdById: req.user!.userId,
      updatedById: req.user!.userId,
    },
  });
  res.status(201).json(page);
}));

router.put("/:id", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Page not found" });
  const updated = await prisma.page.update({
    where: { id },
    data: {
      slug: data.slug || existing.slug,
      title: data.title || existing.title,
      description: data.description ?? existing.description,
      content: data.content ?? existing.content,
      metaTitle: data.metaTitle ?? existing.metaTitle,
      metaDescription: data.metaDescription ?? existing.metaDescription,
      published: typeof data.published === "boolean" ? data.published : existing.published,
      publishedAt: data.published ? new Date() : existing.publishedAt,
      updatedById: req.user!.userId,
    },
  });
  res.json(updated);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.page.delete({ where: { id } });
  res.json({ message: "Deleted" });
}));

router.patch("/:id/publish", handleAsync(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return res.status(404).json({ message: "Page not found" });
  const published = Boolean(req.body.published);
  const updated = await prisma.page.update({
    where: { id },
    data: {
      published,
      publishedAt: published ? new Date() : null,
      updatedById: req.user!.userId,
    },
  });
  res.json(updated);
}));

export default router;
