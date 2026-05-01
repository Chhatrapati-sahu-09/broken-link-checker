// crawler.js

import axios from "axios";
import cheerio from "cheerio";
import { toAbsoluteUrl, isValidHref, isInternalLink } from "./utils.js";

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

  const { data } = await axios.get(baseUrl);
  const $ = cheerio.load(data);

  const linksSet = new Set();

  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (!isValidHref(href)) return;

    const absolute = toAbsoluteUrl(baseUrl, href);
    if (!absolute) return;

    if (onlyInternal && !isInternalLink(baseUrl, absolute)) return;
    if (onlyExternal && isInternalLink(baseUrl, absolute)) return;

    linksSet.add(absolute);
  });

  const links = Array.from(linksSet);

  const settledResults = await processInBatches(links, 10, async (link) => {
    const res = await fetchWithRetry(link);

    let type = "WORKING";
    if (res.status >= 300 && res.status < 400) type = "REDIRECT";
    else if (res.status >= 400) type = "BROKEN";

    return {
      url: link,
      status: res.status,
      type,
      responseTime: `${res.time}ms`,
    };
  });

  const results = settledResults.map((item, index) => {
    if (item.status === "fulfilled") {
      return item.value;
    }

    let errorType = "UNKNOWN_ERROR";
    if (item.reason?.code === "ECONNABORTED") errorType = "TIMEOUT";
    else if (item.reason?.code === "ENOTFOUND") errorType = "DNS_ERROR";

    return {
      url: links[index],
      status: errorType,
      type: "BROKEN",
      responseTime: "0ms",
    };
  });

  return {
    total: links.length,
    results,
  };
};
