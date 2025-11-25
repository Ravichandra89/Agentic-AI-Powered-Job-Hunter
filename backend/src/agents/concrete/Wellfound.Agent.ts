/**
 * WellFound Agent - searchJobs(config: SearchConfig)
 */
import { JobScrappingStrategy } from "../interface/agentJobScrappingStrategy";
import { JobDetails } from "../../types/job.types";
import { JobCard } from "../../types/job.types";
import { By, until } from "selenium-webdriver";
import { SearchConfig } from "../../types/searchConfig.types";
import { createChrome, closeDriver } from "../../config/browser";
import { log } from "../../config/logger";
import { URLSearchParams } from "url";

export class wellfoundAgent implements JobScrappingStrategy {
  source = "wellfound";

  private buildSearchUrl(config: SearchConfig): string {
    const params = new URLSearchParams();

    if (config.keywords) params.append("keywords", config.keywords);
    if (config.location) params.append("keywords", config.location);
    if (config.remote) params.append("remote", "true");

    return `https://wellfound.com/jobs?${params.toString()}`;
  }

  async searchJobs(config: SearchConfig): Promise<JobCard[]> {
    const driver = await createChrome();
    const url = await this.buildSearchUrl(config);

    const jobCards: JobCard[] = [];

    try {
      log.info(`[Wellfound] navigating to ${url}`);
      await driver.get(url);

      await driver.wait(
        until.elementLocated(By.css("div.styles_component__qaOEp")),
        1500
      );

      const cards = await driver.findElements(
        By.css("div.styles_component__qaOEp")
      );

      for (const card of cards) {
        // title
        try {
          const titleElem = await card.findElement(
            By.css("span.styles_title__1_35E")
          );
          const title = await titleElem.getText();

          // companyName
          const companyElem = await card.findElement(
            By.css("a.styles_name___xJUx")
          );
          const companyName = await companyElem.getText();

          // jobUrl
          const linkElem = await card.findElement(
            By.css("a.styles_information__qUos7")
          );
          const relativeUrl = await linkElem.getAttribute("href");
          const jobUrl = `https://wellfound.com${relativeUrl}`;

          jobCards.push({
            title,
            companyName,
            jobUrl,
            source: "wellfound",
          });
        } catch (error) {
          continue;
        }
      }
      log.info(`[wellfound] Extracted ${jobCards.length} cards`);
    } catch (error) {
        log.error(`[wellfound] Error Scraping: ${error}`);
    } finally {
        await closeDriver(driver);
    }

    return jobCards;
  }
}
