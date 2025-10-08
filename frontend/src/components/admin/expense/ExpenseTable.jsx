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
import { DoneAll, Edit, Visibility, Download, PictureAsPdf, InsertDriveFile, Image, Description, Close } from "@mui/icons-material";
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
    const [downloading, setDownloading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

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
        setDownloading(false);
        setPreviewing(false);
    };

    const handlePreviewProof = async (expense) => {
        if (previewing) return;

        setPreviewing(true);
        try {
            const proofUrl = getProofUrl(expense);
            const fileName = getDisplayFileName(expense);

            if (!proofUrl) {
                console.log("No proof available for preview");
                setPreviewing(false);
                return;
            }

            console.log("Opening preview for:", fileName);

            // Set the preview URL and open the preview modal
            setPreviewUrl(proofUrl);
            setPreviewModalOpen(true);

            console.log("Preview modal opened for:", fileName);

            // Reset previewing state after a short delay
            setTimeout(() => {
                setPreviewing(false);
            }, 500);

        } catch (error) {
            console.error("Error previewing proof:", error);
            setPreviewing(false);
        }
    };

    const handleClosePreviewModal = () => {
        setPreviewModalOpen(false);
        setPreviewUrl('');
        setPreviewing(false);
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
            case 'webp':
            case 'svg':
                return <Image />;
            case 'csv':
                return <Description />;
            case 'xlsx':
            case 'xls':
                return <Description />;
            case 'doc':
            case 'docx':
                return <Description />;
            case 'txt':
                return <Description />;
            case 'zip':
            case 'rar':
                return <Description />;
            default:
                return <InsertDriveFile />;
        }
    };

    const getFileType = (fileName) => {
        if (!fileName) return 'Document';

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
            case 'webp':
                return 'WebP Image';
            case 'svg':
                return 'SVG Image';
            case 'csv':
                return 'CSV File';
            case 'xlsx':
                return 'Excel Spreadsheet';
            case 'xls':
                return 'Excel Spreadsheet';
            case 'doc':
                return 'Word Document';
            case 'docx':
                return 'Word Document';
            case 'txt':
                return 'Text File';
            case 'zip':
                return 'ZIP Archive';
            case 'rar':
                return 'RAR Archive';
            case 'pptx':
            case 'ppt':
                return 'PowerPoint Presentation';
            case 'mp4':
            case 'avi':
            case 'mov':
                return 'Video File';
            case 'mp3':
            case 'wav':
                return 'Audio File';
            default:
                return `${extension?.toUpperCase()} File`;
        }
    };

    const handleDownloadProof = async (expense) => {
        if (downloading) return;

        setDownloading(true);
        try {
            const proofUrl = getProofUrl(expense);
            const fileName = getDisplayFileName(expense);

            if (!proofUrl) {
                console.log("No proof available for download");
                setDownloading(false);
                return;
            }

            console.log("Starting download for:", fileName, "from:", proofUrl);

            // Method 1: Direct download using anchor tag (works for most files)
            const link = document.createElement('a');
            link.href = proofUrl;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("Download initiated successfully for:", fileName);

            // Reset downloading state after a short delay
            setTimeout(() => {
                setDownloading(false);
            }, 1500);

        } catch (error) {
            console.error("Error in download:", error);

            // Fallback: Open in new tab for user to manually download
            try {
                const proofUrl = getProofUrl(expense);
                if (proofUrl) {
                    window.open(proofUrl, '_blank', 'noopener,noreferrer');
                    console.log("Opened proof in new tab for manual download");
                }
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
            }

            setDownloading(false);
        }
    };

    // Check if proof exists for an expense
    const hasProof = (expense) => {
        return !!(expense?.proofUrl || expense?.proof);
    };

    // Get proof URL for an expense
    const getProofUrl = (expense) => {
        if (expense?.proofUrl) {
            return expense.proofUrl;
        } else if (expense?.proof) {
            // Check if proof already contains full URL
            if (expense.proof.startsWith('http')) {
                return expense.proof;
            }
            // Construct URL from filename
            return `${import.meta.env.REACT_APP_API_URL || window.location.origin}/uploads/${expense.proof}`;
        }
        return null;
    };

    // Get display filename for an expense
    const getDisplayFileName = (expense) => {
        if (expense?.proof) {
            // If proof is a filename, return it
            if (!expense.proof.startsWith('http')) {
                return expense.proof;
            }
        }
        if (expense?.proofUrl) {
            // Extract filename from URL
            return expense.proofUrl.split('/').pop() || `expense-proof-${expense._id}`;
        }
        return 'Document';
    };



    // Check specific file types for better handling (for tooltips)
    const isImageFile = (fileName) => {
        if (!fileName) return false;
        const extension = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
    };

    const isPdfFile = (fileName) => {
        if (!fileName) return false;
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension === 'pdf';
    };

    const isTextFile = (fileName) => {
        if (!fileName) return false;
        const extension = fileName.split('.').pop()?.toLowerCase();
        return ['txt', 'csv', 'json', 'xml', 'html', 'htm'].includes(extension);
    };

    // Get preview button tooltip text
    const getPreviewTooltip = (fileName) => {
        if (!fileName) return "View document in popup";

        if (isImageFile(fileName)) {
            return "View image in popup";
        }
        if (isPdfFile(fileName)) {
            return "View PDF in popup";
        }
        if (isTextFile(fileName)) {
            return "View text document in popup";
        }
        return "View file in popup";
    };

    // Render preview content based on file type
    const renderPreviewContent = () => {
        if (!previewUrl) return null;

        const fileName = previewUrl.split('/').pop() || 'document';


        if (isImageFile(fileName)) {
            return (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                    <img
                        src={previewUrl}
                        alt="Proof Document"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </Box>
            );
        } else if (isPdfFile(fileName)) {
            return (
                <Box sx={{ width: '100%', height: '70vh' }}>
                    <iframe
                        src={previewUrl}
                        width="100%"
                        height="100%"
                        style={{
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        title="PDF Preview"
                    />
                </Box>
            );
        } else if (isTextFile(fileName)) {
            return (
                <Box sx={{ width: '100%', height: '70vh' }}>
                    <iframe
                        src={previewUrl}
                        width="100%"
                        height="100%"
                        style={{
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        title="Text Preview"
                    />
                </Box>
            );
        } else {
            // For other file types, show a message with download option
            return (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Description sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        File Preview Not Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This file type cannot be displayed in the preview popup.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => window.open(previewUrl, '_blank')}
                    >
                        Download File
                    </Button>
                </Box>
            );
        }
    };

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
                                    Vendor
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
                                            <Typography
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {row?.vendor || "-"}
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
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: "500px",
                            maxWidth: "95vw",
                            bgcolor: "background.paper",
                            borderRadius: 2,
                            boxShadow: 24,
                            overflow: 'hidden',
                        }}
                    >
                        <Card sx={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Modal Header */}
                                <Box
                                    sx={{
                                        p: 2,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        backgroundColor: "primary.main",
                                        color: "white",
                                    }}
                                >
                                    <Typography variant="h6" component="h2" fontWeight="bold">
                                        Expense Details
                                    </Typography>
                                </Box>

                                {/* Modal Body */}
                                <Box sx={{ p: 2.5, flex: 1 }}>
                                    {selectedExpense && (
                                        <Stack spacing={2.5}>
                                            {/* Basic Information */}
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                                                    Basic Information
                                                </Typography>
                                                <Stack spacing={1.5}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">
                                                            Paid To:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedExpense.paidTo || "-"}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">
                                                            Amount:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                            ₹{selectedExpense.amount?.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">
                                                            Department:
                                                        </Typography>
                                                        <Typography variant="body2" textTransform="capitalize">
                                                            {selectedExpense.department?.name || "-"}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">
                                                            Sub-Department:
                                                        </Typography>
                                                        <Typography variant="body2" textTransform="capitalize">
                                                            {selectedExpense.subDepartment?.name || "-"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* Date Information */}
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                                                    Date Information
                                                </Typography>
                                                <Stack spacing={1.5}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">
                                                            Created Date:
                                                        </Typography>
                                                        <Typography variant="body2">
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
                                                <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                                                    Proof & Documents
                                                </Typography>
                                                {hasProof(selectedExpense) ? (
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            border: "1px solid",
                                                            borderColor: "primary.light",
                                                            borderRadius: 1,
                                                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                            <Box sx={{
                                                                color: 'primary.main',
                                                                fontSize: '2rem',
                                                                display: 'flex',
                                                            }}>
                                                                {getFileIcon(getDisplayFileName(selectedExpense))}
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Chip
                                                                    label={getFileType(getDisplayFileName(selectedExpense))}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{ mb: 0.5 }}
                                                                />
                                                                <Typography
                                                                    variant="caption"
                                                                    display="block"
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        wordBreak: 'break-all',
                                                                        fontSize: '0.7rem'
                                                                    }}
                                                                >
                                                                    {getDisplayFileName(selectedExpense)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Tooltip title="Download file">
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<Download />}
                                                                    onClick={() => handleDownloadProof(selectedExpense)}
                                                                    size="small"
                                                                    fullWidth
                                                                    disabled={downloading}
                                                                >
                                                                    {downloading ? 'Downloading...' : 'Download'}
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title={getPreviewTooltip(getDisplayFileName(selectedExpense))}>
                                                                <span>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<Visibility />}
                                                                        onClick={() => handlePreviewProof(selectedExpense)}
                                                                        size="small"
                                                                        fullWidth
                                                                        disabled={previewing}
                                                                    >
                                                                        {previewing ? 'Opening...' : 'Preview'}
                                                                    </Button>
                                                                </span>
                                                            </Tooltip>
                                                        </Stack>
                                                    </Box>
                                                ) : (
                                                    <Alert
                                                        severity="info"
                                                        size="small"
                                                        sx={{ borderRadius: 1 }}
                                                    >
                                                        <Typography variant="body2">
                                                            No proof document attached
                                                        </Typography>
                                                    </Alert>
                                                )}
                                            </Box>

                                            {/* Additional Information */}
                                            {selectedExpense.description && (
                                                <Box>
                                                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                                                        Description
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
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
                                    }}
                                >
                                    <Button
                                        onClick={handleCloseModal}
                                        variant="contained"
                                        size="small"
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Modal>
            )}

            {/* Preview Modal */}
            <Modal
                open={previewModalOpen}
                onClose={handleClosePreviewModal}
                aria-labelledby="preview-modal"
                aria-describedby="preview-document"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <Box
                    sx={{
                        width: "90vw",
                        height: "90vh",
                        maxWidth: "1200px",
                        maxHeight: "800px",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Preview Modal Header */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "primary.main",
                            color: "white",
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6" component="h2" fontWeight="bold">
                            Document Preview
                        </Typography>
                        <IconButton
                            onClick={handleClosePreviewModal}
                            sx={{ color: 'white' }}
                            size="small"
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Preview Modal Content */}
                    <Box sx={{ flex: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {renderPreviewContent()}
                    </Box>

                    {/* Preview Modal Footer */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {previewUrl.split('/').pop()}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            onClick={() => window.open(previewUrl, '_blank')}
                            size="small"
                        >
                            Download
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default ExpenseTable;