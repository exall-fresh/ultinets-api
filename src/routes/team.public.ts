import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const members = await prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  res.json(members);
}));

export default router;
