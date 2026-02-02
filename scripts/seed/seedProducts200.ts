import { makeTargetSizeProducts, seedProducts } from './seedUtils';
import { electronicsProducts } from './productData/electronics';
import { clothingProducts } from './productData/clothing';
import { homeKitchenProducts } from './productData/homeKitchen';
import { booksProducts } from './productData/books';
import { sportsOutdoorsProducts } from './productData/sportsOutdoors';

const baseProducts = [
  ...electronicsProducts,
  ...clothingProducts,
  ...homeKitchenProducts,
  ...booksProducts,
  ...sportsOutdoorsProducts,
];

const products = makeTargetSizeProducts(baseProducts, 200);

const run = async () => {
  try {
    const createdCount = await seedProducts(products);
    console.log(`Seeded products: ${createdCount}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

run();
