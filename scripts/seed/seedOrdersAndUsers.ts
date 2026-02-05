import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getMongoUri } from './seedUtils';
import { ProductModel } from './models/Product';
import { UserModel } from './models/User';
import { OrderModel } from './models/Order';

dotenv.config();

const DEFAULT_USER_COUNT = 10;
const DEFAULT_ORDER_COUNT = 50;

const FIRST_NAMES = [
  'James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia',
  'Elijah', 'Isabella', 'Lucas', 'Mia', 'Mason', 'Charlotte', 'Ethan', 'Amelia',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const PROVINCES = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];
const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Park Blvd', 'Washington St', 'Lake Rd'];
const PAYMENT_METHODS = ['alipay', 'wechat', 'credit-card'] as const;
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const DEFAULT_ORDER_DAYS_SPAN = 60;

type ProductSeed = { _id: mongoose.Types.ObjectId; name: string; image: string; price: number; description?: string };

const STATUS_WEIGHTS: [string, number][] = [
  ['delivered', 40], ['shipped', 25], ['processing', 20], ['pending', 10], ['cancelled', 5],
];

function pickWeightedStatus(): string {
  const r = Math.random() * 100;
  let cum = 0;
  for (const [s, w] of STATUS_WEIGHTS) { cum += w; if (r < cum) return s; }
  return 'delivered';
}

function randomDateOnClusteredDays(daysSpan: number): Date {
  const n = Math.max(8, Math.floor(daysSpan * 0.3));
  const days = new Set<number>();
  while (days.size < n) days.add(Math.floor(Math.random() * daysSpan));
  const d = new Date();
  d.setDate(d.getDate() - Array.from(days)[Math.floor(Math.random() * days.size)]);
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
  return d;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

async function seedUsers(count: number): Promise<mongoose.Types.ObjectId[]> {
  const ids: mongoose.Types.ObjectId[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    let email: string;
    do {
      email = `user${i + 1}+${Math.random().toString(36).slice(2, 8)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const user = await UserModel.create({
      email,
      password: 'SeedPassword123',
      role: i === 0 ? 'admin' : 'user',
      firstName,
      lastName,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      address: `${100 + Math.floor(Math.random() * 900)} ${pick(STREETS)}`,
      city: pick(CITIES),
      province: pick(PROVINCES),
      postalCode: String(10000 + Math.floor(Math.random() * 90000)),
      paymentMethod: pick(PAYMENT_METHODS),
    });
    ids.push(user._id as mongoose.Types.ObjectId);
  }
  return ids;
}

async function seedOrders(
  orderCount: number,
  userIds: mongoose.Types.ObjectId[],
  products: ProductSeed[],
  daysSpan: number
): Promise<number> {
  if (products.length === 0) return 0;

  for (let i = 0; i < orderCount; i++) {
    const numItems = 1 + Math.floor(Math.random() * Math.min(5, products.length));
    const selected = pickN(products, numItems);
    const isBulk = Math.random() < 0.12;
    const randQty = () => (isBulk ? 4 + Math.floor(Math.random() * 9) : 1 + Math.floor(Math.random() * 5));
    const items = selected.map((p) => ({
      productId: p._id,
      name: p.name,
      image: p.image || 'https://via.placeholder.com/100',
      price: p.price,
      quantity: randQty(),
      description: p.description,
    }));
    const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const createdAt = randomDateOnClusteredDays(daysSpan);

    const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    await OrderModel.create({
      userId: pick(userIds),
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: pickWeightedStatus(),
      shippingAddress: {
        fullName,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${100 + Math.floor(Math.random() * 900)} ${pick(STREETS)}`,
        city: pick(CITIES),
        province: pick(PROVINCES),
        postalCode: String(10000 + Math.floor(Math.random() * 90000)),
      },
      paymentMethod: pick(PAYMENT_METHODS),
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 86400000)),
    });
  }
  return orderCount;
}

const envInt = (key: string, def: number) =>
  parseInt(process.env[key] ?? String(def), 10) || def;

const run = async () => {
  const userCount = envInt('SEED_USER_COUNT', DEFAULT_USER_COUNT);
  const orderCount = envInt('SEED_ORDER_COUNT', DEFAULT_ORDER_COUNT);
  const daysSpan = envInt('SEED_ORDER_DAYS_SPAN', DEFAULT_ORDER_DAYS_SPAN);

  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);

  try {
    const ordersDeleted = await OrderModel.deleteMany({});
    const usersDeleted = await UserModel.deleteMany({});
    console.log(`Cleaned: ${ordersDeleted.deletedCount} orders, ${usersDeleted.deletedCount} users`);

    const products = await ProductModel.find({}).select('_id name image price description').lean();
    if (products.length === 0) {
      console.error('No products found. Run product seed first: pnpm run seed:products200:dev');
      process.exit(1);
    }
    console.log(`Found ${products.length} products`);

    const userIds = await seedUsers(userCount);
    console.log(`Seeded ${userIds.length} users`);

    const ordersCreated = await seedOrders(orderCount, userIds, products as ProductSeed[], daysSpan);
    console.log(`Seeded ${ordersCreated} orders (dates spread over last ${daysSpan} days)`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
