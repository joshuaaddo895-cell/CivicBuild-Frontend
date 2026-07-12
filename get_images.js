const fs = require('fs');
async function getWikiImages(query, limit = 5) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&pithumbsize=600`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await res.json();
  const pages = data.query?.pages || {};
  return Object.values(pages)
    .filter((p) => p.thumbnail)
    .map((p) => p.thumbnail.source);
}

const categories = {
  cement: 'cement bag -site:wikipedia.org',
  blocks: 'concrete block -site:wikipedia.org',
  gravel: 'crushed stone -site:wikipedia.org',
  steel: 'steel rebar -site:wikipedia.org',
  roofing: 'corrugated metal roof -site:wikipedia.org',
  tiles: 'ceramic floor tiles -site:wikipedia.org',
  paint: 'paint bucket -site:wikipedia.org',
  plumbing: 'pvc pipes -site:wikipedia.org',
  electrical: 'electrical wire spools -site:wikipedia.org',
};

async function run() {
  const result = {};
  for (const [cat, query] of Object.entries(categories)) {
    result[cat] = await getWikiImages(query);
  }
  fs.writeFileSync('wiki_images.json', JSON.stringify(result, null, 2));
}
run();
