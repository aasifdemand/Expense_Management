import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  useTheme,
  IconButton,
  useMediaQuery,
  Tabs,
  Tab,
  Tooltip,
  Fab,
  Drawer,
} from "@mui/material";
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,

  Download as DownloadIcon,
  // Person as PersonIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const users = [
    { id: 1, name: "John Doe", email: "john@company.com", department: "IT", monthlyAllocation: 5000 },
    { id: 2, name: "Jane Smith", email: "jane@company.com", department: "Sales", monthlyAllocation: 4000 },
    { id: 3, name: "Mike Johnson", email: "mike@company.com", department: "Marketing", monthlyAllocation: 3000 },
    { id: 4, name: "Sarah Wilson", email: "sarah@company.com", department: "Operations", monthlyAllocation: 3500 },
  ];

  const [expenses, setExpenses] = useState([
    { id: 1, paidTo: "Amazon Web Services", amount: 1200, date: "2023-10-15", mode: "Card", department: "IT", userId: 1, userName: "John Doe", reimbursement: false, status: "Pending", approved: false, reimbursed: false },
    { id: 2, paidTo: "Office Supplies Inc", amount: 450, date: "2023-10-12", mode: "Cash", department: "Sales", userId: 2, userName: "Jane Smith", reimbursement: true, status: "Approved", approved: true, reimbursed: false },
    { id: 3, paidTo: "Google Workspace", amount: 800, date: "2023-10-10", mode: "Bank Transfer", department: "Data", userId: 3, userName: "Mike Johnson", reimbursement: false, status: "Rejected", approved: false, reimbursed: false },
    { id: 4, paidTo: "Microsoft Azure", amount: 1500, date: "2023-10-08", mode: "Card", department: "IT", userId: 1, userName: "John Doe", reimbursement: false, status: "Approved", approved: true, reimbursed: false },
    { id: 5, paidTo: "Starbucks Coffee", amount: 85, date: "2023-10-05", mode: "Cash", department: "Marketing", userId: 3, userName: "Mike Johnson", reimbursement: true, status: "Pending", approved: false, reimbursed: false },
  ]);

  const filteredExpenses = expenses.filter(
    (expense) =>
      (selectedUser === "all" || expense.userId.toString() === selectedUser) &&
      (expense.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm) ||
        expense.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const monthlySpending = [4200, 5800, 5100, 7200, 6900, 8300, 9500, 9100, 8200, 7800, 10450, 12300];
  const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleApproveExpense = (expenseId) => {
    setExpenses(expenses.map((expense) => (expense.id === expenseId ? { ...expense, status: "Approved", approved: true } : expense)));
  };

  const handleRejectExpense = (expenseId) => {
    setExpenses(expenses.map((expense) => (expense.id === expenseId ? { ...expense, status: "Rejected", approved: false } : expense)));
  };

  const handleMarkReimbursed = (expenseId) => {
    setExpenses(expenses.map((expense) => (expense.id === expenseId ? { ...expense, reimbursed: true } : expense)));
  };

  const handleDownloadReport = () => {
    const headers = ["ID", "User", "Paid To", "Amount", "Date", "Department", "Status", "Reimbursement"];
    const csvData = expenses.map((expense) =>
      [
        expense.id,
        expense.userName,
        expense.paidTo,
        expense.amount,
        expense.date,
        expense.department,
        expense.mode,
        expense.status,
        expense.reimbursement ? (expense.reimbursed ? "Reimbursed" : "Pending Reimbursement") : "Not Required",
      ].join(",")
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircleIcon fontSize="small" />;
      case "Pending":
        return <PendingIcon fontSize="small" />;
      case "Rejected":
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => {
    const isSmallMobile = useMediaQuery("(max-width:400px)");
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: "white",
          borderRadius: 3,
          boxShadow: 3,
          height: "100%",
          minHeight: isSmallMobile ? 120 : 140,
          display: "flex",
          alignItems: "center",
        }}
      >
        <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
          <Box sx={{ bgcolor: "rgba(199, 184, 184, 0.2)", borderRadius: "50%", p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight="bold">
              {title.includes("Balance") || title.includes("Allocated") || title.includes("Spent") ? "" : ""}
              {value.toLocaleString()}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {title}
            </Typography>
            {subtitle && <Typography variant="body2">{subtitle}</Typography>}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const MobileFiltersDrawer = () => (
    <Drawer anchor="right" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 280, p: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setMobileFiltersOpen(false)}>
          <CancelIcon />
        </IconButton>
      </Box>
      <TextField select fullWidth value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} size="small" label="Filter by User" sx={{ mb: 2 }}>
        <MenuItem value="all">All Users</MenuItem>
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id.toString()}>
            {user.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        size="small"
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Drawer>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
        <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 5, p: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Stats */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 5 }} spacing={2}>
            {[
              {
                title: "Total Allocated",
                value: `₹15,500`,
                icon: <WalletIcon />,
                color: "#4361ee",
                subtitle: "Monthly budget allocation"
              },
              {
                title: "Total Spent",
                value: `₹4,035`,
                icon: <PaymentIcon />,
                color: "#ef476f",
                subtitle: "25.0% of budget used"
              },
              {
                title: "Remaining Balance",
                value: `₹11,465`,
                icon: <TrendingUpIcon />,
                color: "#06d6a0",
                subtitle: "Available funds"
              },
              {
                title: "Pending Reimbursements",
                value: "2",
                icon: <PendingIcon />,
                color: "#ffd166",
                subtitle: "Awaiting payment"
              },
            ].map((stat, index) => (
              <Box sx={{ width: "100%" }} key={index}>
                <StatCard {...stat} />
              </Box>
            ))}
          </Box>

          {/* Chart */}
          <Card sx={{ borderRadius: 3, boxShadow: 3, width: "100%", minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Monthly Spending Trend
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 250, sm: 300 } }}>
                <LineChart
                  xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], valueFormatter: (value) => monthlyLabels[value - 1] }]}
                  series={[{ data: monthlySpending, label: "Spending", color: "#4361ee" }]}
                  height={isMobile ? 250 : 300}
                  margin={{ left: isMobile ? 50 : 70, right: 20, top: 20, bottom: 30 }}
                  grid={{ vertical: true, horizontal: true }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
              size={isMobile ? "small" : "medium"}
              sx={{ px: { xs: 2, sm: 4 }, py: 1, fontWeight: "bold", borderRadius: 2 }}
            >
              {isMobile ? "CSV" : "Download CSV Report"}
            </Button>
            {isMobile && (
              <IconButton onClick={() => setMobileFiltersOpen(true)} sx={{ bgcolor: "primary.main", color: "white" }}>
                <FilterIcon />
              </IconButton>
            )}
            {!isMobile && (
              <>
                <TextField select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} size="small" sx={{ minWidth: 150 }} label="Filter by User">
                  <MenuItem value="all">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                  sx={{ minWidth: 200 }}
                />
              </>
            )}
          </Box>

          {/* Mobile Filters */}
          <MobileFiltersDrawer />

          {/* Table */}
          <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 400 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", overflowX: "auto" }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto">
                  <Tab label="All Expenses" />
                  <Tab label="Pending Approval" />
                  <Tab label="Pending Reimbursement" />
                </Tabs>
              </Box>
              <TableContainer sx={{ overflowX: "auto", overflowY: "visible" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Paid To</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Date</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExpenses
                      .filter((expense) => {
                        if (activeTab === 1) return expense.status === "Pending";
                        if (activeTab === 2) return expense.reimbursement && !expense.reimbursed;
                        return true;
                      })
                      .map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>{expense.userName}</TableCell>
                          <TableCell>{expense.paidTo}</TableCell>
                          <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{expense.date}</TableCell>
                          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{expense.department}</TableCell>
                          <TableCell>
                            <Chip icon={getStatusIcon(expense.status)} label={expense.status} color={getStatusColor(expense.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            {expense.status === "Pending" && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton size="small" color="success" onClick={() => handleApproveExpense(expense.id)}>
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton size="small" color="error" onClick={() => handleRejectExpense(expense.id)}>
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {expense.reimbursement && !expense.reimbursed && expense.approved && (
                              <Tooltip title="Mark as Reimbursed">
                                <Button variant="outlined" size="small" onClick={() => handleMarkReimbursed(expense.id)}>
                                  Mark Paid
                                </Button>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {isMobile && (
            <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }}>
              <AddIcon />
            </Fab>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;