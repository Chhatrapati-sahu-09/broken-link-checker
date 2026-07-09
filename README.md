# Broken Link Checker

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&size=28&center=true&vCenter=true&width=700&lines=Scan+Websites;Detect+Broken+Links;Improve+SEO;Full+Stack+Tool" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/Chhatrapati-sahu-09/broken-link-checker?style=for-the-badge" />
  <img src="https://img.shields.io/github/forks/Chhatrapati-sahu-09/broken-link-checker?style=for-the-badge" />
  <img src="https://img.shields.io/github/license/Chhatrapati-sahu-09/broken-link-checker?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/CLI-Tool-blue?style=for-the-badge&logo=terminal" />
</p>

---

## Overview

A premium, full-featured link validation and website crawler dashboard built to identify and report broken links, redirects, and resource details. Operates as both an interactive web application with real-time progress updates and a CI-ready Command Line Interface (CLI) utility.

---

## Key Features

- **Concurrency Control**: Restricts check loads using `p-limit` for parallel execution safety.
- **Exponential Backoff Retries**: Standardized retry scheduling with dynamic delays (`1000 * 2^i`) to mitigate transient failures.
- **Custom User-Agent Support**: Configurable Request headers via command line arguments and API payloads.
- **Soft 404 Detection**: Heuristic keyword scans matching text elements on html page bodies.
- **Sitemap.xml Ingestion**: Seeding and checking links straight from target sitemaps.
- **Configurable Crawl Depth**: Numeric traversal parameters (`--depth`) for deep crawling.
- **Domain Allow/Block Lists**: Filtering configurations to permit or bypass scans for specific external domains.
- **Link Context Reports**: Displays and documents the source pages, anchor text, and image `alt` attributes for checked targets.
- **HTML Report Export**: Beautiful modern analytical dashboard exports summarizing results.
- **CSV Format Exports**: Standard spreadsheet compatibility conversions powered by `json2csv`.
- **CLI Progress Feedback**: Displays real-time scan statistics using `cli-progress`.
- **CI/CD Integration**: Emits non-zero exit codes when broken links are detected.
- **WebSocket Live Updates**: Server-to-client notifications leveraging Socket.IO.
- **Dockerized execution**: Dockerfile and docker-compose configurations for environment consistency.

---

## Tech Stack

- **Backend**: Node.js, Express, Axios, Cheerio, Socket.IO, p-limit, json2csv, xml2js
- **Frontend**: Responsive modern HTML/CSS/JavaScript interface (WebSocket-enabled)
- **CLI**: Commander.js, Chalk, cli-progress
- **Test Suite**: Vitest

---

## Project Structure

```text
broken-link-checker/
├── bin/
│   └── index.js             # CLI Entry Point
├── public/
│   ├── index.html           # Web UI Layout
│   ├── script.js            # Frontend Script
│   └── styles.css           # Modern Custom Stylesheet
├── server/
│   ├── crawler.js           # Crawler core logic & backoff retries
│   ├── index.js             # API server & WebSocket configurations
│   └── utils.js             # URL and Domain helpers
├── src/
│   ├── csv-generator.js     # CSV report builder
│   ├── html-generator.js    # HTML dashboard template compiler
│   └── formatter.js         # Tabular terminal printer
├── tests/
│   └── crawler.test.js      # Vitest Suite
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Chhatrapati-sahu-09/broken-link-checker.git
cd broken-link-checker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the application
```bash
npm start
```
By default, the server will launch on `http://localhost:5000`.

---

## CLI Usage

Run scans directly from the command line:

```bash
node bin/index.js --url https://example.com [options]
```

### Command Options

| Option | Description |
|---|---|
| `-u, --url <url>` | The starting URL (can be a webpage or a `sitemap.xml`) |
| `-c, --concurrency <number>` | Concurrency limit for checking links (default: 10) |
| `-d, --depth <number>` | Traversal depth for crawling |
| `--user-agent <string>` | Custom User-Agent header to attach to requests |
| `--allow-domains <domains>` | Comma-separated list of external domains to allow |
| `--block-domains <domains>` | Comma-separated list of external domains to block |
| `--internal` | Check internal links only |
| `--external` | Check external links only |
| `--html <path>` | Write results to an interactive HTML report |
| `--csv <path>` | Write results to a CSV document |
| `--config <path>` | Path to a custom config file (merges default config) |

### Configuration Files

Create a `.blcrc` or `blc.config.json` in your project's working directory to manage configuration defaults without repeating flags:

```json
{
  "concurrency": 5,
  "userAgent": "MyCustomChecker/1.0",
  "blockDomains": ["google-analytics.com", "doubleclick.net"]
}
```

---

## API Documentation

### POST `/scan`

Crawl and validate links asynchronously.

#### Request body
```json
{
  "url": "https://example.com",
  "depth": 1,
  "concurrency": 5,
  "userAgent": "Crawler-Agent",
  "allowDomains": ["github.com"],
  "format": "json",
  "socketId": "socket_conn_id_here"
}
```

#### Response (JSON)
```json
{
  "total": 2,
  "working": 1,
  "broken": 1,
  "redirect": 0,
  "results": [
    {
      "url": "https://example.com/working",
      "status": 200,
      "type": "WORKING",
      "responseTime": "15ms",
      "resourceType": "link",
      "sourcePage": "https://example.com",
      "anchorText": "Our Docs"
    },
    {
      "url": "https://example.com/broken",
      "status": 404,
      "type": "BROKEN",
      "responseTime": "10ms",
      "resourceType": "link",
      "sourcePage": "https://example.com",
      "anchorText": "Dead Link"
    }
  ]
}
```

*Note: You can request different file exports directly by setting `"format": "csv"` (returns `text/csv`) or `"format": "html"` (returns `text/html`).*

---

## Testing

Run tests with Vitest:

```bash
npm test
```

---

## Docker Support

Build and run the full stack container:

```bash
docker-compose up --build
```
Access the application at `http://localhost:5000`.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Author

Chhatrapati Sahu  
GitHub: [Chhatrapati-sahu-09](https://github.com/Chhatrapati-sahu-09)
