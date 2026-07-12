import { getDomain } from "../utils/link-utils.js";

export class LinkValidator {
  constructor(config = {}) {
    this.allowDomains = config.allowDomains || [];
    this.blockDomains = config.blockDomains || [];
  }

  isDomainAllowed(url) {
    const domain = getDomain(url);
    if (!domain) return false;

    if (this.allowDomains.length > 0) {
      if (!this.allowDomains.includes(domain)) return false;
    }

    if (this.blockDomains.length > 0) {
      if (this.blockDomains.includes(domain)) return false;
    }

    return true;
  }

  isSoft404(htmlString) {
    if (typeof htmlString !== "string") return false;
    const lower = htmlString.toLowerCase();
    const keywords = [
      "404 not found",
      "page not found",
      "404 error",
      "page doesn't exist",
      "page does not exist",
      "could not be found",
      "requested page was not found"
    ];
    return keywords.some(kw => lower.includes(kw));
  }
}
