/**
 * Get the path to the Requestly extension file.
 * @param {"crx" | "xpi" | "unpacked"} [type="crx"] - The type of extension file to retrieve.
 * @returns {string} The absolute path to the specified Requestly extension file.
 */
function getExtension(type = "crx") {
  switch (type) {
    case "crx":
      return `${__dirname}/extensions/requestly.crx`;
    case "xpi":
      return `${__dirname}/extensions/requestly.xpi`;
    case "unpacked":
      return `${__dirname}/extensions/requestly-unpacked`;
    default:
      return `${__dirname}/extensions/requestly.crx`;
  }
}

/**
 * Close any welcome pages opened by the extension, leaving the main window active.
 * Works with Selenium WebDriver, Playwright, and Puppeteer.
 * @param {WebDriver|Page|Browser} driver - Selenium WebDriver instance, Playwright Page, or Puppeteer Browser.
 * @returns {Promise<void>}
 */
async function closeWelcomePage(driver) {
  await new Promise(resolve => setTimeout(resolve, 500)); // Universal sleep
  
  try {
    // Detect framework type and handle accordingly
    if (driver.getAllWindowHandles) {
      // Selenium WebDriver
      const handles = await driver.getAllWindowHandles();
      const mainHandle = handles[0];

      for (const handle of handles.slice(1)) {
        await driver.switchTo().window(handle);
        await driver.close();
      }
      await driver.switchTo().window(mainHandle);
    } else if (driver.context && typeof driver.context === 'function') {
      // Playwright Page
      const context = driver.context();
      const pages = context.pages();
      
      // Close all pages except the current page
      const currentPage = driver;
      for (const page of pages) {
        if (page !== currentPage && !page.isClosed()) {
          try {
            await page.close();
          } catch (error) {
            // Ignore errors when closing pages
            console.warn('Failed to close page:', error.message);
          }
        }
      }
    } else if (driver.pages && typeof driver.pages === 'function') {
      // Puppeteer Browser
      const pages = await driver.pages();
      
      // Close all pages except the first one (but keep at least one page open)
      if (pages.length > 1) {
        for (let i = 1; i < pages.length; i++) {
          try {
            await pages[i].close();
          } catch (error) {
            // Ignore errors when closing pages
            console.warn('Failed to close page:', error.message);
          }
        }
      }
    } else if (driver.newPage && typeof driver.newPage === 'function') {
      // Playwright BrowserContext
      const pages = driver.pages();
      
      // Close welcome pages but keep the main pages
      if (pages.length > 1) {
        for (let i = 1; i < pages.length; i++) {
          try {
            await pages[i].close();
          } catch (error) {
            // Ignore errors when closing pages
            console.warn('Failed to close page:', error.message);
          }
        }
      }
    }
  } catch (error) {
    // If there's any error, just continue - welcome page closure is not critical
    console.warn('closeWelcomePage encountered an error:', error.message);
  }
}

/**
 * Builds a query string from an object of headers.
 * @param {Object.<string, string>} headers - Key-value pairs of headers.
 * @returns {string} A URL-encoded query string.
 */
function buildQueryString(headers) {
  return Object.entries(headers)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * Validates a header name and value.
 * @param {string} name - The header name.
 * @param {string} value - The header value.
 * @throws {Error} If the header name or value is invalid.
 * @returns {boolean} True if the header is valid.
 */
function validateHeader(name, value) {
  if (!name || typeof name !== "string") {
    throw new Error("Header name must be a non-empty string");
  }
  if (typeof value !== "string") {
    throw new Error("Header value must be a string");
  }
  return true;
}

/**
 * Core function for building add request header URLs.
 */
function addRequestHeaderUrl(headerName, headerValue, headers) {
  let query = "";
  if (headers && typeof headers === "object") {
    Object.entries(headers).forEach(([name, value]) => validateHeader(name, value));
    query = buildQueryString(headers);
  } else if (headerName && typeof headerValue !== "undefined") {
    validateHeader(headerName, headerValue);
    query = `${encodeURIComponent(headerName)}=${encodeURIComponent(headerValue)}`;
  } else {
    throw new Error("Provide either headers or headerName, headerValue");
  }
  return `https://app.requestly.io/automation/add-request-header?${query}`;
}

/**
 * Shortcut: Add multiple request headers using an object.
 * @param {Object.<string, string>} headers
 * @returns {string}
 */
function addRequestHeadersUrl(headers) {
  if (!headers || typeof headers !== "object") {
    throw new Error("headers parameter is required and must be an object");
  }
  return addRequestHeaderUrl(null, null, headers);
}

/**
 * Core function for building remove request header URLs.
 */
function removeRequestHeaderUrl(headerName, headers) {
  let query = "";
  if (headers && Array.isArray(headers)) {
    query = headers.map(key => `header=${encodeURIComponent(key)}`).join("&");
  } else if (headerName) {
    query = `header=${encodeURIComponent(headerName)}`;
  } else {
    throw new Error("Provide either `headers` or `headerName`");
  }
  return `https://app.requestly.io/automation/remove-request-header?${query}`;
}

/**
 * Shortcut: Remove multiple request headers using an array.
 * @param {string[]} headers
 * @returns {string}
 */
function removeRequestHeadersUrl(headers) {
  if (!Array.isArray(headers)) {
    throw new Error("headers parameter must be an array");
  }
  return removeRequestHeaderUrl(null, headers);
}

/**
 * Core function for building add response header URLs.
 */
function addResponseHeaderUrl(headerName, headerValue, headers) {
  let query = "";
  if (headers && typeof headers === "object") {
    Object.entries(headers).forEach(([name, value]) => validateHeader(name, value));
    query = buildQueryString(headers);
  } else if (headerName && typeof headerValue !== "undefined") {
    validateHeader(headerName, headerValue);
    query = `${encodeURIComponent(headerName)}=${encodeURIComponent(headerValue)}`;
  } else {
    throw new Error("Provide either headers or headerName, headerValue");
  }
  return `https://app.requestly.io/automation/add-response-header?${query}`;
}

/**
 * Shortcut: Add multiple response headers using an object.
 * @param {Object.<string, string>} headers
 * @returns {string}
 */
function addResponseHeadersUrl(headers) {
  if (!headers || typeof headers !== "object") {
    throw new Error("headers parameter is required and must be an object");
  }
  return addResponseHeaderUrl(null, null, headers);
}

/**
 * Core function for building remove response header URLs.
 */
function removeResponseHeaderUrl(headerName, headers) {
  let query = "";
  if (headers && Array.isArray(headers)) {
    query = headers.map(key => `header=${encodeURIComponent(key)}`).join("&");
  } else if (headerName) {
    query = `header=${encodeURIComponent(headerName)}`;
  } else {
    throw new Error("Provide either `headers` or `headerName`");
  }
  return `https://app.requestly.io/automation/remove-response-header?${query}`;
}

/**
 * Shortcut: Remove multiple response headers using an array.
 * @param {string[]} headers
 * @returns {string}
 */
function removeResponseHeadersUrl(headers) {
  if (!Array.isArray(headers)) {
    throw new Error("headers parameter must be an array");
  }
  return removeResponseHeaderUrl(null, headers);
}

/**
 * Get a URL to import rules using an API key.
 * @param {string} api_key - The API key for importing rules.
 * @throws {Error} If api_key is missing or not a string.
 * @returns {string} The automation URL for importing rules.
 */
function importRules(api_key) {
  if (!api_key || typeof api_key !== "string") {
    throw new Error("api_key parameter is required and must be a string");
  }
  return `https://app.requestly.io/automation/?api-key=${encodeURIComponent(api_key)}`;
}

module.exports = {
  addRequestHeaderUrl,
  addRequestHeadersUrl,
  removeRequestHeaderUrl,
  removeRequestHeadersUrl,
  addResponseHeaderUrl,
  addResponseHeadersUrl,
  removeResponseHeaderUrl,
  removeResponseHeadersUrl,
  importRules,
  getExtension,
  closeWelcomePage,
};
