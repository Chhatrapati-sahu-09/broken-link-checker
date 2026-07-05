export const generateHtmlReport = (results) => {
  const total = results.length;
  const working = results.filter((r) => r.type === "WORKING").length;
  const broken = results.filter((r) => r.type === "BROKEN").length;
  const redirect = results.filter((r) => r.type === "REDIRECT").length;

  const workingPercent = total ? Math.round((working / total) * 100) : 0;
  const brokenPercent = total ? Math.round((broken / total) * 100) : 0;
  const redirectPercent = total ? Math.round((redirect / total) * 100) : 0;

  const rows = results
    .map(
      (r) => `
      <tr class="result-row" data-type="${r.type}">
        <td class="url-cell">
          <div class="url-text" title="${r.url}">${r.url}</div>
          <div class="url-context">Context: "${r.anchorText || "N/A"}" on <a href="${r.sourcePage || "#"}" target="_blank">${r.sourcePage || "N/A"}</a></div>
        </td>
        <td><span class="badge badge-${r.type.toLowerCase()}">${r.status}</span></td>
        <td><span class="badge-type">${r.resourceType}</span></td>
        <td class="time-cell">${r.responseTime}</td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Broken Link Checker - Scan Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      --card-bg: rgba(30, 41, 59, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      
      --color-working: #10b981;
      --color-broken: #ef4444;
      --color-redirect: #f59e0b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2.5rem 1.5rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2.5rem;
      text-align: center;
    }

    header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    header p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      transition: transform 0.2s, border-color 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .card-label {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .card-meta {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .card-total { border-top: 4px solid var(--primary); }
    .card-working { border-top: 4px solid var(--color-working); }
    .card-broken { border-top: 4px solid var(--color-broken); }
    .card-redirect { border-top: 4px solid var(--color-redirect); }

    /* Visual Metrics Bar */
    .metrics-bar {
      height: 12px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      margin-bottom: 2.5rem;
    }

    .metrics-segment {
      height: 100%;
      transition: width 0.3s ease;
    }

    .metrics-segment.working { background: var(--color-working); }
    .metrics-segment.broken { background: var(--color-broken); }
    .metrics-segment.redirect { background: var(--color-redirect); }

    /* Main Table Section */
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      overflow: hidden;
      backdrop-filter: blur(12px);
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .table-title {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .filter-btn.active {
      background: var(--primary);
      border-color: var(--primary);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th, td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    th {
      background: rgba(0, 0, 0, 0.15);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .result-row {
      transition: background-color 0.2s;
    }

    .result-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .url-cell {
      max-width: 500px;
    }

    .url-text {
      font-weight: 500;
      color: #e2e8f0;
      word-break: break-all;
      margin-bottom: 0.25rem;
    }

    .url-context {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .url-context a {
      color: var(--primary);
      text-decoration: none;
    }

    .url-context a:hover {
      text-decoration: underline;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-working {
      background: rgba(16, 185, 129, 0.15);
      color: var(--color-working);
    }

    .badge-broken {
      background: rgba(239, 68, 68, 0.15);
      color: var(--color-broken);
    }

    .badge-redirect {
      background: rgba(245, 158, 11, 0.15);
      color: var(--color-redirect);
    }

    .badge-type {
      font-size: 0.875rem;
      color: #cbd5e1;
      text-transform: capitalize;
    }

    .time-cell {
      font-variant-numeric: tabular-nums;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      th, td {
        padding: 0.75rem 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Broken Link Checker</h1>
      <p>Scan Report & Analytics</p>
    </header>

    <div class="summary-grid">
      <div class="card card-total">
        <div class="card-label">Total Links</div>
        <div class="card-value">${total}</div>
        <div class="card-meta">Checked resources</div>
      </div>
      <div class="card card-working">
        <div class="card-label">Working</div>
        <div class="card-value" style="color: var(--color-working);">${working}</div>
        <div class="card-meta">${workingPercent}% of total</div>
      </div>
      <div class="card card-broken">
        <div class="card-label">Broken</div>
        <div class="card-value" style="color: var(--color-broken);">${broken}</div>
        <div class="card-meta">${brokenPercent}% of total</div>
      </div>
      <div class="card card-redirect">
        <div class="card-label">Redirects</div>
        <div class="card-value" style="color: var(--color-redirect);">${redirect}</div>
        <div class="card-meta">${redirectPercent}% of total</div>
      </div>
    </div>

    <div class="metrics-bar">
      <div class="metrics-segment working" style="width: ${workingPercent}%"></div>
      <div class="metrics-segment broken" style="width: ${brokenPercent}%"></div>
      <div class="metrics-segment redirect" style="width: ${redirectPercent}%"></div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="table-title">Scan Results Details</div>
        <div class="filters">
          <button class="filter-btn active" onclick="filterType('ALL', this)">All</button>
          <button class="filter-btn" onclick="filterType('WORKING', this)">Working</button>
          <button class="filter-btn" onclick="filterType('BROKEN', this)">Broken</button>
          <button class="filter-btn" onclick="filterType('REDIRECT', this)">Redirects</button>
        </div>
      </div>
      
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Target Link</th>
              <th>Status</th>
              <th>Resource Type</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function filterType(type, button) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const rows = document.querySelectorAll('.result-row');
      rows.forEach(row => {
        if (type === 'ALL' || row.getAttribute('data-type') === type) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
`;
};
