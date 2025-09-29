import {
    Box,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Typography,
    Avatar,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
} from "@mui/material";
import { DoneAll, Edit } from "@mui/icons-material";
import {
    SectionCard,
    StyledTextField,
    StyledSelect,
    StyledFormControl,
} from "../../../styles/budgeting.styles";
import { months } from "../../../utils/months";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateExpense } from "../../../store/expenseSlice";

const ExpenseTable = ({
    expenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    handleOpen,
    setLimit,
    limit,
}) => {
    const { pathname } = useLocation();
    const dispatch = useDispatch();
    const { role } = useSelector((state) => state?.auth);

    const handleReimburse = async (expense) => {
        try {
            await dispatch(
                updateExpense({
                    id: expense?._id,
                    updates: { isReimbursed: !expense?.isReimbursed },
                })
            );
        } catch (err) {
            console.log("error: ", err);
        }
    };

    const isSuperAdminRoute =
        (pathname === "/admin/expenses" || pathname === "/admin/dashboard") &&
        role === "superadmin";

    return (
        <SectionCard>
            {/* Filters */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 3,
                }}
            >
                <StyledTextField
                    placeholder="🔍 Search By Payee..."
                    size="medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: "1 1 250px", minWidth: "250px" }}
                />

                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <StyledFormControl size="medium" sx={{ minWidth: "160px" }}>
                        <InputLabel>Month</InputLabel>
                        <StyledSelect
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            label="Month"
                        >
                            <MenuItem value="">All Months</MenuItem>
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.name}
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </StyledFormControl>

                    <StyledFormControl size="medium" sx={{ minWidth: "140px" }}>
                        <InputLabel>Year</InputLabel>
                        <StyledSelect
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            label="Year"
                        >
                            <MenuItem value="">All Years</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                            <MenuItem value="2024">2024</MenuItem>
                            <MenuItem value="2023">2023</MenuItem>
                        </StyledSelect>
                    </StyledFormControl>

                    <StyledFormControl size="medium" sx={{ minWidth: "120px" }}>
                        <InputLabel>Rows per page</InputLabel>
                        <Select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            label="Rows per page"
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </StyledFormControl>
                </Stack>
            </Box>

            <Divider />

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {isSuperAdminRoute && (
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    User
                                </TableCell>
                            )}
                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                Paid To
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                Amount
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                Department
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                Date
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                IsReimbursed
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : expenses?.length > 0 ? (
                            expenses.map((row) => (
                                <TableRow
                                    key={row._id}
                                    hover
                                    sx={{
                                        transition: "all 0.2s",
                                        "&:hover": { backgroundColor: "action.hover" },
                                    }}
                                >
                                    {isSuperAdminRoute && (
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: "secondary.main" }}>
                                                    {row?.user?.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography fontWeight={500}>
                                                    {row?.user?.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    )}

                                    <TableCell>{row?.paidTo}</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        ₹{row?.amount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{row?.department || "-"}</TableCell>
                                    <TableCell>
                                        {row?.createdAt
                                            ? new Date(row.createdAt).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                                timeZone: "Asia/Kolkata",
                                            })
                                            : "-"}
                                    </TableCell>
                                    <TableCell>{row?.isReimbursed ? "Yes" : "No"}</TableCell>
                                    <TableCell align="center">
                                        {pathname === "/expenses" && role === "user" && (
                                            <IconButton onClick={() => handleOpen(row)} color="primary">
                                                <Edit />
                                            </IconButton>
                                        )}
                                        {isSuperAdminRoute && (
                                            <Tooltip
                                                title={
                                                    row?.isReimbursed
                                                        ? "Already Reimbursed"
                                                        : "Mark as Reimbursed"
                                                }
                                            >
                                                <span>
                                                    <IconButton
                                                        onClick={() => handleReimburse(row)}
                                                        color="success"
                                                        disabled={row?.isReimbursed}
                                                    >
                                                        <DoneAll />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography>No expenses found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {meta?.total > 0 && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={3}
                    flexWrap="wrap"
                    gap={2}
                >
                    <Typography variant="body2" color="text.secondary">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of{" "}
                        {meta.total} entries
                    </Typography>

                    <Pagination
                        count={Math.ceil(meta.total / meta.limit)}
                        page={page}
                        onChange={(e, val) => setPage(val)}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}
        </SectionCard>
    );
};

export default ExpenseTable;
