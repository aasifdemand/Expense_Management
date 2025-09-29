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
        if (cached) return { message: "Search reimbursements fetched from cache", ...(cached as any) };

        // --- Build match stage based on filters ---
        const matchStage: Record<string, any> = {};
        if (filters.paidTo) matchStage.paidTo = { $regex: new RegExp(filters.paidTo, "i") };
        if (filters.department) matchStage.department = filters.department;
        if (filters.isReimbursed !== undefined) matchStage.isReimbursed = filters.isReimbursed;
        if (filters.isApproved !== undefined) matchStage.isApproved = filters.isApproved;
        if (filters.month !== undefined) matchStage.month = Number(filters.month);
        if (filters.year !== undefined) matchStage.year = Number(filters.year);
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
            matchStage.amount = {};
            if (filters.minAmount !== undefined) matchStage.amount.$gte = filters.minAmount;
            if (filters.maxAmount !== undefined) matchStage.amount.$lte = filters.maxAmount;
        }

        // --- Paginated filtered data ---
        const pipelinePaginated: PipelineStage[] = [
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
            pipelinePaginated.splice(3, 0, { $match: { "user.name": { $regex: new RegExp(filters.userName, "i") } } });
        }

        const data = await this.expenseModal.aggregate(pipelinePaginated);

        // --- Total count for pagination ---
        const countPipeline: PipelineStage[] = [
            { $match: matchStage },
        ];
        if (filters.userName) {
            countPipeline.push({
                $lookup: {
                    from: "users",
                    let: { userId: { $toObjectId: "$user" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $project: { _id: 1, name: 1 } },
                    ],
                    as: "user",
                },
            });
            countPipeline.push({ $unwind: "$user" });
            countPipeline.push({ $match: { "user.name": { $regex: new RegExp(filters.userName, "i") } } });
        }
        countPipeline.push({ $count: "total" });
        const countResult = await this.expenseModal.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // --- Full dataset (always unfiltered) ---
        const allExpenses = await this.expenseModal
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "name _id" })
            .lean();

        // --- Stats based on full dataset ---
        const statsPipeline: PipelineStage[] = [
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                    totalReimbursed: { $sum: { $cond: [{ $eq: ["$isReimbursed", true] }, "$amount", 0] } },
                    totalApproved: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },
                },
            },
        ];
        const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
        const stats = statsResult || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 };

        const result = {
            message: "Search completed successfully",
            data,           // filtered + paginated
            allExpenses,    // full dataset always
            stats,
            meta: { total, page: safePage, limit: safeLimit },
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
        if (cached) return { message: "Fetched expenses from cache", ...(cached as any) };

        const [expenses, total] = await Promise.all([
            this.expenseModal
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .populate({ path: "user", select: "name _id" })
                .lean(),
            this.expenseModal.countDocuments(),
        ]);

        // Full dataset for charts/stats
        const allExpenses = await this.expenseModal
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "name _id" })
            .lean();

        // Stats based on full dataset
        const statsPipeline: PipelineStage[] = [
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                    totalReimbursed: { $sum: { $cond: [{ $eq: ["$isReimbursed", true] }, "$amount", 0] } },
                    totalApproved: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },
                },
            },
        ];
        const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
        const stats = statsResult || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 };

        const result = {
            message: "Fetched expenses successfully",
            meta: { total, page: safePage, limit: safeLimit },
            stats,
            data: expenses,    // paginated
            allExpenses,       // full dataset always
        };

        await this.cacheManager.set(cacheKey, result, 60_000);
        return result;
    }


    async getAllExpensesForUser(page = 1, limit = 10, session: Record<string, any>) {
        if (!session?.userId) throw new UnauthorizedException("Unauthorized: User not logged in");

        let userIdObj: Types.ObjectId;
        try {
            userIdObj = new Types.ObjectId(session.userId);
        } catch (err: any) {
            throw new UnauthorizedException("Invalid user ID in session", err);
        }

        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = this.EXPENSE_USER_KEY(session.userId, safePage, safeLimit);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return { message: "Fetched user's expenses from cache", ...(cached as any) };

        // --- Paginated expenses ---
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

        // --- Full dataset for the user ---
        const allExpenses = await this.expenseModal
            .find({ user: userIdObj })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "name _id" })
            .lean();

        // --- Stats for this user's full dataset ---
        const statsPipeline: PipelineStage[] = [
            { $match: { user: userIdObj } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                    totalReimbursed: { $sum: { $cond: [{ $eq: ["$isReimbursed", true] }, "$amount", 0] } },
                    totalApproved: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, "$amount", 0] } },
                },
            },
        ];
        const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
        const stats = statsResult || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 };

        const result = {
            message: "Fetched user's expenses successfully",
            meta: { total, page: safePage, limit: safeLimit },
            stats,
            data: expenses,      // paginated
            allExpenses,         // full dataset for charts/stats
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

        await Promise.all([
            this.cacheManager.del(this.EXPENSE_BY_ID_KEY(id)),
            this.cacheManager.del(this.EXPENSE_ALL_KEY(1, 20)),
            this.cacheManager.del('expenses:search:*'),
            this.cacheManager.del(this.EXPENSE_USER_KEY(updatedExpense.user._id.toString(), 1, 20)),
        ]);


        return { message: "Expense updated successfully", expense: updatedExpense };
    }





}
