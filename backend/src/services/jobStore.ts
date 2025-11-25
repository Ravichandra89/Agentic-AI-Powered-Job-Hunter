import { JobDetails, JobSaveResponse } from "../types/job.types";
import { JobModel } from "../database/models/job.model";
import { log } from "../config/logger";

const normalize = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const COLLATION = { locale: "en", strength: 2 };

const checkExistingOfJob = async (job: JobDetails) => {
  if (job.jobId) {
    const byId = await JobModel.findOne({
      jobId: job.jobId,
      source: job.source,
    });
    if (byId) return byId;
  }

  const byUrl = await JobModel.findOne({ jobUrl: job.jobUrl });
  if (byUrl) return byUrl;

  const title = normalize(job.title);
  const companyName = normalize(job.companyName);
  const location = normalize(job.location);

  const query: Record<string, unknown> = { title, companyName };
  if (location) query.location = location;

  return JobModel.findOne(query).collation(COLLATION);
};

const convertIntoJobDocument = (job: JobDetails) => {
  // TODO: Add llm's for getting smart short summary of job as shortDescription

  const shortDescription =
    job.description && job.description.length > 300
      ? `${job.description.slice(0, 297)}...`
      : job.description;

  return {
    title: normalize(job.title),
    companyName: normalize(job.companyName),
    location: normalize(job.location),
    jobId: job.jobId,
    jobUrl: job.jobUrl,
    shortDescription,
    fullDescription: job.description,
    source: job.source,
    employmentType: job.employmentType,
    seniorityLevel: job.seniorityLevel,
    salary: job.salary,
    fetchedAt: new Date(),
  };
};

export const saveJobs = async (
  jobs: JobDetails[]
): Promise<JobSaveResponse> => {
  const result: JobSaveResponse = { saved: 0, duplicate: 0, errors: [] };

  for (const job of jobs) {
    try {
      const existing = await checkExistingOfJob(job);

      if (existing) {
        log.info(
          `Duplicate: ${job.jobId ?? job.jobUrl} (${job.source}) — skipped`
        );
        result.duplicate += 1;
        continue;
      }

      await JobModel.create(convertIntoJobDocument(job));
      result.saved += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`Failed to save job ${job.jobId ?? job.jobUrl}: ${message}`);
      result.errors?.push(message);
    }
  }

  if (result.errors?.length === 0) {
    delete result.errors;
  }

  return result;
};
