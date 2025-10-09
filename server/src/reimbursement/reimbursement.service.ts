/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { Reimbursement } from 'src/models/reimbursements.model';
import { User, UserRole } from 'src/models/user.model';
import { Expense } from 'src/models/expense.model';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ReimbursementService {
    constructor(
        @InjectModel(Reimbursement.name) private readonly reimbursementModel: Model<Reimbursement>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,

        private readonly notificationService: NotificationsService,
    ) { }





    async getAllReimbursements(page = 1, limit = 10, location?: string) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;



        // Build base query with population and location filtering
        const baseQuery: any = {};

        // Apply location filter if provided
        if (location && location !== 'OVERALL') {
            // First, find users with the specified location
            const usersWithLocation = await this.userModel.find({ userLoc: location }).select('_id');
            const userIds = usersWithLocation.map(user => user._id);

            // Then filter reimbursements by those user IDs
            baseQuery.requestedBy = { $in: userIds };
        }

        const query = this.reimbursementModel
            .find(baseQuery)
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 });

        // Get paginated data
        const [data, total] = await Promise.all([
            query.skip(skip).limit(safeLimit).exec(),
            this.reimbursementModel.countDocuments(baseQuery),
        ]);

        // Get all reimbursements for stats (without pagination)
        const allReimbursementsQuery = this.reimbursementModel
            .find(baseQuery)
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 });

        const allReimbursements = await allReimbursementsQuery.exec();

        // Calculate stats
        const statsData = await this.reimbursementModel.find(baseQuery).exec();

        const stats = {
            totalReimbursements: statsData.length,
            totalAmount: statsData.reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalReimbursed: statsData.filter(r => r.isReimbursed).length,
            totalPending: statsData.filter(r => !r.isReimbursed).length,
            totalReimbursedAmount: statsData
                .filter(r => r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalPendingAmount: statsData
                .filter(r => !r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
        };

        const result = {
            message: 'Fetched reimbursements successfully',
            meta: { total, page: safePage, limit: safeLimit },
            stats,
            data,
            allReimbursements,
            location: location || 'OVERALL'
        };


        return result;
    }

    async getUserReimbursements(userId: string, page = 1, limit = 10, location?: string) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;



        // Build base query
        const baseQuery: any = { requestedBy: new Types.ObjectId(userId) };

        // Apply location filter if provided - verify user's location matches
        if (location && location !== 'OVERALL') {
            const user = await this.userModel.findById(userId).select('userLoc');
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // If the requested location doesn't match user's actual location, return empty
            if (user.userLoc !== location) {
                const emptyResult = {
                    message: 'Fetched user reimbursements successfully',
                    meta: { total: 0, page: safePage, limit: safeLimit },
                    stats: {
                        totalReimbursements: 0,
                        totalAmount: 0,
                        totalReimbursed: 0,
                        totalPending: 0,
                        totalReimbursedAmount: 0,
                        totalPendingAmount: 0,
                    },
                    data: [],
                    allReimbursements: [],
                    location: location
                };


                return emptyResult;
            }
        }

        const query = this.reimbursementModel
            .find(baseQuery)
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 });

        // Get paginated data
        const [data, total] = await Promise.all([
            query.skip(skip).limit(safeLimit).exec(),
            this.reimbursementModel.countDocuments(baseQuery),
        ]);

        // Get all reimbursements for stats (without pagination)
        const allReimbursementsQuery = this.reimbursementModel
            .find(baseQuery)
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 });

        const allReimbursements = await allReimbursementsQuery.exec();

        // Calculate stats
        const statsData = await this.reimbursementModel.find(baseQuery).exec();

        const stats = {
            totalReimbursements: statsData.length,
            totalAmount: statsData.reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalReimbursed: statsData.filter(r => r.isReimbursed).length,
            totalPending: statsData.filter(r => !r.isReimbursed).length,
            totalReimbursedAmount: statsData
                .filter(r => r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalPendingAmount: statsData
                .filter(r => !r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
        };

        const result = {
            message: 'Fetched user reimbursements successfully',
            meta: { total, page: safePage, limit: safeLimit },
            stats,
            data,
            allReimbursements,
            location: location || 'OVERALL'
        };

        return result;
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

        const userId = user._id?.toString ? user._id.toString() : String(user._id);
        console.log(`🔔 Processing reimbursement for user: ${userId}`);

        // ✅ Only update the reimbursement status, no budget or expense modification
        if (isReimbursed && !reimbursementDoc.isReimbursed) {
            reimbursementDoc.isReimbursed = true;
            reimbursementDoc.reimbursedAt = new Date();
            console.log(`💰 Reimbursement marked as paid: ₹${reimbursementDoc.amount}`);
        }
        else if (!isReimbursed && reimbursementDoc.isReimbursed) {
            // Allow reverting the paid status if needed
            reimbursementDoc.isReimbursed = false;
            reimbursementDoc.reimbursedAt = undefined;
            console.log(`↩️ Reimbursement reverted: ₹${reimbursementDoc.amount}`);
        }

        await reimbursementDoc.save();



        // Send notification
        const notificationMessage = isReimbursed
            ? `Your reimbursement request for ₹${reimbursementDoc.amount} has been approved and processed.`
            : `Your reimbursement request for ₹${reimbursementDoc.amount} has been reverted. Please contact administrator for more details.`;

        const notificationType = isReimbursed
            ? "REIMBURSEMENT_APPROVED"
            : "REIMBURSEMENT_REVERTED";

        console.log(`📤 Attempting to send notification to user: ${userId}`);
        const success = this.notificationService.sendNotification(
            userId,
            notificationMessage,
            notificationType,
        );

        if (success) {
            console.log(`✅ Notification sent successfully to user: ${userId}`);
        } else {
            console.warn(`⚠️ User ${userId} is not connected for reimbursement notification`);
        }

        return {
            message: isReimbursed
                ? "Reimbursement marked as paid successfully"
                : "Reimbursement payment reverted successfully",
            reimbursement: reimbursementDoc,
        };
    }






}