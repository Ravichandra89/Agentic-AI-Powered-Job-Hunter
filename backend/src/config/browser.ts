import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export const createChrome = async () => {
    const options = new chrome.Options();

    // addArguments into options

    options.addArguments('--headless=new');
    options.addArguments(
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-extensions',
        '--disable-infobars',
        '--disble-browser-side-navigation',
        '--disable-features=VizDisplayCompositor',
        '--remote-debugging-port=9222',
        '--window-size=1280, 800'
    );

    const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

    await driver.manage().setTimeouts({implicit: 10_000});

    return driver;
}

// Quit Gracefully 
export const closeDriver = async (driver: WebDriver) => {
    if (!driver) return;
    try {
        await driver.quit();
    } catch (error) {
        console.error('Failed to close the selenium driver', error);
    }
}