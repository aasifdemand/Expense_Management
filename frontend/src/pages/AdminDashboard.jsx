import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Avatar,
  LinearProgress,
  useTheme,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  Paper,
  Container,
  useMediaQuery
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// Import your components
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

// Custom theme with dark mode support
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: {
          main: '#4361ee',
          light: '#eef2ff',
          dark: '#3a56d4',
        },
        secondary: {
          main: '#7209b7',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
        },
        success: {
          main: '#06d6a0',
        },
        warning: {
          main: '#ffd166',
        },
        error: {
          main: '#ef476f',
        },
      }
      : {
        primary: {
          main: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
        success: {
          main: '#10b981',
        },
        warning: {
          main: '#f59e0b',
        },
        error: {
          main: '#ef4444',
        },
      }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});

const AdminDashboard = () => {

  const { csrf, setAuthState } = useAuth()
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    paidTo: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    mode: "",
    department: "",
    reimbursement: false,
    proof: null
  });

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      paidTo: "Amazon Web Services",
      amount: 1200,
      date: "2023-10-15",
      mode: "Card",
      department: "IT",
      reimbursement: false,
      status: "Pending"
    },
    {
      id: 2,
      paidTo: "Office Supplies Inc",
      amount: 450,
      date: "2023-10-12",
      mode: "Cash",
      department: "Sales",
      reimbursement: true,
      status: "Approved"
    },
    {
      id: 3,
      paidTo: "Google Workspace",
      amount: 800,
      date: "2023-10-10",
      mode: "Bank Transfer",
      department: "Data",
      reimbursement: false,
      status: "Rejected"
    },
    {
      id: 4,
      paidTo: "Microsoft Azure",
      amount: 1500,
      date: "2023-10-08",
      mode: "Card",
      department: "IT",
      reimbursement: false,
      status: "Approved"
    },
    {
      id: 5,
      paidTo: "Starbucks Coffee",
      amount: 85,
      date: "2023-10-05",
      mode: "Cash",
      department: "Marketing",
      reimbursement: true,
      status: "Pending"
    }
  ]);

  const modeTheme = createTheme(getDesignTokens(darkMode ? 'dark' : 'light'));

  // Calculate dashboard metrics
  const dashboardData = {
    revenue: 12500,
    transactions: expenses.length,
    dailyUsage: 82,
    pendingReimbursements: expenses.filter(e => e.status === "Pending").length,
    totalSpent: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    monthlyBudget: 15000,
    remainingBalance: 15000 - expenses.reduce((sum, expense) => sum + expense.amount, 0)
  };


  const [isLoading, setIsLoading] = useState(false)
  console.log("csrf: ",csrf);
  const handleLogout = async () => {
    setIsLoading(true); // optional: show spinner

  
    
    if (!csrf) return

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf
        }
      });

      if (response.ok) {
        // Clear localStorage
        localStorage.clear();

        // Reset AuthContext
        setAuthState({
          isAuthenticated: false,
          isTwoFactorVerified: false,
          isTwoFactorPending: false,
          role: null,
          userId: null,
          qr: null,
        });

        // Redirect to login
        navigate("/login");
      } else {
        const data = await response.json();
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Network error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleUploadExpense = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setNewExpense({
      paidTo: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      mode: "",
      department: "",
      reimbursement: false,
      proof: null
    });
  };

  const handleSubmitExpense = () => {
    if (!newExpense.paidTo || !newExpense.amount || !newExpense.date ||
      !newExpense.mode || !newExpense.department) {
      return;
    }

    const newExpenseItem = {
      id: expenses.length + 1,
      paidTo: newExpense.paidTo,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      mode: newExpense.mode,
      department: newExpense.department,
      reimbursement: newExpense.reimbursement,
      status: "Pending",
      proof: newExpense.proof
    };

    setExpenses([newExpenseItem, ...expenses]);
    handleCloseDialog();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "application/pdf" || file.type === "text/csv" || file.type.includes("image/"))) {
      setNewExpense({ ...newExpense, proof: file });
    } else {
      alert("Please upload a PDF, CSV, or image file");
    }
  };

  const removeFile = () => {
    setNewExpense({ ...newExpense, proof: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Pending": return "warning";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved": return <CheckCircleIcon fontSize="small" />;
      case "Pending": return <PendingIcon fontSize="small" />;
      case "Rejected": return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  // PERFECTLY SIZED StatCard Component with consistent dimensions
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: "white",
      borderRadius: 3,
      boxShadow: 3,
      height: "100%",
      minHeight: 140,
      display: 'flex',
      alignItems: 'center',
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 6
      }
    }}>
      <CardContent sx={{
        p: isMobile ? 2 : 3,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 2,
        height: '100%'
      }}>
        {/* Icon on Left - Perfectly Centered */}
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            p: isMobile ? 1 : 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            flexShrink: 0,
            minWidth: isMobile ? 48 : 56
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              fontSize: isMobile ? 24 : 28
            }
          })}
        </Box>

        {/* Content on Right - Perfectly Aligned */}
        <Box sx={{
          flex: 1,
          minWidth: 0 // Prevents text overflow
        }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: {
                xs: '1.5rem',
                sm: '1.75rem',
                md: '2.125rem'
              },
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {title.includes("Revenue") || title.includes("Balance") ? "$" : ""}
            {value.toLocaleString()}
            {title.includes("Usage") ? "%" : ""}
          </Typography>

          <Typography
            variant={isMobile ? "body2" : "body1"}
            fontWeight={500}
            gutterBottom
            sx={{
              opacity: 0.9,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap'
              }}
            >
              {trend && (
                <TrendingUpIcon sx={{
                  fontSize: isMobile ? 14 : 16,
                  color: trend > 0 ? '#06d6a0' : '#ef476f',
                  transform: trend > 0 ? 'none' : 'rotate(180deg)'
                }} />
              )}
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={modeTheme}>
      <CssBaseline />
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default"
      }}>
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          handleLogout={handleLogout}
        />

        <Box sx={{ display: "flex", flex: 1 }}>
          {/* Sidebar */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            darkMode={darkMode}
            activePage={activePage}
            setActivePage={setActivePage}
            handleLogout={handleLogout}
            loading={isLoading}
            setLoading={setIsLoading}
          />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { md: `calc(100% - 280px)` },
              ml: { md: '280px' },
              transition: "all 0.3s ease",
              display: 'flex',
              flexDirection: 'column'
            }}
          >

            {/* Centered Stats Cards */}
            <Container maxWidth="100%" sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              py: { xs: 1, md: 2 }
            }}>
              {/* Stats Grid - Perfectly Sized Cards */}
              <Grid
                container
                spacing={3}
                sx={{
                  mb: 4,
                  width: '100%'
                }}
              >
                {[
                  {
                    title: "Total Revenue",
                    value: dashboardData.revenue,
                    icon: <TrendingUpIcon />,
                    color: "#4361ee",
                    subtitle: "+12% from last month",
                    trend: 12
                  },
                  {
                    title: "Transactions",
                    value: dashboardData.transactions,
                    icon: <ReceiptIcon />,
                    color: "#7209b7",
                    subtitle: `${dashboardData.transactions} this month`
                  },
                  {
                    title: "Daily Usage",
                    value: dashboardData.dailyUsage,
                    icon: <PaymentIcon />,
                    color: "#06d6a0",
                    subtitle: "Average: $1,200"
                  },
                  {
                    title: "Pending Reimbursements",
                    value: dashboardData.pendingReimbursements,
                    icon: <PendingIcon />,
                    color: "#ffd166",
                    subtitle: "Awaiting approval"
                  }
                ].map((stat, index) => (
                  <Grid
                    item
                    key={index}
                    xs={12}
                    sm={6}
                    lg={3}
                    sx={{
                      display: 'flex'
                    }}
                  >
                    <Box sx={{
                      width: '100%',
                      height: '100%'
                    }}>
                      <StatCard {...stat} />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Budget Overview - Full width */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    height: "100%",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          fontSize: {
                            xs: '1.1rem',
                            md: '1.25rem'
                          }
                        }}
                      >
                        Budget Overview
                      </Typography>

                      <Grid container spacing={3} sx={{ mb: 2 }}>
                        {[
                          { label: "Monthly Budget", value: dashboardData.monthlyBudget, color: "primary" },
                          { label: "Total Spent", value: dashboardData.totalSpent, color: "error" },
                          { label: "Remaining Balance", value: dashboardData.remainingBalance, color: "success.main" }
                        ].map((item, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Box sx={{
                              textAlign: 'center',
                              p: 2,
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              boxShadow: 1,
                              width: '100%'
                            }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 500 }}
                              >
                                {item.label}
                              </Typography>
                              <Typography
                                variant="h4"
                                fontWeight="bold"
                                color={item.color}
                                sx={{
                                  fontSize: {
                                    xs: '1.5rem',
                                    md: '2.125rem'
                                  }
                                }}
                              >
                                ${item.value.toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={(dashboardData.totalSpent / dashboardData.monthlyBudget) * 100}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "primary.main",
                            borderRadius: 6
                          }
                        }}
                      />

                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          0%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round((dashboardData.totalSpent / dashboardData.monthlyBudget) * 100)}% Spent
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          100%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Action Buttons - Centered */}
              <Box sx={{
                display: "flex",
                gap: 2,
                mb: 4,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleUploadExpense}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    minWidth: { xs: '100%', sm: 'auto' },
                    background: "linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)",
                    boxShadow: "0 4px 12px rgba(67, 97, 238, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #3a56d4 0%, #2f4999 100%)",
                      boxShadow: "0 6px 16px rgba(67, 97, 238, 0.4)",
                    }
                  }}
                >
                  Upload Expense
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    minWidth: { xs: '100%', sm: 'auto' }
                  }}
                >
                  View Reports
                </Button>
              </Box>

              {/* Expenses Table */}
              <Card sx={{
                borderRadius: 3,
                boxShadow: 3,
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  <Box sx={{
                    p: 3,
                    pb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontSize: {
                          xs: '1.1rem',
                          md: '1.25rem'
                        }
                      }}
                    >
                      Recent Expenses
                    </Typography>

                    <TextField
                      size="small"
                      placeholder="Search expenses..."
                      sx={{
                        minWidth: { xs: '100%', sm: 200 }
                      }}
                    />
                  </Box>

                  <TableContainer sx={{ flex: 1 }}>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            pl: 3,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Paid To
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Date
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Mode
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            display: { xs: 'none', md: 'table-cell' },
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Department
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            display: { xs: 'none', sm: 'table-cell' },
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Reimbursement
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            pr: 3,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow
                            key={expense.id}
                            hover
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell sx={{ pl: 3 }}>
                              <Typography fontWeight="500">
                                {expense.paidTo}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold" color="primary">
                                ${expense.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.mode}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              {expense.department}
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                              <Chip
                                label={expense.reimbursement ? "Yes" : "No"}
                                color={expense.reimbursement ? "primary" : "default"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{ pr: 3 }}>
                              <Chip
                                icon={getStatusIcon(expense.status)}
                                label={expense.status}
                                color={getStatusColor(expense.status)}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Container>

            {/* Upload Expense Dialog */}
            <Dialog
              open={uploadDialogOpen}
              onClose={handleCloseDialog}
              maxWidth="md"
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle>
                <Typography variant="h6" fontWeight="bold">
                  Upload New Expense
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Box sx={{
                  pt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3
                }}>
                  <TextField
                    label="Paid To"
                    value={newExpense.paidTo}
                    onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    label="Date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    label="Payment Mode"
                    select
                    value={newExpense.mode}
                    onChange={(e) => setNewExpense({ ...newExpense, mode: e.target.value })}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Digital Wallet">Digital Wallet</MenuItem>
                  </TextField>
                  <TextField
                    label="Department"
                    select
                    value={newExpense.department}
                    onChange={(e) => setNewExpense({ ...newExpense, department: e.target.value })}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                  >
                    <MenuItem value="Sales">Sales</MenuItem>
                    <MenuItem value="Data">Data</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Marketing">Office Expenses</MenuItem>
                    <MenuItem value="Operations">Others</MenuItem>
                  </TextField>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newExpense.reimbursement}
                        onChange={(e) => setNewExpense({ ...newExpense, reimbursement: e.target.checked })}
                      />
                    }
                    label="Needs Reimbursement"
                  />

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Upload Proof (PDF, CSV, or Image)
                    </Typography>
                    {!newExpense.proof ? (
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          py: 1.5,
                          width: '100%',
                          height: isMobile ? 48 : 56
                        }}
                        size={isMobile ? "small" : "medium"}
                      >
                        Select File
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload}
                          accept=".pdf,.csv,image/*"
                        />
                      </Button>
                    ) : (
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: 'success.light',
                          color: 'success.dark'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachFileIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {newExpense.proof.name}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={removeFile}>
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    )}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                  onClick={handleCloseDialog}
                  size={isMobile ? "small" : "medium"}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitExpense}
                  disabled={!newExpense.paidTo || !newExpense.amount || !newExpense.date || !newExpense.mode || !newExpense.department}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    background: "linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #3a56d4 0%, #2f4999 100%)",
                    }
                  }}
                >
                  Submit Expense
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;