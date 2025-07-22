const puppeteer = require("puppeteer");
const {
  addRequestHeaderUrl,
  removeRequestHeaderUrl,
  addResponseHeaderUrl,
  removeResponseHeaderUrl,
  getExtension,
  closeWelcomePage,
} = require("../index.js");

describe("Requestly Puppeteer Tests", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        `--disable-extensions-except=${getExtension("unpacked")}`,
        `--load-extension=${getExtension("unpacked")}`,
      ],
      executablePath: process.env.CHROME_BINARY || puppeteer.executablePath(),
    });

    const pages = await browser.pages();
    page = pages[0];
    
    await closeWelcomePage(browser);
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  }, 30000);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  test("Add single request header", async () => {
    await page.goto(addRequestHeaderUrl("x-testing", "requestly-automation"));
    await page.waitForSelector("body");
    const content = await page.content();
    expect(content).toContain("Success");

    await wait(3000);
    await page.goto("https://testheaders.com");
    await page.waitForSelector("button");
    await page.click("button");

    await page.waitForFunction(() =>
      document.body.innerText.includes("x-testing")
    );
  }, 30000);

  test("Remove single request header", async () => {
    await page.goto(removeRequestHeaderUrl("referer"));
    await page.waitForSelector("body");
    const content = await page.content();
    expect(content).toContain("Success");

    await wait(3000);
    await page.goto("https://testheaders.com");
    await page.waitForSelector("button");
    await page.click("button");

    const newContent = await page.content();
    expect(newContent.includes("referer")).toBe(false);
  }, 30000);

  test("Add single response header", async () => {
    await page.goto(
      addResponseHeaderUrl("x-testing", "requestly-automation-response")
    );
    await page.waitForSelector("body");
    const content = await page.content();
    expect(content).toContain("Success");

    await wait(3000);
    await page.goto("https://testheaders.com");
    await page.waitForSelector("button");
    const buttons = await page.$$("button");
    await buttons[1].click();

    await page.waitForFunction(() =>
      document.body.innerText.includes("x-testing")
    );
  }, 30000);

  test("Remove single response header", async () => {
    await page.goto(removeResponseHeaderUrl("x-testing"));
    await page.waitForSelector("body");
    const content = await page.content();
    expect(content).toContain("Success");

    await wait(3000);
    await page.goto("https://testheaders.com");
    await page.waitForSelector("button");
    const buttons = await page.$$("button");
    await buttons[1].click();

    const newContent = await page.content();
    expect(newContent.includes("x-testing")).toBe(false);
  }, 30000);
});
