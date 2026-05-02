import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { crawlLinks, crawlSite } from "./crawler.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

app.use(limiter);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Serve static frontend files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

// health check
app.get("/", (req, res) => {
  res.send("Broken Link Checker API running 🚀");
});

// main API
app.post("/scan", async (req, res) => {
  const { url, onlyInternal, onlyExternal, deepScan } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`Scanning: ${url}`);

  try {
    const scanResult = deepScan
      ? await crawlSite(url, 2, { onlyInternal, onlyExternal })
      : await crawlLinks(url, { onlyInternal, onlyExternal });

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
