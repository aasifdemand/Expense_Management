import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';

@Module({
    providers: [NotificationsService, NotificationsGateway],
    exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule { }
