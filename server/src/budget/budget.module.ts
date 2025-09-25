import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Budget, BudgetSchema } from 'src/models/budget.model';
import { User, userSchema } from 'src/models/user.model';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Budget.name,
        schema: BudgetSchema
      },
      {
        name: User.name,
        schema: userSchema
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
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule { }
