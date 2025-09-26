import { Button, Box, Typography, Container, Grid } from "@mui/material";
import { budgetData, monthlyTotals } from "../../static/data";
import BudgetCard from "../../components/user/BudgetCard";
import ExpenseUploadForm from "../../components/user/ExpenseUploadForm";
import BudgetPieChart from "../../components/user/BudgetPieChart";
import MonthlyTotalsChart from "../../components/user/MonthlyBarChart";



const Dashboard = () => {

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 'bold',
        mb: 4,
        color: 'primary.main'
      }}>
        {/* Expense Dashboard */}
      </Typography>

      {/* Budget Overview Card */}
      <Box sx={{ mb: 9, mt: -12 }}>
        <BudgetCard budgetData={budgetData} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <BudgetPieChart budgetData={budgetData} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <MonthlyTotalsChart monthlyTotals={monthlyTotals} />
        </Grid>
      </Grid>


    </Box>
  );
};

export default Dashboard;
