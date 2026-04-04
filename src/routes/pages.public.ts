import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get(
  "/",
  handleAsync(async (req, res) => {
    const pages = await prisma.page.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
    res.json(pages);
  })
);

router.get(
  "/:slug",
  handleAsync(async (req, res) => {
    const page = await prisma.page.findUnique({ where: { slug: String(req.params.slug) } });
    if (!page || !page.published) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  })
);

export default router;
