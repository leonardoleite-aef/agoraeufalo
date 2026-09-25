(async () => {
  console.log("Testing POST http://localhost:5173/api/lab/generate-cover ...");
  try {
    const res = await fetch("http://localhost:5173/api/lab/generate-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: "A tech startup office in San Francisco, team working on laptops" })
    });
    console.log("HTTP Status:", res.status, res.statusText);
    const data = await res.json();
    console.log("Success:", data.success);
    console.log("ImageBase64 length:", data.imageBase64?.length);
    if (data.success && data.imageBase64) {
      console.log("✅ Worker /api/lab/generate-cover is working perfectly!");
    } else {
      console.error("❌ Response data:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
})();
