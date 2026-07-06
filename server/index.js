import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { crawlLinks, crawlSite } from "./crawler.js";
import { generateHtmlReport } from "../src/html-generator.js";
import { generateCsvReport } from "../src/csv-generator.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

app.use(limiter);
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

// Serve static frontend files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

// health check
app.get("/", (req, res) => {
  res.send("Broken Link Checker API running 🚀");
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

// main API
app.post("/scan", async (req, res) => {
  const { url, onlyInternal, onlyExternal, deepScan, depth, concurrency, userAgent, allowDomains, blockDomains, socketId, format } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`Scanning: ${url}`);

  try {
    const parsedConcurrency = concurrency ? parseInt(concurrency, 10) : undefined;
    const parsedDepth = depth !== undefined ? parseInt(depth, 10) : (deepScan ? 2 : undefined);

    const parseDomains = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") return val.split(",").map(d => d.trim()).filter(Boolean);
      return undefined;
    };

    const parsedAllow = parseDomains(allowDomains);
    const parsedBlock = parseDomains(blockDomains);

    const onProgress = (progress) => {
      if (socketId) {
        io.to(socketId).emit("progress", progress);
      }
    };

    const scanResult = parsedDepth && parsedDepth > 0
      ? await crawlSite(url, parsedDepth, { onlyInternal, onlyExternal, concurrency: parsedConcurrency, userAgent, allowDomains: parsedAllow, blockDomains: parsedBlock, onProgress })
      : await crawlLinks(url, { onlyInternal, onlyExternal, concurrency: parsedConcurrency, userAgent, allowDomains: parsedAllow, blockDomains: parsedBlock, onProgress });

    if (format === "csv") {
      const csv = generateCsvReport(scanResult.results);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=report.csv");
      return res.send(csv);
    } else if (format === "html") {
      const html = generateHtmlReport(scanResult.results);
      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    }

    res.json(scanResult);
  } catch (err) {
    console.error("Scan error:", err.message);
    const statusCode =
      err.message && err.message.includes("Invalid URL") ? 400 : 500;
    res
      .status(statusCode)
      .json({ error: err.message || "An error occurred during scanning" });
  }
});

// Version/info endpoint
app.get("/info", (req, res) => {
  res.json({
    name: "Broken Link Checker",
    version: "1.0.0",
    author: "Chhatrapati Sahu",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
