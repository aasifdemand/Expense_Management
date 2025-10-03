import React, { useState, useEffect } from 'react';
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
    Avatar,
    IconButton,
    alpha,
    CircularProgress,
    Alert,
    Snackbar
} from "@mui/material";
import { CheckCircle, Refresh } from "@mui/icons-material";

const ReimbursementManagement = () => {
    // State for reimbursement data
    const [reimbursements, setReimbursements] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // API endpoints (replace with your actual endpoints)
    const API_BASE_URL = 'https://your-api-domain.com/api';
    const ENDPOINTS = {
        USERS: `${API_BASE_URL}/users`,
        REIMBURSEMENTS: `${API_BASE_URL}/reimbursements`,
        MARK_REIMBURSED: (id) => `${API_BASE_URL}/reimbursements/${id}/mark-reimbursed`
    };

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            const response = await fetch(ENDPOINTS.USERS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            return data.users || data.data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users data');
            return [];
        }
    };

    // Fetch reimbursements from API
    const fetchReimbursements = async () => {
        try {
            const response = await fetch(ENDPOINTS.REIMBURSEMENTS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reimbursements');
            }

            const data = await response.json();
            return data.reimbursements || data.data || [];
        } catch (error) {
            console.error('Error fetching reimbursements:', error);
            setError('Failed to load reimbursement data');
            return [];
        }
    };

    // Mark reimbursement as reimbursed
    const markAsReimbursed = async (reimbursementId) => {
        try {
            setRefreshing(true);
            const response = await fetch(ENDPOINTS.MARK_REIMBURSED(reimbursementId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    paidDate: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to mark as reimbursed');
            }

            const result = await response.json();

            // Update local state
            setReimbursements(prev =>
                prev.map(item =>
                    item.id === reimbursementId || item._id === reimbursementId
                        ? {
                            ...item,
                            isReimbursed: true,
                            status: 'Paid',
                            paidDate: new Date().toISOString().split('T')[0]
                        }
                        : item
                )
            );

            setSuccess('Reimbursement marked as paid successfully!');
            return true;
        } catch (error) {
            console.error('Error marking as reimbursed:', error);
            setError('Failed to update reimbursement status');
            return false;
        } finally {
            setRefreshing(false);
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                const [usersData, reimbursementsData] = await Promise.all([
                    fetchUsers(),
                    fetchReimbursements()
                ]);

                setUsers(usersData);
                setReimbursements(reimbursementsData);
            } catch (error) {
                console.error('Error initializing data:', error);
                setError('Failed to load data');

                // Fallback to sample data if API fails
                const fallbackUsers = [
                    {
                        id: 'user1',
                        name: 'Priya Sharma',
                        email: 'priya.sharma@company.com',
                        department: 'Sales',
                        avatar: 'https://i.pravatar.cc/150?img=1',
                        allocatedBudget: 50000
                    },
                    {
                        id: 'user2',
                        name: 'Rahul Verma',
                        email: 'rahul.verma@company.com',
                        department: 'Marketing',
                        avatar: 'https://i.pravatar.cc/150?img=2',
                        allocatedBudget: 75000
                    },
                    {
                        id: 'user3',
                        name: 'Anjali Patel',
                        email: 'anjali.patel@company.com',
                        department: 'Engineering',
                        avatar: 'https://i.pravatar.cc/150?img=3',
                        allocatedBudget: 100000
                    }
                ];

                const fallbackData = [
                    {
                        id: 1,
                        title: 'Client Dinner Meeting',
                        category: 'Food',
                        amount: 3500,
                        date: '2023-10-15',
                        status: 'Approved',
                        description: 'Dinner with potential clients from ABC Corp',
                        receipt: 'receipt_1.jpg',
                        userId: 'user1',
                        paidDate: null,
                        isReimbursed: false
                    },
                    {
                        id: 2,
                        title: 'Taxi to Client Office',
                        category: 'Travel',
                        amount: 1200,
                        date: '2023-10-12',
                        status: 'Pending',
                        description: 'Round trip taxi fare for client meeting',
                        receipt: 'receipt_2.jpg',
                        userId: 'user1',
                        paidDate: null,
                        isReimbursed: false
                    },
                    {
                        id: 3,
                        title: 'Team Lunch',
                        category: 'Food',
                        amount: 4200,
                        date: '2023-10-10',
                        status: 'Paid',
                        description: 'Monthly team lunch at restaurant',
                        receipt: 'receipt_3.jpg',
                        userId: 'user2',
                        paidDate: '2023-10-18',
                        isReimbursed: true
                    },
                    {
                        id: 4,
                        title: 'Office Supplies',
                        category: 'Supplies',
                        amount: 2500,
                        date: '2023-10-05',
                        status: 'Approved',
                        description: 'Purchase of stationery and printer ink',
                        receipt: 'receipt_4.jpg',
                        userId: 'user3',
                        paidDate: null,
                        isReimbursed: false
                    },
                    {
                        id: 5,
                        title: 'Conference Registration',
                        category: 'Training',
                        amount: 8000,
                        date: '2023-09-28',
                        status: 'Pending',
                        description: 'Registration fee for Tech Conference 2023',
                        receipt: 'receipt_5.jpg',
                        userId: 'user2',
                        paidDate: null,
                        isReimbursed: false
                    }
                ];

                setUsers(fallbackUsers);
                setReimbursements(fallbackData);
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();

        // Set up real-time updates (polling every 30 seconds)
        const interval = setInterval(async () => {
            const [usersData, reimbursementsData] = await Promise.all([
                fetchUsers(),
                fetchReimbursements()
            ]);
            setUsers(usersData);
            setReimbursements(reimbursementsData);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const [usersData, reimbursementsData] = await Promise.all([
                fetchUsers(),
                fetchReimbursements()
            ]);
            setUsers(usersData);
            setReimbursements(reimbursementsData);
            setSuccess('Data refreshed successfully!');
        } catch (error) {
            setError('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    // Calculate user-specific statistics
    const calculateUserStats = () => {
        const stats = {};

        users.forEach(user => {
            const userReimbursements = reimbursements.filter(item =>
                item.userId === user.id || item.userId === user._id || item.user?._id === user.id || item.user?.id === user.id
            );
            const totalExpenses = userReimbursements.reduce((sum, item) => sum + (item.amount || 0), 0);
            const toBeReimbursed = userReimbursements
                .filter(item => !item.isReimbursed && (item.status === 'Approved' || item.status === 'Paid'))
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            const totalAllocated = user.allocatedBudget || user.totalBudget || 0;
            const paidAmount = userReimbursements
                .filter(item => item.isReimbursed)
                .reduce((sum, item) => sum + (item.amount || 0), 0);

            const userId = user.id || user._id;
            stats[userId] = {
                totalAllocated,
                totalExpenses,
                toBeReimbursed,
                paidAmount,
                remainingBalance: totalAllocated - totalExpenses,
                totalClaims: userReimbursements.length,
                paidClaims: userReimbursements.filter(item => item.isReimbursed).length
            };
        });

        return stats;
    };

    // Handle mark as reimbursed
    const handleMarkAsReimbursed = async (reimbursementId) => {
        const success = await markAsReimbursed(reimbursementId);
        if (success) {
            // Success message is already set in the markAsReimbursed function
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (error) {
            return '-';
        }
    };

    // Get user info by ID
    const getUserInfo = (userId) => {
        const user = users.find(u =>
            u.id === userId || u._id === userId || u.id === userId?.id || u._id === userId?._id
        );
        return user || {
            id: userId,
            name: 'Unknown User',
            department: 'N/A',
            avatar: `https://i.pravatar.cc/150?u=${userId}`,
            allocatedBudget: 0
        };
    };

    // Calculate overall statistics for all users
    const userStats = calculateUserStats();

    // Get the first user as default for stats display (maintains your original structure)
    const defaultUser = users[0] || { id: 'default', allocatedBudget: 0 };
    const defaultStats = userStats[defaultUser.id] || {
        totalAllocated: 0,
        totalExpenses: 0,
        toBeReimbursed: 0,
        paidAmount: 0,
        remainingBalance: 0,
        totalClaims: 0,
        paidClaims: 0
    };

    const reimbursementStats = [
        {
            title: "Total Allocated",
            value: `₹${defaultStats.totalAllocated.toLocaleString()}`,
            color: "#3b82f6",
            subtitle: "Total budget allocation",
            trend: "+5.2%",
            trendColor: "#10b981",
        },
        {
            title: "Total Expenses",
            value: `₹${defaultStats.totalExpenses.toLocaleString()}`,
            color: "#10b981",
            subtitle: "Total expenses incurred",
            trend: "+12.3%",
            trendColor: "#10b981",
        },
        {
            title: "To Be Reimbursed",
            value: `₹${defaultStats.toBeReimbursed.toLocaleString()}`,
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

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f5f7fb',
                }}
            >
                <Typography variant="h6">Loading Reimbursement System...</Typography>
            </Box>
        );
    }

    // Show all reimbursements for all users
    const allReimbursements = reimbursements;

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
                                    Paid To
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
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b", textAlign: "center" }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allReimbursements.length > 0 ? (
                                allReimbursements.map((item) => {
                                    const userInfo = getUserInfo(item.userId || item.user?._id || item.user?.id);
                                    const userStat = userStats[userInfo.id] || {
                                        totalAllocated: 0,
                                        totalExpenses: 0,
                                        toBeReimbursed: 0
                                    };

                                    return (
                                        <TableRow
                                            key={item.id || item._id}
                                            hover
                                            sx={{
                                                transition: "all 0.2s",
                                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar
                                                        src={userInfo.avatar}
                                                        alt={userInfo.name}
                                                        sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}
                                                    >
                                                        {userInfo.name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight={500} sx={{ color: "#1e293b" }}>
                                                            {userInfo.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                                            {userInfo.department}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "#1e293b", fontWeight: 500 }}>
                                                {item.title}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>
                                                {formatCurrency(userStat.totalAllocated)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>
                                                {formatCurrency(userStat.totalExpenses)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold", color: "#ef4444" }}>
                                                {formatCurrency(userStat.toBeReimbursed)}
                                            </TableCell>
                                            <TableCell sx={{ color: "#6b7280" }}>
                                                {formatDate(item.date)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.isReimbursed ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <CheckCircle sx={{ color: "#10b981", fontSize: 20 }} />
                                                        <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
                                                            Reimbursed
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <IconButton
                                                        onClick={() => handleMarkAsReimbursed(item.id || item._id)}
                                                        color="primary"
                                                        disabled={refreshing || item.status !== 'Approved'}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            },
                                                            '&:disabled': {
                                                                opacity: 0.5
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="text.secondary">
                                                No reimbursement claims found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                There are no reimbursement claims in the system.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination Info */}
                {allReimbursements.length > 0 && (
                    <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing 1–{allReimbursements.length} of {allReimbursements.length} entries
                        </Typography>
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default ReimbursementManagement;