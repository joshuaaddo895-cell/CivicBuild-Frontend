const ids = [
  '1773394089934-3e29f2a3d6a9',
  '1680357680725-f350480aee35',
  '1681880511033-b9582a379ce2',
  '1739373849445-a4434a5ecb58',
  '1777793919219-5b1fd98af8cb',
  '1595414440701-da000c40df9c',
  '1517646287270-a5a9ca602e5c',
  '1541888946425-d81bb19240f5',
  '1580810734898-5e1753f23337',
  '1531834685032-c34bf0d84e79',
  '1565008447742-97f6f38c985c',
  '1770149682967-5733992e49ff',
  '1578328819058-b69f3a3b0f6b',
  '1581092160607-ee22621dd758',
  '1683121910935-9df51a09e93f',
  '1683120758027-72a9417db45d',
  '1584622650111-993a426fbf0a',
  '1589939705384-5185137a7f0f',
  '1590069261209-f8e9b8642343',
  '1600585154340-be6161a56a0c',
  '1744960151551-89325664e916',
  '1773525912493-cdb088d19d64',
  '1770838773181-e1b17ec22fee',
  '1728026462560-91b60aac93b9',
  '1730627283177-f43b83c3850c',
];

async function check() {
  for (const id of ids) {
    const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) console.log(`Valid: ${id}`);
      else console.log(`Invalid: ${id} - ${res.status}`);
    } catch (e) {
      console.log(`Error: ${id}`);
    }
  }
}
check();
