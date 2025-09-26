/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget } from 'src/models/budget.model';
import { User } from 'src/models/user.model';
import { AllocateBudgetDto, UpdateAllocatedBudgetDto } from './dto/allocate-budget.dto';
import { SearchBudgetAllocationsDto } from './dto/search-budgets.dto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BudgetService {
    constructor(
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async allocateBudget(data: AllocateBudgetDto) {
        const { month, year, amount, userId } = data;

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException("User not found");

        const budget = await this.budgetModel.create({
            user: userId,
            allocatedAmount: amount,
            spentAmount: 0,
            month,
            year,
        });


        user.allocatedBudgets.push(budget._id as Types.ObjectId);
        await user.save();


        const populatedBudget = await this.budgetModel
            .findById(budget._id)
            .populate({
                path: "user",
                select: "name _id",
            })
            .lean();


        await this.cacheManager.del(`budgets:all:1:20`);
        await this.cacheManager.del(`budget:${budget._id as string}`);

        return {
            message: "Budget allocated successfully",
            budget: populatedBudget,
        };
    }


    async fetchAllocatedBudgets(page = 1, limit = 10) {
        const safePage = Math.max(page, 1);
        const skip = (safePage - 1) * limit;
        const cacheKey = `budgets:all:${safePage}:${limit}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: "Fetched budgets from cache", ...(cached as any) };
        }

        // 1️⃣ Paginated query
        const budgets = await this.budgetModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                select: "name _id",
            })
            .lean();

        // 2️⃣ Count documents
        const total = await this.budgetModel.countDocuments();

        // 3️⃣ Stats aggregation (ignores skip/limit)
        const stats = await this.budgetModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalAllocated: { $sum: "$allocatedAmount" },
                    totalSpent: { $sum: "$spentAmount" },
                },
            },
        ]);

        const { totalAllocated = 0, totalSpent = 0 } = stats[0] || {};

        // 4️⃣ Final result
        const result = {
            message: "Fetched budgets successfully",
            meta: {
                total,
                page: safePage,
                limit,
                totalAllocated,
                totalSpent,
            },
            data: budgets,
        };

        await this.cacheManager.set(cacheKey, result, 60_000);

        return result;
    }

    async searchBudgetAllocations(filters: SearchBudgetAllocationsDto) {
        const {
            userName,
            month,
            year,
            minAllocated,
            maxAllocated,
            minSpent,
            maxSpent,
            page = 1,
            limit = 10,
        } = filters;

        const safePage = Math.max(Number(page), 1);
        const safeLimit = Math.max(Number(limit), 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `budgets:search:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: "Fetched budgets from cache", ...(cached as any) };
        }

        const matchStage: any = {};
        if (month) matchStage.month = month;
        if (year) matchStage.year = year;
        if (minAllocated !== undefined || maxAllocated !== undefined) {
            matchStage.allocatedAmount = {};
            if (minAllocated !== undefined) matchStage.allocatedAmount.$gte = minAllocated;
            if (maxAllocated !== undefined) matchStage.allocatedAmount.$lte = maxAllocated;
        }
        if (minSpent !== undefined || maxSpent !== undefined) {
            matchStage.spentAmount = {};
            if (minSpent !== undefined) matchStage.spentAmount.$gte = minSpent;
            if (maxSpent !== undefined) matchStage.spentAmount.$lte = maxSpent;
        }

        const pipeline: any[] = [
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
                $match: { "user.name": { $regex: userName, $options: "i" } },
            });
        }

        // Pagination + totals + stats
        pipeline.push({
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: safeLimit },
                ],
                totalCount: [{ $count: "count" }],
                stats: [
                    {
                        $group: {
                            _id: null,
                            totalAllocated: { $sum: "$allocatedAmount" },
                            totalSpent: { $sum: "$spentAmount" },
                        },
                    },
                ],
            },
        });

        const [result] = await this.budgetModel.aggregate(pipeline);

        const total = result?.totalCount?.[0]?.count || 0;
        const { totalAllocated = 0, totalSpent = 0 } = result?.stats?.[0] || {};

        const response = {
            message: "Fetched budgets successfully",
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalAllocated,
                totalSpent,
            },
            data: result?.data || [],
        };

        await this.cacheManager.set(cacheKey, response, 60_000);

        return response;
    }



    async editAllocatedBudget(id: string, data: UpdateAllocatedBudgetDto, userId: string) {
        const budget = await this.budgetModel.findById(id);

        if (!budget) {
            throw new NotFoundException("This budget information is not found in our DB");
        }

        const oldUserId = budget.user.toString();
        const newUserId = userId;

        const updatedBudget = await this.budgetModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    allocatedAmount: data?.amount,
                    month: data?.month,
                    year: data?.year,
                    user: newUserId
                }
            },
            { new: true }
        ).populate({
            path: "user",
            select: "name _id"
        });


        if (newUserId && newUserId !== oldUserId) {
            await this.userModel.findByIdAndUpdate(oldUserId, {
                $pull: { allocatedBudgets: id }
            });
            await this.userModel.findByIdAndUpdate(newUserId, {
                $push: { allocatedBudgets: id }
            });
        }

        await this.cacheManager.del(`budgets:all:1:20`);
        await this.cacheManager.del(`budget:${id}`);

        return {
            message: "Budget updated successfully",
            budget: updatedBudget,
        };
    }


    async getBudgetById(id: string) {
        const cacheKey = `budget:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return {
                message: "Fetched budget from cache",
                budget: cached,
            };
        }

        const budget = await this.budgetModel.findById(id).populate({
            path: "user",
            select: "name _id",
        });

        if (!budget) {
            throw new NotFoundException("Budget not found");
        }

        await this.cacheManager.set(cacheKey, budget, 60 * 5);

        return {
            message: "Fetched budget successfully",
            budget,
        };
    }


}
