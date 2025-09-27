/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
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

    private EXPENSE_ALL_KEY = (page: number, limit: number) => `expenses:all:${page}:${limit}`;
    private EXPENSE_USER_KEY = (userId: string, page: number, limit: number) => `expenses:user:${userId}:${page}:${limit}`;
    private EXPENSE_BY_ID_KEY = (id: string) => `expenses:${id}`;





    async handleCreateExpense(data: CreateExpenseDto, userId: string, file?: Express.Multer.File) {
        const { amount, department, paidTo, isReimbursed, year, month } = data;

        const user = await this.userModal.findById(userId).select("name _id expenses");
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


        const budgets = await this.budgetModel.find({
            user: userId,
            year,
            month,
        });

        if (!budgets || budgets.length === 0) {
            throw new BadRequestException("No budget allocated for this user this month by Superadmin");
        }


        let selectedBudget: Budget | null = null;

        for (const b of budgets) {
            if (b.spentAmount < b.allocatedAmount && b.spentAmount + Number(amount) <= b.allocatedAmount) {
                selectedBudget = b;
                break;
            }
        }

        if (!selectedBudget) {
            throw new BadRequestException("No budget found with sufficient remaining balance.");
        }

        // 💸 Create expense
        const newExpense = new this.expenseModal({
            amount,
            department,
            user: user._id,
            isReimbursed,
            proof,
            paidTo,
            year,
            month,
        });

        const expense = await newExpense.save();


        selectedBudget.spentAmount += amount;
        await selectedBudget.save();


        await this.userModal.findByIdAndUpdate(userId, {
            $push: { expenses: expense._id },
        });

        // 📦 Optional: notify superadmin
        // const superadmin = await this.userModal.findOne({ role: UserRole.SUPERADMIN });
        // if (superadmin) {
        //     await this.notificationService.createNotification(
        //         superadmin._id,
        //         `${user.name} created a new expense of ₹${amount} in ${department}`
        //     );
        // }


        await Promise.all([
            this.cacheManager.del(this.EXPENSE_BY_ID_KEY(expense._id as string)),
            this.cacheManager.del(`expenses:all:${1}:${20}`),
            this.cacheManager.del(`expenses:user:${userId}:${1}:${20}`),
            this.cacheManager.del('expenses:search:*'),
        ]);


        return {
            message: "Created the new Expense successfully",
            expense: {
                ...expense.toObject(),
                user: {
                    id: user._id,
                    name: user.name,
                },
            },
            budget: {
                allocated: selectedBudget.allocatedAmount,
                spent: selectedBudget.spentAmount,
                remaining: selectedBudget.allocatedAmount - selectedBudget.spentAmount,
            },
        };
    }




    async searchReimbursements(filters: SearchExpensesDto, page = 1, limit = 20) {
        const safePage = Math.max(Number(page), 1);
        const safeLimit = Math.max(Number(limit), 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `expenses:search:${JSON.stringify(filters)}:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return { message: "Search reimbursements fetched from cache", ...(cached as any) };
        }

        const matchStage: Record<string, any> = {};

        if (filters.paidTo) {
            matchStage.paidTo = { $regex: new RegExp(filters.paidTo, "i") };
        }
        if (filters.department) {
            matchStage.department = filters.department;
        }
        if (filters.isReimbursed !== undefined) {
            matchStage.isReimbursed = filters.isReimbursed;
        }
        if (filters.isApproved !== undefined) {
            matchStage.isApproved = filters.isApproved;
        }
        if (filters.month !== undefined) {
            matchStage.month = filters.month;
        }
        if (filters.year !== undefined) {
            matchStage.year = filters.year;
        }
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
            matchStage.amount = {};
            if (filters.minAmount !== undefined) matchStage.amount.$gte = filters.minAmount;
            if (filters.maxAmount !== undefined) matchStage.amount.$lte = filters.maxAmount;
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
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: safeLimit },
        ];

        if (filters.userName) {
            pipeline.splice(1, 0, {
                $match: { "user.name": { $regex: new RegExp(filters.userName, "i") } },
            });
        }

        const [data, total] = await Promise.all([
            this.expenseModal.aggregate(pipeline),
            this.expenseModal.countDocuments(matchStage),
        ]);

        const result = {
            message: "Search completed successfully",
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
            },
            data,
        };

        await this.cacheManager.set(cacheKey, result, 60_000);

        return result;
    }

    async getAllExpenses(page = 1, limit = 10) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `expenses:all:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return { message: "Fetched expenses from cache", ...(cached as any) };
        }

        const [expenses, total] = await Promise.all([
            this.expenseModal
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
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
                limit: safeLimit,
            },
            data: expenses,
        };

        await this.cacheManager.set(cacheKey, result, 60_000);

        return result;
    }




    async getAllExpensesForUser(page = 1, limit = 10, session: Record<string, any>) {
        console.log("getAllExpensesForUser — session:", session);

        if (!session?.userId) {
            throw new UnauthorizedException("Unauthorized: User not logged in");
        }

        const userId = session.userId;


        let userIdObj: Types.ObjectId;
        try {
            userIdObj = new Types.ObjectId(userId);
        } catch (err: any) {
            console.warn("Invalid userId format:", userId, err);
            throw new UnauthorizedException("Invalid user ID in session");
        }

        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = this.EXPENSE_USER_KEY(userId, safePage, safeLimit);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log("Returning from cache for user:", userId, "key:", cacheKey);
            return { message: "Fetched user's expenses from cache", ...(cached as any) };
        }

        // Log before query
        console.log("Querying expenses for user:", userIdObj);

        const [expenses, total] = await Promise.all([
            this.expenseModal
                .find({ user: userIdObj })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .populate({ path: "user", select: "name _id" })
                .lean(),
            this.expenseModal.countDocuments({ user: userIdObj }),
        ]);

        console.log("Fetched expenses count:", expenses.length, "total:", total);

        const result = {
            message: "Fetched user's expenses successfully",
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
            },
            data: expenses,
        };

        // Cache it
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

        await Promise.all([
            this.cacheManager.del(this.EXPENSE_BY_ID_KEY(id)),
            this.cacheManager.del(this.EXPENSE_ALL_KEY(1, 20)),
            this.cacheManager.del('expenses:search:*'),
            this.cacheManager.del(this.EXPENSE_USER_KEY(updatedExpense.user._id.toString(), 1, 20)),
        ]);


        return { message: "Expense updated successfully", expense: updatedExpense };
    }





}
