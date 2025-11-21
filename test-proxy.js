async function test() {
  const url = "http://localhost:3000/api/proxy";
  const token = "CCheckerProxyToken202511202100";

  // Test 1: Valid Request
  console.log("Test 1: Valid Request");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Token: token },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body length:", text.length);
    if (text.includes("Example Domain")) console.log("Success: Content found");
    else console.log("Failure: Content not found");
  } catch (e) {
    console.error(e);
  }

  // Test 2: Invalid Token
  console.log("\nTest 2: Invalid Token");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Token: "WRONG" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    console.log("Status:", res.status);
    if (res.status === 401) console.log("Success: 401 Unauthorized");
    else console.log("Failure: Expected 401");
  } catch (e) {
    console.error(e);
  }
}
test();
