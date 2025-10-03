import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/models/expense.model';
import { User, userSchema } from 'src/models/user.model';
import { ImagekitService } from 'src/services/media.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { Budget, BudgetSchema } from 'src/models/budget.model';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';
import { Notification, NotificationSchema } from 'src/models/notifications.model';
import { NotificationsService } from 'src/services/notifications.service';
import { Department, DepartmentSchema } from 'src/models/department.model';
import { SubDepartment, SubDepartmentSchema } from 'src/models/sub-department.model';
import { Reimbursement, ReimbursementSchema } from 'src/models/reimbursements.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forFeature([
      {
        name: Expense.name,
        schema: ExpenseSchema
      },
      {
        name: User.name,
        schema: userSchema
      },
      {
        name: Budget.name,
        schema: BudgetSchema
      },
      {
        name: Notification.name,
        schema: NotificationSchema
      },
      {
        name: Department.name,
        schema: DepartmentSchema
      },
      {
        name: SubDepartment.name,
        schema: SubDepartmentSchema
      },
      {
        name: Reimbursement.name,
        schema: ReimbursementSchema
      }
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get("REDIS_HOST") as string,
            port: configService.get("REDIS_PORT") as string,
          },
        }),
        ttl: 60,
      }),
    }),

  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, ImagekitService, NotificationsGateway, NotificationsService],
})
export class ExpensesModule { }
