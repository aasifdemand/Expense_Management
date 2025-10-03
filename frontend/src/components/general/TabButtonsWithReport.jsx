import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TabButtonsWithReport = ({ activeTab, setActiveTab, budgets, expenses }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Format date as "27 Sep 2025"
    const formatDate = (date) => {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return new Date(date).toLocaleDateString("en-GB", options);
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Add company logo
        const logo = "/image.png"; // must be in public folder
        doc.addImage(logo, "PNG", 14, 15, 40, 15);

        // Default date range: yesterday -> today
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const start = startDate ? new Date(startDate) : yesterday;
        const end = endDate ? new Date(endDate) : today;

        let filteredData = [];
        if (activeTab === "budget") {
            filteredData = budgets.filter((b) => {
                const date = new Date(b.createdAt);
                return date >= start && date <= end;
            });
        } else {
            filteredData = expenses.filter((e) => {
                const date = new Date(e.createdAt);
                return date >= start && date <= end;
            });
        }

        let columns = [];
        let rows = [];

        if (activeTab === "budget") {
            columns = ["ID", "Username", "Allocated Amount", "Spent Amount", "Remaining", "Date"];
            rows = filteredData.map((b, index) => [
                index + 1,
                b.user?.name || "N/A",
                `Rs. ${b.allocatedAmount?.toLocaleString() || 0}`,
                `Rs. ${b.spentAmount?.toLocaleString() || 0}`,
                `Rs. ${(b.allocatedAmount - b.spentAmount)?.toLocaleString() || 0}`,
                formatDate(b.createdAt),
            ]);

            // Totals
            const totalAllocated = filteredData.reduce(
                (acc, b) => acc + (b.allocatedAmount || 0),
                0
            );
            const totalSpent = filteredData.reduce(
                (acc, b) => acc + (b.spentAmount || 0),
                0
            );
            const totalRemaining = totalAllocated - totalSpent;
            rows.push([
                "",
                "TOTAL",
                `Rs. ${totalAllocated.toLocaleString()}`,
                `Rs. ${totalSpent.toLocaleString()}`,
                `Rs. ${totalRemaining.toLocaleString()}`,
                "",
            ]);
        } else {
            columns = ["ID", "Username", "Expense Amount", "Reimbursed", "Status", "Date"];
            rows = filteredData.map((e, index) => [
                index + 1,
                e.user?.name || "N/A",
                `Rs. ${e.amount?.toLocaleString() || 0}`,
                e.isReimbursed ? "Yes" : "No",
                e.isReimbursed ? "Completed" : "Pending",
                formatDate(e.createdAt),
            ]);

            // Totals
            const totalAmount = filteredData.reduce((acc, e) => acc + (e.amount || 0), 0);
            const totalReimbursed = filteredData.reduce(
                (acc, e) => acc + (e.isReimbursed ? e.amount : 0),
                0
            );
            const totalPending = totalAmount - totalReimbursed;
            rows.push([
                "",
                "TOTAL",
                `Rs. ${totalAmount.toLocaleString()}`,
                `Reimbursed: Rs. ${totalReimbursed.toLocaleString()}`,
                `Pending: Rs. ${totalPending.toLocaleString()}`,
                "",
            ]);
        }

        // Header
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text(`${activeTab === "budget" ? "Budget" : "Expense"} Report`, 14, 45);

        // Date range (✅ fixed start/end showing correctly)
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(`Date Range: ${formatDate(start)} - ${formatDate(end)}`, 14, 52);
        doc.text(`Generated on: ${formatDate(today)}`, 14, 58);

        autoTable(doc, {
            startY: 65,
            head: [columns],
            body: rows,
            theme: "grid",
            headStyles: {
                fillColor: [33, 150, 243],
                textColor: 255,
                fontStyle: "bold",
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 10 },
        });

        doc.save(`${activeTab}-report-${new Date().toISOString().split("T")[0]}.pdf`);

        // ✅ Reset dates after report generation
        setStartDate("");
        setEndDate("");
    };

    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                mb: 1,
                borderRadius: 1,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                width: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", md: "center" },
                    gap: 3,
                    width: "100%",
                }}
            >
                {/* Tabs Section */}
                <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 40%" } }}>
                    <Typography
                        variant="h5"
                        sx={{ mb: 2, color: "text.primary", fontWeight: "700" }}
                    >
                        Recents
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            variant={activeTab === "budget" ? "contained" : "outlined"}
                            color="primary"
                            sx={{
                                borderRadius: "8px",
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: "600",
                                fontSize: "0.975rem",
                                boxShadow: activeTab === "budget" ? 2 : 0,
                                minWidth: "100px",
                            }}
                            onClick={() => setActiveTab("budget")}
                        >
                            Budgets
                        </Button>
                        <Button
                            variant={activeTab === "expense" ? "contained" : "outlined"}
                            color="secondary"
                            sx={{
                                borderRadius: "8px",
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: "600",
                                fontSize: "0.975rem",
                                boxShadow: activeTab === "expense" ? 2 : 0,
                                minWidth: "100px",
                            }}
                            onClick={() => setActiveTab("expense")}
                        >
                            Expenses
                        </Button>
                    </Box>
                </Box>

                {/* Report Generation Section */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        alignItems: { xs: "stretch", sm: "center" },
                        flex: { xs: "1 1 100%", md: "0 0 60%" },
                        width: "100%",
                        px: 5,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flex: 1,
                            flexDirection: { xs: "column", sm: "row" },
                        }}
                    >
                        {/* <TextField
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarToday sx={{ fontSize: 16 }} />
                                    Start Date
                                </Box>
                            }
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                flex: 1,
                                bgcolor: "background.paper",
                                borderRadius: 1,
                                "& .MuiOutlinedInput-root": { borderRadius: "8px", paddingY: 1 },
                            }}
                            size="small"
                        />
                        <TextField
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarToday sx={{ fontSize: 16 }} />
                                    End Date
                                </Box>
                            }
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                flex: 1,
                                bgcolor: "background.paper",
                                borderRadius: 1,
                                "& .MuiOutlinedInput-root": { borderRadius: "8px", paddingY: 1 },
                            }}
                            size="small"
                        /> */}
                    </Box>
                    {/* <Button
                        variant="contained"
                        color="success"
                        startIcon={<Download />}
                        sx={{
                            borderRadius: "8px",
                            px: 3,
                            py: 2,
                            textTransform: "none",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                            boxShadow: 2,
                            minWidth: "180px",
                            "&:hover": { boxShadow: 4 },
                            flexShrink: 0,
                        }}
                        onClick={generatePDF}
                        disabled={!startDate || !endDate}
                    >
                        Generate Report
                    </Button> */}
                </Box>
            </Box>
        </Paper >
    );
};

export default TabButtonsWithReport;
