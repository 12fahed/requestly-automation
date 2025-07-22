const {
  addRequestHeaderUrl,
  removeRequestHeaderUrl,
  addResponseHeaderUrl,
  removeResponseHeaderUrl,
  getExtension,
  closeWelcomePage
} = require("../index.js");

const chrome = require("selenium-webdriver/chrome");
const { Builder, until, By } = require("selenium-webdriver");

describe("Requestly Selenium Tests", () => {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments(`--load-extension=${getExtension("unpacked")}`);
    options.addArguments(`--disable-extensions-except=${getExtension("unpacked")}`);
    options.addArguments("--headless=new");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    
    await closeWelcomePage(driver);
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  }, 30000);

  test("Add single request header", async () => {
    await driver.get(addRequestHeaderUrl("x-testing", "requestly-automation"));
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "Success"
      ),
      1000
    );
    await driver.sleep(3000);
    await driver.get("https://testheaders.com");
    await driver.sleep(1000);
    await driver.findElement({ css: "button" }).click();
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "x-testing"
      ),
      10000
    );
  }, 30000);

  test("Remove single request header", async () => {
    await driver.get(removeRequestHeaderUrl("referer"));
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "Success"
      ),
      1000
    );
    await driver.sleep(3000);
    await driver.get("https://testheaders.com");
    await driver.sleep(1000);
    await driver.findElement({ css: "button" }).click();
    const source = await driver.getPageSource();
    expect(source.includes("referer")).toBe(false);
  }, 30000);

  test("Add single response header", async () => {
    await driver.get(
      addResponseHeaderUrl("x-testing", "requestly-automation-response")
    );
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "Success"
      ),
      1000
    );
    await driver.sleep(3000);
    await driver.get("https://testheaders.com");
    const buttons = await driver.findElements(By.css("button"));
    await buttons[1].click();
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "x-testing"
      ),
      10000
    );
  }, 30000);

  test("Remove single response header", async () => {
    await driver.get(removeResponseHeaderUrl("x-testing"));
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.tagName("body")),
        "Success"
      ),
      1000
    );
    await driver.sleep(3000);
    await driver.get("https://testheaders.com");
    const buttons = await driver.findElements(By.css("button"));
    await buttons[1].click();
    await driver.sleep(1000);
    const source = await driver.getPageSource();
    expect(source.includes("x-testing")).toBe(false);
  }, 30000);
});
