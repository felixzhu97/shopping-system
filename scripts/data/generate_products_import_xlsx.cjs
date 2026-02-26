/* eslint-disable no-console */
const path = require('path');
const XLSX = require('xlsx');

function pad(n, width) {
  const s = String(n);
  return s.length >= width ? s : '0'.repeat(width - s.length) + s;
}

function randomInt(seed) {
  const a = 1103515245;
  const c = 12345;
  const m = 2 ** 31;
  const next = (a * seed + c) % m;
  return next;
}

function pick(list, seed) {
  const idx = seed % list.length;
  return list[idx];
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function main() {
  const outPath =
    process.argv[2] ||
    path.resolve(
      process.cwd(),
      'services/api/src/__tests__/fixtures/products-import-1000.xlsx'
    );

  const categories = [
    'Electronics',
    'Home & Kitchen',
    'Clothing',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Office',
  ];

  const rows = [];
  for (let i = 1; i <= 1000; i += 1) {
    let seed = i;
    seed = randomInt(seed);
    const category = pick(categories, seed);

    seed = randomInt(seed);
    const basePrice = (seed % 20000) / 100;
    const price = Math.max(1, Number(basePrice.toFixed(2)));

    seed = randomInt(seed);
    const stock = clamp(seed % 500, 0, 500);

    seed = randomInt(seed);
    const rating = Number(((seed % 50) / 10).toFixed(1));

    seed = randomInt(seed);
    const reviewCount = seed % 5000;

    seed = randomInt(seed);
    const inStock = stock > 0 ? true : seed % 2 === 0;

    const name = `Test Product ${pad(i, 4)}`;
    const description = `Generated product for import testing (${i}).`;
    const image = `https://example.com/images/products/${pad(i, 4)}.png`;
    const modelKey = `test-model-${pad((i % 120) + 1, 3)}`;
    const originalPrice = Number((price * 1.2).toFixed(2));

    rows.push({
      name,
      description,
      price,
      image,
      category,
      stock,
      modelKey,
      originalPrice,
      inStock,
      rating,
      reviewCount,
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      'name',
      'description',
      'price',
      'image',
      'category',
      'stock',
      'modelKey',
      'originalPrice',
      'inStock',
      'rating',
      'reviewCount',
    ],
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'products');

  XLSX.writeFile(workbook, outPath);
  console.log(`Generated Excel file with 1000 rows: ${outPath}`);
}

main();
