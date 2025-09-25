import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetModule } from './budget/budget.module';
import { NotificationsGateway } from './gateways/notifications/notifications.gateway';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get("MONGO_URI")
      })
    }),
    AuthModule,
    ExpensesModule,
    BudgetModule
  ],
  controllers: [],
  providers: [NotificationsGateway],
})
export class AppModule { }
