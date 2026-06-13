async function run() {
  const url = "https://nishi-store.vercel.app/";
  const res = await fetch(url, { method: "HEAD" });
  console.log("Headers for homepage:");
  for (const [key, val] of res.headers.entries()) {
    console.log(`${key}: ${val}`);
  }
}
run();
