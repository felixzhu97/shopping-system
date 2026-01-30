import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product, ProductModel } from '../models/Product';

dotenv.config();

const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/shopping-system';

const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors'] as const;

function randomInt(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function randomFloat(minInclusive: number, maxInclusive: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  const value = Math.random() * (maxInclusive - minInclusive) + minInclusive;
  return Math.round(value * factor) / factor;
}

function createProducts(count: number): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const index = String(i + 1).padStart(3, '0');
    const price = randomFloat(9.99, 1999.99, 2);
    const hasDiscount = Math.random() < 0.35;
    const originalPrice = hasDiscount ? randomFloat(price * 1.05, price * 1.35, 2) : undefined;
    const stock = randomInt(0, 200);

    products.push({
      name: `${category} Product ${index}`,
      description: `Sample ${category.toLowerCase()} product generated for database seeding.`,
      price,
      originalPrice,
      image: 'https://example.com/placeholder.jpg',
      category,
      stock,
      rating: randomFloat(3.5, 5, 1),
      reviewCount: randomInt(0, 500),
      inStock: stock > 0
    });
  }

  return products;
}

async function main(): Promise<void> {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  await ProductModel.deleteMany({});
  console.log('Cleared existing products');

  const products = createProducts(200);
  const createdProducts = await ProductModel.insertMany(products);
  console.log(`Inserted ${createdProducts.length} products`);

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

