/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { Department } from 'src/models/department.model';
import { SubDepartment } from 'src/models/sub-department.model';


@Injectable()
export class ExpensesService {

    constructor(
        @InjectModel(Expense.name) private readonly expenseModal: Model<Expense>,
        @InjectModel(User.name) private readonly userModal: Model<User>,
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
        @InjectModel(SubDepartment.name) private readonly subDepartmentModel: Model<SubDepartment>,
        private readonly mediaService: ImagekitService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        // private readonly notificationService: NotificationsService
    ) { }

    private EXPENSE_ALL_KEY = (page: number, limit: number) => `expenses:all:${page}:${limit}`;
    private EXPENSE_USER_KEY = (userId: string, page: number, limit: number) => `expenses:user:${userId}:${page}:${limit}`;
    private EXPENSE_BY_ID_KEY = (id: string) => `expenses:${id}`;




    async handleCreateExpense(
        data: CreateExpenseDto,
        userId: string,
        file?: Express.Multer.File
    ) {
        const { amount, department, paidTo, isReimbursed, subDepartment, paymentMode } = data;

        // Fetch user with budget info
        const user = await this.userModal
            .findById(userId)
            .select("name _id expenses spentAmount reimbursedAmount allocatedAmount budgetLeft");
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

        let fromAllocation = 0;
        let fromReimbursement = 0;

        // ✅ Split amount between allocation vs reimbursement
        if (amount <= user.budgetLeft) {
            fromAllocation = amount;
        } else {
            fromAllocation = Math.max(0, user.budgetLeft);
            fromReimbursement = amount - fromAllocation;
        }

        // ✅ Validate department
        const deptExists = await this.departmentModel.findById(department);
        if (!deptExists) throw new NotFoundException("Department not found!");

        let subDeptId: Types.ObjectId | undefined;
        if (subDepartment) {
            const subDeptExists = await this.subDepartmentModel.findById(subDepartment);
            if (!subDeptExists) throw new NotFoundException("SubDepartment not found!");
            subDeptId = subDeptExists._id as Types.ObjectId;
        }

        // ✅ Create new expense
        const newExpense = new this.expenseModal({
            amount,
            fromAllocation,
            fromReimbursement,
            department: new Types.ObjectId(deptExists._id as string),
            subDepartment: new Types.ObjectId(subDeptId),
            user: new Types.ObjectId(user._id as string),
            isReimbursed,
            proof,
            paidTo,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            paymentMode,
            budget: null,
        });

        const expense = await newExpense.save();

        // ✅ Update user financials
        await this.userModal.findByIdAndUpdate(userId, {
            $push: { expenses: expense._id },
            $inc: {
                spentAmount: amount,
                reimbursedAmount: fromReimbursement,
                budgetLeft: -amount,
            },
        });

        // ✅ Clear cache
        await Promise.all([
            this.cacheManager.del(this.EXPENSE_BY_ID_KEY(expense._id as string)),
            this.cacheManager.del(`expenses:all:${1}:${20}`),
            this.cacheManager.del(`expenses:user:${userId}:${1}:${20}`),
            this.cacheManager.del("expenses:search:*"),
        ]);

        return {
            message: "Created the new Expense successfully",
            expense: {
                ...expense.toObject(),
                user: { id: user._id, name: user.name },
            },
        };
    }






    async searchExpenses(filters: SearchExpensesDto, page = 1, limit = 20) {
        const safePage = Math.max(Number(page), 1);
        const safeLimit = Math.max(Number(limit), 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `expenses:search:${JSON.stringify(filters)}:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return { message: "Search expenses fetched from cache", ...(cached as any) };

        // --- Build match stage
        const matchStage: Record<string, any> = {};
        if (filters.paidTo) matchStage.paidTo = { $regex: new RegExp(filters.paidTo, "i") };
        if (filters.month !== undefined) matchStage.month = filters.month;
        if (filters.year !== undefined) matchStage.year = filters.year;
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
            matchStage.amount = {};
            if (filters.minAmount !== undefined) matchStage.amount.$gte = filters.minAmount;
            if (filters.maxAmount !== undefined) matchStage.amount.$lte = filters.maxAmount;
        }


        // Filter by department/subDepartment ObjectId before lookup
        if (filters.department) {
            try {
                matchStage.department = new Types.ObjectId(filters.department);
            } catch (err: any) {
                console.warn("Invalid department ID:", filters.department, err);
            }
        }
        if (filters.subDepartment) {
            try {
                matchStage.subDepartment = new Types.ObjectId(filters.subDepartment);
            } catch (err: any) {
                console.warn("Invalid subDepartment ID:", filters.subDepartment, err);
            }
        }

        // --- Aggregation pipeline
        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

            // Lookup for department and subDepartment
            {
                $lookup: {
                    from: "departments",
                    localField: "department",
                    foreignField: "_id",
                    as: "department"
                }
            },
            { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "subdepartments",
                    localField: "subDepartment",
                    foreignField: "_id",
                    as: "subDepartment"
                }
            },
            { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },
        ];


        console.log("match stage: ", matchStage);

        // Filter by userName if provided
        if (filters.userName) {
            pipeline.push({ $match: { "user.name": { $regex: new RegExp(filters.userName, "i") } } });
        }

        // --- Stats aggregation (sum before pagination)
        const statsPipeline = [
            ...pipeline,
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                    totalFromAllocation: { $sum: "$fromAllocation" },
                    totalFromReimbursement: { $sum: "$fromReimbursement" },
                }
            }
        ];
        const statsResult = await this.expenseModal.aggregate(statsPipeline);
        const stats = statsResult[0] || { totalSpent: 0, totalFromAllocation: 0, totalFromReimbursement: 0 };

        // --- Pagination and sorting
        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: safeLimit });

        const data = await this.expenseModal.aggregate(pipeline);

        // Count total matching documents (without pagination)
        const totalDocsPipeline = [
            { $match: matchStage },
            {
                $count: "total"
            }
        ];
        const totalResult = await this.expenseModal.aggregate(totalDocsPipeline);
        const total = totalResult[0]?.total || 0;

        return {
            message: "Search completed",
            data,
            stats,
            meta: { total, page: safePage, limit: safeLimit }
        };
    }









    async getAllExpenses(page = 1, limit = 10) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `expenses:all:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return { message: "Fetched expenses from cache", ...(cached as any) };

        // --- Paginated expenses ---
        const [expenses, total] = await Promise.all([
            this.expenseModal
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .populate({ path: "user", select: "name _id" })
                .populate({ path: "department", select: "name" })
                .populate({ path: "subDepartment", select: "name" })
                .lean(),
            this.expenseModal.countDocuments(),
        ]);

        // --- Full dataset for charts/stats ---
        const allExpenses = await this.expenseModal
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "name _id" })
            .lean();

        // --- Stats based on full dataset ---
        // Convert potentially-string or missing numeric fields to double with fallback 0
        const statsPipeline: PipelineStage[] = [
            {
                $group: {
                    _id: null,
                    totalSpent: {
                        $sum: {
                            $convert: {
                                input: "$amount",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                    totalFromAllocation: {
                        $sum: {
                            $convert: {
                                input: "$fromAllocation",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                    totalFromReimbursement: {
                        $sum: {
                            $convert: {
                                input: "$fromReimbursement",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                },
            },
        ];

        const [statsResult] = await this.expenseModal.aggregate(statsPipeline);
        const stats = statsResult || { totalSpent: 0, totalFromAllocation: 0, totalFromReimbursement: 0 };

        const result = {
            message: "Fetched expenses successfully",
            meta: { total, page: safePage, limit: safeLimit },
            stats,          // totalSpent, totalFromAllocation, totalFromReimbursement (numbers)
            data: expenses, // paginated
            allExpenses,    // full dataset
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
                .populate({ path: "department", select: "name" })       // populate department
                .populate({ path: "subDepartment", select: "name" })    // populate subDepartment
                .lean(),
            this.expenseModal.countDocuments({ user: userIdObj }),
        ]);

        // --- Full dataset for the user ---
        const allExpenses = await this.expenseModal
            .find({ user: userIdObj })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "name _id" })
            .populate({ path: "department", select: "name" })
            .populate({ path: "subDepartment", select: "name" })
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
            return { message: "Expense fetched from cache", expense: cached };
        }

        const expense = await this.expenseModal.findById(id)
            .populate({ path: "user", select: "name _id" })
            .populate({ path: "department", select: "name" })
            .populate({ path: "subDepartment", select: "name" });

        if (!expense) throw new NotFoundException("Expense doesn't exist");

        await this.cacheManager.set(cacheKey, expense, 60_000);
        return { message: "Expense returned successfully", expense };
    }

    async updateReimbursement(data: UpdateExpenseDto, id: string) {
        const updatedExpense = await this.expenseModal.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        )
            .populate({ path: "user", select: "name _id" })
            .populate({ path: "department", select: "name" })
            .populate({ path: "subDepartment", select: "name" });

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