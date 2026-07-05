#!/usr/bin/env node

import { Command } from "commander";
import { crawlLinks } from "../src/crawler.js";
import { printResults } from "../src/formatter.js";

const program = new Command();

program
  .name("blc")
  .description("Broken Link Checker CLI")
  .option("-u, --url <url>", "Website URL")
  .option("-c, --concurrency <number>", "Concurrency limit for checking links", (val) => parseInt(val, 10))
  .option("--user-agent <string>", "Custom User-Agent header")
  .option("--internal", "Only internal links")
  .option("--external", "Only external links")
  .parse();

const options = program.opts();

if (!options.url) {
  console.log("❌ Please provide a URL using --url");
  process.exit(1);
}

(async () => {
  try {
    console.log("🔍 Scanning...\n");

    const data = await crawlLinks(options.url, {
      onlyInternal: options.internal,
      onlyExternal: options.external,
      concurrency: options.concurrency,
      userAgent: options.userAgent,
    });

    printResults(data.results);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
})();
