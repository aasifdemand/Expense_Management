import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Expense Management APIs')
    .setDescription('The In-House Expense Management System is a secure internal platform designed specifically for Demand Curve Marketing to manage company expenses, user reimbursements, and budget allocations. The system ensures financial accountability through mandatory documentation, role-based access control, and comprehensive activity tracking')
    .setVersion('1.0')
    .addTag('Expense Manager')
    .build();