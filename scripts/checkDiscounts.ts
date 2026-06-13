import 'dotenv/config';
import mongoose from 'mongoose';
import { Discount } from '../api/models/Discount';

async function main() {
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017/mylebpass';
  await mongoose.connect(url, { dbName: 'mylebpass' });

  const conn = mongoose.connection;
  console.log(`Connected host: ${conn.host}  db: ${conn.name}\n`);

  const total = await Discount.countDocuments({});
  console.log(`Total discounts: ${total}\n`);

  const recent = await Discount.find({}).sort({ createdAt: -1 }).limit(5).lean();
  console.log('Most recent 5:');
  for (const d of recent) {
    console.log(
      `  _id=${d._id} | userId=${d.userId} | businessId=${d.businessId} | discountedAt=${(d as any).discountedAt?.toISOString?.() ?? d.discountedAt} | createdAt=${(d as any).createdAt?.toISOString?.() ?? '(none)'}`
    );
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
