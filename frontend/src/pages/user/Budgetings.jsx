import React, { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from 'date-fns/locale';


import {
  Avatar,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Tooltip,
  IconButton,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Download, Search as SearchIcon, Visibility } from "@mui/icons-material";
import {
  StyledTextField,
  StyledFormControl,
  StyledSelect,
  FilterToolbar,
  TableWrapper,
} from "../../styles/budgeting.styles.js";

const budgets = [
  { id: 1, category: "Food", allocated: 5000, spent: 3200, remaining: 1800, status: "Reimbursed", date: "2025-09-01" },
  { id: 2, category: "Transportation", allocated: 3000, spent: 2800, remaining: 200, status: "Pending Reimbursement", date: "2025-09-05" },
  { id: 3, category: "Entertainment", allocated: 2000, spent: 800, remaining: 1200, status: "Reimbursed", date: "2025-09-10" },
  { id: 4, category: "Utilities", allocated: 4000, spent: 4200, remaining: -200, status: "Pending Reimbursement", date: "2025-09-15" },
    { id: 1, category: "Food", allocated: 5000, spent: 3200, remaining: 1800, status: "Reimbursed", date: "2025-09-01" },
  { id: 2, category: "Transportation", allocated: 3000, spent: 2800, remaining: 200, status: "Pending Reimbursement", date: "2025-09-05" },
];

const statusColors = {
  "Reimbursed": { text: "#10B981" },
  "Pending Reimbursement": { text: "#F97316" },
};

function getInitials(category) {
  return category.split(" ").map((n) => n[0]).join("").toUpperCase();
}

const Budgetings = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // ✅ detect mobile

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [budgetData] = useState(budgets);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredBudgets = budgetData.filter((budget) => {
    const matchesFilter = filter === "All" || budget.status === filter;
    const matchesSearch = budget.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalReimbursed = budgetData.filter((b) => b.status === "Reimbursed").length;
  const totalPending = budgetData.filter((b) => b.status === "Pending Reimbursement").length;
  const totalAllocated = budgetData.reduce((sum, budget) => sum + budget.allocated, 0);

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleView = (budget) => {
    setSelectedBudget(budget);
    setOpenDialog(true);
  };

  const handleOpenReportDialog = () => setOpenReportDialog(true);

//   const handleDownloadReport = () => {
//     if (!fromDate || !toDate) {
//       alert("Please select both From and To dates!");
//       return;
//     }
//     alert(`Downloading report from ${fromDate} to ${toDate}`);
//     setOpenReportDialog(false);
//     setFromDate("");
//     setToDate("");
//   };

const handleDownloadReport = () => {
  if (!fromDate || !toDate) {
    alert("Please select both From and To dates!");
    return;
  }

  const filteredData = budgetData.filter((budget) => {
    const budgetDate = new Date(budget.date);
    return budgetDate >= fromDate && budgetDate <= toDate;
  });

  if (filteredData.length === 0) {
    alert("No data found for the selected date range.");
    return;
  }

  const csvContent = [
    ["Category", "Allocated", "Spent", "Remaining", "Date", "Status"],
    ...filteredData.map((b) => [
      b.category,
      b.allocated,
      b.spent,
      b.remaining,
      b.date,
      b.status,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `budget_report_${fromDate.toISOString().split("T")[0]}_to_${toDate.toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  

 

  return (
    <Box sx={{ width: "100%", fontFamily: "Inter, sans-serif", bgcolor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      {/* Status Chips */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label={`${totalReimbursed} Reimbursed`}
            size="small"
            sx={{ bgcolor: "rgba(16,185,129,0.1)", color: statusColors["Reimbursed"].text, fontWeight: 600, borderRadius: "8px" }}
          />
          <Chip
            label={`${totalPending} Pending`}
            size="small"
            sx={{ bgcolor: "rgba(249,115,22,0.1)", color: statusColors["Pending Reimbursement"].text, fontWeight: 600, borderRadius: "8px" }}
          />
          <Chip
            label={`${formatCurrency(totalAllocated)} Total Budget`}
            size="small"
            sx={{ bgcolor: "rgba(102,126,234,0.1)", color: theme.palette.primary.main, fontWeight: 600, borderRadius: "8px" }}
          />
        </Box>
      </Box>

      {/* Search / Filter / Actions */}
      <FilterToolbar sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between", gap: 2 }}>
        <StyledTextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category..."
          size="small"
          fullWidth
          sx={{ flexGrow: 1, maxWidth: { md: "500px" } }}
          InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
        />
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, gap: 2, width: { xs: "100%", md: "auto" } }}>
          <StyledFormControl size="small" sx={{ minWidth: 200 }}>
            <StyledSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Reimbursed">Reimbursed</MenuItem>
              <MenuItem value="Pending Reimbursement">Pending Reimbursement</MenuItem>
            </StyledSelect>
          </StyledFormControl>
          <Button
            onClick={handleOpenReportDialog}
            startIcon={<Download />}
            sx={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "white", px: 3, py: 1.2, borderRadius: "10px", fontWeight: 600, textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)" } }}
          >
            Reports
          </Button>
        </Box>
      </FilterToolbar>

      {/* Table / Mobile Cards */}
      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {filteredBudgets.length > 0 ? filteredBudgets.map((budget) => (
            <Box key={budget.id} sx={{ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: "white" }}>
                  {getInitials(budget.category)}
                </Avatar>
                <Typography fontWeight={600}>{budget.category}</Typography>
              </Box>
              <Typography><b>Allocated:</b> {formatCurrency(budget.allocated)}</Typography>
              <Typography><b>Spent:</b> {formatCurrency(budget.spent)}</Typography>
              <Typography sx={{ color: budget.remaining < 0 ? theme.palette.error.main : theme.palette.success.main }}>
                <b>Remaining:</b> {formatCurrency(budget.remaining)}
              </Typography>
              <Typography><b>Date:</b> {budget.date}</Typography>
              <Typography sx={{ color: statusColors[budget.status]?.text || theme.palette.text.primary }}><b>Status:</b> {budget.status}</Typography>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Tooltip title="View budget details">
                  <IconButton size="small" sx={{ color: theme.palette.primary.main }} onClick={() => handleView(budget)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )) : (
            <Typography color="text.secondary" textAlign="center" mt={2}>No budgets found.</Typography>
          )}
        </Box>
      ) : (
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[100] }}>
                {["Category", "Allocated", "Spent", "Remaining", "Date", "Status", "Actions"].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 600, fontSize: 13, color: theme.palette.text.secondary, py: 1.5, textTransform: "uppercase" }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBudgets.map((budget) => (
                <TableRow key={budget.id} hover>
                  <TableCell sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: "white" }}>
                        {getInitials(budget.category)}
                      </Avatar>
                      <Typography fontWeight={600}>{budget.category}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                  <TableCell>{formatCurrency(budget.spent)}</TableCell>
                  <TableCell sx={{ color: budget.remaining < 0 ? theme.palette.error.main : theme.palette.success.main }}>
                    {formatCurrency(budget.remaining)}
                  </TableCell>
                  <TableCell>{budget.date}</TableCell>
                  <TableCell sx={{ color: statusColors[budget.status]?.text || theme.palette.text.primary }}>{budget.status}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View budget details">
                        <IconButton size="small" sx={{ color: theme.palette.primary.main }} onClick={() => handleView(budget)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}

      {/* Budget Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Budget Details</DialogTitle>
        <DialogContent dividers>
          {selectedBudget && (
            <Box>
              <Typography variant="body1"><b>Category:</b> {selectedBudget.category}</Typography>
              <Typography variant="body1"><b>Allocated:</b> {formatCurrency(selectedBudget.allocated)}</Typography>
              <Typography variant="body1"><b>Spent:</b> {formatCurrency(selectedBudget.spent)}</Typography>
              <Typography variant="body1"><b>Remaining:</b> {formatCurrency(selectedBudget.remaining)}</Typography>
              <Typography variant="body1"><b>Status:</b> {selectedBudget.status}</Typography>
              <Typography variant="body1"><b>Date:</b> {selectedBudget.date}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Report Date Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
        

<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
  <DatePicker
    label="From Date"
    value={fromDate}
    onChange={(newValue) => setFromDate(newValue)}
    inputFormat="dd/MM/yyyy"
    renderInput={(params) => <TextField {...params} fullWidth />}
  />
  <DatePicker
    label="To Date"
    value={toDate}
    onChange={(newValue) => setToDate(newValue)}
    inputFormat="dd/MM/yyyy"
    renderInput={(params) => <TextField {...params} fullWidth />}
  />
</LocalizationProvider>



          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDownloadReport}>Download</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgetings;
