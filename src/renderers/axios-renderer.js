import axios from "axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class AxiosRenderer {
  constructor(authManager, linkValidator, config = {}) {
    this.authManager = authManager;
    this.linkValidator = linkValidator;
    this.userAgent = config.userAgent || "";
  }

  async render(url, retries = 3) {
    for (let i = 0; i <= retries; i++) {
      try {
        const start = Date.now();
        const authHeaders = this.authManager ? this.authManager.getHeaders() : {};
        const headers = { ...authHeaders };
        
        if (this.userAgent) {
          headers["User-Agent"] = this.userAgent;
        }

        const res = await axios.get(url, {
          timeout: 5000,
          headers,
          validateStatus: () => true,
        });

        const contentType = res.headers["content-type"] || "";
        let isSoft = false;
        
        if (res.status === 200 && contentType.includes("text/html") && this.linkValidator) {
          const bodyText = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
          if (this.linkValidator.isSoft404(bodyText)) {
            isSoft = true;
          }
        }

        return {
          status: isSoft ? "SOFT_404" : res.status,
          time: Date.now() - start,
          data: res.data,
          contentType,
        };
      } catch (err) {
        if (i === retries) throw err;
        const backoffDelay = 1000 * Math.pow(2, i);
        await delay(backoffDelay);
      }
    }
  }
}
