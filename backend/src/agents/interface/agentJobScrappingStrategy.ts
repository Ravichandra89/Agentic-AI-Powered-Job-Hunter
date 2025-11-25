/**
 * jobScrapingStrategy.ts
 * Strategy interface that every job scraping agent must implement.
 * Ensures consistent structure for LinkedIn, Wellfound, etc.
 */

import { SearchConfig } from "../../types/searchConfig.types";
import { JobCard } from "../../types/job.types";

export interface JobScappingStrategy {
    source: string;
    searchJobs(config: SearchConfig) : Promise<JobCard[]> ;
};