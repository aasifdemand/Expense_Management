/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from 'src/models/expense.model';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { ImagekitService } from 'src/services/media.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/models/user.model';

@Injectable()
export class ExpensesService {

    constructor(
        @InjectModel(Expense.name) private readonly expenseModal: Model<Expense>,
        @InjectModel(User.name) private readonly userModal: Model<User>,
        private readonly mediaService: ImagekitService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }



    async handleCreateExpense(data: CreateExpenseDto, file?: Express.Multer.File) {
        const { amount, date, department, paidTo, isReimbursed } = data;

        const user = await this.userModal.findById(paidTo).select("name _id");
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


        const newExpense = new this.expenseModal({
            amount,
            date,
            department,
            paidTo: user._id,
            isReimbursed,
            proof,

        });

        const expense = await newExpense.save();


        const safeUser = {
            id: user._id,
            name: user.name,
        };

        await this.cacheManager.del("expenses:all");

        return {
            message: "Created the new Expense successfully",
            expense: {
                ...expense.toObject(),
                paidTo: safeUser,
            },
        };
    }



    async getAllExpenses(skip = 0, limit = 20) {
        const cacheKey = `expenses:all:${skip}:${limit}`;
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
                .lean().populate({
                    path: "paidTo",
                    select: "name _id",
                }),
            this.expenseModal.countDocuments(),
        ]);

        const result = {
            message: "Fetched expenses successfully",
            meta: {
                total,
                skip,
                limit,
                pages: Math.ceil(total / limit),
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
            path: "paidTo",
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
            path: "paidTo",
            select: "name _id",
        })

        if (!updatedExpense) {
            throw new NotFoundException("Expense doesn't exist");
        }

        await this.cacheManager.del(`expenses:${id}`);
        await this.cacheManager.del("expenses:all");

        return { message: "Expense updated successfully", expense: updatedExpense };
    }

    async searchReimbursements(searchString: string) {

        const regex = new RegExp(searchString, "i");

        const reimbursements = await this.expenseModal
            .find({
                isReimbursed: true,
                $or: [
                    { paidTo: { $regex: regex } },
                    { department: { $regex: regex } },
                ],
            })
            .populate({ path: "paidTo", select: "name _id" })
            .lean();

        return {
            message: "Search completed successfully",
            count: reimbursements.length,
            data: reimbursements,
        };
    }


}
