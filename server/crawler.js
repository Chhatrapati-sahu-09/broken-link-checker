import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { toAbsoluteUrl, isValidHref, isInternalLink } from "./utils.js";

// Performance guard: cap number of links processed per scan
const MAX_LINKS = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isSoft404 = (htmlString) => {
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
};

const fetchWithRetry = async (url, retries = 3, options = {}) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const start = Date.now();

      const headers = {};
      if (options.userAgent) {
        headers["User-Agent"] = options.userAgent;
      }

      const res = await axios.get(url, {
        timeout: 5000,
        headers,
        validateStatus: () => true,
      });

      const contentType = res.headers["content-type"] || "";
      let isSoft = false;
      if (res.status === 200 && contentType.includes("text/html")) {
        const bodyText = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
        if (isSoft404(bodyText)) {
          isSoft = true;
        }
      }

      return {
        status: isSoft ? "SOFT_404" : res.status,
        time: Date.now() - start,
      };
    } catch (err) {
      if (i === retries) throw err;
      const backoffDelay = 1000 * Math.pow(2, i);
      await delay(backoffDelay);
    }
  }
};

export const crawlLinks = async (baseUrl, options = {}) => {
  const { onlyInternal = false, onlyExternal = false, concurrency = 10, userAgent } = options;

  if (!baseUrl) {
    throw new Error("URL is required.");
  }

  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    throw new Error("Invalid URL format. Please use http:// or https://");
  }

  let data;
  try {
    const headers = {};
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
    if (err.code === "ECONNABORTED") {
      throw new Error("Request timeout. The website took too long to respond.");
    } else if (err.code === "ENOTFOUND") {
      throw new Error("Website not found. Please check the URL.");
    } else if (err.code === "ECONNREFUSED") {
      throw new Error(
        "Connection refused. The website may be blocked or offline.",
      );
    }
    throw new Error(`Failed to fetch website: ${err.message}`);
  }
  const $ = cheerio.load(data);

  const resources = new Map();

  const addResource = (url, resourceType) => {
    if (!resources.has(url)) {
      resources.set(url, resourceType);
      return;
    }

    if (resources.get(url) === "image" && resourceType === "link") {
      resources.set(url, resourceType);
    }
  };

  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (!isValidHref(href)) return;

    const absolute = toAbsoluteUrl(baseUrl, href);
    if (!absolute) return;

    if (onlyInternal && !isInternalLink(baseUrl, absolute)) return;
    if (onlyExternal && isInternalLink(baseUrl, absolute)) return;

    addResource(absolute, "link");
  });

  $("img").each((i, el) => {
    const src = $(el).attr("src");

    if (!src) return;

    const absolute = toAbsoluteUrl(baseUrl, src);
    if (!absolute) return;

    if (onlyInternal && !isInternalLink(baseUrl, absolute)) return;
    if (onlyExternal && isInternalLink(baseUrl, absolute)) return;

    addResource(absolute, "image");
  });

  // Cap the number of resources to MAX_LINKS
  // Cap the number of resources to MAX_LINKS
  const resourcesList = Array.from(resources.entries())
    .slice(0, MAX_LINKS)
    .map(([url, resourceType]) => ({
      url,
      resourceType,
    }));

  const limitValue = typeof concurrency === "number" && concurrency > 0 ? concurrency : 10;
  const limit = pLimit(limitValue);

  const settledResults = await Promise.allSettled(
    resourcesList.map((resource) =>
      limit(async () => {
        const res = await fetchWithRetry(resource.url, 3, { userAgent });

        let type = "WORKING";
        if (res.status === "SOFT_404") {
          type = "BROKEN";
        } else if (typeof res.status === "number" && res.status >= 300 && res.status < 400) {
          type = "REDIRECT";
        } else if (typeof res.status === "number" && res.status >= 400) {
          type = "BROKEN";
        }

        return {
          url: resource.url,
          status: res.status,
          type,
          responseTime: `${res.time}ms`,
          resourceType: resource.resourceType,
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
    };
  });

  // Structured response: total, working, broken, redirect, results
  return {
    total: results.length,
    working: results.filter((r) => r.type === "WORKING").length,
    broken: results.filter((r) => r.type === "BROKEN").length,
    redirect: results.filter((r) => r.type === "REDIRECT").length,
    results,
  };
};

export const crawlSite = async (startUrl, maxDepth = 2, options = {}) => {
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const collectedResults = [];

  while (queue.length > 0) {
    const { url, depth } = queue.shift();

    if (visited.has(url) || depth > maxDepth) continue;
    visited.add(url);

    const pageData = await crawlLinks(url, {
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

  return {
    total: collectedResults.length,
    working,
    broken,
    redirect,
    results: collectedResults,
  };
};
