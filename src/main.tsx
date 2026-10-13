import ReactDOM from "react-dom/client";
import { CareerApp } from "./ui/CareerApp";
import { ReleaseLabApp } from "./ui/ReleaseLabApp";
import "./styles.css";
import "./studio.css";
import "./office.css";
import "./products.css";
import "./pipeline.css";
import "./architecture.css";
import "./network.css";
import "./discovery.css";
import "./frontier.css";
import "./release-lab.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("QA Idle root element is missing.");
}
export const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(
  new URLSearchParams(window.location.search).get("playtest") === "release-lab" ? (
    <ReleaseLabApp />
  ) : (
    <CareerApp />
  ),
);
