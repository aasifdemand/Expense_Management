import { Module } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reimbursement, ReimbursementSchema } from 'src/models/reimbursements.model';
import { User, userSchema } from 'src/models/user.model';
import { Expense, ExpenseSchema } from 'src/models/expense.model';
import { Budget, BudgetSchema } from 'src/models/budget.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reimbursement.name,
        schema: ReimbursementSchema
      },
      {
        name: User.name,
        schema: userSchema
      },
      {
        name: Expense.name,
        schema: ExpenseSchema
      },
      {
        name: Budget.name,
        schema: BudgetSchema
      }
    ])
  ],
  controllers: [ReimbursementController],
  providers: [ReimbursementService],
})
export class ReimbursementModule { }
