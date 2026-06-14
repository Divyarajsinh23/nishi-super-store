async function run() {
  console.log("Fetching live homepage HTML...");
  const htmlRes = await fetch("https://nishi-store.vercel.app/?t=" + Date.now(), { headers: { 'cache-control': 'no-cache' } });
  const htmlText = await htmlRes.text();
  
  const match = htmlText.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (!match) {
    console.error("No script match found in HTML");
    return;
  }
  
  const jsUrl = "https://nishi-store.vercel.app" + match[1];
  console.log("Found live JS bundle URL:", jsUrl);
  
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  // Let's check if there are image references like "/images/pulses_toor_dal.png" in the JS code
  const hasToorDalImage = jsText.includes("/images/pulses_toor_dal.png");
  console.log("Has Toor Dal image path in JS:", hasToorDalImage);
  
  // Check for some other products
  const hasLaysChips = jsText.includes("Lays Chips");
  console.log("Has Lays Chips in JS:", hasLaysChips);
  
  const hasMasoorDal = jsText.includes("Masoor Dal");
  console.log("Has Masoor Dal in JS:", hasMasoorDal);
  
  // Print a small snippet around Masoor Dal or Toor Dal if found
  const toorIdx = jsText.indexOf("Toor Dal");
  if (toorIdx !== -1) {
    console.log("Snippet around Toor Dal:");
    console.log(jsText.substring(toorIdx - 100, toorIdx + 500));
  } else {
    console.log("Toor Dal not found in JS bundle.");
  }
}
run();
