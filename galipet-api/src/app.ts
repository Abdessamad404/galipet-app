import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
import profilesRoutes from "./modules/profiles/profiles.routes";
import petsRoutes from "./modules/pets/pets.routes";
import availabilityRoutes from "./modules/availability/availability.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import messagesRoutes from "./modules/messages/messages.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import insuranceRoutes from "./modules/insurance/insurance.routes";
import { startKeepAliveCron } from "./utils/cron";
import { notFound, errorHandler } from "./middleware/error.middleware";

const app = express();

// Démarre le cron job keep-alive pour Koyeb
if (process.env.NODE_ENV === "production") {
  startKeepAliveCron();
}

// Middleware globaux
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.redirect("/api/health");
});
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", project: "Gali'Pet API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/insurance", insuranceRoutes);

// Middleware erreurs — toujours en dernier
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gali'Pet API running on port ${PORT}`);
});
