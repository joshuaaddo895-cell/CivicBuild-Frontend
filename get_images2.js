const fs = require('fs');
async function getWikiImages(query, limit = 10) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&pithumbsize=600`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await res.json();
  const pages = data.query?.pages || {};
  return Object.values(pages)
    .filter((p) => p.thumbnail)
    .map((p) => p.thumbnail.source);
}

const categories = {
  cement: ['cement bags', 'portland cement', 'cement powder construction'],
  blocks: ['concrete block pallet', 'sandcrete blocks', 'cinder blocks wall'],
  gravel: ['crushed stone aggregate', 'gravel pile construction', 'river sand'],
  steel: ['steel rebar stack', 'iron rods construction', 'steel i-beams'],
  roofing: ['corrugated metal roofing', 'aluminum roofing sheets', 'roofing tiles sheet'],
  tiles: ['ceramic floor tiles', 'porcelain tiles floor', 'bathroom wall tiles'],
  paint: ['paint bucket construction', 'paint cans', 'wall paint colors'],
  plumbing: ['pvc pipes plumbing', 'pvc water pipe', 'brass plumbing fittings'],
  electrical: ['electrical cable spool', 'pvc conduit pipe', 'electrical wiring wire'],
};

async function run() {
  const result = {};
  for (const [cat, queries] of Object.entries(categories)) {
    result[cat] = [];
    for (const q of queries) {
      const imgs = await getWikiImages(q);
      result[cat].push(...imgs);
    }
    result[cat] = [...new Set(result[cat])]; // unique
  }
  fs.writeFileSync('wiki_images2.json', JSON.stringify(result, null, 2));
}
run();
