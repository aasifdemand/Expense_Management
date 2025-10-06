import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsGateway: NotificationsGateway) { }

    // Send notification via socket only
    sendNotification(userId: string, message: string, type = 'EXPENSE_CREATED') {
        const notif = { message, type, createdAt: new Date() };
        const success = this.notificationsGateway.sendToUser(userId, notif);
        return { success, notification: notif };
    }
}
