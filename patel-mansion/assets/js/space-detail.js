import { renderRoomModel } from "./three-scenes.js";

const params = new URLSearchParams(window.location.search);
const key = params.get("space");
const space = window.homeData.spaces[key];

if (!space) {
  document.querySelector("main").innerHTML = `<section class="premium-card"><h1>Space not found</h1><a class="btn" href="navigation.html">Back</a></section>`;
} else {
  document.getElementById("space-title").textContent = space.title;
  document.getElementById("space-theme").textContent = space.theme;
  document.getElementById("space-size").textContent = `Size: ${space.dimensions}`;
  document.getElementById("space-cost").textContent = `Cost: ${space.estimatedCost}`;

  space.details.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    document.getElementById("space-details").appendChild(li);
  });

  space.materials.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    document.getElementById("space-materials").appendChild(li);
  });

  const numbers = (space.dimensions.match(/\d+/g) || []).map(Number);
  const width = numbers[0] || 12;
  const depth = numbers[1] || 10;
  renderRoomModel(document.getElementById("space-3d"), space.title, width, depth);
}
