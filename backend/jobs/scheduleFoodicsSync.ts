// jobs/scheduleFoodicsSync.ts
import cron from "node-cron";
import { processPendingSyncJobs } from "../workers/foodicsSyncWorkers.js";

cron.schedule("*/10 * * * * *", () => {
  processPendingSyncJobs().catch((err) =>
    console.error("processPendingSyncJobs crashed:", err),
  );
});
