# Broken Link Checker

<p align="center">
  <a href="https://github.com/Chhatrapati-sahu-09">
    <img src="https://ishan-rest.vercel.app/svg/banner/dev10/Broken_Link_Checker/Scan%20Websites%20%7C%20Detect%20Broken%20Links" style="width:100%;">
  </a>
</p>

<p align="center">
  <b>Scan websites. Detect broken links. Improve reliability, UX, and SEO.</b>
</p>

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/info-circle.svg" width="22"/> About the Project

Broken Link Checker is a full-stack developer utility that scans websites and validates all hyperlinks and media resources.

It identifies:

* Broken links (HTTP 4xx / 5xx)
* Redirect chains (3xx)
* Working links (2xx)
* Broken images

The tool is designed for:

* Developers
* QA engineers
* SEO analysts

It is available as:

* Web Interface (browser-based)
* CLI Tool (developer workflow)

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/target.svg" width="22"/> Problem Statement

Modern websites often contain:

* Dead links (404)
* Outdated resources
* Broken media

These issues lead to:

* Poor user experience
* SEO penalties
* Reduced trust

Manual detection is inefficient.

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/lightbulb.svg" width="22"/> Solution

This tool automates:

* Crawling web pages
* Extracting all links and images
* Validating each resource
* Generating a structured report

Result:

* Fast detection
* Actionable insights
* Improved website quality

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/bolt.svg" width="22"/> Key Features

| Feature           | Description                |
| ----------------- | -------------------------- |
| Link Extraction   | Parses all anchor tags     |
| HTTP Validation   | Checks response status     |
| Parallel Requests | Faster scanning            |
| Retry Mechanism   | Handles temporary failures |
| Deep Crawling     | Multi-page scanning        |
| Image Validation  | Detects broken images      |
| Filtering         | Internal / external links  |
| CLI Support       | Terminal usage             |
| Export            | JSON report                |
| Stats Dashboard   | Summary analytics          |

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/stack.svg" width="22"/> Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs" height="40"/>
  <img src="https://skillicons.dev/icons?i=express" height="40"/>
  <img src="https://skillicons.dev/icons?i=js" height="40"/>
  <img src="https://skillicons.dev/icons?i=html" height="40"/>
  <img src="https://skillicons.dev/icons?i=css" height="40"/>
</p>

### Backend

* Node.js
* Express.js
* Axios
* Cheerio

### Frontend

* HTML
* CSS
* Vanilla JavaScript

### CLI

* Commander.js
* Chalk

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/settings.svg" width="22"/> Installation

### Clone Repository

```bash
git clone https://github.com/your-username/broken-link-checker.git
cd broken-link-checker
```

### Install Dependencies

```bash
npm install
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/player-play.svg" width="22"/> Running the Project

### Start Backend Server

```bash
node index.js
```

Open:

```
http://localhost:5000
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/terminal.svg" width="22"/> CLI Usage

### Setup CLI

```bash
npm link
```

### Run Command

```bash
blc --url https://example.com
```

### Options

```
-u, --url <url>       Target website
--internal            Scan internal links only
--external            Scan external links only
--json                Output JSON format
--summary             Show summary only
--deep                Enable multi-page scan
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/api.svg" width="22"/> API Usage

### Endpoint

```
POST /scan
```

### Request Body

```json
{
  "url": "https://example.com",
  "deepScan": true
}
```

### Response

```json
{
  "total": 20,
  "working": 15,
  "broken": 3,
  "redirect": 2,
  "results": [
    {
      "url": "https://example.com/about",
      "status": 200,
      "type": "WORKING",
      "responseTime": "120ms"
    }
  ]
}
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/git-branch.svg" width="22"/> Project Structure

```text
broken-link-checker/
├── bin/                # CLI entry point
├── src/                # Core logic
│   ├── crawler.js
│   ├── utils.js
│   ├── formatter.js
├── public/             # Frontend files
│   ├── index.html
│   ├── style.css
│   ├── script.js
├── index.js            # Express server
├── package.json
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/diagram.svg" width="22"/> System Architecture

```mermaid
flowchart TD
    A[User Input URL] --> B[Fetch HTML]
    B --> C[Parse Links & Images]
    C --> D[Convert to Absolute URLs]
    D --> E[HTTP Requests]
    E --> F[Classify Responses]
    F --> G[Generate Report]
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/database.svg" width="22"/> ER Diagram

```mermaid
erDiagram
    USER ||--o{ SCAN : performs
    SCAN ||--|{ LINK : contains
    LINK {
        string url
        int status
        string type
        string responseTime
    }
    SCAN {
        int total
        int working
        int broken
        int redirect
    }
```

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/shield.svg" width="22"/> Performance & Safety

* Rate limiting (prevents abuse)
* Max link threshold (prevents overload)
* Timeout handling
* Retry mechanism
* Error handling

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/chart-bar.svg" width="22"/> GitHub Analytics

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=Chhatrapati-sahu-09&show_icons=true&theme=tokyonight" />
</p>

<p align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=Chhatrapati-sahu-09&theme=tokyonight" />
</p>

<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=Chhatrapati-sahu-09&theme=tokyo-night" />
</p>

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/rocket.svg" width="22"/> Future Improvements

* PDF / HTML reports
* Chrome extension
* AI-based link analysis
* CI/CD integration
* Dashboard analytics

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/briefcase.svg" width="22"/> Resume Description

Built a full-stack Broken Link Checker using Node.js and Vanilla JavaScript that scans websites, detects broken links and images, and provides structured reports through both web interface and CLI.

---

## <img src="https://tabler-icons.io/static/tabler-icons/icons/license.svg" width="22"/> License

MIT © 2026 Chhatrapati Sahu

---

<p align="center">
  Built with precision for modern web reliability
</p>
