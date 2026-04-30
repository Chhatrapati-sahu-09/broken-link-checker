async function scanLinks() {
  const url = document.getElementById("urlInput").value;
  const loading = document.getElementById("loading");
  const tableBody = document.querySelector("#resultTable tbody");

  if (!url) {
    alert("Enter URL");
    return;
  }

  loading.innerText = "Scanning...";
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

    data.results.forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.url}</td>
        <td>${item.status}</td>
        <td class="${item.type}">${item.type}</td>
        <td>${item.responseTime}</td>
      `;

      tableBody.appendChild(row);
    });

    loading.innerText = "Done ✅";
  } catch (err) {
    loading.innerText = "Error ❌";
  }
}
