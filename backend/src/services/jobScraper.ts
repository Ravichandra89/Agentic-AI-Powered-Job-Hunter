import { getJobDescription } from "./jobDescription";
import { parseJob } from "./jobParser";
import { saveJobs } from "./jobStore";

import { JobDetails } from "../types/job.types";
import { SearchConfig } from "../types/searchConfig.types";
import { log } from "../config/logger";

// Work as Orchestrator 

export interface scrapResult {
    source: string,
    totalCards: number,
    totalParsed: number,
    saved: number,
    duplicate: number,
    errors?: string[]
};

export const runJobScraper = (
    
) => {

}
