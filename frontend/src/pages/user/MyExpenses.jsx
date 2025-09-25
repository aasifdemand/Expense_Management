import { Container } from "@mui/material";
import ExpensesList from "../../components/user/ExpensesList"

const dummyExpenses = [
    { id: 1, description: "Travel to Client Meeting", department: "Sales", date: "2025-09-20", receipt: "INV001", amount: 4500, status: "approved" },
    { id: 2, description: "Team Lunch", department: "HR", date: "2025-09-21", receipt: "INV002", amount: 2200, status: "pending" },
    { id: 2, description: "Team Lunch", department: "HR", date: "2025-09-21", receipt: "INV002", amount: 2200, status: "pending" },
    { id: 2, description: "Team Lunch", department: "HR", date: "2025-09-21", receipt: "INV002", amount: 2200, status: "pending" },
];

export default function MyExpenses() {
    return (
        <Container sx={{ mt: 4 }}>
            <ExpensesList expenses={dummyExpenses} />
        </Container>
    );
}