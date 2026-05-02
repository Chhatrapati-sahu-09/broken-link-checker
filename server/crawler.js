// crawler.js

import axios from "axios";
import * as cheerio from "cheerio";
import { toAbsoluteUrl, isValidHref, isInternalLink } from "./utils.js";

const MAX_LINKS = 100;

const fetchWithRetry = async (url, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const start = Date.now();

      const res = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
      });

      return {
        status: res.status,
        time: Date.now() - start,
      };
    } catch (err) {
      if (i === retries) throw err;
    }
  }
};

const processInBatches = async (links, batchSize = 10, handler) => {
  const results = [];

  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((link) => handler(link)),
    );
    results.push(...batchResults);
  }

  return results;
};

export const crawlLinks = async (baseUrl, options = {}) => {
  const { onlyInternal = false, onlyExternal = false } = options;

  if (!baseUrl) {
    throw new Error("URL is required.");
  }

  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    throw new Error("Invalid URL format. Please use http:// or https://");
  }

  let data;
  try {
    const response = await axios.get(baseUrl, {
      timeout: 5000,
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

  const resourcesList = Array.from(resources.entries())
    .slice(0, MAX_LINKS)
    .map(([url, resourceType]) => ({
      url,
      resourceType,
    }));

  const settledResults = await processInBatches(
    resourcesList,
    10,
    async (resource) => {
      const res = await fetchWithRetry(resource.url);

      let type = "WORKING";
      if (res.status >= 300 && res.status < 400) type = "REDIRECT";
      else if (res.status >= 400) type = "BROKEN";

      return {
        url: resource.url,
        status: res.status,
        type,
        responseTime: `${res.time}ms`,
        resourceType: resource.resourceType,
      };
    },
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
