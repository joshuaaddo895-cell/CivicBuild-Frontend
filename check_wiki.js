const fs = require('fs');
const images = JSON.parse(fs.readFileSync('wiki_images.json'));

async function check() {
  for (const cat in images) {
    console.log(`Checking ${cat}...`);
    const valid = [];
    for (const url of images[cat]) {
      try {
        const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.status === 200) {
          valid.push(url);
        } else {
          console.log(`Failed: ${url} - ${res.status}`);
        }
      } catch (e) {
        console.log(`Error: ${url} - ${e.message}`);
      }
    }
    images[cat] = valid;
  }
  fs.writeFileSync('wiki_images_valid.json', JSON.stringify(images, null, 2));
}
check();
