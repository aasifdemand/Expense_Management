import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { SectionCard, StyledFormControl, StyledSelect, StyledTextField } from "../../../styles/budgeting.styles";
import { Avatar, Box, Button, Card, CardContent, Divider, IconButton, InputLabel, MenuItem, Modal, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Visibility } from "@mui/icons-material";

const ExpenseTable = ({
    expenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    setLimit,
    limit,
    showFilters = false,       // default filters hidden
    showPagination = false,    // default pagination hidden
}) => {
    const { pathname } = useLocation();
    // const dispatch = useDispatch();
    const { role } = useSelector((state) => state?.auth);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    // const [departmentFilter, setDepartmentFilter] = useState("");
    // const [subDepartmentFilter, setSubDepartmentFilter] = useState("");
    // const [availableSubDepartments, setAvailableSubDepartments] = useState([]);

    // const departments = [
    //     { value: "", label: "All Departments" },
    //     { value: "sales", label: "Sales" },
    //     { value: "data", label: "Data" },
    //     { value: "it", label: "IT (EndBounce)" },
    //     { value: "office", label: "Office Expenses" },
    //     { value: "others", label: "Others" },
    // ];

    // const subDepartmentsData = { /* ...your existing subDepartmentsData... */ };

    // useEffect(() => {
    //     if (departmentFilter && subDepartmentsData[departmentFilter]) {
    //         setAvailableSubDepartments(subDepartmentsData[departmentFilter]);
    //     } else {
    //         setAvailableSubDepartments([{ value: "", label: "All Sub-Departments" }]);
    //     }
    //     setSubDepartmentFilter("");
    // }, [departmentFilter]);

    const handleViewDetails = (expense) => {
        setSelectedExpense(expense);
        setViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setViewModalOpen(false);
        setSelectedExpense(null);
    };

    const handleDownloadProof = (expense) => {
        if (!expense?.proofUrl) return;
        const link = document.createElement("a");
        link.href = expense.proofUrl;
        link.target = "_blank";
        link.download = expense.proofUrl.split("/").pop() || "proof";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isSuperAdminRoute =
        (pathname === "/admin/expenses" || pathname === "/admin/dashboard") &&
        role === "superadmin";

    return (
        <>
            <SectionCard>
                {/* Filters */}
                {showFilters && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, p: 3 }}>
                        <StyledTextField
                            placeholder=" Search By Payee..."
                            size="medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ flex: "1 1 250px", minWidth: "250px" }}
                        />
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {/* <StyledFormControl size="medium" sx={{ minWidth: "180px" }}>
                                <InputLabel>Department</InputLabel>
                                <StyledSelect
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    label="Department"
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </StyledFormControl>

                            <StyledFormControl size="medium" sx={{ minWidth: "200px" }}>
                                <InputLabel>Sub-Department</InputLabel>
                                <StyledSelect
                                    value={subDepartmentFilter}
                                    onChange={(e) => setSubDepartmentFilter(e.target.value)}
                                    label="Sub-Department"
                                    disabled={!departmentFilter}
                                >
                                    {availableSubDepartments.map((subDept) => (
                                        <MenuItem key={subDept.value} value={subDept.value}>
                                            {subDept.label}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </StyledFormControl> */}

                            {setLimit && (
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
                            )}
                        </Stack>
                    </Box>
                )}

                <Divider />

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {isSuperAdminRoute && <TableCell>User</TableCell>}
                                <TableCell>Paid To</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Sub-Department</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">View Details</TableCell>
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
                                    <TableRow key={row._id} hover>
                                        {isSuperAdminRoute && (
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar>{row?.user?.name?.charAt(0).toUpperCase()}</Avatar>
                                                    <Typography>{row?.user?.name}</Typography>
                                                </Box>
                                            </TableCell>
                                        )}
                                        <TableCell>{row?.paidTo}</TableCell>
                                        <TableCell>₹{row?.amount?.toLocaleString()}</TableCell>
                                        <TableCell>{row?.department?.name || "-"}</TableCell>
                                        <TableCell>{row?.subDepartment?.name || "-"}</TableCell>
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
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton onClick={() => handleViewDetails(row)}>
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
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

                {/* Pagination */}
                {showPagination && meta?.total > 0 && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={3} flexWrap="wrap" gap={2}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} entries
                        </Typography>
                        <Pagination
                            count={Math.ceil(meta.total / limit)}
                            page={page}
                            onChange={(e, val) => setPage(val)}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </SectionCard>

            <Modal open={viewModalOpen} onClose={handleCloseModal}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: "95%", sm: "85%", md: "700px" }, maxHeight: "90vh", overflow: "auto", bgcolor: "background.paper", borderRadius: 2, boxShadow: 24, p: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" mb={2}>Expense Details</Typography>
                            {selectedExpense ? (
                                <Stack spacing={2}>
                                    <Typography><b>Paid To:</b> {selectedExpense.paidTo}</Typography>
                                    <Typography><b>Amount:</b> ₹{selectedExpense.amount?.toLocaleString()}</Typography>
                                    <Typography><b>Department:</b> {selectedExpense.department?.name || "-"}</Typography>
                                    <Typography><b>Sub-Department:</b> {selectedExpense.subDepartment?.name || "-"}</Typography>
                                    {selectedExpense.proofUrl && (
                                        <Stack direction="row" spacing={2} mt={2}>
                                            <Button variant="contained" onClick={() => handleDownloadProof(selectedExpense)} startIcon={<Download />}>Download Proof</Button>
                                        </Stack>
                                    )}
                                </Stack>
                            ) : (
                                <Typography>No expense selected</Typography>
                            )}

                        </CardContent>
                    </Card>
                </Box>
            </Modal>
        </>
    );
};


export default ExpenseTable