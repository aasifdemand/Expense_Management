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
        userExpenses,
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
        limit,
        selectedExpense,
        setSelectedExpense
    } = useExpenses();

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchExpensesForUser({
            search,
            month: filterMonth,
            year: filterYear
        }))
    }, [dispatch, search, filterMonth, filterYear])

    const handleUpload = () => {
        console.log("Upload button clicked");
    };

    return (
        <Box sx={{ mt: -1 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Button
                    onClick={handleUpload}
                    sx={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        color: "white",
                        px: 3,
                        py: 1.2,
                        borderRadius: "10px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
                        }
                    }}
                >
                    Upload New Expense
                </Button>
            </Box>

            <ExpenseTable
                limit={limit}
                setLimit={setLimit}
                expenses={userExpenses}
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
                // Add thin blue border to existing search, dropdowns, and rows-per-page inside ExpenseTable
                searchSx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: '#3b82f6',
                        '& fieldset': { borderColor: '#3b82f6', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#2563eb' },
                        '&.Mui-focused fieldset': { borderColor: '#1d4ed8' },
                    }
                }}
                selectSx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: '#3b82f6',
                        '& fieldset': { borderColor: '#3b82f6', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#2563eb' },
                        '&.Mui-focused fieldset': { borderColor: '#1d4ed8' },
                    }
                }}
                paginationSx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: '#3b82f6',
                        '& fieldset': { borderColor: '#3b82f6', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#2563eb' },
                        '&.Mui-focused fieldset': { borderColor: '#1d4ed8' },
                    }
                }}
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
