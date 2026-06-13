import { readFileSync } from 'fs';

const text = readFileSync("live-bundle.js", "utf8");
console.log("File loaded. length:", text.length);

const target = "Please enter your house number/address";
const idx = text.indexOf(target);
console.log(`Index of "${target}":`, idx);
if (idx !== -1) {
  console.log(text.slice(idx - 100, idx + 1000));
}
