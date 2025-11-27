import {
  loadHtml,
  cleanHtml,
  matchRegex,
  CheerioAPI,
} from "../core/utils/parser";
import { JobDetails } from "../types/job.types";
import { RawHTMLResponse } from "../types/common.types";

/**
 * Extract job title
 */
const extractTitle = ($: CheerioAPI): string =>
  $("h1").first().text().trim() ||
  $('meta[property="og:title"]').attr("content") ||
  "";

/**
 * Extract company name
 */
const extractCompanyName = ($: CheerioAPI): string =>
  $("[data-company-name]").text().trim() ||
  $('[class*="company"]').first().text().trim() ||
  "";

/**
 * Extract job description block
 */
const extractDescription = ($: CheerioAPI): string => {
  const selectors = [
    "#job-details",
    ".job-details",
    ".description",
    "#job-description",
    "[data-job-description]",
    ".jobs-description",
    ".content",
  ];

  for (const sel of selectors) {
    const html = $(sel).html();
    if (html && html.length > 50) {
      return cleanHtml(html);
    }
  }

  return cleanHtml($("body").text());
};

/**
 * Extract skills from raw HTML
 */
const extractSkills = (html: string): string[] => {
  const knownSkills = [
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "python",
    "c++",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "mongodb",
    "html",
    "css",
    "git",
  ];

  const found = new Set<string>();
  const lower = html.toLowerCase();

  knownSkills.forEach((skill) => {
    if (lower.includes(skill)) found.add(skill);
  });

  return [...found];
};

/**
 * Extract job ID from a job URL
 */
const extractJobId = (url: string): string | undefined => {
  const linkedin = url.match(/\/jobs\/view\/(\d+)/);
  if (linkedin) return linkedin[1];

  const wellfound = url.match(/-(\d+)(\/)?$/);
  if (wellfound) return wellfound[1];

  return undefined;
};

/**
 * Detect job source
 */
const detectSource = (url: string): "linkedin" | "wellfound" =>
  url.includes("linkedin.com")
    ? "linkedin"
    : url.includes("wellfound.com") || url.includes("angel.co")
    ? "wellfound"
    : "linkedin";

/**
 * Extract meta values like salary & employment type
 */
const extractMetadata = (html: string) => ({
  salary:
    matchRegex(html, /(₹[\d,]+\s?[-–]\s?₹[\d,]+)/) ||
    matchRegex(html, /\$[\d,]+/),
  employmentType: matchRegex(
    html,
    /(full[- ]?time|part[- ]?time|contract|internship)/i
  ),
  seniorityLevel: matchRegex(
    html,
    /(entry[- ]?level|junior|mid[- ]?level|senior|lead|manager)/i
  ),
});

/**
 * MAIN PARSER FUNCTION
 */
export const parseJob = (raw: RawHTMLResponse): JobDetails => {
  const $ = loadHtml(raw.html);

  const description = extractDescription($);
  const meta = extractMetadata(raw.html);

  return {
    title: extractTitle($),
    companyName: extractCompanyName($),
    location: undefined,
    description,
    jobUrl: raw.url,
    jobId: extractJobId(raw.url),
    skills: extractSkills(raw.html),
    source: detectSource(raw.url),
    ...meta,
  };
};
