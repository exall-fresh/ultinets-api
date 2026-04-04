import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth, requireRole(["admin", "editor"]));

router.get("/", handleAsync(async (req, res) => {
  const files = await prisma.media.findMany({ orderBy: { uploadedAt: "desc" } });
  res.json(files);
}));

router.delete("/:id", requireRole(["admin"]), handleAsync(async (req, res) => {
  const item = await prisma.media.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) return res.status(404).json({ message: "Not found" });
  const filePath = path.join(process.cwd(), UPLOAD_DIR, path.basename(item.url));
  try { fs.unlinkSync(filePath); } catch (_) {}
  await prisma.media.delete({ where: { id: item.id } });
  res.json({ message: "Deleted" });
}));

router.post("/upload", upload.single("file"), handleAsync(async (req: AuthenticatedRequest, res) => {
  if (!req.file || !req.user) return res.status(400).json({ message: "File upload failed" });
  const media = await prisma.media.create({
    data: {
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: req.body.altText || "",
      uploadedById: req.user.userId,
    },
  });
  res.status(201).json(media);
}));

export default router;
