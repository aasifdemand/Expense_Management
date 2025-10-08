/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    Inject
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

        // Clear relevant caches
        await this.clearReimbursementCaches(requestedBy!.toString());

        return { reimbursement };
    }

    async fetchAllReimbursements() {
        const cacheKey = `reimbursements:all`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: 'Fetched all reimbursements from cache', ...(cached as any) };
        }

        const allReimbursements = await this.reimbursementModel
            .find()
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 })
            .exec();

        // Calculate stats
        const stats = {
            totalReimbursements: allReimbursements.length,
            totalAmount: allReimbursements.reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalReimbursed: allReimbursements.filter(r => r.isReimbursed).length,
            totalPending: allReimbursements.filter(r => !r.isReimbursed).length,
            totalReimbursedAmount: allReimbursements
                .filter(r => r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalPendingAmount: allReimbursements
                .filter(r => !r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
        };

        const result = {
            message: 'Fetched all reimbursements successfully',
            stats,
            data: allReimbursements,
        };

        await this.cacheManager.set(cacheKey, result, 60_000); // 1 minute cache
        return result;
    }

    async fetchUserReimbursements(userId: string) {
        const cacheKey = `reimbursements:user:${userId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: 'Fetched user reimbursements from cache', ...(cached as any) };
        }

        const userReimbursements = await this.reimbursementModel
            .find({ requestedBy: new Types.ObjectId(userId) })
            .populate('requestedBy', 'name email userLoc')
            .populate('expense')
            .sort({ createdAt: -1 })
            .exec();

        // Calculate stats for this user
        const stats = {
            totalReimbursements: userReimbursements.length,
            totalAmount: userReimbursements.reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalReimbursed: userReimbursements.filter(r => r.isReimbursed).length,
            totalPending: userReimbursements.filter(r => !r.isReimbursed).length,
            totalReimbursedAmount: userReimbursements
                .filter(r => r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
            totalPendingAmount: userReimbursements
                .filter(r => !r.isReimbursed)
                .reduce((sum, reimbursement) => sum + reimbursement.amount, 0),
        };

        const result = {
            message: 'Fetched user reimbursements successfully',
            stats,
            data: userReimbursements,
        };

        await this.cacheManager.set(cacheKey, result, 60_000);
        return result;
    }

    async getAllReimbursements(page = 1, limit = 10, location?: string) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        // Update cache key to include location
        const cacheKey = `reimbursements:all:${location || 'overall'}:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: 'Fetched reimbursements from cache', ...(cached as any) };
        }

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

        await this.cacheManager.set(cacheKey, result, 60_000);
        return result;
    }

    async getUserReimbursements(userId: string, page = 1, limit = 10, location?: string) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        // Update cache key to include location and user
        const cacheKey = `reimbursements:user:${userId}:${location || 'overall'}:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: 'Fetched user reimbursements from cache', ...(cached as any) };
        }

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

                await this.cacheManager.set(cacheKey, emptyResult, 60_000);
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

        await this.cacheManager.set(cacheKey, result, 60_000);
        return result;
    }

    async searchReimbursements(filters: any, page = 1, limit = 20) {
        const safePage = Math.max(Number(page), 1);
        const safeLimit = Math.max(Number(limit), 1);
        const skip = (safePage - 1) * safeLimit;

        const cacheKey = `reimbursements:search:${JSON.stringify(filters)}:${safePage}:${safeLimit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return { message: 'Fetched search results from cache', ...(cached as any) };
        }

        const query: any = {};
        if (filters?.isReimbursed !== undefined) query.isReimbursed = filters.isReimbursed;
        if (filters?.userId) query.requestedBy = new Types.ObjectId(filters.userId);

        const total = await this.reimbursementModel.countDocuments(query);
        const data = await this.reimbursementModel
            .find(query)
            .populate('requestedBy', 'name _id userLoc')
            .populate('expense')
            .skip(skip)
            .limit(safeLimit)
            .sort({ createdAt: -1 })
            .exec();

        const result = {
            data,
            meta: { total, page: safePage, limit: safeLimit }
        };

        await this.cacheManager.set(cacheKey, result, 60_000);
        return result;
    }

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

        // Clear relevant caches
        await this.clearReimbursementCaches(reimbursementDoc.requestedBy.toString());

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

        // Clear reimbursement caches
        await this.clearAllReimbursementCaches();

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

    async deleteReimbursement(rId: string) {
        const reimbursementDoc = await this.reimbursementModel.findById(rId);
        if (!reimbursementDoc) throw new NotFoundException("Reimbursement record doesn't exist");

        if (reimbursementDoc.isReimbursed)
            throw new BadRequestException("Cannot delete a reimbursement that is already paid");

        const userId = reimbursementDoc.requestedBy.toString();
        await reimbursementDoc.deleteOne();

        // Clear relevant caches
        await this.clearReimbursementCaches(userId);

        return { message: "Reimbursement deleted successfully" };
    }

    // Helper method to clear reimbursement caches for a specific user
    private async clearReimbursementCaches(userId: string) {
        const cacheKeys = [
            `reimbursements:all`,
            `reimbursements:user:${userId}`,
            `reimbursements:all:*`,
            `reimbursements:user:${userId}:*`,
            `reimbursements:search:*`
        ];

        for (const pattern of cacheKeys) {
            // If it's a pattern with wildcard, you might need to get all keys and delete matching ones
            // For simplicity, we'll clear the main caches
            await this.cacheManager.del(pattern.replace(':*', ''));
        }
    }

    // Helper method to clear all reimbursement caches
    private async clearAllReimbursementCaches() {
        const cacheKeys = [
            `reimbursements:all`,
            `reimbursements:all:*`,
            `reimbursements:user:*`,
            `reimbursements:search:*`
        ];

        for (const pattern of cacheKeys) {
            await this.cacheManager.del(pattern.replace(':*', ''));
        }
    }
}