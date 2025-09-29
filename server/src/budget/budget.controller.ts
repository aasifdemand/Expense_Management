/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Param, Patch, Post, Query, Session, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { AllocateBudgetDto } from './dto/allocate-budget.dto';
import { SearchBudgetAllocationsDto } from './dto/search-budgets.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) { }


  @Post("allocate")
  @UseGuards(CsrfGuard)
  async allocateBudgetForUser(@Body() data: AllocateBudgetDto, @Session() session: Record<string, any>,) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }
    if (session?.user && session?.user?.role !== "superadmin")
      throw new UnauthorizedException("Only Superadmin can allocate budgets for the user")
    return await this.budgetService.allocateBudget(data)
  }


  @Get()
  @UseGuards(CsrfGuard)
  @UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
  async getExpenses(
    @Query("page") skip = "1",
    @Query("limit") limit = "20",
    @Session() session: Record<string, any>,
  ) {
    console.log("Session in get all budget allocations route: ", session);
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }
    if (session?.user && session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("You are not authorized to view budget allocations");
    }



    return this.budgetService.fetchAllocatedBudgets(Number(skip), Number(limit));
  }

  @Get("search")
  @UseGuards(CsrfGuard)
  @UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
  async getExpensesOrSearch(
    @Query() search: SearchBudgetAllocationsDto,
    @Session() session: Record<string, any>,
  ) {
    console.log("Session in get all budget allocations route: ", session);

    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    if (session?.user && session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("You are not authorized to view budget allocations");
    }


    return this.budgetService.searchBudgetAllocations(search);
  }


  @Get(":id")
  @UseGuards(CsrfGuard)
  async getSingleBudget(@Param("id") id: string, @Session() session: Record<string, any>) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }

    if (session?.user && session?.user?.role !== "superadmin")
      throw new UnauthorizedException("Only Superadmin can update the allocated budgets for the user")
    return await this.budgetService.getBudgetById(id)
  }


  @Patch(":id")
  @UseGuards(CsrfGuard)
  async editCurrentBudget(@Param("id") id: string, @Body() data: AllocateBudgetDto, @Session() session: Record<string, any>) {
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first")
    }

    if (session?.user && session?.user?.role !== "superadmin")
      throw new UnauthorizedException("Only Superadmin can update the allocated budgets for the user")

    return await this.budgetService.editAllocatedBudget(id, data, session?.userId as string)
  }

}
