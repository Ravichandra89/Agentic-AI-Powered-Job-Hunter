// src/types/common.ts

export type Status = "idle" | "running" | "success" | "failed";

export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface ScraperResult<T> {
  status: Status;
  data: T[];
  meta?: {
    source: string;
    fetchedAt: Date;
    total: number;
  };
}

export type HTMLString = string;

// Used internally by parser & agents
export interface RawHTMLResponse {
  url: string;
  html: HTMLString;
  fetchedAt: Date;
}
