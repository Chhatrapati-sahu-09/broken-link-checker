let allResults = [];

function showStats(data) {
  const total = data.length;
  const broken = data.filter((r) => r.type === "BROKEN").length;
  const working = data.filter((r) => r.type === "WORKING").length;

  document.getElementById("stats").innerHTML = `
    <strong>Total:</strong> ${total} |
    <span style="color:green">Working: ${working}</span> |
    <span style="color:red">Broken: ${broken}</span>
  `;
}

function filterLinks(type) {
  const tableBody = document.querySelector("#resultTable tbody");
  tableBody.innerHTML = "";

  const filtered =
    type === "ALL" ? allResults : allResults.filter((r) => r.type === type);

  filtered.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><a href="${item.url}" target="_blank">${item.url}</a></td>
      <td>${item.status}</td>
      <td class="${item.type}">${item.type}</td>
      <td>${item.responseTime}</td>
    `;

    tableBody.appendChild(row);
  });
}

function searchLinks() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const tableBody = document.querySelector("#resultTable tbody");
  tableBody.innerHTML = "";

  const filtered = allResults.filter((r) =>
    r.url.toLowerCase().includes(query),
  );

  filtered.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><a href="${item.url}" target="_blank">${item.url}</a></td>
      <td>${item.status}</td>
      <td class="${item.type}">${item.type}</td>
      <td>${item.responseTime}</td>
    `;

    tableBody.appendChild(row);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(allResults, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.json";
  a.click();
}

async function scanLinks() {
  const url = document.getElementById("urlInput").value;
  const loader = document.getElementById("loader");

  try {
    new URL(url);
  } catch {
    alert("Invalid URL");
    return;
  }

  loader.style.display = "block";

  try {
    const res = await fetch("http://localhost:5000/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    allResults = data.results;

    showStats(allResults);
    filterLinks("ALL");

    loader.style.display = "none";
  } catch (err) {
    loader.style.display = "none";
  }
}
