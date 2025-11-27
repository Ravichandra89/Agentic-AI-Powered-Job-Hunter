/**
 * scheduler/cron.ts
 */

import cron from "node-cron";
import { log } from "../../config/logger";

import { runJobScraper } from "../../services/jobScraper";
import { linkedinStrategy } from "../../agents/concrete/linkedin.Agent";
import { wellfoundAgent } from "../../agents/concrete/Wellfound.Agent";

import { SearchConfig } from "../../types/searchConfig.types";
import { sendJobAlert } from "../../services/jobNotifier";

const tempSearchConfig: SearchConfig = {
  keywords: "backend developer",
  location: "India",
  remote: false,
};

const executeScraper = async () => {
  try {
    log.info("🚀 Starting automated job scraping task...");

    const agents = [new linkedinStrategy(), new wellfoundAgent()];

    for (const agent of agents) {
      const result = await runJobScraper(agent, tempSearchConfig);

      log.info(
        `📊 Scraped from ${result.source} — Cards: ${result.totalCards}, Parsed: ${result.totalParsed}, Saved: ${result.saved}, Duplicate: ${result.duplicate}`
      );

      
      if (result.savedJobs && result.savedJobs.length > 0) {
        log.info(
          `📨 Sending job alert for ${result.savedJobs.length} new jobs`
        );
        await sendJobAlert(result.savedJobs);
      }
    }

    log.info("✨ Job scraping cron task completed.");
  } catch (error) {
    log.error(`Cron Scraper failed: ${String(error)}`);
  }
};

// 3-hour schedule - Run after every 3 Hrs
cron.schedule("0 */3 * * *", async () => {
  await executeScraper();
  log.info("⏱️ Next run scheduled in 3 hours...");
});

if (process.env.RUN_ON_STARTUP === "true") {
  executeScraper();
}

log.info("🕒 Cron scheduler initialized — scraping every 3 hours.");
