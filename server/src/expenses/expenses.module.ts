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
  providers: [ExpensesService, ImagekitService],
})
export class ExpensesModule { }
