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
import { months } from "../../../utils/months";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateExpense } from "../../../store/expenseSlice";
import { useState, useEffect } from "react";

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
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [subDepartmentFilter, setSubDepartmentFilter] = useState("");
    const [availableSubDepartments, setAvailableSubDepartments] = useState([]);

    // Check if current page is dashboard
    const isDashboard = pathname === "/admin/dashboard";
    const isBudgetingPage = pathname.includes("/budgeting");
    const isExpensesPage = pathname.includes("/expenses");

    // Show view details only on budgeting and expenses pages, not on dashboard
    const showViewDetails = isBudgetingPage || isExpensesPage;

    // Department and Sub-department options
    const departments = [
        { value: "", label: "All Departments" },
        { value: "sales", label: "Sales" },
        { value: "data", label: "Data" },
        { value: "it", label: "IT (EndBounce)" },
        { value: "office", label: "Office Expenses" },
        { value: "others", label: "Others" },
    ];

    const subDepartmentsData = {
        sales: [
            { value: "", label: "All Sub-Departments" },
            { value: "g-suite", label: "G-Suite" },
            { value: "instantly", label: "Instantly" },
            { value: "domain", label: "Domain" },
            { value: "contabo", label: "Contabo" },
            { value: "linkedin", label: "Linkedin" },
            { value: "vendor-g-suite", label: "Vendor G-Suite" },
            { value: "vendor-outlook", label: "Vendor Outlook" },
            { value: "vpn", label: "VPN" },
            { value: "zoom-calling", label: "Zoom Calling" },
            { value: "ai-ark", label: "Ai Ark" },
            { value: "others", label: "Others" },
        ],
        data: [
            { value: "", label: "All Sub-Departments" },
            { value: "apollo", label: "Apollo" },
            { value: "linkedin", label: "Linkedin" },
            { value: "email-verifier", label: "Email Verifier" },
            { value: "zoominfo", label: "Zoominfo" },
            { value: "vpn", label: "VPN" },
            { value: "ai-ark", label: "Ai Ark" },
            { value: "domain", label: "Domain" },
            { value: "others", label: "Others" },
        ],
        it: [
            { value: "", label: "All Sub-Departments" },
            { value: "servers", label: "Servers" },
            { value: "domain", label: "Domain" },
            { value: "zoho", label: "Zoho" },
            { value: "instantly", label: "Instantly" },
            { value: "real-cloud", label: "Real Cloud" },
            { value: "others", label: "Others" },
        ],
        office: [
            { value: "", label: "All Sub-Departments" },
            { value: "apna", label: "APNA" },
            { value: "naukri", label: "Naukri" },
            { value: "milk-bill-tea", label: "Milk Bill/Tea etc." },
            { value: "cake", label: "Cake" },
            { value: "electricity-bill", label: "Electricity Bill" },
            { value: "swiggy-blinkit", label: "Swiggy/Blinkit" },
            { value: "office-rent", label: "Office Rent" },
            { value: "office-maintenance", label: "Office Maintenance" },
            { value: "stationary", label: "Stationary" },
            { value: "courier-charges", label: "Courier Charges" },
            { value: "salaries", label: "Salaries" },
            { value: "salary-arrears", label: "Salary Arrears" },
            { value: "incentive", label: "Incentive" },
            { value: "incentive-arrears", label: "Incentive Arrears" },
            { value: "internet-bill", label: "Internet Bill" },
            { value: "office-repairs-beautification", label: "Office Repairs & Beautification" },
            { value: "chairs-purchase", label: "Chairs Purchase" },
            { value: "goodies-bonuses-bonanza", label: "Goodies/Bonuses/Bonanza" },
            { value: "event-exp", label: "Event Exp" },
            { value: "cricket", label: "Cricket" },
            { value: "trainings", label: "Trainings" },
            { value: "employee-insurance", label: "Employee Insurance" },
            { value: "id-cards", label: "ID Cards" },
            { value: "laptop", label: "Laptop" },
            { value: "desktop", label: "Desktop" },
            { value: "system-peripherals", label: "System Peripherals" },
            { value: "others", label: "Others" },
        ],
        others: [
            { value: "", label: "All Sub-Departments" },
            { value: "miscellaneous", label: "Miscellaneous" },
            { value: "general", label: "General" },
        ]
    };

    // Update sub-departments when department changes
    useEffect(() => {
        if (departmentFilter && subDepartmentsData[departmentFilter]) {
            setAvailableSubDepartments(subDepartmentsData[departmentFilter]);
        } else {
            setAvailableSubDepartments([{ value: "", label: "All Sub-Departments" }]);
        }
        // Reset sub-department filter when department changes
        setSubDepartmentFilter("");
    }, [departmentFilter]);

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

    const isSuperAdminRoute =
        (pathname === "/admin/expenses" || pathname === "/admin/dashboard") &&
        role === "superadmin";

    return (
        <>
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
                        <StyledFormControl size="medium" sx={{ minWidth: "180px" }}>
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
                                    Sub-Department
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    Date
                                </TableCell>
                                {showViewDetails && (
                                    <TableCell
                                        sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}
                                    >
                                        View Details
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={showViewDetails ? 7 : 6} align="center">
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
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {row?.department?.name || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {row?.subDepartment?.name || "-"}
                                            </Typography>
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
                                    <TableCell colSpan={showViewDetails ? 7 : 6} align="center">
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