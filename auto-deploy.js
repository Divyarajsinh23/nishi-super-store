import chokidar from "chokidar";
import { simpleGit } from "simple-git";

const git = simpleGit();

let timer = null;

async function deploy() {
  try {
    console.log("Changes detected...");

    await git.add("./*");

    const status = await git.status();

    if (status.files.length === 0) {
      console.log("No changes to commit.");
      return;
    }

    await git.commit(`Auto update ${new Date().toLocaleString()}`);

    await git.push("origin", "main");

    console.log("Code pushed successfully!");
    console.log("Vercel deployment started automatically.");
  } catch (err) {
    console.error("Auto-deploy error:", err);
  }
}

chokidar
  .watch(".", {
    ignored: [
      /node_modules/,
      /.git/,
      /.vercel/,
      /dist/,
      /dev-run.js/
    ],
    persistent: true
  })
  .on("change", () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      deploy();
    }, 10000); // Wait 10 seconds after last change
  });

console.log("Watching for file changes...");