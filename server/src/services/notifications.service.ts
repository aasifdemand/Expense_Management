import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from "src/models/notifications.model";
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async createNotification(userId: string, message: string, type = "EXPENSE_CREATED") {

        const notif = new this.notificationModel({
            message,
            recipient: new Types.ObjectId(userId),
            type
        });

        await notif.save();


        this.notificationsGateway.sendToUser(userId, notif);

        return { notification: notif };
    }

    async getUserNotifications(userId: string) {
        const notifications = await this.notificationModel.find({ recipient: userId }).sort({ createdAt: -1 });
        return { notifications }
    }

    async markAsRead(id: string) {
        const notification = await this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
        return { notification }
    }
}
