import { renderHouseModel } from "./three-scenes.js";

const params = new URLSearchParams(window.location.search);
const section = params.get("section");
const data = window.homeData.departments[section];

if (!data) {
  document.querySelector("main").innerHTML = `<section class="premium-card"><h1>Department not found</h1><a class="btn" href="departments.html">Back</a></section>`;
} else {
  document.getElementById("department-title").textContent = data.title;
  document.getElementById("department-subtitle").textContent = data.subtitle;
  document.getElementById("department-budget").textContent = `Budget: ${data.budget}`;

  const fillList = (id, values = []) => {
    const host = document.getElementById(id);
    values.forEach((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      host.appendChild(li);
    });
  };

  fillList("department-highlights", data.highlights);
  fillList("department-materials", data.materials);

  if (data.dimensions) {
    document.getElementById("dimensions-block").style.display = "block";
    fillList("department-dimensions", data.dimensions);
  }

  if (data.qualityChecks) {
    document.getElementById("qc-block").style.display = "block";
    fillList("department-qc", data.qualityChecks);
  }

  if (section === "home-map") {
    document.getElementById("department-3d-block").style.display = "block";
    renderHouseModel(document.getElementById("department-3d"));
  }
}
