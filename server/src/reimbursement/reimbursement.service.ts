/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reimbursement } from 'src/models/reimbursements.model';
import { CreateReimbursementDto, UpdateReimbursementDto } from './dto/create-reimbursement.dto';
import { User, UserRole } from 'src/models/user.model';
import { Expense } from 'src/models/expense.model';

@Injectable()
export class ReimbursementService {
    constructor(
        @InjectModel(Reimbursement.name) private readonly reimbursementModel: Model<Reimbursement>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,

    ) { }

    async createReimbursement(data: CreateReimbursementDto) {
        const { amount, expense: expenseId, requestedBy } = data;

        // Fetch expense
        const expense = await this.expenseModel.findById(expenseId);

        if (!expense) {
            throw new NotFoundException("Expense not found");
        }

        // The reimbursement amount that should be matched
        const reimbursableAmount = Number(expense.fromReimbursement);

        // Strict equality check
        if (Number(amount) !== reimbursableAmount) {
            throw new UnauthorizedException(
                `Reimbursement amount must be exactly ${reimbursableAmount}`
            );
        }

        // Create reimbursement record
        const reimbursement = new this.reimbursementModel({
            expense: new Types.ObjectId(expenseId),
            requestedBy: new Types.ObjectId(requestedBy),
            amount,
            isReimbursed: false,
        });

        await reimbursement.save();
        return { reimbursement };
    }



    async fetchAllReimbursements(filters?: any) {
        const query: any = {};

        if (filters?.isReimbursed !== undefined) query.isReimbursed = filters.isReimbursed;
        if (filters?.userId) query.requestedBy = new Types.ObjectId(filters.userId);
        if (filters?.expenseId) query.expense = new Types.ObjectId(filters.expenseId);

        const reimbursements = await this.reimbursementModel
            .find(query)
            .populate('requestedBy', 'name email')
            .populate('expense')
            .sort({ createdAt: -1 })
            .exec();

        return reimbursements;
    }


    async searchReimbursements(filters: any, page = 1, limit = 20) {
        const safePage = Math.max(Number(page), 1);
        const safeLimit = Math.max(Number(limit), 1);
        const skip = (safePage - 1) * safeLimit;

        const query: any = {};
        if (filters?.isReimbursed !== undefined) query.isReimbursed = filters.isReimbursed;
        if (filters?.userId) query.requestedBy = new Types.ObjectId(filters.userId);

        const total = await this.reimbursementModel.countDocuments(query);
        const data = await this.reimbursementModel
            .find(query)
            .populate('requestedBy', 'name _id')
            .populate('expense')
            .skip(skip)
            .limit(safeLimit)
            .sort({ createdAt: -1 })
            .exec();

        return { data, meta: { total, page: safePage, limit: safeLimit } };
    }

    // // Mark reimbursement as paid/reimbursed
    // async markReimbursementsPaid(rId: string) {
    //     const reimbursementDoc = await this.reimbursementModel.findById(rId);
    //     if (!reimbursementDoc) throw new NotFoundException("Reimbursement record doesn't exist");

    //     if (reimbursementDoc.isReimbursed)
    //         throw new BadRequestException("Reimbursement already marked as paid");

    //     const user = await this.userModel.findById(reimbursementDoc.requestedBy);
    //     if (!user) throw new NotFoundException("User not found");

    //     if (user.reimbursedAmount === undefined) user.reimbursedAmount = 0;
    //     user.reimbursedAmount -= reimbursementDoc.amount; // decrement user amount

    //     reimbursementDoc.isReimbursed = true;

    //     await Promise.all([user.save(), reimbursementDoc.save()]);
    //     return { message: "Reimbursement marked as paid", reimbursement: reimbursementDoc };
    // }


    async updateReimbursement(rId: string, data: UpdateReimbursementDto, user: any) {
        const reimbursementDoc = await this.reimbursementModel.findById(rId);
        if (!reimbursementDoc) throw new NotFoundException("Reimbursement record doesn't exist");

        if (reimbursementDoc.isReimbursed) {
            throw new BadRequestException("Cannot update a reimbursement that is already paid");
        }

        // Normal users should only update their own requests
        if (reimbursementDoc.requestedBy.toString() !== user._id.toString() && user.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedException("You cannot update someone else's reimbursement request");
        }


        if (data.amount !== undefined) reimbursementDoc.amount = Number(data.amount);


        await reimbursementDoc.save();
        return {
            message: "Reimbursement updated successfully",
            reimbursement: reimbursementDoc,
        };
    }



    async superadminUpdateReimbursement(rId: string, isReimbursed: boolean, superadmin: any) {
        if (superadmin?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedException("Only Superadmin can perform this action");
        }

        const reimbursementDoc = await this.reimbursementModel.findById(rId);
        if (!reimbursementDoc) {
            throw new NotFoundException("Reimbursement record doesn't exist");
        }

        // Only update when marking as reimbursed
        if (isReimbursed) {
            // Update linked expense
            if (reimbursementDoc.expense) {
                const expense = await this.expenseModel.findById(reimbursementDoc.expense);
                if (!expense) throw new NotFoundException("Linked expense not found");

                // Deduct the reimbursed amount
                expense.fromReimbursement = Number(expense.fromReimbursement) - Number(reimbursementDoc.amount);

                if (expense.fromReimbursement < 0) {
                    throw new BadRequestException("Expense reimbursement amount cannot go negative");
                }

                await expense.save();
            }

            // Update linked user
            const user = await this.userModel.findById(reimbursementDoc.requestedBy);
            if (!user) throw new NotFoundException("User not found");

            if (user.reimbursedAmount === undefined) user.reimbursedAmount = 0;
            user.reimbursedAmount = Number(user.reimbursedAmount) - Number(reimbursementDoc.amount);

            if (user.reimbursedAmount < 0) {
                throw new BadRequestException("User reimbursed amount cannot go negative");
            }

            await user.save();

            // Finally mark reimbursement as completed
            reimbursementDoc.isReimbursed = true;
        }

        await reimbursementDoc.save();

        return {
            message: isReimbursed
                ? "Reimbursement marked as paid and synced with expense/user"
                : "No changes applied (not reimbursed)",
            reimbursement: reimbursementDoc,
        };
    }



    async deleteReimbursement(rId: string) {
        const reimbursementDoc = await this.reimbursementModel.findById(rId);
        if (!reimbursementDoc) throw new NotFoundException("Reimbursement record doesn't exist");

        if (reimbursementDoc.isReimbursed)
            throw new BadRequestException("Cannot delete a reimbursement that is already paid");

        await reimbursementDoc.deleteOne();
        return { message: "Reimbursement deleted successfully" };
    }
}
