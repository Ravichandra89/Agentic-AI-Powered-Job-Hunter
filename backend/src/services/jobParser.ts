import { load } from "cheerio";
import { JobDetails } from "../types/job.types";
import { RawHTMLResponse } from "../types/common.types";


type CheerioAPI = ReturnType<typeof load>;

/**
 * Extract job title from page
 */
const extractTitle = ($: CheerioAPI): string =>
  $("h1").first().text().trim() ||
  $('meta[property="og:title"]').attr("content") ||
  "";

/**
 * Extract company name from page
 */
const extractCompanyName = ($: CheerioAPI): string =>
  $("[data-company-name]").text().trim() ||
  $('[class*="company"]').first().text().trim() ||
  "";

/**
 * Clean HTML string -> plain text
 */
const cleanHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Extract job description
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
    if (lower.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  });

  return [...found];
};

/**
 * Extract job ID from URL
 */
const extractJobId = (url: string): string | undefined => {
  const linkedin = url.match(/\/jobs\/view\/(\d+)/);
  if (linkedin) return linkedin[1];

  const wellfound = url.match(/-(\d+)(\/)?$/);
  if (wellfound) return wellfound[1];

  return undefined;
};

/**
 * Detect job source from URL
 */
const detectSource = (url: string): "linkedin" | "wellfound" =>
  url.includes("linkedin.com")
    ? "linkedin"
    : url.includes("angel.co") || url.includes("wellfound.com")
    ? "wellfound"
    : "linkedin";

/**
 * Helper to match regex
 */
const matchRegex = (html: string, regex: RegExp): string | undefined => {
  const m = html.match(regex);
  return m ? m[0] : undefined;
};

/**
 * Extract metadata like salary, employment type, seniority
 */
const extractMetadata = (html: string) => {
  const salary =
    matchRegex(html, /(₹[\d,]+\s?[-–]\s?₹[\d,]+)/) ||
    matchRegex(html, /\$[\d,]+/);

  const employmentType = matchRegex(
    html,
    /(full[- ]?time|part[- ]?time|contract|internship)/i
  );

  const seniorityLevel = matchRegex(
    html,
    /(entry[- ]?level|junior|mid[- ]?level|senior|lead|manager)/i
  );

  return { salary, employmentType, seniorityLevel };
};

/**
 * Main function: parse job 
 */
export const parseJob = (raw: RawHTMLResponse): JobDetails => {
  const $: CheerioAPI = load(raw.html);

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
