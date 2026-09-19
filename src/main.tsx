import ReactDOM from "react-dom/client";
import { CareerApp } from "./ui/CareerApp";
import "./styles.css";
import "./studio.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("QA Idle root element is missing.");
}
export const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(<CareerApp />);
