import cron from "node-cron";

// Ping toutes les 10 minutes
export const startKeepAliveCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const url = process.env.APP_URL;
      const response = await fetch(`${url}/api/health`);
      const data = await response.json();
      console.log(`[Cron] Keep-alive ping: ${data.status}`);
    } catch (err) {
      console.error("[Cron] Keep-alive failed:", err);
    }
  });

  console.log("[Cron] Keep-alive job started (every 10 minutes)");
};
