import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
const apiKey = match ? match[1].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

const scenario = "A busy coffee shop in downtown Chicago on a rainy morning";
const imagePrompt = `Calm EdTech style, modern vector illustration, minimalist, vibrant but soft colors, high quality. Theme: ${scenario}. No text, no letters, no words in the image.`;

const payload = {
  contents: [{
    parts: [{ text: imagePrompt }]
  }],
  generationConfig: {
    responseModalities: ["IMAGE"],
    response_format: {
      image: { aspect_ratio: "ASPECT_RATIO_SIXTEEN_BY_NINE" }
    }
  }
};

const models = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image"
];

for (const model of models) {
  console.log(`\n--- Testing model: ${model} ---`);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!res.ok) {
      console.error("Error:", JSON.stringify(data, null, 2));
    } else {
      const part = data.candidates?.[0]?.content?.parts?.[0];
      const inlineData = part?.inlineData || part?.inline_data;
      console.log("Success! MimeType:", inlineData?.mimeType);
      console.log("Base64 length:", inlineData?.data?.length);
      if (inlineData?.data) {
        console.log("Image generation verified!");
        break;
      }
    }
  } catch (err) {
    console.error("Fetch err:", err);
  }
}


