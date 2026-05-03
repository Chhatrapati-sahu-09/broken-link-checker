## ✨ Features

>>>>>>> 34a1bce (chore: sync local changes before rebase/push)


## 🖥️ Tech Stack



## 🛠️ Setup & Usage

1. **Clone the repo:**
   ```bash
   cd broken-link-checker
   ```
   npm start
5. **Open frontend:**
   - Visit [http://localhost:5000](http://localhost:5000)
   ```

## 📦 API Example

**POST** `/scan`

```json
{
  "url": "https://example.com",
  "onlyInternal": false,
  "onlyExternal": false,
  "deepScan": false
}
```

**Response:**

```json
{
  "total": 10,
  "working": 7,
  "broken": 2,
  "redirect": 1,
  "results": [
    { "url": "...", "status": 200, "type": "WORKING", ... }
  ]
}
>>>>>>> 6fbfa7e (docs: Add detailed README with animated banner, badges, icons, and ER diagram)



## Run Application

```bash
node index.js
```

---

## Project Structure

```text
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
        int redirect
=======
## 🗺️ ER Diagram

```mermaid
    USER ||--o{ SCAN : requests
    SCAN ||--|{ RESULT : contains
    SCAN {
      date timestamp
      int working
      int broken
    RESULT {
      string url
      int status
      string type
      string resourceType
      string responseTime
>>>>>>> 6fbfa7e (docs: Add detailed README with animated banner, badges, icons, and ER diagram)
    }
```

---

<<<<<<< HEAD
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
=======
## 📄 License

MIT

---

## 👤 Author

- [Chhatrapati Sahu](https://github.com/Chhatrapati-sahu-09)

---

## 🌐 Links

- [Live Demo](https://broken-link-checker-demo.vercel.app/) _(if deployed)_
- [GitHub Repo](https://github.com/Chhatrapati-sahu-09/broken-link-checker)
>>>>>>> 6fbfa7e (docs: Add detailed README with animated banner, badges, icons, and ER diagram)
