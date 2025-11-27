import { By, until, WebDriver } from "selenium-webdriver";
import { JobScrappingStrategy } from "../interface/agentJobScrappingStrategy";
import { JobDetails } from "../../types/job.types";
import { JobCard } from "../../types/job.types";
import { SearchConfig } from "../../types/searchConfig.types";
import { createChrome, closeDriver } from "../../config/browser";
import { log } from "../../config/logger";
import { URLSearchParams } from "url";

export class YCombinatorAgent implements JobScrappingStrategy {
  source = "yc";

  private buildSearchUrl(config: SearchConfig): string {
    const params = new URLSearchParams();

    if (config.keywords) params.append("query", config.keywords);
    if (config.location) params.append("location", config.location);
    if (config.remote) params.append("remote", "true");

    return `https://www.workatastartup.com/jobs?${params.toString()}`;
  }

  async searchJobs(config: SearchConfig): Promise<JobCard[]> {
    const driver: WebDriver = await createChrome();
    const url = await this.buildSearchUrl(config);

    const jobCards: JobCard[] = [];

    try {
      log.info(`YC navigating to ${url}`);

      await driver.get(url);
      await driver.wait(until.elementLocated(By.css("a.Little")), 5000);

      const cards = await driver.findElements(By.css("a.title"));

      for (const card of cards) {
        try {
          const title = await card.getText();
          const relativeUrl = await card.getAttribute("href");

          // Extract Company Name
          const container = await card.findElement(By.xpath(".."));
          const companyElem = await container.findElement(
            By.css("a[href*='/companies/']")
          );

          const companyName = await companyElem.getText();

          const jobUrl = relativeUrl.startsWith("http")
            ? relativeUrl
            : `https://www.workatastartup.com${relativeUrl}`;

          jobCards.push({
            title,
            companyName,
            jobUrl,
            source: "yc",
          });
        } catch (error) {
          continue;
        }
      }

      log.info(`[Yc] Found ${jobCards.length} job cards`);
    } catch (error) {
      log.error(`[YC] Scrapping failed` + error);
    } finally {
      await closeDriver(driver);
    }

    return jobCards;
  }
}
