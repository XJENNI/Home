const params = new URLSearchParams(window.location.search);
const id = Number(params.get("phase"));
const phase = window.homeData.phases.find((item) => item.id === id);

if (!phase) {
  document.querySelector("main").innerHTML = `<section class="premium-card"><h1>Phase not found</h1><a class="btn" href="phases.html">Back</a></section>`;
} else {
  document.getElementById("phase-title").textContent = phase.title;
  document.getElementById("phase-budget").textContent = `Budget: ${phase.budget}`;
  document.getElementById("phase-duration").textContent = `Duration: ${phase.duration}`;

  phase.scope.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    document.getElementById("phase-scope").appendChild(li);
  });
}
