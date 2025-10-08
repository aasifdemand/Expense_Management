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
    Modal,
    Paper,
    Select,
    MenuItem,
    InputLabel,
    Popover,
} from "@mui/material";
import {
    SectionCard,
    StyledTextField,
    StyledFormControl,
} from "../../../styles/budgeting.styles";
import { useState } from "react";
import { useSelector } from "react-redux";

const BudgetTable = ({
    budgets,
    loading,
    meta,
    page = 1,
    setPage,
    search,
    setSearch,
    limit = 5,
    setLimit,
    showPagination = false,
}) => {
    const { role } = useSelector((state) => state?.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBudgetId, setSelectedBudgetId] = useState(null);

    const handleCloseModal = () => {
        setIsOpen(false);
        setSelectedBudget(null);
    };

    const handleBudgetTypeClick = (event, budgetId) => {
        setAnchorEl(event.currentTarget);
        setSelectedBudgetId(budgetId);
    };

    const handleBudgetTypeChange = (newType) => {
        if (selectedBudgetId) {
            console.log(`Updating budget ${selectedBudgetId} to type: ${newType}`);
        }
        setAnchorEl(null);
        setSelectedBudgetId(null);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedBudgetId(null);
    };

    const getBudgetTypeStyle = (type) => {
        const baseStyle = {

            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-block",
            transition: "all 0.2s ease",
            "&:hover": {
                opacity: 0.9,
                transform: "scale(1.05)",
            },
        };
        if (type === "normal") {
            return {
                ...baseStyle,
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                border: "1px solid #c8e6c9",
            };
        } else {
            return {
                ...baseStyle,
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                border: "1px solid #bbdefb",
            };
        }
    };

    const getBudgetTypeDisplay = (type) => (type === "normal" ? "Normal" : "Reimbursed");

    const open = Boolean(anchorEl);
    const popoverId = open ? "budget-type-popover" : undefined;

    return (
        <SectionCard>
            {/* Filters */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    width: "100%"
                }}
            >
                {role === "superadmin" && (
                    <StyledTextField
                        placeholder="Search By Name..."
                        size="medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flex: "1 1 200px", minWidth: "150px" }}
                    />
                )}

                {setLimit && showPagination && (
                    <StyledFormControl size="medium" >
                        <InputLabel>Rows per page</InputLabel>
                        <Select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            label="Rows per page"
                        >
                            {[5, 10, 20, 50, 70].map((val) => (
                                <MenuItem key={val} value={val}>
                                    {val}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                )}
            </Box>

            <Divider sx={{ py: 2 }} />

            {/* Table */}
            <TableContainer sx={{ overflowX: "auto" }}>
                <Table >
                    <TableHead>
                        <TableRow>
                            {role === "superadmin" && (
                                <TableCell sx={{ fontWeight: "bold" }}>User Name</TableCell>
                            )}
                            <TableCell sx={{ fontWeight: "bold" }}>Allocated</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Spent</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Remaining</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Company</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Budget Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={role === "superadmin" ? 7 : 6} align="center">
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : budgets?.length > 0 ? (
                            budgets.map((row) => (
                                <TableRow key={row._id} hover>
                                    {role === "superadmin" && (
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30, fontSize: 14 }}>
                                                    {row?.user?.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography fontWeight={500} sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                                                    {row?.user?.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                                        ₹{row?.allocatedAmount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                                        ₹{row?.spentAmount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                                        ₹{row?.remainingAmount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>{row?.company}</TableCell>
                                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
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
                                    <TableCell>
                                        <Box
                                            sx={getBudgetTypeStyle(row?.budgetType || "normal")}
                                            onClick={(e) => handleBudgetTypeClick(e, row._id)}
                                        >
                                            {getBudgetTypeDisplay(row?.budgetType || "normal")}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={role === "superadmin" ? 7 : 6} align="center">
                                    <Typography>No budgets found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Budget Type Popover */}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ "& .MuiPopover-paper": { borderRadius: 1, minWidth: 120, p: 0 } }}
            >
                <Box>
                    {["normal", "reimbursed"].map((type) => (
                        <Box
                            key={type}
                            sx={{
                                p: 1.5,
                                cursor: "pointer",
                                '&:hover': { backgroundColor: "#f5f7fa" },
                                color: type === "normal" ? "#2e7d32" : "#1565c0",
                                fontWeight: 500,
                            }}
                            onClick={() => handleBudgetTypeChange(type)}
                        >
                            {getBudgetTypeDisplay(type)}
                        </Box>
                    ))}
                </Box>
            </Popover>

            {/* Pagination */}
            {showPagination && meta?.total > 0 && setPage && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1.5}
                    p={{ xs: 1.5, sm: 2 }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total} entries
                    </Typography>
                    <Pagination
                        count={Math.ceil(meta.total / limit)}
                        page={page}
                        onChange={(e, val) => setPage(val)}
                        color="primary"
                        size="small"
                    />
                </Box>
            )}

            {/* Optional Modal */}
            <Modal open={isOpen} onClose={handleCloseModal}>
                <Paper
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "90%", sm: 400 },
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 24,
                    }}
                >
                    {selectedBudget ? (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Budget Details
                            </Typography>
                            <Typography>
                                <strong>User:</strong> {selectedBudget?.user?.name}
                            </Typography>
                            <Typography>
                                <strong>Allocated:</strong> ₹{selectedBudget?.allocatedAmount?.toLocaleString()}
                            </Typography>
                            <Typography>
                                <strong>Budget Type:</strong> {getBudgetTypeDisplay(selectedBudget?.budgetType || "normal")}
                            </Typography>
                            <Typography>
                                <strong>Date:</strong>{" "}
                                {new Date(selectedBudget?.createdAt).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "Asia/Kolkata",
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>No budget selected</Typography>
                    )}
                </Paper>
            </Modal>
        </SectionCard>
    );
};

export default BudgetTable;
