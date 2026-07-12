import * as cheerio from "cheerio";
import pLimit from "p-limit";
import xml2js from "xml2js";
import axios from "axios";
import { toAbsoluteUrl, isValidHref, isInternalLink } from "../utils/link-utils.js";

const MAX_LINKS = 100;

export class CrawlerService {
  constructor(renderer, linkValidator, authManager, config = {}) {
    this.renderer = renderer;
    this.linkValidator = linkValidator;
    this.authManager = authManager;
    this.config = config;
  }

  isSitemapUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.endsWith(".xml") || parsed.pathname.includes("sitemap");
    } catch {
      return false;
    }
  }

  async parseSitemap(xmlString) {
    const parser = new xml2js.Parser();
    try {
      const result = await parser.parseStringPromise(xmlString);
      const urls = [];
      if (result && result.urlset && Array.isArray(result.urlset.url)) {
        for (const entry of result.urlset.url) {
          if (entry.loc && entry.loc[0]) {
            urls.push(entry.loc[0].trim());
          }
        }
      } else if (result && result.sitemapindex && Array.isArray(result.sitemapindex.sitemap)) {
        for (const entry of result.sitemapindex.sitemap) {
          if (entry.loc && entry.loc[0]) {
            urls.push(entry.loc[0].trim());
          }
        }
      }
      return urls;
    } catch (err) {
      console.error("Error parsing sitemap XML:", err.message);
      return [];
    }
  }

  async crawlLinks(baseUrl, options = {}) {
    const { 
      onlyInternal = false, 
      onlyExternal = false, 
      concurrency = 10, 
      userAgent, 
      allowDomains = [], 
      blockDomains = [], 
      onProgress 
    } = options;

    if (!baseUrl) {
      throw new Error("URL is required.");
    }

    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      throw new Error("Invalid URL format. Please use http:// or https://");
    }

    let data;
    try {
      const authHeaders = this.authManager ? this.authManager.getHeaders() : {};
      const headers = { ...authHeaders };
      if (userAgent) {
        headers["User-Agent"] = userAgent;
      }
      
      const response = await axios.get(baseUrl, {
        timeout: 5000,
        headers,
        validateStatus: () => true,
      });
      data = response.data;
    } catch (err) {
      if (this.isSitemapUrl(baseUrl)) {
        try {
          const authHeaders = this.authManager ? this.authManager.getHeaders() : {};
          const headers = { ...authHeaders };
          if (userAgent) {
            headers["User-Agent"] = userAgent;
          }
          const response = await axios.get(baseUrl, {
            timeout: 5000,
            headers,
            validateStatus: () => true,
          });
          data = response.data;
        } catch (sitemapErr) {
          throw new Error(`Failed to fetch sitemap: ${sitemapErr.message}`);
        }
      } else {
        throw new Error(`Failed to fetch website: ${err.message}`);
      }
    }

    const resources = new Map();

    const addResource = (url, resourceType, anchorText = "") => {
      if (!resources.has(url)) {
        resources.set(url, { resourceType, anchorText, sourcePage: baseUrl });
        return;
      }

      if (resources.get(url).resourceType === "image" && resourceType === "link") {
        resources.set(url, { resourceType, anchorText, sourcePage: baseUrl });
      }
    };

    if (this.isSitemapUrl(baseUrl)) {
      const parsedUrls = await this.parseSitemap(data);
      for (const loc of parsedUrls) {
        const isInternal = isInternalLink(baseUrl, loc);
        if (onlyInternal && !isInternal) continue;
        if (onlyExternal && isInternal) continue;

        if (this.linkValidator && !isInternal && !this.linkValidator.isDomainAllowed(loc)) continue;

        addResource(loc, "link", "Sitemap URL");
      }
    } else {
      const $ = cheerio.load(data);

      $("a").each((i, el) => {
        const href = $(el).attr("href");

        if (!isValidHref(href)) return;

        const absolute = toAbsoluteUrl(baseUrl, href);
        if (!absolute) return;

        const isInternal = isInternalLink(baseUrl, absolute);
        if (onlyInternal && !isInternal) return;
        if (onlyExternal && isInternal) return;

        if (this.linkValidator && !isInternal && !this.linkValidator.isDomainAllowed(absolute)) return;

        const text = $(el).text().trim() || "";
        addResource(absolute, "link", text);
      });

      $("img").each((i, el) => {
        const src = $(el).attr("src");

        if (!src) return;

        const absolute = toAbsoluteUrl(baseUrl, src);
        if (!absolute) return;

        const isInternal = isInternalLink(baseUrl, absolute);
        if (onlyInternal && !isInternal) return;
        if (onlyExternal && isInternal) return;

        if (this.linkValidator && !isInternal && !this.linkValidator.isDomainAllowed(absolute)) return;

        const alt = $(el).attr("alt") || "";
        addResource(absolute, "image", alt);
      });
    }

    const resourcesList = Array.from(resources.entries())
      .slice(0, MAX_LINKS)
      .map(([url, info]) => ({
        url,
        resourceType: info.resourceType,
        anchorText: info.anchorText,
        sourcePage: info.sourcePage,
      }));

    const limitValue = typeof concurrency === "number" && concurrency > 0 ? concurrency : 10;
    const limit = pLimit(limitValue);

    let completed = 0;
    const total = resourcesList.length;

    const settledResults = await Promise.allSettled(
      resourcesList.map((resource) =>
        limit(async () => {
          const res = await this.renderer.render(resource.url, 3);

          let type = "WORKING";
          if (res.status === "SOFT_404") {
            type = "BROKEN";
          } else if (typeof res.status === "number" && res.status >= 300 && res.status < 400) {
            type = "REDIRECT";
          } else if (typeof res.status === "number" && res.status >= 400) {
            type = "BROKEN";
          }

          completed++;
          if (onProgress) {
            onProgress({ completed, total, url: resource.url });
          }

          return {
            url: resource.url,
            status: res.status,
            type,
            responseTime: `${res.time}ms`,
            resourceType: resource.resourceType,
            sourcePage: resource.sourcePage,
            anchorText: resource.anchorText,
          };
        }),
      ),
    );

    const results = settledResults.map((item, index) => {
      if (item.status === "fulfilled") {
        return item.value;
      }

      let errorType = "UNKNOWN_ERROR";
      if (item.reason?.code === "ECONNABORTED") errorType = "TIMEOUT";
      else if (item.reason?.code === "ENOTFOUND") errorType = "DNS_ERROR";

      return {
        url: resourcesList[index].url,
        status: errorType,
        type: "BROKEN",
        responseTime: "0ms",
        resourceType: resourcesList[index].resourceType,
        sourcePage: resourcesList[index].sourcePage,
        anchorText: resourcesList[index].anchorText,
      };
    });

    return {
      total: results.length,
      working: results.filter((r) => r.type === "WORKING").length,
      broken: results.filter((r) => r.type === "BROKEN").length,
      redirect: results.filter((r) => r.type === "REDIRECT").length,
      results,
    };
  }

  async crawlSite(startUrl, maxDepth = 2, options = {}) {
    const visited = new Set();
    const queue = [];
    const collectedResults = [];

    if (this.isSitemapUrl(startUrl)) {
      try {
        const authHeaders = this.authManager ? this.authManager.getHeaders() : {};
        const headers = { ...authHeaders };
        if (options.userAgent) {
          headers["User-Agent"] = options.userAgent;
        }
        const response = await axios.get(startUrl, {
          timeout: 5000,
          headers,
          validateStatus: () => true,
        });
        const urls = await this.parseSitemap(response.data);
        for (const loc of urls) {
          queue.push({ url: loc, depth: 0 });
        }
        visited.add(startUrl);
      } catch (err) {
        console.error("Failed to seed from sitemap:", err.message);
      }
    } else {
      queue.push({ url: startUrl, depth: 0 });
    }

    while (queue.length > 0) {
      const { url, depth } = queue.shift();

      if (visited.has(url) || depth > maxDepth) continue;
      visited.add(url);

      const pageData = await this.crawlLinks(url, {
        ...options,
        onlyInternal: true,
        onlyExternal: false,
      });
      collectedResults.push(...pageData.results);

      if (depth < maxDepth) {
        pageData.results.forEach((result) => {
          if (
            result.resourceType === "link" &&
            result.type === "WORKING" &&
            isInternalLink(startUrl, result.url)
          ) {
            queue.push({ url: result.url, depth: depth + 1 });
          }
        });
      }
    }

    const working = collectedResults.filter(
      (result) => result.type === "WORKING",
    ).length;
    const broken = collectedResults.filter(
      (result) => result.type === "BROKEN",
    ).length;
    const redirect = collectedResults.filter(
      (result) => result.type === "REDIRECT",
    ).length;

    // Deduplicate by URL
    const uniqueMap = new Map();
    collectedResults.forEach((res) => {
      if (!uniqueMap.has(res.url)) {
        uniqueMap.set(res.url, res);
      }
    });

    const deduplicatedResults = Array.from(uniqueMap.values());

    return {
      total: deduplicatedResults.length,
      working: deduplicatedResults.filter((r) => r.type === "WORKING").length,
      broken: deduplicatedResults.filter((r) => r.type === "BROKEN").length,
      redirect: deduplicatedResults.filter((r) => r.type === "REDIRECT").length,
      results: deduplicatedResults,
    };
  }
}
