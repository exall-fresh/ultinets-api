import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import authRoutes from "./routes/auth";
import servicesPublicRoutes from "./routes/services.public";
import servicesAdminRoutes from "./routes/services.admin";
import teamPublicRoutes from "./routes/team.public";
import teamAdminRoutes from "./routes/team.admin";
import partnersPublicRoutes from "./routes/partners.public";
import partnersAdminRoutes from "./routes/partners.admin";
import contactsPublicRoutes from "./routes/contacts.public";
import contactsAdminRoutes from "./routes/contacts.admin";
import mediaPublicRoutes from "./routes/media.public";
import mediaAdminRoutes from "./routes/media.admin";
import settingsPublicRoutes from "./routes/settings.public";
import settingsAdminRoutes from "./routes/settings.admin";
import aboutPublicRoutes from "./routes/about.public";
import aboutAdminRoutes from "./routes/about.admin";
import logsAdminRoutes from "./routes/logs.admin";
import usersAdminRoutes from "./routes/users.admin";
import prisma from "./prisma";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(","), credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "public/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesPublicRoutes);
app.use("/api/admin/services", servicesAdminRoutes);
app.use("/api/team", teamPublicRoutes);
app.use("/api/admin/team", teamAdminRoutes);
app.use("/api/partners", partnersPublicRoutes);
app.use("/api/admin/partners", partnersAdminRoutes);
app.use("/api/contact", contactsPublicRoutes);
app.use("/api/admin/contacts", contactsAdminRoutes);
app.use("/api/admin/media", mediaAdminRoutes);
app.use("/api/admin/settings", settingsAdminRoutes);
app.use("/api/settings", settingsPublicRoutes);
app.use("/api/about", aboutPublicRoutes);
app.use("/api/admin/about", aboutAdminRoutes);
app.use("/api/admin/logs", logsAdminRoutes);
app.use("/api/admin/users", usersAdminRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("subscribe:all", () => {
    socket.join("all");
  });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal error" });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Backend CMS API is running on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
