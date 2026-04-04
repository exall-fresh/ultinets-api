import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/auth";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  handleAsync(async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstName: firstName || "",
        lastName: lastName || "",
        role: role || "admin",
      },
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
  })
);

router.post(
  "/login",
  handleAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    return res.json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
  })
);

router.post(
  "/refresh-token",
  handleAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

    try {
      const payload = verifyRefreshToken(refreshToken);
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);
      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  })
);

router.post("/logout", (req, res) => {
  // With JWT stateless, implement blocklist in production.
  res.json({ message: "Logout success" });
});

router.get(
  "/me",
  requireAuth,
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, status: user.status });
  })
);

export default router;
