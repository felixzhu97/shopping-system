import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getMongoUri } from './seedUtils';
import { UserModel } from './models/User';
import { DEFAULT_ADMIN, DEFAULT_USER } from './defaultUsers';

dotenv.config();

async function run() {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);

  try {
    if (!(await UserModel.exists({ email: DEFAULT_ADMIN.email }))) {
      await UserModel.create(DEFAULT_ADMIN);
      console.log('Created admin: admin@example.com / Admin123!');
    }
    if (!(await UserModel.exists({ email: DEFAULT_USER.email }))) {
      await UserModel.create(DEFAULT_USER);
      console.log('Created user: user@example.com / User123!');
    }
    console.log('Default users ready: admin@example.com / Admin123!, user@example.com / User123!');
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error('Seed default users failed:', err);
  process.exit(1);
});
