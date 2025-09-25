/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

    async allocateBudget(data: AllocateBudgetDto, userId: string) {
        const { month, year, amount } = data

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException("User not found");

        const existing = await this.budgetModel.findOne({ user: userId, month, year }).populate({
            path: "user",
            select: "name _id"
        });
        if (existing) {
            throw new BadRequestException("Budget already allocated for this user in this month");
        }

        const budget = new this.budgetModel({
            user: userId,
            allocatedAmount: amount,
            spentAmount: 0,
            month,
            year,
        });


        await budget.save();

        user.allocatedBudgets.push(budget?._id as Types.ObjectId);
        await user.save()


        await this.cacheManager.del(`budgets:all:1:20`);
        await this.cacheManager.del(`budget:${budget?._id as string}`);


        return {
            message: "Budget allocated successfully",
            budget,
        };
    }

    async fetchAllocatedBudgets(page = 1, limit = 20) {
        const safePage = Math.max(page, 1);
        const skip = (safePage - 1) * limit;
        const cacheKey = `budgets:all:${safePage}:${limit}`;


        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: "Fetched budgets from cache", ...(cached as any) };
        }

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

        const total = await this.budgetModel.countDocuments();

        const result = {
            message: "Fetched budgets successfully",
            meta: {
                total,
                page: safePage,
                limit,
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
        } = filters;


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
            if (minAllocated !== undefined)
                matchStage.allocatedAmount.$gte = minAllocated;
            if (maxAllocated !== undefined)
                matchStage.allocatedAmount.$lte = maxAllocated;
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

        const budgets = await this.budgetModel.aggregate(pipeline);

        const result = {
            message: "Fetched budgets successfully",
            count: budgets.length,
            data: budgets,
        };


        await this.cacheManager.set(cacheKey, result, 60_000);

        return result;
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
