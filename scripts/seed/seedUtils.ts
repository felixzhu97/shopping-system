import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ProductModel, { SeedProduct } from './models/Product';

dotenv.config();

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

export function getMongoUri(): string {
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';
}

export async function seedProducts(products: SeedProduct[]): Promise<number> {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);
  try {
    const { deletedCount } = await ProductModel.deleteMany({});
    console.log(`Removed products: ${deletedCount ?? 0}`);
    const created = await ProductModel.insertMany(products);
    return created.length;
  } finally {
    await mongoose.disconnect();
  }
}

export function makeTargetSizeProducts(base: SeedProduct[], target: number): SeedProduct[] {
  if (target <= 0) return [];
  if (base.length === 0) return [];

  const result: SeedProduct[] = [];
  let i = 0;
  while (result.length < target) {
    const p = base[i % base.length];
    const seq = result.length + 1;
    result.push({
      ...p,
      category: categories[Math.floor(Math.random() * categories.length)],
      modelKey: modelKeys[Math.floor(Math.random() * modelKeys.length)],
      name: `${p.name} - Variant ${seq}`,
      price: roundToOneDecimal(p.price * (0.9 + Math.random() * 0.2)),
      originalPrice:
        p.originalPrice === undefined ? undefined : roundToOneDecimal(p.originalPrice * (0.9 + Math.random() * 0.3)),
      stock: Math.max(0, Math.floor(50 + Math.random() * 150)),
      rating: p.rating === undefined ? undefined : roundToOneDecimal(p.rating * (0.9 + Math.random() * 0.2)),
      reviewCount:
        p.reviewCount === undefined
          ? undefined
          : Math.max(0, Math.floor(p.reviewCount * (0.7 + Math.random() * 0.6))),
      inStock: p.inStock ?? true,
    });
    i++;
  }
  return result;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

