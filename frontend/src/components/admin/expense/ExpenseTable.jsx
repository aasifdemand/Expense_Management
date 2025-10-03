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
    Modal,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
} from "@mui/material";
import { DoneAll, Edit, Visibility, Download, PictureAsPdf, InsertDriveFile, Image, Description } from "@mui/icons-material";
import {
    SectionCard,
    StyledTextField,
    StyledSelect,
    StyledFormControl,
} from "../../../styles/budgeting.styles";
// import { months } from "../../../utils/months";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useExpenses } from "../../../hooks/useExpenses";

const ExpenseTable = ({
    expenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    // filterMonth,
    // setFilterMonth,
    // filterYear,
    // setFilterYear,
    // handleOpen,

    setLimit,
    limit,
}) => {
    const { pathname } = useLocation();

    const { role } = useSelector((state) => state?.auth);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const { currentDepartment, setCurrentDepartment, currentSubDepartment, setCurrentSubDepartment } = useExpenses()

    const isBudgetingPage = pathname.includes("/budgeting");
    const isExpensesPage = pathname.includes("/expenses");

    // Show view details only on budgeting and expenses pages, not on dashboard
    const showViewDetails = isBudgetingPage || isExpensesPage;

    const { departments, subDepartments } = useSelector((state) => state.department)



    const handleViewDetails = (expense) => {
        setSelectedExpense(expense);
        setViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setViewModalOpen(false);
        setSelectedExpense(null);
    };




    const getFileIcon = (fileName) => {
        if (!fileName) return <InsertDriveFile />;

        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <PictureAsPdf />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return <Image />;
            case 'csv':
            case 'xlsx':
            case 'xls':
                return <Description />;
            default:
                return <InsertDriveFile />;
        }
    };

    const getFileType = (fileName) => {
        if (!fileName) return 'Unknown';

        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'PDF Document';
            case 'jpg':
            case 'jpeg':
                return 'JPEG Image';
            case 'png':
                return 'PNG Image';
            case 'gif':
                return 'GIF Image';
            case 'bmp':
                return 'Bitmap Image';
            case 'csv':
                return 'CSV File';
            case 'xlsx':
            case 'xls':
                return 'Excel Spreadsheet';
            case 'doc':
            case 'docx':
                return 'Word Document';
            default:
                return `${extension?.toUpperCase()} File`;
        }
    };

    const handleDownloadProof = (expense) => {
        if (expense?.proofUrl) {
            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = expense.proofUrl;
            link.target = '_blank';

            // Extract filename from URL or use a default name
            const fileName = expense.proofUrl.split('/').pop() || `expense-proof-${expense._id}`;
            link.download = fileName;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.log("No proof available for download");
            // You can add a toast notification here if needed
        }
    };

    const handlePreviewProof = (expense) => {
        if (expense?.proofUrl) {
            window.open(expense.proofUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // const isSuperAdminRoute =
    //     (pathname === "/admin/expenses" || pathname === "/admin/dashboard") &&
    //     role === "superadmin";

    return (
        <>
            <SectionCard>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 3, alignItems: "center" }}>


                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ width: "100%" }}>
                        {/* Department */}
                        {
                            role === "superadmin" && <>
                                <StyledTextField
                                    placeholder="Search By Name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ flex: "1 1 300px", minWidth: "300px" }}
                                />
                                <StyledFormControl sx={{ flex: "1 1 200px", minWidth: 180 }}>
                                    <InputLabel>Department</InputLabel>
                                    <StyledSelect
                                        value={currentDepartment?._id || ""}
                                        onChange={(e) => {
                                            const dept = departments.find((d) => d._id === e.target.value);
                                            setCurrentDepartment(dept || null);
                                            setCurrentSubDepartment(null);
                                        }}
                                        label="Department"
                                    >
                                        <MenuItem value=""><em>All Departments</em></MenuItem>
                                        {departments.map((dept) => (
                                            <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                        ))}
                                    </StyledSelect>
                                </StyledFormControl>

                                {/* Sub-Department */}
                                <StyledFormControl sx={{ flex: "1 1 220px", minWidth: 200 }}>
                                    <InputLabel>Sub-Department</InputLabel>
                                    <StyledSelect
                                        value={currentSubDepartment?._id || ""}
                                        onChange={(e) => {
                                            const sub = subDepartments.find((s) => s._id === e.target.value);
                                            setCurrentSubDepartment(sub || null);
                                        }}
                                        label="Sub-Department"
                                        disabled={!currentDepartment}
                                    >
                                        <MenuItem value=""><em>All Sub-Departments</em></MenuItem>
                                        {subDepartments.map((sub) => (
                                            <MenuItem key={sub._id} value={sub._id}>{sub.name}</MenuItem>
                                        ))}
                                    </StyledSelect>
                                </StyledFormControl>
                            </>
                        }

                        {/* Rows per page */}
                        <StyledFormControl sx={{ flex: "0 1 150px", minWidth: 120 }}>
                            <InputLabel>Rows per page</InputLabel>
                            <Select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                                {[5, 10, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>
                        </StyledFormControl>
                    </Stack>
                </Box>



                <Divider />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {role === "superadmin" && <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    User
                                </TableCell>}
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Amount
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Department
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Sub-Department
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Description
                                </TableCell>
                                {showViewDetails && (
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            textAlign: "center"
                                        }}
                                    >
                                        View Details
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={showViewDetails ? 7 : 6}
                                        align="center"
                                    >
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
                                        {
                                            role === "superadmin" && <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                                                        {row?.user?.name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography fontWeight={500}>
                                                        {row?.user?.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        }
                                        <TableCell sx={{ fontWeight: "bold" }} align="left">
                                            ₹{row?.amount?.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {row?.department?.name || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {row?.subDepartment?.name || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left">
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
                                        <TableCell align="left">
                                            {row?.description || "-"}
                                        </TableCell>
                                        {showViewDetails && (
                                            <TableCell align="center">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => handleViewDetails(row)}
                                                        color="primary"
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={showViewDetails ? 7 : 6}
                                        align="center"
                                    >
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

            {/* View Details Modal - Only show if on budgeting or expenses page */}
            {showViewDetails && (
                <Modal
                    open={viewModalOpen}
                    onClose={handleCloseModal}
                    aria-labelledby="expense-details-modal"
                    aria-describedby="expense-details-description"
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: "95%", sm: "85%", md: "700px" },
                            maxHeight: "90vh",
                            overflow: "auto",
                            bgcolor: "background.paper",
                            borderRadius: 2,
                            boxShadow: 24,
                            p: 0,
                        }}
                    >
                        <Card>
                            <CardContent sx={{ p: 0 }}>
                                {/* Modal Header */}
                                <Box
                                    sx={{
                                        p: 3,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        backgroundColor: "primary.main",
                                        color: "white",
                                    }}
                                >
                                    <Typography variant="h5" component="h2" fontWeight="bold">
                                        Expense Details
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Complete information about the expense
                                    </Typography>
                                </Box>

                                {/* Modal Body */}
                                <Box sx={{ p: 3 }}>
                                    {selectedExpense && (
                                        <Stack spacing={3}>
                                            {/* Basic Information */}
                                            <Box>
                                                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                                    Basic Information
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1" fontWeight="500">
                                                            Paid To:
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedExpense.paidTo}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1" fontWeight="500">
                                                            Amount:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                                                            ₹{selectedExpense.amount?.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1" fontWeight="500">
                                                            Department:
                                                        </Typography>
                                                        <Typography variant="body1" textTransform="capitalize">
                                                            {selectedExpense.department?.name || "-"}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1" fontWeight="500">
                                                            Sub-Department:
                                                        </Typography>
                                                        <Typography variant="body1" textTransform="capitalize">
                                                            {selectedExpense.subDepartment?.name || "-"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* Date Information */}
                                            <Box>
                                                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                                    Date Information
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1" fontWeight="500">
                                                            Created Date:
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedExpense.createdAt
                                                                ? new Date(selectedExpense.createdAt).toLocaleString("en-US", {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                    timeZone: "Asia/Kolkata",
                                                                })
                                                                : "-"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* Proof Section */}
                                            <Box>
                                                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                                    Proof & Documents
                                                </Typography>
                                                {selectedExpense.proof ? (
                                                    <Box
                                                        sx={{
                                                            p: 3,
                                                            border: "2px dashed",
                                                            borderColor: "primary.light",
                                                            borderRadius: 2,
                                                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                                            <Box sx={{
                                                                color: 'primary.main',
                                                                fontSize: '3rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {getFileIcon(selectedExpense.proof)}
                                                            </Box>
                                                        </Box>

                                                        <Chip
                                                            label={getFileType(selectedExpense.proof)}
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ mb: 2 }}
                                                        />

                                                        <Typography variant="body1" gutterBottom fontWeight="500">
                                                            Proof Document Available
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                            You can download or preview the attached proof document.
                                                        </Typography>

                                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<Download />}
                                                                onClick={() => handleDownloadProof(selectedExpense)}
                                                                size="medium"
                                                                sx={{ minWidth: '160px' }}
                                                            >
                                                                Download Proof
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Visibility />}
                                                                onClick={() => handlePreviewProof(selectedExpense)}
                                                                size="medium"
                                                                sx={{ minWidth: '160px' }}
                                                            >
                                                                Preview Proof
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                ) : (
                                                    <Alert
                                                        severity="info"
                                                        sx={{
                                                            borderRadius: 2,
                                                            '& .MuiAlert-message': {
                                                                width: '100%'
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="body1" fontWeight="500">
                                                            No Proof Document Attached
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            This expense does not have any proof document attached.
                                                        </Typography>
                                                    </Alert>
                                                )}
                                            </Box>

                                            {/* Additional Information */}
                                            {selectedExpense.description && (
                                                <Box>
                                                    <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                                        Description
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            backgroundColor: 'grey.50',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {selectedExpense.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Stack>
                                    )}
                                </Box>

                                {/* Modal Footer */}
                                <Box
                                    sx={{
                                        p: 2,
                                        borderTop: "1px solid",
                                        borderColor: "divider",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1,
                                    }}
                                >
                                    <Button onClick={handleCloseModal} variant="outlined">
                                        Close
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Modal>
            )}
        </>
    );
};

export default ExpenseTable;