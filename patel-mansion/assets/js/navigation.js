const spaces = Object.entries(window.homeData.spaces);
const host = document.getElementById("space-list");

spaces.forEach(([key, item]) => {
  const card = document.createElement("article");
  card.className = "info-card";
  card.innerHTML = `
    <h3>${item.title}</h3>
    <p class="muted">${item.theme}</p>
    <p><strong>Size:</strong> ${item.dimensions}</p>
    <p><strong>Estimated Cost:</strong> ${item.estimatedCost}</p>
    <a class="btn" href="space-detail.html?space=${encodeURIComponent(key)}">Open ${item.title}</a>
  `;
  host.appendChild(card);
});
