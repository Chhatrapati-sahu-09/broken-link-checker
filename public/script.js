let allResults = [];

function filterLinks(type) {
  const tableBody = document.querySelector("#resultTable tbody");
  tableBody.innerHTML = "";

  const filtered =
    type === "ALL"
      ? allResults
      : allResults.filter((item) => item.type === type);

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
  const stats = document.getElementById("stats");
  const tableBody = document.querySelector("#resultTable tbody");

  if (!url) {
    alert("Enter URL");
    return;
  }
  try {
    new URL(url);
  } catch {
    alert("Invalid URL");
    return;
  }

  loader.style.display = "block";
  stats.innerText = "";
  tableBody.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    allResults = data.results;
    filterLinks("ALL");

    // Stats dashboard
    const total = data.results.length;
    const broken = data.results.filter(r => r.type === "BROKEN").length;
    const working = data.results.filter(r => r.type === "WORKING").length;
    const redirect = data.results.filter(r => r.type === "REDIRECT").length;
    stats.innerText = `Total: ${total} | Working: ${working} | Broken: ${broken} | Redirect: ${redirect}`;

    loader.style.display = "none";
  } catch (err) {
    loader.style.display = "none";
    stats.innerText = "Error ❌";
  }
}
