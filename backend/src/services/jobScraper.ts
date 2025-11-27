/**
 * jobScraper.ts
 * Orchestrates the complete job scraping pipeline:
 * Agent → JobCards → Fetch HTML → Parse → Save → Return new jobs
 */

import { getJobDescription } from "./jobDescription";
import { parseJob } from "./jobParser";
import { saveJobs } from "./jobStore";

import { JobDetails } from "../types/job.types";
import { SearchConfig } from "../types/searchConfig.types";
import { log } from "../config/logger";
import { JobScrappingStrategy } from "../agents/interface/agentJobScrappingStrategy";

export interface scrapResult {
  source: string;
  totalCards: number;
  totalParsed: number;
  saved: number;
  duplicate: number;
  savedJobs?: JobDetails[];
  errors?: string[];
}

export const runJobScraper = async (
  strategy: JobScrappingStrategy,
  config: SearchConfig
): Promise<scrapResult> => {
  log.info(`🚀 Starting scraper for source: ${strategy.source}`);

  // 1️⃣ Extract job cards
  const jobCards = await strategy.searchJobs(config);

  log.info(
    `[${strategy.source}] Extracted ${jobCards.length} job cards for keywords: ${config.keywords}`
  );

  // 2️⃣ Parse each job's full description
  const parsedJobs: JobDetails[] = [];

  for (const job of jobCards) {
    try {
      const rawHtml = await getJobDescription(job.jobUrl);

      if (!rawHtml.html?.length) {
        log.error(`[${strategy.source}] Empty HTML for URL ${job.jobUrl}`);
        continue;
      }

      const parsed = parseJob(rawHtml);
      parsedJobs.push(parsed); // ⭐ FIXED (previously was jobCards.push)

      log.debug(
        `[${strategy.source}] Parsed job → ${parsed.title} @ ${parsed.companyName}`
      );
    } catch (error) {
      log.error(
        `[${strategy.source}] Failed processing job URL: ${
          job.jobUrl
        } → ${String(error)}`
      );
    }
  }

  // 3️⃣ Save + dedupe
  const response = await saveJobs(parsedJobs);

  log.info(
    `[${strategy.source}] Completed — Saved: ${response.saved}, Duplicate: ${response.duplicate}`
  );

  return {
    source: strategy.source,
    totalCards: jobCards.length,
    totalParsed: parsedJobs.length,
    saved: response.saved,
    duplicate: response.duplicate,
    savedJobs: response.savedJobs,
    errors: response.errors,
  };
};
