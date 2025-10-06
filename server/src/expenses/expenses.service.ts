/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Expense } from 'src/models/expense.model';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { ImagekitService } from 'src/services/media.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User, UserRole } from 'src/models/user.model';
import { Budget } from 'src/models/budget.model';
import { SearchExpensesDto } from './dtos/search-expense.dto';
import { Department } from 'src/models/department.model';
import { SubDepartment } from 'src/models/sub-department.model';
import { Reimbursement } from 'src/models/reimbursements.model';

import type { Request } from 'express';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModal: Model<Expense>,
    @InjectModel(User.name) private readonly userModal: Model<User>,
    @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(SubDepartment.name)
    private readonly subDepartmentModel: Model<SubDepartment>,
    @InjectModel(Reimbursement.name)
    private readonly reimbursementModel: Model<Reimbursement>,
    private readonly mediaService: ImagekitService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway
  ) { }

  private EXPENSE_ALL_KEY = (page: number, limit: number) =>
    `expenses:all:${page}:${limit}`;
  private EXPENSE_USER_KEY = (userId: string, page: number, limit: number) =>
    `expenses:user:${userId}:${page}:${limit}`;
  private EXPENSE_BY_ID_KEY = (id: string) => `expenses:${id}`;

  async handleCreateExpense(
    data: CreateExpenseDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const {
      amount,
      department,
      description,
      isReimbursed,
      subDepartment,
      paymentMode,
    } = data;

    const user = await this.userModal
      .findById(userId)
      .select('name spentAmount reimbursedAmount budgetLeft');

    if (!user) throw new NotFoundException('User not found!!');

    // File upload (proof)
    let proof: string | undefined;
    if (file) {
      const uploaded = await this.mediaService.uploadFile(
        file.buffer,
        file.originalname,
        '/expenses',
      );
      proof = uploaded.url;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get CURRENT MONTH budgets only
    const currentMonthBudgets = await this.budgetModel
      .find({ user: userId, month, year })
      .sort({ createdAt: 1 });

    console.log('=== BUDGET DEBUG INFO ===');
    console.log('Searching budgets for:', { userId, month, year });
    console.log('Found budgets:', currentMonthBudgets.length);

    // Detailed budget info
    currentMonthBudgets.forEach((budget, index) => {
      console.log(`Budget ${index + 1}:`, {
        id: budget._id,
        allocated: budget.allocatedAmount,
        spent: budget.spentAmount,
        remaining: budget.remainingAmount,
        month: budget.month,
        year: budget.year
      });
    });

    // Calculate available budget from CURRENT MONTH only
    const currentMonthAvailableBudget = currentMonthBudgets.reduce(
      (total, budget) => total + budget.remainingAmount,
      0
    );



    let fromAllocation = 0;
    let fromReimbursement = 0;

    // If no budgets exist for current month
    if (currentMonthBudgets.length === 0) {

      fromAllocation = 0;
      fromReimbursement = amount;
    } else if (currentMonthAvailableBudget >= amount) {
      // Case 1: Enough budget in current month
      fromAllocation = amount;
      fromReimbursement = 0;

    } else if (currentMonthAvailableBudget > 0) {
      // Case 2: Partial budget in current month
      fromAllocation = currentMonthAvailableBudget;
      fromReimbursement = amount - currentMonthAvailableBudget;

    } else {
      // Case 3: No budget left in current month
      fromAllocation = 0;
      fromReimbursement = amount;

    }



    // [Rest of your reimbursement and expense creation logic...]
    // Get or create reimbursement document for this user
    let reimbursement = await this.reimbursementModel.findOne({
      requestedBy: userId,
      isReimbursed: false
    });

    // Calculate new reimbursement amount
    let newReimbursementAmount = 0;
    if (reimbursement) {
      newReimbursementAmount = reimbursement.amount + fromReimbursement;
    } else {
      newReimbursementAmount = fromReimbursement;
    }



    // Handle reimbursement document
    if (newReimbursementAmount > 0) {
      if (reimbursement) {
        reimbursement = await this.reimbursementModel.findByIdAndUpdate(
          reimbursement._id,
          { amount: newReimbursementAmount },
          { new: true }
        );

      } else {
        reimbursement = await this.reimbursementModel.create({
          requestedBy: user._id,
          amount: newReimbursementAmount,
          isReimbursed: false,
        });

      }
    } else {
      if (reimbursement) {
        reimbursement = await this.reimbursementModel.findByIdAndUpdate(
          reimbursement._id,
          { amount: 0 },
          { new: true }
        );

      }
    }


    let remainingAllocation = fromAllocation;
    const budgetUpdates: Array<{ budgetId: Types.ObjectId; spentIncrease: number }> = [];

    // Allocate expense across current month budgets
    if (fromAllocation > 0 && currentMonthBudgets.length > 0) {
      for (const budget of currentMonthBudgets) {
        if (remainingAllocation <= 0) break;

        const useFromThisBudget = Math.min(remainingAllocation, budget.remainingAmount);
        if (useFromThisBudget > 0) {
          budgetUpdates.push({
            budgetId: budget._id as Types.ObjectId,
            spentIncrease: useFromThisBudget,
          });
          remainingAllocation -= useFromThisBudget;

        }
      }
    }

    // Department validation
    const deptExists = await this.departmentModel.findById(department);
    if (!deptExists) throw new NotFoundException('Department not found!');

    let subDeptId;
    if (subDepartment) {
      const subDeptExists = await this.subDepartmentModel.findById(subDepartment);
      if (!subDeptExists) throw new NotFoundException('SubDepartment not found!');
      subDeptId = subDeptExists._id as Types.ObjectId;
    }

    // Create expense
    const newExpense = new this.expenseModal({
      amount,
      fromAllocation,
      fromReimbursement,
      department: deptExists._id,
      subDepartment: subDeptId,
      user: user._id,
      isReimbursed,
      proof,
      description,
      year,
      month,
      paymentMode,
      budgets: currentMonthBudgets.map(b => b._id),
      reimbursement: reimbursement ? reimbursement._id : undefined,
    });

    const expense = await newExpense.save();

    // Link reimbursement to expense
    if (reimbursement && fromReimbursement > 0) {
      await this.reimbursementModel.findByIdAndUpdate(
        reimbursement._id,
        { expense: expense._id }
      );

    }

    // Update user financials
    await this.userModal.findByIdAndUpdate(userId, {
      $push: {
        expenses: expense._id,
      },
      $inc: {
        spentAmount: amount,
        reimbursedAmount: fromReimbursement,
        budgetLeft: -fromAllocation,
      },
    });

    // Update individual budgets
    if (budgetUpdates.length > 0) {
      const bulkOps = budgetUpdates.map(update => ({
        updateOne: {
          filter: { _id: update.budgetId },
          update: {
            $inc: {
              spentAmount: update.spentIncrease,
              remainingAmount: -update.spentIncrease,
            },
          },
        },
      }));


      try {
        const result = await this.budgetModel.bulkWrite(bulkOps);
        console.log('✅ Budgets updated successfully:', {
          matched: result.matchedCount,
          modified: result.modifiedCount,
        });
      } catch (error) {
        console.error('❌ Error updating budgets:', error);
        throw new Error('Failed to update budget allocations');
      }
    }

    // Clear cache
    await Promise.all([
      this.cacheManager.del(this.EXPENSE_BY_ID_KEY(expense._id as string)),
      this.cacheManager.del(`expenses:all:1:20`),
      this.cacheManager.del(`expenses:user:${userId}:1:20`),
      this.cacheManager.del('expenses:search:*'),
    ]);

    // In your expense creation method
    const superAdmins = await this.userModal.find({ role: UserRole.SUPERADMIN }).select('_id');

    const notificationMessage = `New expense created by ${user.name} for ₹${amount}`;

    for (const admin of superAdmins) {
      const userId = admin._id as Types.ObjectId; // proper conversion to string
      const success = this.notificationService.sendNotification(
        userId.toString(),
        notificationMessage,
        'EXPENSE_CREATED',
      );

      if (!success) {
        console.warn(`⚠️ SuperAdmin ${userId.toString()} is not connected`);
      }
    }






    return {
      message: 'Created the new Expense successfully',
      expense: {
        ...expense.toObject(),
        user: { _id: user._id, name: user.name },
        reimbursement: reimbursement && reimbursement.amount > 0 ? {
          _id: reimbursement._id,
          amount: reimbursement.amount,
          isReimbursed: reimbursement.isReimbursed,
        } : null,
      },
    };
  }
  async searchExpenses(filters: SearchExpensesDto, page = 1, limit = 20) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = `expenses:search:${JSON.stringify(filters)}:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached)
      return {
        message: 'Search expenses fetched from cache',
        ...(cached as any),
      };

    const matchStage: Record<string, any> = {};
    if (filters.month !== undefined) matchStage.month = filters.month;
    if (filters.year !== undefined) matchStage.year = filters.year;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      matchStage.amount = {};
      if (filters.minAmount !== undefined)
        matchStage.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined)
        matchStage.amount.$lte = filters.maxAmount;
    }

    if (filters.department) {
      try {
        matchStage.department = new Types.ObjectId(filters.department);
      } catch (err) {
        console.warn('Invalid department ID:', filters.department, err);
      }
    }

    if (filters.subDepartment) {
      try {
        matchStage.subDepartment = new Types.ObjectId(filters.subDepartment);
      } catch (err) {
        console.warn('Invalid subDepartment ID:', filters.subDepartment, err);
      }
    }

    const basePipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subdepartments',
          localField: 'subDepartment',
          foreignField: '_id',
          as: 'subDepartment',
        },
      },
      { $unwind: { path: '$subDepartment', preserveNullAndEmptyArrays: true } },
    ];

    // Search by username if provided
    if (filters.userName) {
      basePipeline.push({
        $match: { 'user.name': { $regex: new RegExp(filters.userName, 'i') } },
      });
    }

    // Project only required fields
    const projectionStage: PipelineStage = {
      $project: {
        _id: 1,
        paidTo: 1,
        amount: 1,
        fromAllocation: 1,
        fromReimbursement: 1,
        month: 1,
        year: 1,
        createdAt: 1,
        updatedAt: 1,
        user: { _id: '$user._id', name: '$user.name' },
        department: { _id: '$department._id', name: '$department.name' },
        subDepartment: {
          _id: '$subDepartment._id',
          name: '$subDepartment.name',
        },
      },
    };

    const pipeline = [...basePipeline, projectionStage];

    // --- Stats aggregation
    const statsPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalFromAllocation: { $sum: '$fromAllocation' },
          totalFromReimbursement: { $sum: '$fromReimbursement' },
        },
      },
    ];
    const statsResult = await this.expenseModal.aggregate(statsPipeline);
    const stats = statsResult[0] || {
      totalSpent: 0,
      totalFromAllocation: 0,
      totalFromReimbursement: 0,
    };

    // Pagination + sorting for filtered data
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: safeLimit });

    const data = await this.expenseModal.aggregate(pipeline);

    // Count total matching documents
    const totalResult = await this.expenseModal.aggregate([
      { $match: matchStage },
      { $count: 'total' },
    ]);
    const total = totalResult[0]?.total || 0;

    // ✅ Fetch all expenses (allExpenses) without filters or pagination
    const allExpensesPipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subdepartments',
          localField: 'subDepartment',
          foreignField: '_id',
          as: 'subDepartment',
        },
      },
      { $unwind: { path: '$subDepartment', preserveNullAndEmptyArrays: true } },
      projectionStage,
      { $sort: { createdAt: -1 } },
    ];
    const allExpenses = await this.expenseModal.aggregate(allExpensesPipeline);

    return {
      message: 'Search completed',
      data,
      stats,
      allExpenses,
      meta: { total, page: safePage, limit: safeLimit },
    };
  }

  async getAllExpenses(page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = `expenses:all:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached)
      return { message: 'Fetched expenses from cache', ...(cached as any) };

    // --- Paginated expenses ---
    const [expenses, total] = await Promise.all([
      this.expenseModal
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate({ path: 'user', select: 'name _id' })
        .populate({ path: 'department', select: 'name _id' })
        .populate({ path: 'subDepartment', select: 'name _id' })
        .populate({ path: "reimbursement", select: " _id amount isReimbursed" })
        .lean(),
      this.expenseModal.countDocuments(),
    ]);

    // --- Full dataset for charts/stats ---
    const allExpenses = await this.expenseModal
      .find()
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name _id' })
      .populate({ path: 'department', select: 'name _id' })
      .populate({ path: 'subDepartment', select: 'name _id' })
      .populate({ path: "reimbursement", select: " _id amount isReimbursed" })
      .lean();

    // --- Stats based on full dataset ---
    const statsPipeline: PipelineStage[] = [
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: {
              $convert: {
                input: '$amount',
                to: 'double',
                onError: 0,
                onNull: 0,
              },
            },
          },
          totalFromAllocation: {
            $sum: {
              $convert: {
                input: '$fromAllocation',
                to: 'double',
                onError: 0,
                onNull: 0,
              },
            },
          },
          totalFromReimbursement: {
            $sum: {
              $convert: {
                input: '$fromReimbursement',
                to: 'double',
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
    ];

    const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
    const stats = statsResult || {
      totalSpent: 0,
      totalFromAllocation: 0,
      totalFromReimbursement: 0,
    };

    const result = {
      message: 'Fetched expenses successfully',
      meta: { total, page: safePage, limit: safeLimit },
      stats,
      data: expenses, // paginated
      allExpenses, // full dataset
    };

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async getAllExpensesForUser(
    page = 1,
    limit = 10,
    req: Request,
  ) {
    const { session } = req
    if (!session?.user?._id)
      throw new UnauthorizedException('Unauthorized: User not logged in');

    let userIdObj: Types.ObjectId;
    try {
      userIdObj = new Types.ObjectId(session.user?._id as string);
    } catch (err: any) {
      throw new UnauthorizedException('Invalid user ID in session', err);
    }

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = this.EXPENSE_USER_KEY(session?.user?._id as string, safePage, safeLimit);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached)
      return {
        message: "Fetched user's expenses from cache",
        ...(cached as any),
      };

    // --- Paginated expenses ---
    const [expenses, total] = await Promise.all([
      this.expenseModal
        .find({ user: userIdObj })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate({ path: 'user', select: 'name _id' })
        .populate({ path: 'department', select: 'name' }) // populate department
        .populate({ path: 'subDepartment', select: 'name' })
        .populate({ path: "reimbursement", select: " _id amount isReimbursed" }) // populate subDepartment
        .lean(),
      this.expenseModal.countDocuments({ user: userIdObj }),
    ]);

    // --- Full dataset for the user ---
    const allExpenses = await this.expenseModal
      .find({ user: userIdObj })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name _id' })
      .populate({ path: 'department', select: 'name' })
      .populate({ path: 'subDepartment', select: 'name' })
      .populate({ path: "reimbursement", select: " _id amount isReimbursed" })
      .lean();

    // --- Stats for this user's full dataset ---
    const statsPipeline: PipelineStage[] = [
      { $match: { user: userIdObj } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalReimbursed: {
            $sum: { $cond: [{ $eq: ['$isReimbursed', true] }, '$amount', 0] },
          },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$isApproved', true] }, '$amount', 0] },
          },
        },
      },
    ];
    const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
    const stats = statsResult || {
      totalSpent: 0,
      totalReimbursed: 0,
      totalApproved: 0,
    };

    const result = {
      message: "Fetched user's expenses successfully",
      meta: { total, page: safePage, limit: safeLimit },
      stats,
      data: expenses,
      allExpenses,
    };

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async getExpenseById(id: string) {
    const cacheKey = `expenses:${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return { message: 'Expense fetched from cache', expense: cached };
    }

    const expense = await this.expenseModal
      .findById(id)
      .populate({ path: 'user', select: 'name _id' })
      .populate({ path: 'department', select: 'name' })
      .populate({ path: 'subDepartment', select: 'name' })
      .populate({ path: "reimbursement", select: " _id amount isReimbursed" })

    if (!expense) throw new NotFoundException("Expense doesn't exist");

    await this.cacheManager.set(cacheKey, expense, 60_000);
    return { message: 'Expense returned successfully', expense };
  }

  async updateReimbursement(data: UpdateExpenseDto, id: string) {
    const updatedExpense = await this.expenseModal
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate({ path: 'user', select: 'name _id' })
      .populate({ path: 'department', select: 'name' })
      .populate({ path: 'subDepartment', select: 'name' })
      .populate({ path: "reimbursement", select: " _id amount isReimbursed" })

    if (!updatedExpense) {
      throw new NotFoundException("Expense doesn't exist");
    }

    await Promise.all([
      this.cacheManager.del(this.EXPENSE_BY_ID_KEY(id)),
      this.cacheManager.del(this.EXPENSE_ALL_KEY(1, 20)),
      this.cacheManager.del('expenses:search:*'),
      this.cacheManager.del(
        this.EXPENSE_USER_KEY(updatedExpense.user._id.toString(), 1, 20),
      ),
    ]);

    return { message: 'Expense updated successfully', expense: updatedExpense };
  }
}