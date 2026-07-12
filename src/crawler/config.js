import fs from "fs";
import path from "path";

export class ScanConfig {
  constructor(options = {}) {
    this.url = options.url || "";
    this.concurrency = typeof options.concurrency === "number" ? options.concurrency : 10;
    this.depth = typeof options.depth === "number" ? options.depth : 0;
    this.userAgent = options.userAgent || "";
    this.allowDomains = Array.isArray(options.allowDomains) ? options.allowDomains : [];
    this.blockDomains = Array.isArray(options.blockDomains) ? options.blockDomains : [];
    this.onlyInternal = !!options.onlyInternal;
    this.onlyExternal = !!options.onlyExternal;
    
    // Placeholder flags for subsequent steps
    this.render = !!options.render;
    this.ignoreRobots = !!options.ignoreRobots;
    
    // Credentials for authentication (Step 5)
    this.cookies = options.cookies || "";
    this.auth = options.auth || "";
    this.username = options.username || "";
    this.password = options.password || "";
    
    // Slack/Discord/Email (Step 9)
    this.slack = options.slack || "";
    this.discord = options.discord || "";
    this.email = options.email || "";
  }

  static loadFromFile(configFlag) {
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
  }
}
