// job card
export interface JobCard {
  title: string;
  companyName: string;
  location?: string;
  jobUrl: string;
  jobId?: string;
  source: "linkedin" | "wellfound" | "yc";
}

export interface JobDetails extends JobCard {
  description: string;
  salary?: string;
  employmentType?: string;
  seniorityLevel?: string;
  skills?: string[];
}

export interface JobDocument extends JobDetails {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobSaveResponse {
  saved: number;
  duplicate: number;
  errors?: string[];
}

export interface JobSaveResponse {
  saved: number;
  duplicate: number;
  errors?: string[];
  savedJobs?: JobDetails[];
}
