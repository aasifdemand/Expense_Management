import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsGateway: NotificationsGateway) { }


    sendNotification(userId: string, message: string, type = 'EXPENSE_CREATED'): boolean {
        try {
            const notif = { message, type, createdAt: new Date() };
            const success = this.notificationsGateway.sendToUser(userId, notif);

            if (success) {
                console.log(`✅ Notification sent to user ${userId}: ${message}`);
            } else {
                console.warn(`⚠️ User ${userId} not connected for notification: ${message}`);
            }

            return success;
        } catch (error) {
            console.error(`❌ Error sending notification to user ${userId}:`, error);
            return false;
        }
    }
}