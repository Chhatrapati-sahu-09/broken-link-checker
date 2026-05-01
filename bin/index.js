#!/usr/bin/env node

import { Command } from "commander";
import { crawlLinks } from "../src/crawler.js";
import { printResults } from "../src/formatter.js";

const program = new Command();

program
  .name("blc")
  .description("Broken Link Checker CLI")
  .option("-u, --url <url>", "Website URL")
  .option("--internal", "Only internal links")
  .option("--external", "Only external links")
  .parse();

const options = program.opts();

if (!options.url) {
  console.log("❌ Please provide a URL using --url");
  process.exit(1);
}

(async () => {
  console.log("🔍 Scanning...\n");

  const data = await crawlLinks(options.url, {
    onlyInternal: options.internal,
    onlyExternal: options.external,
  });

  printResults(data.results);
})();
