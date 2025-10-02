import mongoose from 'mongoose';
import { User, userSchema, UserRole } from '../models/user.model';
import * as argon2 from 'argon2';

import dotenv from "dotenv"

dotenv.config()

// Create User model
const UserModel = mongoose.model<User & mongoose.Document>('User', userSchema);

async function seed() {
  try {
    await mongoose.connect("mongodb+srv://aasifdemand:demand12345@cluster0.pkim2nz.mongodb.net/EXPENSES?retryWrites=true&w=majority&appName=Cluster0");

    // Clear existing users
    await UserModel.deleteMany({});

    // Password hashing helper
    const hashPassword = async (password: string) => {
      return await argon2.hash(password);
    };

    // Array of users to create
    const users = [
      { name: 'Kaleem Mohammed', password: 'kaleem@dcm', role: UserRole.SUPERADMIN },
      { name: "Malik Muzammil", password: "muzammil@dcm", role: UserRole.SUPERADMIN },
      { name: 'Ashraf Ali', password: 'ashraf@dcm', role: UserRole.USER },
      { name: 'Nihal Ahmed', password: 'nihal@dcm', role: UserRole.USER },
      { name: 'Mohammed Ovez', password: 'ovez@dcm', role: UserRole.USER },
      { name: "Dinesh Kumar", password: "dinesh@dcm", role: UserRole.USER },

      //   { name: 'user4', password: 'password123', role: UserRole.USER },
      //   { name: 'user5', password: 'password123', role: UserRole.USER },
      //   { name: 'user6', password: 'password123', role: UserRole.USER },
      //   { name: 'user7', password: 'password123', role: UserRole.USER },
      //   { name: 'user8', password: 'password123', role: UserRole.USER },
    ];

    // Hash passwords and insert users
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await new UserModel({
        name: user.name,
        password: hashedPassword,
        role: user.role,
      }).save();
    }

    console.log('Seed completed ✔✔');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

void seed();
