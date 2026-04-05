import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { handleAsync } from "./utils";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all users (admin only)
router.get(
  "/",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  })
);

// Get single user
router.get(
  "/:id",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = parseInt(req.params.id);
    
    // Users can only view their own profile, admins can view any
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  })
);

// Create new user (admin only)
router.post(
  "/",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstName: firstName || "",
        lastName: lastName || "",
        role: role || "viewer",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  })
);

// Update user (admin can update any, users can update their own profile)
router.put(
  "/:id",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = parseInt(req.params.id);
    const { email, firstName, lastName, role, status } = req.body;

    // Users can only update their own profile, admins can update any
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Non-admin users cannot change role or status
    if (req.user.role !== "admin" && (role || status)) {
      return res.status(403).json({ message: "Cannot change role or status" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined && req.user.role === "admin") updateData.role = role;
    if (status !== undefined && req.user.role === "admin") updateData.status = status;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  })
);

// Change password (users can change their own, admins can change any)
router.put(
  "/:id/password",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Users can only change their own password, admins can change any
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // For non-admin users, verify current password
    if (req.user.role !== "admin") {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    res.json({ message: "Password updated successfully" });
  })
);

// Delete user (admin only)
router.delete(
  "/:id",
  handleAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const userId = parseInt(req.params.id);

    // Prevent self-deletion
    if (req.user.userId === userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
  })
);

export default router;
