import { getJobDescription } from "./jobDescription";
import { parseJob } from "./jobParser";
import { saveJobs } from "./jobStore";

import { JobDetails } from "../types/job.types";
import { SearchConfig } from "../types/searchConfig.types";
import { log } from "../config/logger";
import { JobScrappingStrategy } from "../agents/interface/agentJobScrappingStrategy";

// Work as Orchestrator

export interface scrapResult {
  source: string;
  totalCards: number;
  totalParsed: number;
  saved: number;
  duplicate: number;
  errors?: string[];
}

export const runJobScraper = async (
  strategy: JobScrappingStrategy,
  config: SearchConfig
): Promise<scrapResult> => {
  log.info(`Starting scraper for source : ${strategy.source}`);

  const jobCards = await strategy.searchJobs(config);
  log.info(
    `[${strategy.source}] Extracted ${jobCards.length} job cards for keywords: ${config.keywords}`
  );

  // Parsing each jobs
  const parsedJobs: JobDetails[] = [];

  for (const job of jobCards) {
    try {
      const rawHtml = await getJobDescription(job.jobUrl);
      if (!rawHtml) {
        log.error(`No Raw Html found while fetching Description`);
      }

      // if yes then parse
      const parsed = await parseJob(rawHtml);

      jobCards.push(parsed);
      log.debug(
        `[${strategy.source}] Parsed job: ${parsed.title} @ ${parsed.companyName}`
      );
    } catch (error) {
      log.error(`[${strategy.source}] Failed to process URL. ${job.jobUrl}`);
    }
  }

  // Save + dedupe -> saved, duplicate, errors[]
  const response = await saveJobs(parsedJobs);
  log.info(
    `[${strategy.source}] Completed run — Saved: ${response.saved}, Duplicate: ${response.duplicate}`
  );

  return {
    source: strategy.source,
    totalCards: jobCards.length,
    totalParsed: parsedJobs.length,
    saved: response.saved,
    duplicate: response.duplicate,
    errors: response.errors,
  };
};
