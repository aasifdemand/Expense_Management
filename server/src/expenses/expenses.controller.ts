/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { SearchExpensesDto } from './dtos/search-expense.dto';
import type { Request } from 'express';

@Controller('expenses')
export class ExpensesController {
  private logger = new Logger('expenses_controller');
  constructor(private readonly expensesService: ExpensesService) { }

  @Post('create')
  @UseGuards(CsrfGuard)
  @UseInterceptors(FileInterceptor('proof'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createExpense(
    @Req() req: Request,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`recieved a create expense request `);
    try {
      // console.log("session: ", session);

      const { session } = req;
      if (
        session?.twoFactorPending ||
        !session?.twoFactorVerified ||
        !session?.authenticated
      ) {
        throw new UnauthorizedException(
          'Unauthorized, Please verify Your identity first',
        );
      }
      return this.expensesService.handleCreateExpense(
        createExpenseDto,
        session?.user?._id as string,
        file,
      );
    } catch (error) {
      throw error;
    }
  }

  // In expenses.controller.ts

  @Get()
  @UseGuards(CsrfGuard)
  async getExpenses(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('location') location = 'OVERALL',
    @Req() req: Request,
  ) {
    const { session } = req;
    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, Please verify Your identity first',
      );
    }

    return this.expensesService.getAllExpenses(Number(page), Number(limit), location);
  }

  @Get('search')
  @UseGuards(CsrfGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  )
  async getExpensesOrSearch(
    @Query() search: SearchExpensesDto,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('location') location = 'OVERALL',
    @Req() req: Request,
  ) {
    const { session } = req;
    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, Please verify Your identity first',
      );
    }

    return this.expensesService.searchExpenses(
      search,
      Number(page),
      Number(limit),
      location,
    );
  }

  @Get('user')
  @UseGuards(CsrfGuard)
  async getExpensesForUser(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req: Request,
  ) {
    const { session } = req;
    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, Please verify Your identity first',
      );
    }

    return this.expensesService.getAllExpensesForUser(
      Number(page),
      Number(limit),
      req,
    );
  }

  @Get(':id')
  @UseGuards(CsrfGuard)
  async getExpense(@Param('id') id: string, @Req() req: Request) {
    // console.log('Session in single expense: ', session);

    const { session } = req;
    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, Please verify Your identity first',
      );
    }
    return this.expensesService.getExpenseById(id);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  )
  async updateExpense(
    @Body() data: UpdateExpenseDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { session } = req;
    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, Please verify Your identity first',
      );
    }
    // if (session?.user && session?.user?.role !== "superadmin") {
    //   throw new UnauthorizedException("you are not authorized to Update this expense")
    // }

    return this.expensesService.updateReimbursement(data, id);
  }
}