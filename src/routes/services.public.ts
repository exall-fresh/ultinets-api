import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const services = await prisma.service.findMany({ 
    where: { published: true }, 
    include: { details: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" } 
  });
  res.json(services);
}));

// New endpoint for grouped services
router.get("/grouped", handleAsync(async (req, res) => {
  const services = await prisma.service.findMany({ 
    where: { published: true }, 
    include: { details: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" } 
  });
  
  // Group services by category
  const grouped = services.reduce((acc, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);
  
  res.json(grouped);
}));

router.get("/:slug", handleAsync(async (req, res) => {
  const service = await prisma.service.findUnique({ 
    where: { slug: String(req.params.slug) },
    include: { details: { orderBy: { order: "asc" } } }
  });
  if (!service || !service.published) return res.status(404).json({ message: "Service not found" });
  res.json(service);
}));

export default router;
