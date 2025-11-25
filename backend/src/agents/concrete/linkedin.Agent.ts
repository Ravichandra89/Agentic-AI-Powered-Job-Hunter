/**
 * Concrete Linkedin Agent
 *  - searchJobs(config : SearchConfig)
 */
import { JobScrappingStrategy } from "../interface/agentJobScrappingStrategy";
import { createChrome, closeDriver } from "../../config/browser";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { log } from "../../config/logger";
import { SearchConfig } from "../../types/searchConfig.types";
import { JobCard } from "../../types/job.types";

// ChatOpenAI
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

export class linkedinStrategy implements JobScrappingStrategy {
  source = "linkedin";
  // llm model
  private model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    maxTokens: 1000,
    timeout: 30,
  });

  private buildSearchUrl(config: SearchConfig): string {
    const params = new URLSearchParams();

    if (config.keywords) params.append("keywords", config.keywords);
    if (config.location) params.append("location", config.location);
    if (config.remote) params.append("f_WT", "2");
    if (config.limit) params.append("limit", String(config.limit));

    // return a url
    return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
  }

  async searchJobs(config: SearchConfig): Promise<JobCard[]> {
    const driver = await createChrome();
    // build the searchUrl
    const searchUrl = await this.buildSearchUrl(config);

    log.info(`[linkedin] Navigating to : ${searchUrl}`);
    const results: JobCard[] = [];

    try {
      // open the page
      driver.get(searchUrl);

      // add wait
      await driver.wait(
        until.elementLocated(By.css(".jobs-search-results__list-item")),
        15000
      );
      const cards = await driver.findElements(
        By.css(".jobs-search-results__list-item")
      );

      for (const card of cards) {
        try {
          const titleElem = await card.findElement(By.css("h3"));
          const companyElem = await card.findElement(
            By.css(".base-search-card__subtitle a")
          );
          const linkElem = await card.findElement(
            By.css("a.base-card__full-link")
          );

          // fetch the fields
          const title = await titleElem.getText();
          const companyName = await companyElem.getText();
          const newUrl = await linkElem.getAttribute("href");

          results.push({
            title,
            companyName,
            jobUrl: newUrl,
            source: "linkedin",
          });
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      log.error(`[Linkedin] Scraper Failed : ${error}`);
    } finally {
      // ultimatelly close the driver
      await closeDriver(driver);
    }

    log.info(`[linkedin] Extracted ${results.length} job cards`);

    return results;
  }
}
