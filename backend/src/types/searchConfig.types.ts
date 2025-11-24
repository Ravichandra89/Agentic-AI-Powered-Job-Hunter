// Single Job Search configuration
import { JobCard } from "./job.types"; 

export interface SearchConfig {
    keywords: string;
    location?: string;
    experience?: string;
    remote?: boolean;
    postedWithinDays?: number;

    // pagination Optional
    limit?: number;
    page?: number;
};

// Run multiple searches
export interface BulkSearchConfig {
    searches: SearchConfig[];
}

export interface AgentSearchInput {
  config: SearchConfig;
  page?: number;
}


export interface AgentJobResponse {
  source: "linkedin" | "wellfound";
  jobs: JobCard[];
  nextPage?: number | null;
}