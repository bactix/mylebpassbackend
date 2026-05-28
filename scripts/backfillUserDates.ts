import dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { User } from '../api/models/User';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mylebpass';

async function backfillUserDates() {
  try {
    await connect(MONGO_URL);
    console.log('Connected to MongoDB');

    const now = new Date();
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Find all users with missing date fields
    const usersWithMissingDates = await User.find({
      $or: [
        { startDate: { $exists: false } },
        { expiryDate: { $exists: false } },
        { createdAt: { $exists: false } },
      ],
    });

    console.log(`Found ${usersWithMissingDates.length} users with missing date fields`);

    // Backfill missing dates
    for (const user of usersWithMissingDates) {
      if (!user.startDate) user.startDate = now;
      if (!user.expiryDate) user.expiryDate = oneYearFromNow;
      if (!user.createdAt) user.createdAt = now;
      await user.save();
    }

    console.log(`Successfully backfilled ${usersWithMissingDates.length} users`);

    // Verify all users now have required fields
    const usersWithoutDates = await User.find({
      $or: [
        { startDate: { $exists: false } },
        { expiryDate: { $exists: false } },
        { createdAt: { $exists: false } },
      ],
    });

    if (usersWithoutDates.length === 0) {
      console.log('✓ All users now have required date fields');
    } else {
      console.log(`⚠ ${usersWithoutDates.length} users still missing date fields`);
    }
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

backfillUserDates();
