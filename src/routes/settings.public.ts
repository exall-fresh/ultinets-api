import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.get("/", handleAsync(async (req, res) => {
  const settings = await prisma.setting.findMany();
  const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  res.json(result);
}));

export default router;
