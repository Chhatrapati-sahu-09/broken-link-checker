
import axios from "axios";
import cheerio from "cheerio";
import {
  toAbsoluteUrl,
  isValidHref,
  isInternalLink,
} from "./utils.js";

export const crawlLinks = async (baseUrl, options = {}) => {
  const { onlyInternal = false, onlyExternal = false } = options;

  // Fetch page
  const { data } = await axios.get(baseUrl);
  const $ = cheerio.load(data);

  const linksSet = new Set();

  // Extract links
  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (!isValidHref(href)) return;

    const absolute = toAbsoluteUrl(baseUrl, href);
    if (!absolute) return;

    // Filter internal/external
    if (onlyInternal && !isInternalLink(baseUrl, absolute)) return;
    if (onlyExternal && isInternalLink(baseUrl, absolute)) return;

    linksSet.add(absolute);
  });

  const links = Array.from(linksSet);
  const results = [];

  for (let link of links) {
    try {
      const res = await axios.get(link, {
        timeout: 5000,
        validateStatus: () => true, // don't throw on 404
      });

      let type = "WORKING";

      if (res.status >= 300 && res.status < 400) type = "REDIRECT";
      else if (res.status >= 400) type = "BROKEN";

      results.push({
        url: link,
        status: res.status,
        type,
      });
    } catch (err) {
      let errorType = "UNKNOWN_ERROR";

      if (err.code === "ECONNABORTED") errorType = "TIMEOUT";
      else if (err.code === "ENOTFOUND") errorType = "DNS_ERROR";

      results.push({
        url: link,
        status: errorType,
        type: "BROKEN",
      });
    }
  }

  return {
    total: links.length,
    results,
  };
};
