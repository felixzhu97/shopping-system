import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product, ProductModel } from '../models/Product';

dotenv.config();

const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/shopping-system';

const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors'] as const;
const modelKeys = [
  '2016_rolls-royce_dawn',
  'airpod_max',
  'apple_airtag',
  'apple_mac_mini_m1',
  'apple_vision_pro',
  'apple_watch_ultra_-_orange',
  'arnt_shoes_-_ulv_whussuphaterz',
  'book_open',
  'camera_canon_eos_400d',
  'desk_lamp',
  'female_bag',
  'headphones',
  'intel_cpu',
  'macbook_pro_m3_16_inch_2024',
  'mercedes-benz_maybach_2022',
  'nvidia_geforce_rtx_3090_-_gpu',
  'office_electronics_desk_fan_retro',
  'one_ring',
  'pepsi_bottle',
  'rayban_sunglasses',
  'rolls-royce_silver_cloud_ii__www.vecarz.com',
  'woody_toy_story',
] as const;

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
    const modelKey = modelKeys[i % modelKeys.length];

    products.push({
      name: `${category} Product ${index}`,
      description: `Sample ${category.toLowerCase()} product generated for database seeding.`,
      price,
      originalPrice,
      image: 'https://example.com/placeholder.jpg',
      modelKey,
      category,
      stock,
      rating: randomFloat(3.5, 5, 1),
      reviewCount: randomInt(0, 500),
      inStock: stock > 0,
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

