const host = document.getElementById("phase-list");

window.homeData.phases.forEach((phase) => {
  const card = document.createElement("article");
  card.className = "info-card";
  card.innerHTML = `
    <h3>${phase.title}</h3>
    <p><strong>Budget:</strong> ${phase.budget}</p>
    <p><strong>Duration:</strong> ${phase.duration}</p>
    <a class="btn" href="phase-detail.html?phase=${phase.id}">Open ${phase.title}</a>
  `;
  host.appendChild(card);
});
