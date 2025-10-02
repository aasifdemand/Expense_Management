/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Logger, Param, Patch, Post, Query, Session, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { SearchExpensesDto } from './dtos/search-expense.dto';

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
      // console.log("session: ", session);

      if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
        throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
      }
      return this.expensesService.handleCreateExpense(createExpenseDto, session?.userId as string, file);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(CsrfGuard)
  async getExpenses(
    @Query("page") page = "1",
    @Query("limit") limit = "20",
    @Session() session: Record<string, any>,
  ) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    return this.expensesService.getAllExpenses(Number(page), Number(limit));
  }

  @Get("search")
  @UseGuards(CsrfGuard)
  @UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
  async getExpensesOrSearch(
    @Query() search: SearchExpensesDto,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
    @Session() session: Record<string, any>,
  ) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    return this.expensesService.searchExpenses(search, Number(page), Number(limit));
  }


  @Get("user")
  @UseGuards(CsrfGuard)
  async getExpensesForUser(
    @Query("page") page = "1",
    @Query("limit") limit = "20",
    @Session() session: Record<string, any>,
  ) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    return this.expensesService.getAllExpensesForUser(Number(page), Number(limit), session);
  }



  @Get(":id")
  @UseGuards(CsrfGuard)
  async getExpense(@Param("id") id: string, @Session() session: Record<string, any>,) {
    console.log("Session in single expense: ", session);

    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }
    if (session?.user && session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("you are not authorized to view this expense")
    }
    return this.expensesService.getExpenseById(id)
  }


  @Patch(":id")
  @UseGuards(CsrfGuard)
  @UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
  async updateExpense(@Body() data: UpdateExpenseDto, @Param("id") id: string, @Session() session: Record<string, any>,) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }
    // if (session?.user && session?.user?.role !== "superadmin") {
    //   throw new UnauthorizedException("you are not authorized to Update this expense")
    // }

    return this.expensesService.updateReimbursement(data, id)
  }



}
