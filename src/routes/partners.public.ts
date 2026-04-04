import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const partners = await prisma.partner.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  res.json(partners);
}));

export default router;
