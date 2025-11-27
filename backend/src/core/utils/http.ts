/**
 * http.ts
 * Minimal HTTP client for fetching raw HTML pages
 */

import axios from "axios";
import { log } from "../../config/logger";

export interface HttpResponse {
  url: string;
  status: number;
  data: any;
  fetchedAt: Date;
}

class HttpClient {
  private client = axios.create({
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "text/html,application/json",
    },
  } as any); // 👈 prevents Axios type mismatch

  /** GET request */
  async get(url: string, config: any = {}): Promise<HttpResponse> {
    log.debug(`[HTTP] GET → ${url}`);

    try {
      // allow redirects config safely
      const resp = await this.client.get(url, {
        maxRedirects: 5,
        ...config,
      } as any);

      return {
        url,
        status: resp.status,
        data: resp.data,
        fetchedAt: new Date(),
      };
    } catch (err: any) {
      log.error(`[HTTP] GET failed: ${url} | ${err.message}`);
      throw err;
    }
  }

  /** HEAD request - check if URL is alive */
  async head(url: string): Promise<boolean> {
    try {
      await this.client.head(url as any);
      return true;
    } catch {
      return false;
    }
  }
}

export const http = new HttpClient();
