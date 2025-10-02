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
    Stack,
    Modal,
    Paper,
    Select,
    MenuItem,
    InputLabel,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import {
    SectionCard,
    StyledTextField,
    StyledFormControl,
} from "../../../styles/budgeting.styles";
import { useSelector } from "react-redux";
import { useState } from "react";

const BudgetTable = ({
    budgets,
    loading,
    meta,
    page = 1,
    setPage,
    search,
    setSearch,
    handleOpen, // optional
    limit = 5,
    setLimit,
    showPagination = false,
}) => {
    const { user } = useSelector((state) => state?.auth);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);

    const handleOpenModal = (row) => {
        setSelectedBudget(row);
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        setSelectedBudget(null);
    };

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
                    placeholder="Search By Name..."
                    size="medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: "1 1 250px", minWidth: "250px" }}
                />

                {setLimit && showPagination && (
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
            </Box>

            <Divider />

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>User Name</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Allocated Amount</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : budgets?.length > 0 ? (
                            budgets.map((row) => (
                                <TableRow key={row._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: "primary.main" }}>
                                                {row?.user?.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography fontWeight={500}>
                                                {row?.user?.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        ₹{row?.allocatedAmount?.toLocaleString()}
                                    </TableCell>
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
                                        <IconButton onClick={() => handleOpenModal(row)} color="primary">
                                            <Visibility />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography>No budgets found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {showPagination && meta?.total > 0 && setPage && (
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

            {/* Modal */}
            <Modal open={isOpen} onClose={handleCloseModal}>
                <Paper
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "90%", sm: 400 },
                        p: 4,
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
