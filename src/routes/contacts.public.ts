import { Router } from "express";
import prisma from "../prisma";
import { handleAsync } from "./utils";

const router = Router();

router.post("/", handleAsync(async (req, res) => {
  const data = req.body;
  const created = await prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      service: data.service,
      status: "new",
      captchaToken: data.captchaToken,
    },
  });
  res.status(201).json(created);
}));

export default router;
