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

const canvas3d = document.getElementById("house-3d");
import("./three-scenes.js")
  .then(({ renderHouseModel }) => {
    renderHouseModel(canvas3d);
  })
  .catch(() => {
    if (canvas3d) canvas3d.innerHTML = '<p class="muted" style="padding:16px">3D preview unavailable in this environment.</p>';
  });
