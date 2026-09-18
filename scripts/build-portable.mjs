import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// The game has no remote assets. Inline the production bundle so the release
// can also be opened directly from disk without a development server.
const root = resolve(import.meta.dirname, "../dist");
let html = await readFile(resolve(root, "index.html"), "utf8");
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const style = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !style) {
  throw new Error("Expected one JavaScript and one CSS entry in dist/index.html.");
}
const asset = (url) => resolve(root, url.replace(/^\//, ""));
const js = await readFile(asset(script[1]), "utf8");
const css = await readFile(asset(style[1]), "utf8");
html = html.replace(
  script[0],
  () => `<script type="module">${js.replace(/<\/script/gi, "<\\/script")}</script>`,
);
html = html.replace(style[0], () => `<style>${css}</style>`);
await writeFile(resolve(root, "qa-idle.html"), html);
console.log("Portable game: dist/qa-idle.html");
