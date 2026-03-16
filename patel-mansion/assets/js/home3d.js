import { mountARHouse, mountWalkthrough } from "./three-scenes.js";

mountWalkthrough(
  document.getElementById("walkthrough-3d"),
  document.getElementById("lock-walkthrough"),
  document.getElementById("walkthrough-status")
);

mountARHouse(
  document.getElementById("ar-3d"),
  document.getElementById("ar-button-host")
);
