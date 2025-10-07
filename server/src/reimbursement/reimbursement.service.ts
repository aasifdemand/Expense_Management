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
import { Budget } from 'src/models/budget.model';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ReimbursementService {
    constructor(
        @InjectModel(Reimbursement.name) private readonly reimbursementModel: Model<Reimbursement>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        private readonly notificationService: NotificationsService,
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



    async fetchAllReimbursements() {
        // const query: any = {};

        // if (filters?.isReimbursed !== undefined) query.isReimbursed = filters.isReimbursed;
        // if (filters?.userId) query.requestedBy = new Types.ObjectId(filters.userId);
        // if (filters?.expenseId) query.expense = new Types.ObjectId(filters.expenseId);

        const reimbursements = await this.reimbursementModel
            .find()
            .populate('requestedBy', 'name email')
            .populate('expense')
            .sort({ createdAt: -1 })
            .exec();

        return reimbursements;
    }


    async fetchUserReimbursements(userId: string) {
        const reimbursements = await this.reimbursementModel
            .find({ requestedBy: new Types.ObjectId(userId) })
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



    async superadminUpdateReimbursement(
        rId: string,
        isReimbursed: boolean,
        superadmin: any
    ) {
        if (superadmin?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedException("Only Superadmin can perform this action");
        }

        const reimbursementDoc = await this.reimbursementModel.findById(rId);
        if (!reimbursementDoc) {
            throw new NotFoundException("Reimbursement record doesn't exist");
        }

        // Prevent re-processing already reimbursed records
        if (reimbursementDoc.isReimbursed && isReimbursed) {
            throw new BadRequestException("Reimbursement is already marked as paid");
        }

        // Get the user who requested the reimbursement
        const user = await this.userModel.findById(reimbursementDoc.requestedBy);
        if (!user) throw new NotFoundException("User not found");

        // Only update when marking as reimbursed
        if (isReimbursed && !reimbursementDoc.isReimbursed) {
            // ✅ Update linked expense - convert reimbursement to allocation
            if (reimbursementDoc.expense) {
                const expense = await this.expenseModel.findById(reimbursementDoc.expense);
                if (!expense) throw new NotFoundException("Linked expense not found");

                // Convert reimbursement amount back to allocation
                expense.fromAllocation = Number(expense.fromAllocation) + Number(reimbursementDoc.amount);
                expense.fromReimbursement = Math.max(0, Number(expense.fromReimbursement) - Number(reimbursementDoc.amount));

                await expense.save();

                // ✅ Update the budget for this expense
                if (expense.budget) {
                    await this.budgetModel.findByIdAndUpdate(
                        expense.budget,
                        {
                            $inc: {
                                remainingAmount: reimbursementDoc.amount,
                                spentAmount: -reimbursementDoc.amount
                            }
                        }
                    );
                    console.log(`✅ Updated budget ${expense.budget.toString()} - added ${reimbursementDoc.amount} back to allocation`);
                }
            }

            // ✅ Update linked user's balances
            // Update user balances
            user.reimbursedAmount = Number(user.reimbursedAmount || 0) + Number(reimbursementDoc.amount);
            user.budgetLeft = Number(user.budgetLeft || 0) + Number(reimbursementDoc.amount); // Add back to available budget

            await user.save();

            // ✅ Mark reimbursement as completed
            reimbursementDoc.isReimbursed = true;
            reimbursementDoc.reimbursedAt = new Date();

            console.log(`💰 Reimbursement processed: ${reimbursementDoc.amount} converted to allocation`);

            // ✅ Send notification to the user
            const notificationMessage = `Your reimbursement request for ₹${reimbursementDoc.amount} has been approved and processed. Amount has been added back to your budget allocation.`;
            const success = this.notificationService.sendNotification(
                user._id as string,
                notificationMessage,
                'REIMBURSEMENT_APPROVED',
            );

            if (!success) {
                console.warn(`⚠️ User ${user._id as string} is not connected for reimbursement notification`);
            }

        } else if (!isReimbursed && reimbursementDoc.isReimbursed) {
            // Handle case where superadmin wants to undo reimbursement
            // ✅ Revert expense changes
            if (reimbursementDoc.expense) {
                const expense = await this.expenseModel.findById(reimbursementDoc.expense);
                if (expense) {
                    // Revert allocation changes
                    expense.fromAllocation = Math.max(0, Number(expense.fromAllocation) - Number(reimbursementDoc.amount));
                    expense.fromReimbursement = Number(expense.fromReimbursement) + Number(reimbursementDoc.amount);

                    await expense.save();

                    // Revert budget changes
                    if (expense.budget) {
                        await this.budgetModel.findByIdAndUpdate(
                            expense.budget,
                            {
                                $inc: {
                                    remainingAmount: -reimbursementDoc.amount,
                                    spentAmount: reimbursementDoc.amount
                                }
                            }
                        );
                        console.log(`↩️ Reverted budget ${expense.budget.toString()} - moved ${reimbursementDoc.amount} back to reimbursement`);
                    }
                }
            }

            // ✅ Revert user's balances
            user.reimbursedAmount = Math.max(0, Number(user.reimbursedAmount || 0) - Number(reimbursementDoc.amount));
            user.budgetLeft = Math.max(0, Number(user.budgetLeft || 0) - Number(reimbursementDoc.amount));
            await user.save();

            reimbursementDoc.isReimbursed = false;
            reimbursementDoc.reimbursedAt = undefined;

            console.log(`↩️ Reimbursement reverted: ${reimbursementDoc.amount}`);

            // ✅ Send notification to the user about reversal
            const notificationMessage = `Your reimbursement request for ₹${reimbursementDoc.amount} has been reverted. Please contact administrator for more details.`;
            console.log("user id: ", user?._id);


            const success = this.notificationService.sendNotification(
                user._id as string,
                notificationMessage,
                'REIMBURSEMENT_REVERTED',
            );

            if (!success) {
                console.warn(`⚠️ User ${user._id as string} is not connected for reimbursement reversal notification`);
            }
        }

        await reimbursementDoc.save();

        return {
            message: isReimbursed
                ? "Reimbursement processed - amount converted to budget allocation"
                : "Reimbursement reverted - amount moved back to reimbursement",
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
