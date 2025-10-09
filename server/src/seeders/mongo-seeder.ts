import mongoose from 'mongoose';
import { User, userSchema, UserRole, UserLocation, UserDepartment } from '../models/user.model';
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

    const users = [
      {
        name: 'Kaleem Mohammed',
        password: 'kaleem@dcm',
        role: UserRole.SUPERADMIN,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.GENERAL,
        email: 'kalm@demandcurvemarketing.com',
        phone: '8296173336',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Kaleem Md',
        password: 'Kal@786',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.GENERAL,
        email: 'kaleem@demandcurvemarketing.com',
        phone: '8296173336',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Malik Muzammil',
        password: 'muzammil@dcm',
        role: UserRole.SUPERADMIN,
        userLoc: UserLocation.MUMBAI,
        department: UserDepartment.GENERAL,
        email: 'Markm@demandcurvemarketing.com',
        phone: '9172460147',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Muzamil M',
        password: 'malik@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.MUMBAI,
        department: UserDepartment.GENERAL,
        email: 'malikm@demandcurvemarketing.com',
        phone: '9172460147',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Ashraf Ali',
        password: 'ashraf@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.DATA,
        email: 'ashraf.ali@demandcurvemarketing.com',
        phone: '9945836292',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Nihal Ahmed',
        password: 'nihal@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.IT,
        email: 'nihal.ahmed@demandcurvemarketing.com',
        phone: '7975417762',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Dinesh Kumar',
        password: 'dinesh@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.HR,
        email: 'dinesh.kumar@demandcurvemarketing.com',
        phone: '9663567392',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Kannan Jaguya',
        password: 'Kannan@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.MUMBAI,
        department: UserDepartment.HR,
        email: 'kannan.jm@demandcurvemarketing.com',
        phone: '79045 91853',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Anwar Siddiqui',
        password: 'anwar@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.MUMBAI,
        department: UserDepartment.IT,
        email: 'anwar.siddiqui@demandcurvemarketing.com',
        phone: '7208300986',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: "Waris Ali",
        password: "waris@dcm",
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.SALES,
        email: "waris.ali@demandcurvemarketing.com",
        phone: "7006188016",
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Syed Fiddarain',
        password: 'fiddu@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.SALES,
        email: 'ben.colvin@demandcurvemarketing.com',
        phone: '7899134198',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
      {
        name: 'Afroz Pasha',
        password: 'Affu@dcm',
        role: UserRole.USER,
        userLoc: UserLocation.BENGALURU,
        department: UserDepartment.SALES,
        email: 'peter.anderson@demandcurvemarketing.com',
        phone: '8971112188',
        allocatedBudgets: [],
        reimbursements: [],
        expenses: [],
        budgetLeft: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        sessions: [],
        spentAmount: 0
      },
    ];

    // Hash passwords and insert users with ALL fields
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);

      await new UserModel({
        ...user,
        password: hashedPassword
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