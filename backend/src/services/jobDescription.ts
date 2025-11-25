import { tryParse } from "selenium-webdriver/http";
import { createChrome } from "../config/browser";
import { log } from "../config/logger";
import { RawHTMLResponse } from "../types/common.types";

export const getJobDescription = async (
  jobUrl: string
): Promise<RawHTMLResponse> => {
  try {
    // create a new chrome driver
    const driver = await createChrome();

    await driver.get(jobUrl);
    await driver.sleep(15000);

    // get HTML content
    const html = await driver.getPageSource();
    if (!html) {
      throw new Error("No HTML content found");
    }

    return {
      url: jobUrl,
      html,
      fetchedAt: new Date(),
    };
  } catch (error) {
    log.error(`Error getting job description: ${error}`);

    return {
      url: jobUrl,
      html: "",
      fetchedAt: new Date(),
    };
  }
};
