#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import { crawlLinks, crawlSite } from "../src/crawler.js";
import { printResults } from "../src/formatter.js";
import { generateHtmlReport } from "../src/html-generator.js";
import { generateCsvReport } from "../src/csv-generator.js";

const program = new Command();

program
  .name("blc")
  .description("Broken Link Checker CLI")
  .option("-u, --url <url>", "Website URL")
  .option("-c, --concurrency <number>", "Concurrency limit for checking links", (val) => parseInt(val, 10))
  .option("-d, --depth <number>", "Crawl depth (runs recursive multi-page crawl if depth > 0)", (val) => parseInt(val, 10))
  .option("--user-agent <string>", "Custom User-Agent header")
  .option("--allow-domains <domains>", "Comma-separated list of external domains to allow", (val) => val.split(",").map(d => d.trim()).filter(Boolean))
  .option("--block-domains <domains>", "Comma-separated list of external domains to block", (val) => val.split(",").map(d => d.trim()).filter(Boolean))
  .option("--internal", "Only internal links")
  .option("--external", "Only external links")
  .option("--html <path>", "Path to export HTML report")
  .option("--csv <path>", "Path to export CSV report")
  .option("--config <path>", "Path to custom JSON configuration file")
  .parse();

const options = program.opts();

const loadConfig = (configFlag) => {
  if (configFlag) {
    const absolutePath = path.resolve(process.cwd(), configFlag);
    if (fs.existsSync(absolutePath)) {
      try {
        return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
      } catch (err) {
        console.error(`Error: Failed to parse custom config file ${configFlag}:`, err.message);
      }
    }
  }
  const configPaths = [".blcrc", "blc.config.json"];
  for (const file of configPaths) {
    const absolutePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(absolutePath)) {
      try {
        return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
      } catch (err) {
        console.error(`Warning: Failed to parse config file ${file}:`, err.message);
      }
    }
  }
  return {};
};

const config = loadConfig(options.config);

const getOption = (key, defaultValue) => {
  if (options[key] !== undefined) return options[key];
  if (config[key] !== undefined) return config[key];
  return defaultValue;
};

const url = getOption("url");
const concurrency = getOption("concurrency");
const depth = getOption("depth");
const userAgent = getOption("userAgent");
const allowDomains = getOption("allowDomains");
const blockDomains = getOption("blockDomains");
const internal = getOption("internal");
const external = getOption("external");
const htmlPath = getOption("html");
const csvPath = getOption("csv");

if (!url) {
  console.log("❌ Please provide a URL using --url or config file");
  process.exit(1);
}

(async () => {
  try {
    console.log("🔍 Scanning...\n");

    let progressBar;
    const onProgress = ({ completed, total, url: currentUrl }) => {
      if (!progressBar) {
        progressBar = new cliProgress.SingleBar({
          format: 'Progress |{bar}| {percentage}% | {value}/{total} | Checking: {url}',
          hideCursor: true
        }, cliProgress.Presets.shades_classic);
        progressBar.start(total, 0, { url: currentUrl });
      }
      progressBar.setTotal(total);
      progressBar.update(completed, { url: currentUrl.slice(0, 30) });
    };

    const hasDepth = typeof depth === "number" && depth > 0;
    const data = hasDepth
      ? await crawlSite(url, depth, {
          onlyInternal: internal,
          onlyExternal: external,
          concurrency,
          userAgent,
          allowDomains,
          blockDomains,
          onProgress,
        })
      : await crawlLinks(url, {
          onlyInternal: internal,
          onlyExternal: external,
          concurrency,
          userAgent,
          allowDomains,
          blockDomains,
          onProgress,
        });

    if (progressBar) {
      progressBar.stop();
      console.log(); // empty line after progress bar completion
    }

    printResults(data.results);

    if (htmlPath) {
      const htmlContent = generateHtmlReport(data.results);
      fs.writeFileSync(path.resolve(process.cwd(), htmlPath), htmlContent, "utf-8");
      console.log(`\n📄 HTML report written to ${htmlPath}`);
    }

    if (csvPath) {
      const csvContent = generateCsvReport(data.results);
      fs.writeFileSync(path.resolve(process.cwd(), csvPath), csvContent, "utf-8");
      console.log(`📄 CSV report written to ${csvPath}`);
    }

    if (data.broken > 0) {
      console.log(`\n❌ Found ${data.broken} broken links.`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
})();
