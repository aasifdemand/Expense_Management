import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchExpensesForUser } from "../../store/expenseSlice";

export default function MyExpenses() {
    const { user } = useSelector((state) => state?.auth)



    const {
        expenses,
        loading,
        meta,
        page,
        setPage,
        open,
        handleOpen,
        handleClose,
        handleSubmit,
        search,
        setSearch,
        filterMonth,
        setFilterMonth,
        filterYear,
        setFilterYear,
        getMonthByNumber,
        setLimit,
        limit, selectedExpense, setSelectedExpense } = useExpenses();



    const navigate = useNavigate()

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchExpensesForUser({
            userId: user?._id,
            search,
            month: filterMonth,
            year: filterYear
        }))
    }, [dispatch, search, filterMonth, filterYear, user])


    // console.log("user expenses: ", userExpenses);




    return (
        <Box sx={{ margin: { xs: 1, sm: 1, md: 4 } }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        boxShadow: 2,
                        "&:hover": {
                            boxShadow: 4,
                        },
                    }}
                    onClick={() => navigate("/user/add")}
                >
                    + Upload New Expense
                </Button>
            </Box>

            {/* <ExpenseUploadForm /> */}
            <ExpenseTable
                limit={limit}
                setLimit={setLimit}
                expenses={expenses}
                loading={loading}
                meta={meta}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                filterMonth={filterMonth}
                setFilterMonth={setFilterMonth}
                filterYear={filterYear}
                setFilterYear={setFilterYear}
                getMonthByNumber={getMonthByNumber}
                handleOpen={handleOpen}
            />

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Expense</DialogTitle>
                <DialogContent>
                    {selectedExpense && (
                        <>
                            <TextField
                                label="Payee"
                                value={user?.name || ""}
                                onChange={(e) =>
                                    setSelectedExpense({
                                        ...selectedExpense,
                                        user: { ...selectedExpense.user, name: e.target.value },
                                    })
                                }
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Amount"
                                type="number"
                                value={selectedExpense.amount}
                                onChange={(e) =>
                                    setSelectedExpense({
                                        ...selectedExpense,
                                        amount: Number(e.target.value),
                                    })
                                }
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Department"
                                value={selectedExpense.department || ""}
                                onChange={(e) =>
                                    setSelectedExpense({
                                        ...selectedExpense,
                                        department: e.target.value,
                                    })
                                }
                                fullWidth
                                margin="normal"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
}
