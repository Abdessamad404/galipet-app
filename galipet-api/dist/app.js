"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const profiles_routes_1 = __importDefault(require("./modules/profiles/profiles.routes"));
const pets_routes_1 = __importDefault(require("./modules/pets/pets.routes"));
const availability_routes_1 = __importDefault(require("./modules/availability/availability.routes"));
const bookings_routes_1 = __importDefault(require("./modules/bookings/bookings.routes"));
const messages_routes_1 = __importDefault(require("./modules/messages/messages.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
const insurance_routes_1 = __importDefault(require("./modules/insurance/insurance.routes"));
const cron_1 = require("./utils/cron");
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Démarre le cron job keep-alive pour Koyeb
if (process.env.NODE_ENV === "production") {
    (0, cron_1.startKeepAliveCron)();
}
// Middleware globaux
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", project: "Gali'Pet API" });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/profiles", profiles_routes_1.default);
app.use("/api/pets", pets_routes_1.default);
app.use("/api/availability", availability_routes_1.default);
app.use("/api/bookings", bookings_routes_1.default);
app.use("/api/messages", messages_routes_1.default);
app.use("/api/reviews", reviews_routes_1.default);
app.use("/api/notifications", notifications_routes_1.default);
app.use("/api/insurance", insurance_routes_1.default);
// Middleware erreurs — toujours en dernier
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gali'Pet API running on port ${PORT}`);
});
