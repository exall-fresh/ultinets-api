import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const aboutSections = await prisma.aboutSection.findMany({ 
    where: { published: true },
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } }
    },
    orderBy: { order: "asc" } 
  });
  
  // Transform to a more convenient format
  const result = aboutSections.reduce((acc, section) => {
    acc[section.section] = {
      title: section.title,
      content: section.content,
      pillars: section.pillars,
      stats: section.stats
    };
    return acc;
  }, {} as Record<string, any>);
  
  res.json(result);
}));

router.get("/:section", handleAsync(async (req, res) => {
  const section = await prisma.aboutSection.findUnique({ 
    where: { section: String(req.params.section) },
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } }
    }
  });
  
  if (!section || !section.published) {
    return res.status(404).json({ message: "Section not found" });
  }
  
  res.json({
    title: section.title,
    content: section.content,
    pillars: section.pillars,
    stats: section.stats
  });
}));

export default router;