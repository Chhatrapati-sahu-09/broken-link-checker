import axios from "axios";
import cheerio from "cheerio";
import { toAbsoluteUrl } from "./utils.js";

export const crawlLinks = async (baseUrl) => {
  // fetch page HTML
  const { data } = await axios.get(baseUrl);

  const $ = cheerio.load(data);
  const linksSet = new Set();

  // extract links
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href) {
      const absolute = toAbsoluteUrl(baseUrl, href);
      if (absolute) linksSet.add(absolute);
    }
  });

  const links = Array.from(linksSet);
  const results = [];

  // check each link
  for (let link of links) {
    try {
      const res = await axios.get(link, { timeout: 5000 });

      let type = "WORKING";
      if (res.status >= 300 && res.status < 400) type = "REDIRECT";
      if (res.status >= 400) type = "BROKEN";

      results.push({
        url: link,
        status: res.status,
        type,
      });
    } catch (err) {
      results.push({
        url: link,
        status: "ERROR",
        type: "BROKEN",
      });
    }
  }

  return {
    total: links.length,
    results,
  };
};
