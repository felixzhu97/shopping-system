import { booksProducts } from './productData/books';
import { clothingProducts } from './productData/clothing';
import { electronicsProducts } from './productData/electronics';
import { homeKitchenProducts } from './productData/homeKitchen';
import { sportsOutdoorsProducts } from './productData/sportsOutdoors';
import { makeTargetSizeProducts, seedProducts } from './seedUtils';

const products = [
  ...makeTargetSizeProducts(electronicsProducts, 40),
  ...makeTargetSizeProducts(clothingProducts, 40),
  ...makeTargetSizeProducts(homeKitchenProducts, 40),
  ...makeTargetSizeProducts(booksProducts, 40),
  ...makeTargetSizeProducts(sportsOutdoorsProducts, 40),
];

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
