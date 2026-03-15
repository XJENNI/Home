const entries = Object.entries(window.homeData.departments);
const host = document.getElementById("department-list");

entries.forEach(([key, item]) => {
  const card = document.createElement("article");
  card.className = "info-card";
  card.innerHTML = `
    <h3>${item.title}</h3>
    <p class="muted">${item.subtitle}</p>
    <p><strong>Budget:</strong> ${item.budget}</p>
    <a class="btn" href="department-detail.html?section=${encodeURIComponent(key)}">Open ${item.title}</a>
  `;
  host.appendChild(card);
});
