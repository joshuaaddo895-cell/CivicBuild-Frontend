const fs = require('fs');

async function searchDDG(query) {
  const url = `https://html.duckduckgo.com/html/?q=site:unsplash.com/photos+${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  const html = await res.text();
  const matches = [...html.matchAll(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g)];
  return [...new Set(matches.map((m) => m[0]))];
}

const queries = {
  cement: 'cement bags',
  blocks: 'concrete blocks',
  gravel: 'gravel pile',
  steel: 'steel rebar',
  roofing: 'corrugated roof',
  tiles: 'ceramic floor tiles',
  paint: 'paint bucket',
  plumbing: 'pvc pipes',
  electrical: 'electrical cable spool',
};

async function run() {
  const result = {};
  for (const [cat, q] of Object.entries(queries)) {
    const urls = await searchDDG(q);
    result[cat] = urls;
    console.log(`${cat}: ${urls.length} images`);
  }
  fs.writeFileSync('unsplash_urls.json', JSON.stringify(result, null, 2));
}
run();
