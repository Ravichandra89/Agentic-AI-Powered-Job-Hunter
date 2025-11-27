import { load } from "cheerio";

export const loadHtml = (html: string) => load(html);

/**
 * Strip all HTML tags and extra spaces → clean plain text
 */
export const cleanHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ") 
    .replace(/\s+/g, " ")     
    .trim();

/**
 * Extract first matching regex from HTML/text
 */
export const matchRegex = (text: string, regex: RegExp): string | undefined => {
  const match = text.match(regex);
  return match ? match[0] : undefined;
};

/**
 * Safe text getter: returns trimmed string or empty
 */
export const safeText = (value?: string | null): string =>
  value?.trim() || "";

/**
 * Normalize text for deduping / comparisons
 */
export const normalize = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export type CheerioAPI = ReturnType<typeof loadHtml>;
