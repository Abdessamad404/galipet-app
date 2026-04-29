"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKeepAliveCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
// Cron job pour garder l'app éveillée sur Koyeb (free tier)
// Ping toutes les 10 minutes
const startKeepAliveCron = () => {
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        try {
            const url = process.env.APP_URL || "http://localhost:3000";
            const response = await fetch(`${url}/health`);
            const data = await response.json();
            console.log(`[Cron] Keep-alive ping: ${data.status}`);
        }
        catch (err) {
            console.error("[Cron] Keep-alive failed:", err);
        }
    });
    console.log("[Cron] Keep-alive job started (every 10 minutes)");
};
exports.startKeepAliveCron = startKeepAliveCron;
