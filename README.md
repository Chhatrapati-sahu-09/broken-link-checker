# Broken Link Checker

<p align="center">
  <a href="https://github.com/Chhatrapati-sahu-09">
    <img src="https://ishan-rest.vercel.app/svg/banner/dev10/Broken_Link_Checker/Scan%20Websites%20%7C%20Detect%20Broken%20Links" style="width:100%;">
  </a>
</p>

---

## <img src="https://cdn.simpleicons.org/nodedotjs" width="22"/>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs" height="40"/>
  <img src="https://skillicons.dev/icons?i=express" height="40"/>
  <img src="https://skillicons.dev/icons?i=js" height="40"/>
  <img src="https://skillicons.dev/icons?i=html" height="40"/>
  <img src="https://skillicons.dev/icons?i=css" height="40"/>
</p>

---

## Overview

Broken Link Checker is a developer-focused tool that scans websites and identifies:

<ul>
<li><img src="https://www.svgrepo.com/show/452131/error.svg" width="16"/> Broken links (HTTP 4xx / 5xx)</li>
<li><img src="https://www.svgrepo.com/show/502659/redirect.svg" width="16"/> Redirect links (3xx)</li>
<li><img src="https://www.svgrepo.com/show/13650/check.svg" width="16"/> Working links (2xx)</li>
<li><img src="https://www.svgrepo.com/show/502498/image.svg" width="16"/> Broken images</li>
</ul>

Available as:

<ul>
<li><img src="https://www.svgrepo.com/show/533146/browser.svg" width="16"/> Web Application</li>
<li><img src="https://www.svgrepo.com/show/533322/terminal.svg" width="16"/> CLI Tool</li>
</ul>

---

## Features

| Icon                                                                      | Feature         | Description         |
| ------------------------------------------------------------------------- | --------------- | ------------------- |
| <img src="https://www.svgrepo.com/show/499828/search.svg" width="16"/>    | Link Scanning   | Extract all links   |
| <img src="https://www.svgrepo.com/show/535234/lightning.svg" width="16"/> | Fast Checking   | Parallel processing |
| <img src="https://www.svgrepo.com/show/535008/globe.svg" width="16"/>     | Deep Scan       | Multi-page crawl    |
| <img src="https://www.svgrepo.com/show/502498/image.svg" width="16"/>     | Image Detection | Broken images       |
| <img src="https://www.svgrepo.com/show/532997/chart.svg" width="16"/>     | Analytics       | Stats dashboard     |
| <img src="https://www.svgrepo.com/show/533201/filter.svg" width="16"/>    | Filtering       | Internal/external   |
| <img src="https://www.svgrepo.com/show/533340/download.svg" width="16"/>  | Export          | JSON report         |
| <img src="https://www.svgrepo.com/show/533322/terminal.svg" width="16"/>  | CLI Tool        | Terminal usage      |

---

## CLI Usage

```bash
blc --url https://example.com
```

---

## Installation

```bash
git clone https://github.com/your-username/broken-link-checker.git
cd broken-link-checker
npm install
```

---

## Run Application

```bash
node index.js
```

---

## Project Structure

```text
broken-link-checker/
├── bin/
├── src/
├── public/
├── index.js
└── package.json
```

---

## Architecture (ER Diagram)

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

## Performance & Safety

<ul>
<li><img src="https://www.svgrepo.com/show/489317/shield.svg" width="16"/> Rate limiting</li>
<li><img src="https://www.svgrepo.com/show/533152/clock.svg" width="16"/> Timeout handling</li>
<li><img src="https://www.svgrepo.com/show/533151/retry.svg" width="16"/> Retry mechanism</li>
<li><img src="https://www.svgrepo.com/show/533305/layers.svg" width="16"/> Max link limit</li>
</ul>

---

## GitHub Analytics

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

## License

MIT © 2026 Chhatrapati Sahu

---

<p align="center">
  Built for developers focused on performance and reliability
</p>
