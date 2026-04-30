
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { crawlLinks } from "./crawler.js";

const app = express();
app.use(cors());
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
  const { url, onlyInternal, onlyExternal } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const data = await crawlLinks(url, {
      onlyInternal,
      onlyExternal,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
