/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget } from 'src/models/budget.model';
import { User, UserRole } from 'src/models/user.model';
import {
  AllocateBudgetDto,
  UpdateAllocatedBudgetDto,
} from './dto/allocate-budget.dto';
import { SearchBudgetAllocationsDto } from './dto/search-budgets.dto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reimbursement } from 'src/models/reimbursements.model';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Reimbursement.name)
    private readonly reimbursementModel: Model<Reimbursement>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }


  async allocateBudget(data: AllocateBudgetDto) {
    const { amount, userId } = data;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Get existing pending reimbursement for this user
    const existingReimbursement = await this.reimbursementModel.findOne({
      requestedBy: userId,
      isReimbursed: false
    });

    console.log('=== BUDGET ALLOCATION DEBUG ===');
    console.log('Existing reimbursement:', existingReimbursement);
    console.log('New allocation amount:', amount);

    let reimbursementUpdate: Reimbursement | null = null;

    // If there's an existing reimbursement, reduce it with the new allocation
    if (existingReimbursement && existingReimbursement.amount > 0) {
      const newReimbursementAmount = Math.max(0, existingReimbursement.amount - amount);

      if (newReimbursementAmount > 0) {
        // Reduce reimbursement amount
        reimbursementUpdate = await this.reimbursementModel.findByIdAndUpdate(
          existingReimbursement._id,
          { amount: newReimbursementAmount },
          { new: true }
        );
        console.log('📉 Reduced reimbursement to:', newReimbursementAmount);
      } else {
        // Reimbursement is fully covered by new allocation - set to 0
        reimbursementUpdate = await this.reimbursementModel.findByIdAndUpdate(
          existingReimbursement._id,
          { amount: 0 },
          { new: true }
        );
        console.log('💰 Reimbursement fully covered by new allocation');
      }
    }

    // Create the budget
    const budget = await this.budgetModel.create({
      user: userId,
      allocatedAmount: amount,
      spentAmount: 0,
      remainingAmount: amount,
      month: Number(new Date().getMonth() + 1),
      year: Number(new Date().getFullYear()),
    });

    // Update user
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

    console.log('=== BUDGET ALLOCATION COMPLETE ===');

    return {
      message: 'Budget allocated successfully',
      budget: populatedBudget,
      reimbursementUpdate: reimbursementUpdate ? {
        _id: reimbursementUpdate._id,
        newAmount: reimbursementUpdate.amount,
        previousAmount: existingReimbursement?.amount
      } : null
    };
  }




  async fetchAllocatedBudgets(page = 1, limit = 20, userId?: string, location?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const user = userId ? await this.userModel.findById(userId) : null;

    // Build base query
    let query = this.budgetModel.find();

    // Apply user filter if needed
    if (user?.role === UserRole.USER) {
      query = query.where('user').equals(user._id);
    }

    // Update cache keys to include location
    const cacheKeyPage = `budgets:${user?.role || 'superadmin'}:${userId || 'all'}:${location || 'overall'}:page:${safePage}:${safeLimit}`;
    const cacheKeyAll = `budgets:${user?.role || 'superadmin'}:${userId || 'all'}:${location || 'overall'}:all`;

    // Get all budgets with user populated
    let allBudgets = await this.cacheManager.get<Budget[]>(cacheKeyAll);
    if (!allBudgets) {
      allBudgets = await query
        .populate({
          path: 'user',
          select: 'name _id userLoc role',
        })
        .sort({ createdAt: -1 })
        .lean();

      await this.cacheManager.set(cacheKeyAll, allBudgets, 3000);
    }

    // Apply location filter in memory - use type assertion for user field
    let filteredBudgets = allBudgets;
    if (location && location !== 'OVERALL') {
      filteredBudgets = allBudgets.filter(budget =>
        (budget.user as any)?.userLoc === location
      );
    }

    console.log('🔍 Budget Fetch Debug:', {
      location,
      totalBudgets: allBudgets.length,
      filteredBudgets: filteredBudgets.length,
      sampleBudget: filteredBudgets[0] // Debug first budget
    });

    // Use cache for paginated results
    let paginatedBudgets = await this.cacheManager.get(cacheKeyPage);
    if (!paginatedBudgets) {
      // Paginate the filtered results
      paginatedBudgets = filteredBudgets.slice(skip, skip + safeLimit);
      await this.cacheManager.set(cacheKeyPage, paginatedBudgets, 3000);
    }

    // Total count
    const total = filteredBudgets.length;

    return {
      message: 'Fetched budgets successfully',
      data: paginatedBudgets,
      allBudgets: filteredBudgets,
      location: location || 'OVERALL',
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
    location?: string
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

    const { user: sessionUser } = session;

    // Build base query
    let query = this.budgetModel.find();

    // Apply role-based filter
    if (sessionUser?.role !== 'superadmin') {
      query = query.where('user').equals(new Types.ObjectId(sessionUser?.id));
    }

    // Apply other filters
    if (month) query = query.where('month').equals(month);
    if (year) query = query.where('year').equals(year);
    if (minAllocated !== undefined) query = query.where('allocatedAmount').gte(minAllocated);
    if (maxAllocated !== undefined) query = query.where('allocatedAmount').lte(maxAllocated);
    if (minSpent !== undefined) query = query.where('spentAmount').gte(minSpent);
    if (maxSpent !== undefined) query = query.where('spentAmount').lte(maxSpent);

    // Update cache keys to include location
    const cacheKeyPage = `budgets:search:${sessionUser?.role}:${sessionUser?.id}:${location || 'overall'}:page:${safePage}:${safeLimit}:${JSON.stringify(filters)}`;
    const cacheKeyAll = `budgets:search:${sessionUser?.role}:${sessionUser?.id}:${location || 'overall'}:all:${JSON.stringify(filters)}`;

    // Get all budgets with user populated
    let allBudgets = await this.cacheManager.get<Budget[]>(cacheKeyAll);
    if (!allBudgets) {
      allBudgets = await query
        .populate({
          path: 'user',
          select: 'name _id userLoc role',
        })
        .sort({ createdAt: -1 })
        .lean();

      await this.cacheManager.set(cacheKeyAll, allBudgets, 3000);
    }

    // Apply location and userName filters in memory with type assertions
    let filteredBudgets = allBudgets;

    // Apply location filter
    if (location && location !== 'OVERALL') {
      filteredBudgets = filteredBudgets.filter(budget =>
        (budget.user as any)?.userLoc === location
      );
    }

    // Apply userName filter
    if (userName) {
      filteredBudgets = filteredBudgets.filter(budget =>
        (budget.user as any)?.name?.toLowerCase().includes(userName.toLowerCase())
      );
    }

    console.log('🔍 Budget Search Debug:', {
      location,
      userName,
      totalBudgets: allBudgets.length,
      filteredBudgets: filteredBudgets.length,
      sampleBudget: filteredBudgets[0] // Debug first budget
    });

    // Use cache for paginated results
    let paginatedBudgets = await this.cacheManager.get(cacheKeyPage);
    if (!paginatedBudgets) {
      // Paginate the filtered results
      paginatedBudgets = filteredBudgets.slice(skip, skip + safeLimit);
      await this.cacheManager.set(cacheKeyPage, paginatedBudgets, 3000);
    }

    // Total count
    const total = filteredBudgets.length;

    return {
      message: 'Fetched budgets successfully',
      data: paginatedBudgets,
      allBudgets: filteredBudgets,
      location: location || 'OVERALL',
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