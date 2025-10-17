/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  NotFoundException,
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
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';
import { MailService } from 'src/services/mail.service';
import createExpenseEmailTemplate from './templates/create-expense.template';

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
    private readonly notificationsGateway: NotificationsGateway,
    private readonly mailService: MailService
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
      vendor,
    } = data;

    const user = await this.userModal
      .findById(userId)
      .select('name email spentAmount reimbursedAmount budgetLeft');

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

    // ====== FIXED: UTC-safe expense date ======
    const now = new Date();
    const expenseDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const month = expenseDate.getUTCMonth() + 1;
    const year = expenseDate.getUTCFullYear();

    // Get CURRENT MONTH budgets only
    const currentMonthBudgets = await this.budgetModel
      .find({ user: userId, month, year })
      .sort({ createdAt: 1 });

    console.log('=== BUDGET DEBUG INFO ===');
    console.log('Searching budgets for:', { userId, month, year });
    console.log('Found budgets:', currentMonthBudgets.length);

    // Calculate available budget from CURRENT MONTH only
    const currentMonthAvailableBudget = currentMonthBudgets.reduce(
      (total, budget) => total + budget.remainingAmount,
      0
    );

    let fromAllocation = 0;
    let fromReimbursement = 0;

    // Budget allocation logic
    if (currentMonthBudgets.length === 0) {
      fromAllocation = 0;
      fromReimbursement = amount;
    } else if (currentMonthAvailableBudget >= amount) {
      fromAllocation = amount;
      fromReimbursement = 0;
    } else if (currentMonthAvailableBudget > 0) {
      fromAllocation = currentMonthAvailableBudget;
      fromReimbursement = amount - currentMonthAvailableBudget;
    } else {
      fromAllocation = 0;
      fromReimbursement = amount;
    }

    // Get or create reimbursement document
    let reimbursement = await this.reimbursementModel.findOne({
      requestedBy: userId,
      isReimbursed: false,
    });

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

    const deptExists = await this.departmentModel.findById(department);
    if (!deptExists) throw new NotFoundException('Department not found!');

    let subDeptData: SubDepartment | null = null;
    let subDeptId;
    if (subDepartment) {
      const subDeptExists = await this.subDepartmentModel.findById(subDepartment);
      if (!subDeptExists) throw new NotFoundException('SubDepartment not found!');
      subDeptId = subDeptExists._id as Types.ObjectId;
      subDeptData = subDeptExists;
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
      date: expenseDate, // ✅ UTC-safe date
      paymentMode,
      vendor,
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

    // 🔔 SEND EMAIL NOTIFICATIONS TO SUPER ADMINS
    await this.sendExpenseEmailNotifications(expense, user, deptExists, subDeptData);

    // In-app notifications
    const superAdmins = await this.userModal.find({ role: UserRole.SUPERADMIN }).select('_id');
    const notificationMessage = `New expense created by ${user.name} for ₹${amount}`;

    for (const admin of superAdmins) {
      const adminId = admin._id as Types.ObjectId;
      const success = this.notificationService.sendNotification(
        adminId.toString(),
        notificationMessage,
        'EXPENSE_CREATED',
      );

      if (!success) {
        console.warn(`⚠️ SuperAdmin ${adminId.toString()} is not connected`);
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

  private async sendExpenseEmailNotifications(
    expense: any,
    user: any,
    department: any,
    subDepartment?: any
  ): Promise<void> {
    try {
      // Get super admins with email addresses
      const superAdmins = await this.userModal.find({
        role: UserRole.SUPERADMIN
      }).select('email name').lean();

      if (superAdmins.length === 0) {
        console.log('No super admins found for email notification');
        return;
      }

      // Properly filter out undefined/null emails and ensure they are strings
      const adminEmails = superAdmins
        .map(admin => admin.email)
        .filter((email): email is string =>
          typeof email === 'string' && email.trim().length > 0
        );

      if (adminEmails.length === 0) {
        console.log('No valid admin emails found for notification');
        return;
      }

      // Create email template
      const emailHtml = createExpenseEmailTemplate(expense, user, department, subDepartment);

      // Send email to all super admins
      const emailSuccess = await this.mailService.sendEmail({
        to: adminEmails,
        subject: `💰 New Expense Submitted - ₹${expense.amount}`,
        html: emailHtml,
      });

      if (emailSuccess) {
        console.log(`✅ Expense email notifications sent to ${adminEmails.length} admins`);
      } else {
        console.log('❌ Failed to send expense email notifications');
      }
    } catch (error) {
      console.error('Error sending expense email notifications:', error);
      // Don't throw error - email failure shouldn't break expense creation
    }
  }




  async getAllExpenses(page = 1, limit = 10, location?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    // Update cache key to include location
    const cacheKey = `expenses:all:${location || 'overall'}:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached)
      return { message: 'Fetched expenses from cache', ...(cached as any) };

    // Build base query with population and location filtering
    const baseQuery: any = {};

    // Apply location filter if provided
    if (location && location !== 'OVERALL') {
      // First, find users with the specified location
      const usersWithLocation = await this.userModal.find({ userLoc: location }).select('_id');
      const userIds = usersWithLocation.map(user => user._id);

      // Then filter expenses by those user IDs
      baseQuery.user = { $in: userIds };
    }

    const query = this.expenseModal
      .find(baseQuery)
      .populate('user', 'name userLoc')
      .populate('department', 'name')
      .populate('subDepartment', 'name')
      .populate('reimbursement', 'amount isReimbursed')
      .sort({ createdAt: -1 });

    // Get paginated data
    const [data, total] = await Promise.all([
      query.skip(skip).limit(safeLimit).exec(),
      this.expenseModal.countDocuments(baseQuery),
    ]);

    // Get all expenses for stats (without pagination)
    const allExpensesQuery = this.expenseModal
      .find(baseQuery)
      .populate('user', 'name userLoc')
      .populate('department', 'name')
      .populate('subDepartment', 'name')
      .populate('reimbursement', 'amount isReimbursed')
      .sort({ createdAt: -1 });

    const allExpenses = await allExpensesQuery.exec();

    // Calculate stats
    const statsData = await this.expenseModal.find(baseQuery).exec();

    const stats = {
      totalSpent: statsData.reduce((sum, expense) => sum + expense.amount, 0),
      totalFromAllocation: statsData.reduce((sum, expense) => sum + (expense.fromAllocation || 0), 0),
      totalFromReimbursement: statsData.reduce((sum, expense) => sum + (expense.fromReimbursement || 0), 0),
    };

    const result = {
      message: 'Fetched expenses successfully',
      meta: { total, page: safePage, limit: safeLimit },
      stats,
      data,
      allExpenses,
      location: location || 'OVERALL'
    };

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async searchExpenses(filters: SearchExpensesDto, page = 1, limit = 20, location?: string) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = `expenses:search:${location || 'overall'}:${JSON.stringify(filters)}:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached)
      return {
        message: 'Search expenses fetched from cache',
        ...(cached as any),
      };

    // Build the main query
    const baseQuery: any = {};

    // Apply basic filters
    if (filters.month !== undefined) {
      baseQuery.month = filters.month;
    }
    if (filters.year !== undefined) {
      baseQuery.year = filters.year;
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      baseQuery.amount = {};
      if (filters.minAmount !== undefined) baseQuery.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) baseQuery.amount.$lte = filters.maxAmount;
    }

    if (filters.department) {
      try {
        baseQuery.department = new Types.ObjectId(filters.department);
      } catch (err) {
        console.warn('Invalid department ID:', filters.department, err);
      }
    }

    if (filters.subDepartment) {
      try {
        baseQuery.subDepartment = new Types.ObjectId(filters.subDepartment);
      } catch (err) {
        console.warn('Invalid subDepartment ID:', filters.subDepartment, err);
      }
    }

    // Apply location filter if provided
    if (location && location !== 'OVERALL') {
      // First, find users with the specified location
      const usersWithLocation = await this.userModal.find({ userLoc: location }).select('_id');
      const userIds = usersWithLocation.map(user => user._id);

      // Then filter expenses by those user IDs
      baseQuery.user = { $in: userIds };
    }

    const query = this.expenseModal
      .find(baseQuery)
      .populate('user', 'name userLoc')
      .populate('department', 'name')
      .populate('subDepartment', 'name')
      .sort({ createdAt: -1 });

    // Get data without username filter first
    let data = await query.skip(skip).limit(safeLimit).exec();
    let allExpenses = await this.expenseModal.find(baseQuery)
      .populate('user', 'name userLoc')
      .populate('department', 'name')
      .populate('subDepartment', 'name')
      .sort({ createdAt: -1 })
      .exec();

    // Apply username filter in memory if provided
    if (filters.userName) {
      const userNameRegex = new RegExp(filters.userName, 'i');

      // Type-safe filtering using Mongoose document methods
      data = data.filter(expense => {
        const user = expense.user as any; // Use type assertion for populated field
        return user && user.name && userNameRegex.test(user.name);
      });

      allExpenses = allExpenses.filter(expense => {
        const user = expense.user as any; // Use type assertion for populated field
        return user && user.name && userNameRegex.test(user.name);
      });
    }

    // Get total count (need to handle username filter separately)
    let total = await this.expenseModal.countDocuments(baseQuery);

    // If username filter is applied, we need to adjust the total count
    if (filters.userName) {
      const allFilteredExpenses = await this.expenseModal.find(baseQuery)
        .populate('user', 'name userLoc')
        .exec();

      const userNameRegex = new RegExp(filters.userName, 'i');
      const filteredExpenses = allFilteredExpenses.filter(expense => {
        const user = expense.user as any; // Use type assertion for populated field
        return user && user.name && userNameRegex.test(user.name);
      });
      total = filteredExpenses.length;
    }

    // Calculate stats using the same filter
    const statsData = await this.expenseModal.find(baseQuery).exec();

    const stats = {
      totalSpent: statsData.reduce((sum, expense) => sum + expense.amount, 0),
      totalFromAllocation: statsData.reduce((sum, expense) => sum + (expense.fromAllocation || 0), 0),
      totalFromReimbursement: statsData.reduce((sum, expense) => sum + (expense.fromReimbursement || 0), 0),
    };

    const result = {
      message: 'Search completed',
      data,
      stats,
      allExpenses,
      location: location || 'OVERALL',
      meta: { total, page: safePage, limit: safeLimit },
    };

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async getAllExpensesForUser(
    page = 1,
    limit = 10,
    userId: string
  ) {



    const userIdObj = new Types.ObjectId(userId);


    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = this.EXPENSE_USER_KEY(userIdObj.toString(), safePage, safeLimit);
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