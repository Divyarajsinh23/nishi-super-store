import { spawn } from "child_process";

console.log("Starting Vite development server...");
const vite = spawn("npx", ["vite"], { stdio: "inherit", shell: true });

console.log("Starting Auto-Deploy watcher...");
const watcher = spawn("node", ["auto-deploy.js"], { stdio: "inherit", shell: true });

process.on("SIGINT", () => {
  vite.kill();
  watcher.kill();
  process.exit();
});
