import 'dotenv/config';
import mongoose from 'mongoose';
import { Business } from '../api/models/Business';

async function main() {
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017/mylebpass';
  await mongoose.connect(url, { dbName: 'mylebpass' });

  const businesses = await Business.find({}, 'email businessModel usageLimit createdAt')
    .sort({ createdAt: -1 })
    .lean();

  console.log(`Found ${businesses.length} business(es):\n`);
  for (const b of businesses) {
    console.log(`email=${b.email} | businessModel=${b.businessModel} | usageLimit=${(b as any).usageLimit ?? '(unset)'}`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
