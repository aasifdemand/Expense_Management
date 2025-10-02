import { connect, model } from "mongoose";
import { ExpenseSchema, Expense } from "../models/expense.model";
import { DepartmentSchema, Department } from "../models/department.model";

async function migrateExpenses() {
    await connect(process.env.MONGO_URI || "mongodb+srv://aasifdemand:demand12345@cluster0.pkim2nz.mongodb.net/EXPENSES?retryWrites=true&w=majority&appName=Cluster0");
    const ExpenseModel = model<Expense>("Expense", ExpenseSchema);
    const DepartmentModel = model<Department>("Department", DepartmentSchema);

    const departments = await DepartmentModel.find().lean();

    for (const dept of departments) {
        const res = await ExpenseModel.updateMany(
            { department: dept.name },          // match string value
            { $set: { department: dept._id } } // update to ObjectId
        );
        console.log(`Updated ${res.modifiedCount} expenses for department: ${dept.name}`);
    }

    console.log("✅ Migration done!");
    process.exit(0);
}

migrateExpenses();
