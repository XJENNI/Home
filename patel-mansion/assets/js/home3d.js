import { mountARHouse, mountWalkthrough } from "./three-scenes.js";

mountWalkthrough(
  document.getElementById("walkthrough-3d"),
  document.getElementById("lock-walkthrough")
);

mountARHouse(
  document.getElementById("ar-3d"),
  document.getElementById("ar-button-host")
);
