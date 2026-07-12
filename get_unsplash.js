const fs = require('fs');
async function searchUnsplash(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=10`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results.filter((r) => !r.premium).map((r) => r.id);
}
async function run() {
  try {
    const ids = await searchUnsplash('cement');
    console.log(ids);
  } catch (e) {
    console.log(`Failed: ${e.message}`);
  }
}
run();
