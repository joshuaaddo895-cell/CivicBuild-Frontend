const fs = require('fs');

// Verified image pools per category (free Unsplash IDs)
const images = {
  cement: [
    '1773394089934-3e29f2a3d6a9',
    '1680357680725-f350480aee35',
    '1681880511033-b9582a379ce2',
    '1739373849445-a4434a5ecb58',
  ],
  blocks: [
    '1777793919219-5b1fd98af8cb',
    '1595414440701-da000c40df9c',
    '1517646287270-a5a9ca602e5c',
  ],
  gravel: [
    '1777793919219-5b1fd98af8cb',
    '1681880511033-b9582a379ce2',
    '1541888946425-d81bb19240f5',
  ],
  steel: ['1580810734898-5e1753f23337', '1565008447742-97f6f38c985c'],
  roofing: [
    '1770149682967-5733992e49ff',
    '1578328819058-b69f3a3b0f6b',
    '1581092160607-ee22621dd758',
  ],
  tiles: [
    '1584622650111-993a426fbf0a',
    '1517646287270-a5a9ca602e5c', // blocks also has this
  ],
  paint: ['1590069261209-f8e9b8642343', '1600585154340-be6161a56a0c'],
  plumbing: ['1744960151551-89325664e916', '1773525912493-cdb088d19d64'],
  electrical: [
    '1770838773181-e1b17ec22fee',
    '1728026462560-91b60aac93b9',
    '1730627283177-f43b83c3850c',
  ],
};

let content = fs.readFileSync('src/constants/mockProducts.ts', 'utf8');

// The objects have `category: '...'` followed by `imageUri`, `imageUrl`, `image_url` lines.
let out = [];
let lines = content.split('\n');
let currentCat = 'cement';
let indices = {
  cement: 0,
  blocks: 0,
  gravel: 0,
  steel: 0,
  roofing: 0,
  tiles: 0,
  paint: 0,
  plumbing: 0,
  electrical: 0,
};

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  let catMatch = line.match(/category:\s*'([^']+)'/);
  if (catMatch) {
    currentCat = catMatch[1];
  }

  if (line.match(/(imageUri|imageUrl|image_url):\s*$/)) {
    out.push(line);
    // next line is the url
    let nextLine = lines[i + 1];
    if (nextLine && nextLine.includes('unsplash.com')) {
      let pool = images[currentCat] || images['cement'];
      let id = pool[indices[currentCat] % pool.length];
      let newUrl = `      'https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80',`;
      out.push(newUrl);
      if (line.includes('imageUri')) {
        indices[currentCat]++; // increment once per product
      }
      i++; // skip original url line
      continue;
    }
  }

  out.push(line);
}

fs.writeFileSync('src/constants/mockProducts.ts', out.join('\n'));
console.log('Done updating mockProducts.ts');
