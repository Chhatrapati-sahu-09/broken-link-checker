import { ScanConfig } from "./crawler/config.js";
import { AuthManager } from "./auth/auth-manager.js";
import { LinkValidator } from "./validators/link-validator.js";
import { RendererFactory } from "./renderers/renderer-factory.js";
import { CrawlerService } from "./crawler/crawler-service.js";

export const crawlLinks = async (baseUrl, options = {}) => {
  const config = new ScanConfig({ url: baseUrl, ...options });
  const authManager = new AuthManager(config);
  const linkValidator = new LinkValidator(config);
  const renderer = RendererFactory.create(authManager, linkValidator, config);
  const crawlerService = new CrawlerService(renderer, linkValidator, authManager, config);
  return crawlerService.crawlLinks(baseUrl, options);
};

export const crawlSite = async (startUrl, maxDepth = 2, options = {}) => {
  const config = new ScanConfig({ url: startUrl, depth: maxDepth, ...options });
  const authManager = new AuthManager(config);
  const linkValidator = new LinkValidator(config);
  const renderer = RendererFactory.create(authManager, linkValidator, config);
  const crawlerService = new CrawlerService(renderer, linkValidator, authManager, config);
  return crawlerService.crawlSite(startUrl, maxDepth, options);
};
