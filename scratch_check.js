import { readFileSync } from 'fs';

const text = readFileSync("live-bundle.js", "utf8");
console.log("File loaded. length:", text.length);

const target = "Localhost Wallet";
const idx = text.indexOf(target);
console.log(`Index of "${target}":`, idx);
if (idx !== -1) {
  console.log(text.slice(idx - 500, idx + 500));
}
