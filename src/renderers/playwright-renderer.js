import { chromium } from "playwright";

export class PlaywrightRenderer {
  constructor(authManager, linkValidator, config = {}) {
    this.authManager = authManager;
    this.linkValidator = linkValidator;
    this.userAgent = config.userAgent || "";
    this.timeout = config.timeout || 10000;
  }

  async render(url, retries = 3) {
    let browser;
    const start = Date.now();
    try {
      browser = await chromium.launch({ headless: true });
      
      const contextOptions = {};
      if (this.userAgent) {
        contextOptions.userAgent = this.userAgent;
      }
      
      const context = await browser.newContext(contextOptions);
      
      if (this.authManager) {
        const authHeaders = this.authManager.getHeaders();
        if (authHeaders["Cookie"]) {
          const cookies = authHeaders["Cookie"].split(";").map(c => {
            const [name, ...val] = c.split("=");
            return {
              name: name.trim(),
              value: val.join("=").trim(),
              url: url
            };
          });
          await context.addCookies(cookies);
        }
        
        if (authHeaders["Authorization"]) {
          await context.setExtraHTTPHeaders({
            "Authorization": authHeaders["Authorization"]
          });
        }
      }

      const page = await context.newPage();
      const response = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: this.timeout,
      });

      const status = response ? response.status() : 200;
      const htmlContent = await page.content();
      const contentType = response ? (await response.headerValue("content-type") || "") : "";
      
      let isSoft = false;
      if (status === 200 && contentType.includes("text/html") && this.linkValidator) {
        if (this.linkValidator.isSoft404(htmlContent)) {
          isSoft = true;
        }
      }

      await browser.close();

      return {
        status: isSoft ? "SOFT_404" : status,
        time: Date.now() - start,
        data: htmlContent,
        contentType,
      };
    } catch (err) {
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw err;
    }
  }
}
