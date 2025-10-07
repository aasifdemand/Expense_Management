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
    Tooltip
} from "@mui/material";
import { useExpenses } from '../../hooks/useExpenses';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReimbursements, markAsReimbursed } from '../../store/reimbursementSlice';
import { DoneAll, AccountBalance, MonetizationOn, CreditCard } from '@mui/icons-material';
import { fetchBudgets } from '../../store/budgetSlice';
// import { fetchBudgets } from '../../store/budgetSlice';
// import { fetchExpenses, fetchExpensesForUser } from '../../store/expenseSlice';

const ReimbursementManagement = () => {
    const dispatch = useDispatch()
    const { reimbursements } = useSelector((state) => state.reimbursement)

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { allExpenses } = useExpenses()

    const totalAllocated = allExpenses?.reduce((acc, b) => acc + Number(b?.fromAllocation), 0) || 0
    const totalExpenses = allExpenses?.reduce((acc, b) => acc + Number(b?.amount), 0) || 0
    const totalReimbursed = reimbursements
        ?.filter(item => !item?.isReimbursed)
        .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

    useEffect(() => {
        dispatch(fetchReimbursements())
    }, [dispatch])

    const handleMarkReimbursed = async (id) => {
        const res = await dispatch(markAsReimbursed({ id, isReimbursed: true }))

        if (markAsReimbursed.fulfilled.match(res)) {
            dispatch(fetchReimbursements())
            await Promise.all([
                dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false })),
                // dispatch(fetchExpenses({ page: 1, limit: 20 })),
                // dispatch(fetchExpensesForUser({ page: 1, limit: 20 }))
            ]);
        }
    }

    const reimbursementStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated?.toLocaleString()}`,
            color: "#3b82f6",
            icon: <AccountBalance sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Total budget allocation",
            trend: "+5.2%",
            trendColor: "#10b981",
        },
        {
            title: "Total Expenses",
            value: `₹${totalExpenses?.toLocaleString()}`,
            color: "#10b981",
            icon: <MonetizationOn sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Total expenses incurred",
            trend: "+12.3%",
            trendColor: "#10b981",
        },
        {
            title: "To Be Reimbursed",
            value: `₹${totalReimbursed?.toLocaleString()}`,
            color: "#ef4444",
            icon: <CreditCard sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
            subtitle: "Pending reimbursement amount",
            trend: "-8.7%",
            trendColor: "#ef4444",
        }
    ];

    // Enhanced StatCard Component with Icons
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
                    {/* Icon */}
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
                            mr: 2,
                        }}
                    >
                        {stat.icon}
                    </Box>

                    {/* Amount */}
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
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
                // backgroundColor: '#f8fafc',
                width: '100%',
                overflowX: 'hidden',
            }}
        >

            {/* Notifications */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
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

            {/* Header */}
            {/* <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                        mb: 1
                    }}
                >
                    Reimbursement Management
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#6b7280",
                        fontSize: { xs: "0.9rem", sm: "1rem" }
                    }}
                >
                    Manage and track all reimbursement requests
                </Typography>
            </Box> */}

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
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: { md: '600px' } }}>
                    <Table sx={{ minWidth: 650 }} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    User
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    Amount Allocated
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    Total Expenses
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    To Be Reimbursed
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    Date
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    Description
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.875rem", sm: "1rem" },
                                        color: "#1e293b",
                                        textAlign: "center",
                                        backgroundColor: '#f8fafc',
                                        py: 2
                                    }}
                                >
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reimbursements?.length > 0 ? (
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
                                                <Typography
                                                    fontWeight={500}
                                                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                                                >
                                                    {item?.requestedBy?.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight={500}
                                                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                                            >
                                                ₹{Number(item?.expense?.fromAllocation || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight={500}
                                                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                                            >
                                                ₹{Number(item?.expense?.amount || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight={500}
                                                sx={{
                                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                                    color: item?.isReimbursed ? 'text.secondary' : '#ef4444'
                                                }}
                                            >
                                                ₹{item?.isReimbursed ? 0 : Number(item?.expense?.fromReimbursement || 0)?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{ fontSize: { xs: "0.875rem", sm: "0.9rem" } }}
                                            >
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
                                                sx={{
                                                    fontSize: { xs: "0.875rem", sm: "0.9rem" },
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
                                        <Typography
                                            variant="h6"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                                        >
                                            No reimbursement requests found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Info */}
                {reimbursements?.length > 0 && (
                    <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                            Showing {reimbursements.length} reimbursement request{reimbursements.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default ReimbursementManagement;