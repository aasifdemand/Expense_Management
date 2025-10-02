import { connect, connection, model, Types, Document } from "mongoose";
import * as dotenv from "dotenv";

import { DepartmentSchema, Department } from "../models/department.model";
import { SubDepartmentSchema, SubDepartment } from "../models/sub-department.model";

dotenv.config();

async function runSeeder() {
    try {
        await connect(process.env.MONGO_URI || "mongodb+srv://aasifdemand:demand12345@cluster0.pkim2nz.mongodb.net/EXPENSES?retryWrites=true&w=majority&appName=Cluster0");
        console.log("🟢 Connected to MongoDB");

        const DepartmentModel = model<Department & Document>("Department", DepartmentSchema);
        const SubDepartmentModel = model<SubDepartment & Document>("SubDepartment", SubDepartmentSchema);

        // --- Departments ---
        const departments = ["Sales", "Office", "Data", "IT (EndBounce)"];

        const deptMap: Record<string, Types.ObjectId> = {};

        // Seed Departments
        for (const name of departments) {
            let dept = await DepartmentModel.findOne({ name }).exec();
            if (!dept) {
                dept = await DepartmentModel.create({ name });
                console.log(`✅ Inserted Department: ${name}`);
            } else {
                console.log(`⚠️ Department already exists: ${name}`);
            }
            deptMap[name] = dept._id as Types.ObjectId;
        }

        // --- SubDepartments ---
        const subDepartmentsData: Record<string, string[]> = {
            "Sales": [
                "G-Suite",
                "Instantly",
                "Domain",
                "Contabo",
                "Linkedin",
                "Vendor G-Suite",
                "Vendor Outlook",
                "VPN",
                "Zoom Calling",
                "Ai Ark",
                "Others"
            ],
            "Office": [
                "APNA",
                "Naukri",
                "Milk Bill/Tea etc.",
                "Cake",
                "Electricity Bill",
                "Swiggy/Blinkit",
                "Office Rent",
                "Office Maintenance",
                "Stationary",
                "Courier Charges",
                "Salaries",
                "Salary Arrears",
                "Incentive",
                "Incentive Arrears",
                "Internet Bill",
                "Office Repairs & Butification",
                "Chairs Purchase",
                "Goodies/Bonuses/Bonanza",
                "Event Exp",
                "Cricket",
                "Trainings",
                "Employee Insurance",
                "ID Cards",
                "Laptop",
                "Desktop",
                "System Peripherals",
                "Others"
            ],
            "Data": [
                "Apollo",
                "Linkedin",
                "Email Verifier",
                "Zoominfo",
                "VPN",
                "Ai Ark",
                "Domain",
                "Others"
            ],
            "IT (EndBounce)": [
                "Servers",
                "Domain",
                "Zoho",
                "Instantly",
                "Real Cloud",
                "Others"
            ]
        };

        for (const [deptName, subDeps] of Object.entries(subDepartmentsData)) {
            const parentId = deptMap[deptName];
            for (const subName of subDeps) {
                const exists = await SubDepartmentModel.findOne({ name: subName, department: parentId }).exec();
                if (!exists) {
                    await SubDepartmentModel.create({ name: subName, department: parentId });
                    console.log(`✅ Inserted SubDepartment: ${subName} under ${deptName}`);
                } else {
                    console.log(`⚠️ Skipped (already exists): ${subName}`);
                }
            }
        }

        console.log("🎉 Seeding completed successfully!");
        await connection.close();
    } catch (err) {
        console.error("❌ Seeding error:", err);
        await connection.close();
    }
}

runSeeder();
