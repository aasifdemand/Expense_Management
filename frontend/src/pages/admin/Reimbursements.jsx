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
import { useBudgeting } from '../../hooks/useBudgeting';
import { useExpenses } from '../../hooks/useExpenses';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReimbursements, markAsReimbursed } from '../../store/reimbursementSlice';
import { DoneAll } from '@mui/icons-material';


const ReimbursementManagement = () => {

    const dispatch = useDispatch()
    const { reimbursements, } = useSelector((state) => state.reimbursement)

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { allBudgets } = useBudgeting()
    const { allExpenses } = useExpenses()

    const totalAllocated = allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0)
    const totalExpenses = allExpenses?.reduce((acc, b) => acc + Number(b?.amount), 0)
    const totalReimbursed = allExpenses?.reduce((acc, b) => acc + Number(b?.fromReimbursement), 0)



    useEffect(() => {
        dispatch(fetchReimbursements())
    }, [dispatch])

    const handleMarkReimbursed = async (id) => {
        const res = await dispatch(markAsReimbursed({ id, isReimbursed: true }))

        if (markAsReimbursed.fulfilled.match(res)) {
            dispatch(fetchReimbursements())
        }
    }

    const reimbursementStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated}`,
            color: "#3b82f6",
            subtitle: "Total budget allocation",
            trend: "+5.2%",
            trendColor: "#10b981",
        },
        {
            title: "Total Expenses",
            value: `₹${totalExpenses}`,
            color: "#10b981",
            subtitle: "Total expenses incurred",
            trend: "+12.3%",
            trendColor: "#10b981",
        },
        {
            title: "To Be Reimbursed",
            value: `₹${totalReimbursed}`,
            color: "#ef4444",
            subtitle: "Pending reimbursement amount",
            trend: "-8.7%",
            trendColor: "#ef4444",
        }
    ];

    // StatCard Component (same as your original)
    const StatCard = ({ stat }) => (
        <Card
            sx={{
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                height: { xs: "130px", sm: "140px", md: "150px" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                flex: 1,
                minWidth: { xs: "calc(50% - 10px)", sm: "200px", md: "240px" },
                maxWidth: { xs: "calc(50% - 10px)", sm: "none" },
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
                    p: { xs: 2, sm: 3 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                {/* Top Section - Amount and Trend */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: 1.5, sm: 2 },
                    }}
                >
                    {/* Amount */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "#1e293b",
                                fontWeight: 700,
                                fontSize: {
                                    xs: "1.1rem",
                                    sm: "1.4rem",
                                    md: "1.6rem",
                                    lg: "1.8rem",
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
                            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                            lineHeight: 1.2,
                            mb: 0.5,
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
                            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                            fontWeight: 600,
                            lineHeight: 1.2,
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

    // if (isLoading) {
    //     return (
    //         <Box
    //             sx={{
    //                 display: 'flex',
    //                 justifyContent: 'center',
    //                 alignItems: 'center',
    //                 minHeight: '100vh',
    //                 backgroundColor: '#f5f7fb',
    //             }}
    //         >
    //             <Typography variant="h6">Loading Reimbursement System...</Typography>
    //         </Box>
    //     );
    // }

    // Show all reimbursements for all users
    console.log(reimbursements);




    return (
        <Box
            sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                minHeight: "100vh",
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


            {/* Stats Cards */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        flexWrap: "wrap",
                        width: "100%",
                        justifyContent: { xs: "space-between", sm: "flex-start" },
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
                }}
            >


                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    User
                                </TableCell>

                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    Amount Allocated
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    Total Expenses
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    To Be Reimbursed
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}>
                                    Description
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b", textAlign: "center" }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                reimbursements?.map((item) => {
                                    return (
                                        <TableRow key={item?._id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{ bgcolor: "primary.main" }}>
                                                        {item?.requestedBy?.name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography fontWeight={500}>
                                                        {item?.requestedBy?.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {item?.expense?.fromAllocation}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {item?.expense?.amount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {item?.expense?.fromReimbursement}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                            <TableCell>
                                                {item?.expense?.description}
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
                                                            width: 40,
                                                            height: 40,
                                                            '&:hover': {
                                                                backgroundColor: item?.isReimbursed ? 'success.main' : 'primary.main',
                                                                color: 'white',
                                                            }
                                                        }}
                                                    >
                                                        <DoneAll />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination Info */}
                {/* {allReimbursements.length > 0 && (
                    <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing 1–{allReimbursements.length} of {allReimbursements.length} entries
                        </Typography>
                    </Box>
                )} */}
            </Card>
        </Box>
    );
};

export default ReimbursementManagement;