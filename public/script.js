const state = {
  allResults: [],
  filteredResults: [],
  activeFilter: "BROKEN",
  searchQuery: "",
  progressTimer: null,
  progressValue: 0,
  theme: localStorage.getItem("broken-link-theme") || "light",
};

const API_URL = "http://localhost:5000/scan";

const $ = (selector) => document.querySelector(selector);

function normalizeUrl(input) {
  const raw = input.trim();

  if (!raw) {
    throw new Error("Enter a website URL.");
  }

  const candidate = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
  const parsed = new URL(candidate);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return parsed.toString();
}

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("broken-link-theme", theme);
  state.theme = theme;
}

function toggleDarkMode() {
  setTheme(state.theme === "dark" ? "light" : "dark");
}

function updateProgress(value, label) {
  state.progressValue = value;
  $("#progressBar").style.width = `${value}%`;
  $("#progressValue").textContent = `${Math.round(value)}%`;
  $("#progressLabel").textContent = label;
}

function startProgress() {
  clearInterval(state.progressTimer);
  updateProgress(8, "Preparing crawl...");

  state.progressTimer = setInterval(() => {
    const next = Math.min(state.progressValue + 7, 92);
    updateProgress(next, next < 35 ? "Fetching pages..." : next < 70 ? "Validating resources..." : "Wrapping up...");
  }, 220);
}

function stopProgress(finalLabel = "Scan complete") {
  clearInterval(state.progressTimer);
  updateProgress(100, finalLabel);

  window.setTimeout(() => {
    updateProgress(0, "Ready to scan");
  }, 600);
}

function setLoading(isLoading) {
  const loader = $("#loader");
  loader.style.display = isLoading ? "flex" : "none";
  loader.setAttribute("aria-hidden", String(!isLoading));
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function computeStats(results) {
  const total = results.length;
  const broken = results.filter((result) => result.type === "BROKEN").length;
  const working = results.filter((result) => result.type === "WORKING").length;
  const redirect = results.filter((result) => result.type === "REDIRECT").length;
  const images = results.filter((result) => result.resourceType === "image").length;

  return {
    total,
    broken,
    working,
    redirect,
    images,
    brokenRate: total ? (broken / total) * 100 : 0,
  };
}

function renderStats(results) {
  const stats = computeStats(results);
  const cards = [
    ["Total resources", stats.total],
    ["Broken", stats.broken],
    ["Working", stats.working],
    ["Images", stats.images],
  ];

  $("#stats").innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="card stat-card">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
        </article>
      `,
    )
    .join("");

  const brokenPct = formatPercent(stats.brokenRate);
  $("#analyticsLabel").textContent = stats.total
    ? `${brokenPct} broken of ${stats.total}`
    : "Waiting for data";

  const workingWidth = stats.total ? (stats.working / stats.total) * 100 : 0;
  const brokenWidth = stats.total ? (stats.broken / stats.total) * 100 : 0;
  const redirectWidth = stats.total ? (stats.redirect / stats.total) * 100 : 0;

  $("#analyticsBar").innerHTML = `
    <div class="analytics-segment working" style="width: ${workingWidth}%"></div>
    <div class="analytics-segment broken" style="width: ${brokenWidth}%"></div>
    <div class="analytics-segment redirect" style="width: ${redirectWidth}%"></div>
  `;
}

function matchesSearch(item, query) {
  if (!query) {
    return true;
  }

  return [item.url, item.status, item.type, item.resourceType]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(query));
}

function getFilteredResults() {
  return state.allResults.filter((item) => {
    const matchesFilter = state.activeFilter === "ALL"
      || item.type === state.activeFilter
      || item.resourceType === state.activeFilter;

    return matchesFilter && matchesSearch(item, state.searchQuery);
  });
}

function renderResults() {
  const tableBody = $("#resultTable tbody");
  const filtered = getFilteredResults();
  state.filteredResults = filtered;

  tableBody.innerHTML = "";

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">No results match the current filters.</td>
      </tr>
    `;
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a class="resource-link" href="${item.url}" target="_blank" rel="noreferrer">${item.url}</a></td>
      <td><span class="badge ${String(item.type).toLowerCase()}">${item.status}</span></td>
      <td><span class="badge ${item.resourceType}">${item.resourceType}</span></td>
      <td>${item.responseTime}</td>
    `;
    tableBody.appendChild(row);
  });
}

function setActiveFilterButton(filter) {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
}

function filterLinks(type) {
  state.activeFilter = type;
  setActiveFilterButton(type);
  renderResults();
}

function searchLinks() {
  state.searchQuery = $("#searchInput").value.trim().toLowerCase();
  renderResults();
}

function downloadJSON() {
  const payload = {
    generatedAt: new Date().toISOString(),
    results: state.filteredResults.length ? state.filteredResults : state.allResults,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "broken-link-report.json";
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function scanLinks() {
  let normalizedUrl;

  try {
    normalizedUrl = normalizeUrl($("#urlInput").value);
  } catch (error) {
    alert(error.message);
    return;
  }

  setLoading(true);
  startProgress();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalizedUrl, deepScan: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Scan failed.");
    }

    const data = await response.json();
    state.allResults = data.results || [];

    renderStats(state.allResults);
    renderResults();
    stopProgress("Scan complete");
  } catch (error) {
    alert(error.message || "Unable to scan the site.");
    stopProgress("Scan failed");
  } finally {
    setLoading(false);
  }
}

document.getElementById("searchInput").addEventListener("input", searchLinks);
setTheme(state.theme);
updateProgress(0, "Ready to scan");
renderStats([]);
renderResults();
