import { renderHouseModel } from "./three-scenes.js";

const { project, metrics, mainDetails } = window.homeData;

document.getElementById("hero-summary").textContent =
  `${project.name} is a ${project.structure} premium residence on ${project.plotSize}, with ${project.builtUpArea} built-up area, ${project.totalInvestment} target investment, and ${project.timeline} execution plan.`;

const metricsHost = document.getElementById("metric-cards");
metrics.forEach((metric) => {
  const div = document.createElement("div");
  div.className = "metric";
  div.innerHTML = `<span class="label">${metric.label}</span><span class="value">${metric.value}</span>`;
  metricsHost.appendChild(div);
});

const detailHost = document.getElementById("main-details");
mainDetails.forEach((item) => {
  const box = document.createElement("article");
  box.className = "detail-item";
  box.innerHTML = `<strong>${item.title}</strong><p class="muted">${item.value}</p>`;
  detailHost.appendChild(box);
});

renderHouseModel(document.getElementById("house-3d"));
