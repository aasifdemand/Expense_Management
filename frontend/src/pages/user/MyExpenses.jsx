import { Box, Button } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import StatCard from "../../components/general/StatCard";
import { useNavigate } from "react-router-dom";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const Expenses = () => {
    const navigate = useNavigate();

    const {
        adminExpenses,
        adminStats,
        adminMeta,
        loading,
        page,
        setPage,
        limit,
        setLimit,
    } = useExpenses({ mode: "admin" });

    const expenseStats = [
        {
            title: "Total Admin Expenses",
            value: `₹${adminStats?.totalSpent?.toLocaleString() || 0}`,
            color: "#3b82f6",
            icon: <MonetizationOnIcon />,
            subtitle: "Company expenses",
        },
    ];

    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100vh" }}>
            <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                {expenseStats.map((stat, i) => (
                    <StatCard key={i} stat={stat} />
                ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => navigate("/admin/expenses/add")}
                >
                    + Upload New Expense
                </Button>
            </Box>

            <ExpenseTable
                expenses={adminExpenses}
                loading={loading}
                meta={adminMeta}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                disableSearch
                disableFilters
            />
        </Box>
    );
};

export default Expenses;
