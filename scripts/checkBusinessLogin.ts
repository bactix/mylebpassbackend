import 'dotenv/config';
import mongoose from 'mongoose';
import { Business } from '../api/models/Business';

async function main() {
  const url = process.env.MONGO_URL || 'mongodb://localhost:27017/mylebpass';
  await mongoose.connect(url, { dbName: 'mylebpass' });

  const businesses = await Business.find({}, 'email accountType status password').lean();
  console.log(`Found ${businesses.length} business(es):\n`);
  for (const b of businesses) {
    console.log(
      `email=${b.email} | accountType=${(b as any).accountType ?? '(unset)'} | status=${b.status} | hasPassword=${Boolean((b as any).password)}`
    );
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
