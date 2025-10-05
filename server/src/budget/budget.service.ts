/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Budget } from 'src/models/budget.model';
import { User, UserRole } from 'src/models/user.model';
import {
  AllocateBudgetDto,
  UpdateAllocatedBudgetDto,
} from './dto/allocate-budget.dto';
import { SearchBudgetAllocationsDto } from './dto/search-budgets.dto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Department } from 'src/models/department.model';
import { SubDepartment } from 'src/models/sub-department.model';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Budget>,
    @InjectModel(SubDepartment.name)
    private readonly subDepartmentModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async allocateBudget(data: AllocateBudgetDto) {
    const { amount, userId } = data;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const budget = await this.budgetModel.create({
      user: userId,
      allocatedAmount: amount,
      spentAmount: 0,
      remainingAmount: amount,
      month: Number(new Date().getMonth() + 1),
      year: Number(new Date().getFullYear()),
    });

    user.allocatedBudgets.push(budget._id as Types.ObjectId);
    user.allocatedAmount += Number(amount);
    user.budgetLeft += Number(amount);
    await user.save();

    const populatedBudget = await this.budgetModel
      .findById(budget._id)
      .populate({ path: 'user', select: 'name _id' })
      .lean();

    // Invalidate related caches
    await this.cacheManager.del(`budgets:all`);
    await this.cacheManager.del(`budget:${budget._id as string}`);

    return {
      message: 'Budget allocated successfully',
      budget: populatedBudget,
    };
  }

  async fetchAllocatedBudgets(page = 1, limit = 20, userId?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const user = userId ? await this.userModel.findById(userId) : null;

    const query: any = {};

    if (user?.role === UserRole.USER) {
      query.user = user._id;
    }

    const cacheKeyPage = `budgets:${user?.role || 'superadmin'}:${userId || 'all'}:page:${safePage}:${safeLimit}`;
    const cacheKeyAll = `budgets:${user?.role || 'superadmin'}:${userId || 'all'}:all`;

    // Paginated budgets
    let budgets = await this.cacheManager.get(cacheKeyPage);
    if (!budgets) {
      budgets = await this.budgetModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate({ path: 'user', select: 'name _id' })
        .lean();

      await this.cacheManager.set(cacheKeyPage, budgets, 3000);
    }

    const total = await this.budgetModel.countDocuments(query);

    let allBudgets = await this.cacheManager.get(cacheKeyAll);
    if (!allBudgets) {
      allBudgets = await this.budgetModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate({ path: 'user', select: 'name _id' })
        .lean();

      await this.cacheManager.set(cacheKeyAll, allBudgets, 3000);
    }

    return {
      message: 'Fetched budgets successfully',
      data: budgets,
      allBudgets,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }

  async getUserBudgets(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKeyPage = `budgets:user:${userId}:page:${safePage}:${safeLimit}`;
    const cacheKeyAll = `budgets:user:${userId}:all`;

    // Paginated budgets - just pass userId and pagination
    let budgets = await this.cacheManager.get(cacheKeyPage);
    if (!budgets) {
      budgets = await this.budgetModel
        .find({ user: userId }) // Just filter by userId
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate({ path: 'user', select: 'name _id' })
        .lean();

      await this.cacheManager.set(cacheKeyPage, budgets, 30000);
    }

    const total = await this.budgetModel.countDocuments({ user: userId });

    let allBudgets = await this.cacheManager.get(cacheKeyAll);
    if (!allBudgets) {
      allBudgets = await this.budgetModel
        .find({ user: userId }) // Just filter by userId
        .sort({ createdAt: -1 })
        .populate({ path: 'user', select: 'name _id' })
        .lean();

      await this.cacheManager.set(cacheKeyAll, allBudgets, 30000);
    }

    return {
      message: 'Fetched user budgets successfully',
      data: budgets,
      allBudgets,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }

  async searchBudgetAllocations(
    filters: SearchBudgetAllocationsDto,
    session: Record<string, any>,
  ) {
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

    const { user } = session;

    // Build match stage based on filters + role
    const matchStage: Record<string, any> = {};
    if (user?.role !== 'superadmin') {
      matchStage.user = user?.id;
    }
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

    const cacheKeyPage = `budgets:search:${user?.role}:${user?.id}:page:${safePage}:${safeLimit}:${JSON.stringify(filters)}`;
    const cacheKeyAll = `budgets:search:${user?.role}:${user?.id}:all:${JSON.stringify(filters)}`;

    // Page results
    let budgets: any[] | undefined = await this.cacheManager.get(cacheKeyPage);
    if (!budgets) {
      const pipelinePage: PipelineStage[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            let: { userId: { $toObjectId: '$user' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { _id: 1, name: 1 } },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ];

      if (userName) {
        pipelinePage.push({
          $match: { 'user.name': { $regex: userName, $options: 'i' } },
        });
      }

      pipelinePage.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
      );

      budgets = await this.budgetModel.aggregate(pipelinePage);
      await this.cacheManager.set(cacheKeyPage, budgets, 3000);
    }

    // Total count
    const countPipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          let: { userId: { $toObjectId: '$user' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];
    if (userName) {
      countPipeline.push({
        $match: { 'user.name': { $regex: userName, $options: 'i' } },
      });
    }
    countPipeline.push({ $count: 'total' });

    const countResult = await this.budgetModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // All budgets
    let allBudgets: any[] | undefined =
      await this.cacheManager.get(cacheKeyAll);
    if (!allBudgets) {
      const pipelineAll: PipelineStage[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            let: { userId: { $toObjectId: '$user' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { _id: 1, name: 1 } },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ];
      if (userName) {
        pipelineAll.push({
          $match: { 'user.name': { $regex: userName, $options: 'i' } },
        });
      }
      pipelineAll.push({ $sort: { createdAt: -1 } });

      allBudgets = await this.budgetModel.aggregate(pipelineAll);
      await this.cacheManager.set(cacheKeyAll, allBudgets, 3000);
    }

    return {
      message: 'Fetched budgets successfully',
      data: budgets,
      allBudgets,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }

  async editAllocatedBudget(
    id: string,
    data: UpdateAllocatedBudgetDto,
    userId: string,
  ) {
    const budget = await this.budgetModel.findById(id);
    if (!budget)
      throw new NotFoundException(
        'This budget information is not found in our DB',
      );

    const oldUserId = budget.user.toString();
    const newUserId = userId;

    const updatedBudget = await this.budgetModel
      .findByIdAndUpdate(
        id,
        { $set: { allocatedAmount: data.amount, user: newUserId } },
        { new: true },
      )
      .populate({ path: 'user', select: 'name _id' });

    // Update user references if user changed
    if (newUserId && newUserId !== oldUserId) {
      await this.userModel.findByIdAndUpdate(oldUserId, {
        $pull: { allocatedBudgets: id },
      });
      await this.userModel.findByIdAndUpdate(newUserId, {
        $push: { allocatedBudgets: id },
      });
    }

    // Invalidate caches
    await this.cacheManager.del(`budgets:all`);
    await this.cacheManager.del(`budget:${id}`);

    return {
      message: 'Budget updated successfully',
      budget: updatedBudget,
    };
  }

  async getBudgetById(id: string) {
    const cacheKey = `budget:${id}`;
    let budget = await this.cacheManager.get(cacheKey);
    if (!budget) {
      budget = await this.budgetModel
        .findById(id)
        .populate({ path: 'user', select: 'name _id' });
      if (!budget) throw new NotFoundException('Budget not found');
      await this.cacheManager.set(cacheKey, budget, 3000); // 5 min
    }

    return {
      message: 'Fetched budget successfully',
      budget,
    };
  }
}
