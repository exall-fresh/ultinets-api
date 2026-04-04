import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Apply authentication middleware
router.use(requireAuth);
router.use(requireRole(['admin', 'editor']));

// Get all about sections (including unpublished)
router.get("/", handleAsync(async (req, res) => {
  const aboutSections = await prisma.aboutSection.findMany({
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } },
      createdBy: { select: { firstName: true, lastName: true } },
      updatedBy: { select: { firstName: true, lastName: true } }
    },
    orderBy: { order: "asc" } 
  });
  res.json(aboutSections);
}));

// Get single about section
router.get("/:id", handleAsync(async (req, res) => {
  const section = await prisma.aboutSection.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } }
    }
  });
  
  if (!section) {
    return res.status(404).json({ message: "About section not found" });
  }
  
  res.json(section);
}));

// Create about section
router.post("/", handleAsync(async (req, res) => {
  const { section, title, content, published, order, pillars, stats } = req.body;
  const userId = req.user.id;

  const aboutSection = await prisma.aboutSection.create({
    data: {
      section,
      title,
      content,
      published: published || false,
      order: order || 0,
      createdById: userId,
      updatedById: userId,
      pillars: pillars ? {
        create: pillars.map((pillar: any, index: number) => ({
          title: pillar.title,
          description: pillar.description,
          icon: pillar.icon,
          order: pillar.order || index
        }))
      } : undefined,
      stats: stats ? {
        create: stats.map((stat: any, index: number) => ({
          label: stat.label,
          value: stat.value,
          icon: stat.icon,
          order: stat.order || index
        }))
      } : undefined
    },
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } }
    }
  });

  res.status(201).json(aboutSection);
}));

// Update about section
router.put("/:id", handleAsync(async (req, res) => {
  const { section, title, content, published, order, pillars, stats } = req.body;
  const userId = req.user.id;
  const sectionId = parseInt(req.params.id);

  // Delete existing pillars and stats
  await prisma.aboutPillar.deleteMany({ where: { sectionId } });
  await prisma.aboutStat.deleteMany({ where: { sectionId } });

  const aboutSection = await prisma.aboutSection.update({
    where: { id: sectionId },
    data: {
      section,
      title,
      content,
      published,
      order,
      updatedById: userId,
      pillars: pillars ? {
        create: pillars.map((pillar: any, index: number) => ({
          title: pillar.title,
          description: pillar.description,
          icon: pillar.icon,
          order: pillar.order || index
        }))
      } : undefined,
      stats: stats ? {
        create: stats.map((stat: any, index: number) => ({
          label: stat.label,
          value: stat.value,
          icon: stat.icon,
          order: stat.order || index
        }))
      } : undefined
    },
    include: { 
      pillars: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } }
    }
  });

  res.json(aboutSection);
}));

// Delete about section
router.delete("/:id", handleAsync(async (req, res) => {
  const sectionId = parseInt(req.params.id);

  await prisma.aboutSection.delete({
    where: { id: sectionId }
  });

  res.json({ message: "About section deleted successfully" });
}));

export default router;