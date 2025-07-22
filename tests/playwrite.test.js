const { chromium } = require("playwright");
const {
  addRequestHeaderUrl,
  removeRequestHeaderUrl,
  addResponseHeaderUrl,
  removeResponseHeaderUrl,
  getExtension,
} = require("../index.js");

describe("Requestly Playwright Tests", () => {
  let browser;
  let page;
  let context;

  beforeAll(async () => {
    browser = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        "--headless=new",
        `--disable-extensions-except=${getExtension("unpacked")}`,
        `--load-extension=${getExtension("unpacked")}`,
      ],
    });
    context = browser;
    page = await context.newPage();
  }, 30000);

  afterAll(async () => {
    await browser.close();
  }, 30000);

  test("Add single request header", async () => {
    await page.goto(addRequestHeaderUrl("x-testing", "requestly-automation"));
    await page.waitForSelector("body");
    expect(await page.textContent("body")).toContain("Success");

    await page.waitForTimeout(3000);
    await page.goto("https://testheaders.com");
    await page.click("button");

    await page.waitForFunction(() =>
      document.body.innerText.includes("x-testing")
    );
  }, 30000);

  test("Remove single request header", async () => {
    await page.goto(removeRequestHeaderUrl("referer"));
    await page.waitForSelector("body");
    expect(await page.textContent("body")).toContain("Success");

    await page.waitForTimeout(3000);
    await page.goto("https://testheaders.com");
    await page.click("button");

    const content = await page.content();
    expect(content.includes("referer")).toBe(false);
  }, 30000);

  test("Add single response header", async () => {
    await page.goto(
      addResponseHeaderUrl("x-testing", "requestly-automation-response")
    );
    await page.waitForSelector("body");
    expect(await page.textContent("body")).toContain("Success");

    await page.waitForTimeout(3000);
    await page.goto("https://testheaders.com");
    const buttons = await page.$$("button");
    await buttons[1].click();

    await page.waitForFunction(() =>
      document.body.innerText.includes("x-testing")
    );
  }, 30000);

  test("Remove single response header", async () => {
    await page.goto(removeResponseHeaderUrl("x-testing"));
    await page.waitForSelector("body");
    expect(await page.textContent("body")).toContain("Success");

    await page.waitForTimeout(3000);
    await page.goto("https://testheaders.com");
    const buttons = await page.$$("button");
    await buttons[1].click();

    const content = await page.content();
    expect(content.includes("x-testing")).toBe(false);
  }, 30000);
});
