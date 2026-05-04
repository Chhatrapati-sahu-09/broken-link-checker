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

A full-stack tool to scan websites and detect:

- Broken links  
- Redirects  
- Working resources  

This helps improve user experience and SEO performance.

---

## Features

- Scan websites for broken links  
- Detect redirects and working links  
- Internal and external link filtering  
- Deep scan (multi-page crawling)  
- CLI and Web interface  
- JSON report output  

---

## Tech Stack

### Backend
<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express" />
</p>

- Node.js  
- Express.js  
- Axios  
- Cheerio  

---

### Frontend
<p>
  <img src="https://skillicons.dev/icons?i=html,css,js" />
</p>

- HTML  
- CSS  
- JavaScript  

---

### CLI
<p>
  <img src="https://skillicons.dev/icons?i=nodejs" />
</p>

- Commander.js  
- Chalk  

---

## Setup and Usage

### 1. Clone the repository

```bash
git clone https://github.com/your-username/broken-link-checker.git
cd broken-link-checker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application

```bash
node index.js
```

### 4. Open in browser

```
http://localhost:5000
```

---

## API Example

### POST `/scan`

#### Request

```json
{
  "url": "https://example.com",
  "onlyInternal": false,
  "onlyExternal": false,
  "deepScan": false
}
```

#### Response

```json
{
  "total": 10,
  "working": 7,
  "broken": 2,
  "redirect": 1,
  "results": [
    {
      "url": "https://example.com/about",
      "status": 200,
      "type": "WORKING"
    }
  ]
}
```

---

## CLI Usage

```bash
blc --url https://example.com
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

## Architecture

```mermaid
erDiagram
    SCAN ||--|{ LINK : contains
    LINK {
        string url
        int status
        string type
    }
```

---

## Performance and Safety

- Rate limiting  
- Timeout handling  
- Retry mechanism  
- Max link limit  

---

## License

MIT

---

## Author

Chhatrapati Sahu  
https://github.com/Chhatrapati-sahu-09

---

## Support

If you find this project useful, consider starring and sharing it.
