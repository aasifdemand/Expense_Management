/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Expense } from 'src/models/expense.model';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { ImagekitService } from 'src/services/media.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/models/user.model';
import { Budget } from 'src/models/budget.model';
import { SearchExpensesDto } from './dtos/search-expense.dto';
// import { NotificationsService } from 'src/services/notifications.service';

@Injectable()
export class ExpensesService {

    constructor(
        @InjectModel(Expense.name) private readonly expenseModal: Model<Expense>,
        @InjectModel(User.name) private readonly userModal: Model<User>,
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        private readonly mediaService: ImagekitService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        // private readonly notificationService: NotificationsService
    ) { }



    async handleCreateExpense(data: CreateExpenseDto, userId: string, file?: Express.Multer.File,) {
        const { amount, department, paidTo, isReimbursed, year, month } = data;

        const user = await this.userModal.findById(userId).select("name _id");
        if (!user) throw new NotFoundException("User not found!!");

        let proof: string | undefined;

        if (file) {
            const uploaded = await this.mediaService.uploadFile(
                file.buffer,
                file.originalname,
                "/expenses"
            );
            proof = uploaded.url;
        }




        const filter = {
            user: userId,
            year,
            month
        };

        console.log("Budget filter:", filter);

        const budget = await this.budgetModel.findOne(filter);

        if (!budget) {
            throw new BadRequestException(
                "No budget allocated for this user this month by Superadmin"
            );
        }

        if (budget.spentAmount === budget.allocatedAmount) {
            throw new BadRequestException("Sorry your allocated balance has been spent already")
        }

        if (budget.spentAmount + Number(amount) > budget.allocatedAmount) {
            throw new BadRequestException("Expense exceeds allocated budget limit");
        }


        const newExpense = new this.expenseModal({
            amount,
            department,
            user: user._id,
            isReimbursed,
            proof,
            paidTo,
            year,
            month
        });

        const expense = await newExpense.save();

        budget.spentAmount += amount;
        await budget.save();


        const safeUser = {
            id: user._id,
            name: user.name,
        };

        // const superadmin = await this.userModal.findOne({ role: UserRole.SUPERADMIN });

        // if (superadmin) {
        //     await this.notificationService.createNotification(
        //         superadmin?._id as string,
        //         `${user.name} created a new expense of ₹${amount} in ${department}`
        //     )
        // }




        await this.cacheManager.del("expenses:all");
        await this.cacheManager.del("expenses:search:*");

        return {
            message: "Created the new Expense successfully",
            expense: {
                ...expense.toObject(),
                user: safeUser,
            },
            budget: {
                allocated: budget.allocatedAmount,
                spent: budget.spentAmount,
                remaining: budget.allocatedAmount - budget.spentAmount,
            },
        };
    }



    async getAllExpenses(page = 1, limit = 20) {

        const safePage = Math.max(page, 1);
        const skip = (safePage - 1) * limit;

        const cacheKey = `expenses:all:${safePage}:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return { message: "Fetched expenses from cache", ...(cached as any) };
        }

        const [expenses, total] = await Promise.all([
            this.expenseModal
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "user",
                    select: "name _id",
                })
                .lean(),
            this.expenseModal.countDocuments(),
        ]);

        const result = {
            message: "Fetched expenses successfully",
            meta: {
                total,
                page: safePage,
                limit,

            },
            data: expenses,
        };

        await this.cacheManager.set(cacheKey, result, 60_000);

        return result;
    }


    async getExpenseById(id: string) {
        const cacheKey = `expenses:${id}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return { message: "Expense fetched from cache", expense: cached };
        }

        const expense = await this.expenseModal.findById(id).populate({
            path: "user",
            select: "name _id",
        });
        if (!expense) throw new NotFoundException("Expense doesn't exist");

        await this.cacheManager.set(cacheKey, expense, 60_000);

        return { message: "Expense returned successfully", expense };
    }


    async updateReimbursement(data: UpdateExpenseDto, id: string,) {
        const updatedExpense = await this.expenseModal.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).populate({
            path: "user",
            select: "name _id",
        })

        if (!updatedExpense) {
            throw new NotFoundException("Expense doesn't exist");
        }

        await this.cacheManager.del(`expenses:${id}`);
        await this.cacheManager.del("expenses:all");
        await this.cacheManager.del("expenses:search:*");

        return { message: "Expense updated successfully", expense: updatedExpense };
    }



    async searchReimbursements(filters: SearchExpensesDto) {
        const {
            userName,
            paidTo,
            minAmount,
            maxAmount,
            department,
            isReimbursed,
            isApproved,
            month,
            year,
        } = filters;

        const cacheKey = `expenses:search:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return { message: "Search reimbursements fetched from cache", ...(cached as any) };
        }

        const matchStage: Record<string, any> = {};

        if (paidTo) {
            matchStage.paidTo = { $regex: new RegExp(paidTo, "i") };
        }
        if (department) {
            matchStage.department = department;
        }
        if (isReimbursed !== undefined) {
            matchStage.isReimbursed = isReimbursed;
        }
        if (isApproved !== undefined) {
            matchStage.isApproved = isApproved;
        }
        if (month !== undefined) {
            matchStage.month = month;
        }
        if (year !== undefined) {
            matchStage.year = year;
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            matchStage.amount = {};
            if (minAmount !== undefined) matchStage.amount.$gte = minAmount;
            if (maxAmount !== undefined) matchStage.amount.$lte = maxAmount;
        }

        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    let: { userId: { $toObjectId: "$user" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $project: { _id: 1, name: 1 } },
                    ],
                    as: "user",
                },
            },
            { $unwind: "$user" },
        ];

        if (userName) {
            pipeline.push({
                $match: { "user.name": { $regex: new RegExp(userName, "i") } },
            });
        }

        const reimbursements = await this.expenseModal.aggregate(pipeline);

        const result = {
            message: "Search completed successfully",
            count: reimbursements.length,
            data: reimbursements,
        };

        await this.cacheManager.set(cacheKey, result, 60_000); // cache for 60 sec

        return result;
    }


}
