async function run() {
  console.log("Fetching live homepage HTML...");
  const htmlRes = await fetch("https://nishi-store.vercel.app/", { headers: { 'cache-control': 'no-cache' } });
  const htmlText = await htmlRes.text();
  
  // extract script source
  const match = htmlText.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (!match) {
    console.error("No script match found in HTML");
    return;
  }
  
  const jsUrl = "https://nishi-store.vercel.app" + match[1];
  console.log("Found live JS bundle URL:", jsUrl);
  
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  // check if checkoutDetails is cleared in handleCheckoutFormSubmit
  // Our target from before was `Please enter your house number/address`
  const target = "Please enter your house number/address";
  const idx = jsText.indexOf(target);
  console.log(`Index of "${target}":`, idx);
  if (idx !== -1) {
    const snippet = jsText.slice(idx - 100, idx + 1000);
    console.log("Snippet:");
    console.log(snippet);
    
    // Check if `he({houseNo:``,pincode:``,mobileNo:``})` is in the setTimeout inside the onSubmit logic
    // Wait, let's see if the setTimeout contains `houseNo` clearing
    const hasClearingInTimeout = snippet.includes("houseNo:``");
    console.log("Has clearing in setTimeout:", hasClearingInTimeout);
  }
}
run();
