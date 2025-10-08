import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
    Alert,
    Snackbar,
    Avatar,
    IconButton,
    Chip,
    Tooltip,
    Pagination,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { useExpenses } from '../../hooks/useExpenses';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReimbursements, markAsReimbursed } from '../../store/reimbursementSlice';
import { DoneAll, AccountBalance, MonetizationOn, CreditCard, } from '@mui/icons-material';
import { fetchBudgets } from '../../store/budgetSlice';
import { useLocation } from '../../contexts/LocationContext';
import { fetchExpenses } from '../../store/expenseSlice';
import { useBudgeting } from '../../hooks/useBudgeting';

const ReimbursementManagement = () => {
    const { currentLoc } = useLocation()
    const dispatch = useDispatch()
    const {
        reimbursements,
        loading,
        pagination,


    } = useSelector((state) => state.reimbursement)

    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const { allExpenses } = useExpenses()
    const { allBudgets } = useBudgeting()

    const totalAllocated = allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0) || 0
    const totalExpenses = allExpenses?.reduce((acc, b) => acc + Number(b?.amount), 0) || 0
    const totalPendingReimbursed = reimbursements
        ?.filter(item => !item?.isReimbursed)
        .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;
    const totalReimbursed = reimbursements
        ?.filter(item => item?.isReimbursed)
        .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

    useEffect(() => {
        dispatch(fetchReimbursements({
            location: currentLoc,
            page: currentPage,
            limit: itemsPerPage
        }))
    }, [dispatch, currentLoc, currentPage, itemsPerPage])

    const handleMarkReimbursed = async (id) => {
        const res = await dispatch(markAsReimbursed({ id, isReimbursed: true }))

        if (markAsReimbursed.fulfilled.match(res)) {
            // Refresh data with current filters
            dispatch(fetchReimbursements({
                location: currentLoc,
                page: currentPage,
                limit: itemsPerPage
            }))
            await Promise.all([
                dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false, location: currentLoc })),
                dispatch(fetchExpenses({ page: 1, limit: 20, location: currentLoc })),
            ]);
            setSuccess('Reimbursement marked as paid successfully!');
        } else {
            setErrorMessage('Failed to mark reimbursement as paid');
        }
    }

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(event.target.value);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const reimbursementStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated?.toLocaleString()}`,
            color: "#3b82f6",
            icon: <AccountBalance sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Total budget allocation",
        },
        {
            title: "Total Expenses",
            value: `₹${totalExpenses?.toLocaleString()}`,
            color: "#10b981",
            icon: <MonetizationOn sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Total expenses incurred",
        },
        {
            title: "Total paid Reimbursements",
            value: `₹${totalReimbursed?.toLocaleString()}`,
            color: "#8b5cf6",
            icon: <DoneAll sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "All reimbursement requests",
        }, {
            title: "To Be Reimbursed",
            value: `₹${totalPendingReimbursed?.toLocaleString()}`,
            color: "#ef4444",
            icon: <CreditCard sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Pending reimbursement amount",
        },
    ];

    // Enhanced StatCard Component with Amount near Icon
    const StatCard = ({ stat }) => (
        <Card
            sx={{
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                height: { xs: "140px", sm: "150px", md: "160px" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                flex: 1,
                minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "240px" },
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "none" },
                "&:hover": {
                    transform: { xs: "none", sm: "translateY(-4px)" },
                    boxShadow: {
                        xs: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        sm: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    },
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(
                        stat.color,
                        0.7
                    )} 100%)`,
                },
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 2.5, sm: 3 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                {/* Top Section - Icon and Amount */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: 2, sm: 2.5 },
                    }}
                >
                    {/* Icon with Amount */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: { xs: 44, sm: 48, md: 52 },
                                height: { xs: 44, sm: 48, md: 52 },
                                borderRadius: "12px",
                                backgroundColor: alpha(stat.color, 0.1),
                                color: stat.color,
                                flexShrink: 0,
                            }}
                        >
                            {stat.icon}
                        </Box>

                        {/* Amount */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: "#1e293b",
                                    fontWeight: 700,
                                    fontSize: {
                                        xs: "1.3rem",
                                        sm: "1.5rem",
                                        md: "1.7rem",
                                        lg: "1.9rem",
                                    },
                                    lineHeight: 1.1,
                                    wordBreak: "break-word",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {stat.value}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Bottom Section - Title and Subtitle */}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#1e293b",
                            fontWeight: 700,
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            lineHeight: 1.2,
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {stat.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                            fontWeight: 500,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {stat.subtitle}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                minHeight: "100vh",
                width: '100%',
                overflowX: 'hidden',
            }}
        >

            {/* Notifications */}
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={4000}
                onClose={() => setSuccess('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>

            {/* Stats Cards */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 2, sm: 2.5, md: 3 },
                        flexWrap: "wrap",
                        width: "100%",
                        justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                >
                    {reimbursementStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </Box>
            </Box>

            {/* Filters and Controls */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>


                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Per Page</InputLabel>
                        <Select
                            value={itemsPerPage}
                            label="Per Page"
                            onChange={handleItemsPerPageChange}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />

                    <Typography variant="body2" color="text.secondary">
                        Showing {reimbursements.length} of {pagination.totalItems} reimbursements
                    </Typography>
                </Box>
            </Card>

            {/* Reimbursements Table */}
            <Card
                sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                }}
            >
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                            mb: 2
                        }}
                    >
                        Reimbursement Requests
                        {currentLoc !== 'OVERALL' && (
                            <Chip
                                label={currentLoc}
                                size="small"
                                sx={{ ml: 1 }}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: { md: '600px' } }}>
                    <Table sx={{ minWidth: 650 }} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    User
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    Amount Allocated
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    Total Expenses
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    To Be Reimbursed
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2 }}>
                                    Description
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", backgroundColor: '#f8fafc', py: 2, textAlign: "center" }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            Loading...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : reimbursements?.length > 0 ? (
                                reimbursements.map((item) => (
                                    <TableRow
                                        key={item?._id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#f8fafc'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: "primary.main",
                                                        width: { xs: 32, sm: 40 },
                                                        height: { xs: 32, sm: 40 }
                                                    }}
                                                >
                                                    {item?.requestedBy?.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight={500}>
                                                        {item?.requestedBy?.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item?.requestedBy?.userLoc}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                ₹{Number(item?.expense?.fromAllocation || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                ₹{Number(item?.expense?.amount || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight={500}
                                                sx={{
                                                    color: item?.isReimbursed ? 'text.secondary' : '#ef4444'
                                                }}
                                            >
                                                ₹{item?.isReimbursed ? 0 : Number(item?.expense?.fromReimbursement || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {item?.createdAt
                                                    ? new Date(item.createdAt).toLocaleString("en-US", {
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
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: { xs: '120px', sm: '200px' },
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {item?.expense?.description || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title={item?.isReimbursed ? "Reimbursed" : "Mark as reimbursed"}>
                                                <IconButton
                                                    color={item?.isReimbursed ? "success" : "default"}
                                                    onClick={() => !item?.isReimbursed && handleMarkReimbursed(item._id)}
                                                    sx={{
                                                        backgroundColor: item?.isReimbursed ? 'success.light' : 'transparent',
                                                        border: item?.isReimbursed ? 'none' : '1px solid',
                                                        borderColor: 'grey.300',
                                                        borderRadius: 2,
                                                        width: { xs: 36, sm: 40 },
                                                        height: { xs: 36, sm: 40 },
                                                        '&:hover': {
                                                            backgroundColor: item?.isReimbursed ? 'success.main' : 'primary.main',
                                                            color: 'white',
                                                            transform: 'scale(1.05)',
                                                        },
                                                        transition: 'all 0.2s ease-in-out'
                                                    }}
                                                >
                                                    <DoneAll sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No reimbursement requests found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {reimbursements?.length > 0 && (
                    <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Typography variant="body2" color="text.secondary">
                                Showing {reimbursements.length} of {pagination.totalItems} reimbursements
                                {currentLoc !== 'OVERALL' && ` in ${currentLoc}`}
                            </Typography>

                            <Pagination
                                count={pagination.totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        </Stack>
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default ReimbursementManagement;