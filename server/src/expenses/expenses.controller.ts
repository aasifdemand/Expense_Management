/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Logger, Param, Patch, Post, Query, Session, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';

@Controller('expenses')
export class ExpensesController {
  private logger = new Logger("expenses_controller")
  constructor(private readonly expensesService: ExpensesService) { }


  @Post("create")
  @UseGuards(CsrfGuard)
  @UseInterceptors(FileInterceptor("proof"))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async createExpense(
    @Session() session: Record<string, any>,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`recieved a create expense request `)
    try {
      console.log("session: ", session);

      if (session?.user?.role !== "user") {
        throw new UnauthorizedException("Only users can create the expenses")
      }

      return this.expensesService.handleCreateExpense(createExpenseDto, file);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(CsrfGuard)
  async getExpensesOrSearch(
    @Query("skip") skip = "0",
    @Query("limit") limit = "20",
    @Query("search") search: string,
    @Session() session: Record<string, any>,
  ) {
    console.log("Session in expenses route: ", session);

    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("You are not authorized to view expenses");
    }

    if (search) {
      return this.expensesService.searchReimbursements(search);
    }

    return this.expensesService.getAllExpenses(Number(skip), Number(limit));
  }





  @Get(":id")
  @UseGuards(CsrfGuard)
  async getExpense(@Param("id") id: string, @Session() session: Record<string, any>,) {
    console.log("Session in single expense: ", session);
    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("you are not authorized to view this expense")
    }
    return this.expensesService.getExpenseById(id)
  }


  @Patch(":id")
  @UseGuards(CsrfGuard)

  async updateExpense(@Body() data: UpdateExpenseDto, @Param("id") id: string, @Session() session: Record<string, any>,) {
    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("you are not authorized to Update this expense")
    }

    return this.expensesService.updateReimbursement(data, id)
  }

}
