import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { Download, CalendarToday } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TabButtonsWithReport = ({ activeTab, setActiveTab, budgets, expenses }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Format date as "27 Sep 2025"
    const formatDate = (date) => {
        if (!date) return "N/A";
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return new Date(date).toLocaleDateString("en-GB", options);
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Add company logo (with error handling)
            try {
                const logo = "/image.png"; // must be in public folder
                doc.addImage(logo, "PNG", 14, 15, 40, 15);
            } catch (logoError) {
                console.warn("Logo not found, continuing without logo");
            }

            // Default date range: current month if no dates selected
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const start = startDate ? new Date(startDate) : firstDayOfMonth;
            const end = endDate ? new Date(endDate) : lastDayOfMonth;

            // Ensure end date includes time for proper comparison
            end.setHours(23, 59, 59, 999);

            let filteredData = [];
            if (activeTab === "budget") {
                filteredData = budgets.filter((b) => {
                    if (!b || !b.createdAt) return false;
                    const date = new Date(b.createdAt);
                    return date >= start && date <= end;
                });
            } else {
                filteredData = expenses.filter((e) => {
                    if (!e || !e.createdAt) return false;
                    const date = new Date(e.createdAt);
                    return date >= start && date <= end;
                });
            }

            let columns = [];
            let rows = [];

            if (activeTab === "budget") {
                columns = ["ID", "Username", "Allocated Amount", "Spent Amount", "Remaining", "Date"];
                rows = filteredData.map((b, index) => [
                    (index + 1).toString(),
                    b.user?.name || "N/A",
                    `₹${(b.allocatedAmount || 0).toLocaleString()}`,
                    `₹${(b.spentAmount || 0).toLocaleString()}`,
                    `₹${((b.allocatedAmount || 0) - (b.spentAmount || 0)).toLocaleString()}`,
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

                if (filteredData.length > 0) {
                    rows.push([
                        "",
                        "TOTAL",
                        `₹${totalAllocated.toLocaleString()}`,
                        `₹${totalSpent.toLocaleString()}`,
                        `₹${totalRemaining.toLocaleString()}`,
                        "",
                    ]);
                }
            } else {
                columns = ["ID", "Username", "Expense Amount", "Reimbursed", "Status", "Date"];
                rows = filteredData.map((e, index) => [
                    (index + 1).toString(),
                    e.user?.name || "N/A",
                    `₹${(e.amount || 0).toLocaleString()}`,
                    e.isReimbursed ? "Yes" : "No",
                    e.isReimbursed ? "Completed" : "Pending",
                    formatDate(e.createdAt),
                ]);

                // Totals
                const totalAmount = filteredData.reduce((acc, e) => acc + (e.amount || 0), 0);
                const totalReimbursed = filteredData.reduce(
                    (acc, e) => acc + (e.isReimbursed ? (e.amount || 0) : 0),
                    0
                );
                const totalPending = totalAmount - totalReimbursed;

                if (filteredData.length > 0) {
                    rows.push([
                        "",
                        "TOTAL",
                        `₹${totalAmount.toLocaleString()}`,
                        `Reimbursed: ₹${totalReimbursed.toLocaleString()}`,
                        `Pending: ₹${totalPending.toLocaleString()}`,
                        "",
                    ]);
                }
            }

            // Header
            doc.setFontSize(20);
            doc.setFont(undefined, "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("DEMANDCURVE", 105, 25, { align: "center" });

            doc.setFontSize(12);
            doc.setFont(undefined, "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("TALENT INTERPRETED", 105, 32, { align: "center" });

            // Report Title
            doc.setFontSize(16);
            doc.setFont(undefined, "bold");
            doc.setTextColor(40, 40, 40);
            doc.text(`${activeTab === "budget" ? "Budget" : "Expense"} Report`, 105, 45, { align: "center" });

            // Date range
            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`Date Range: ${formatDate(start)} - ${formatDate(end)}`, 14, 55);
            doc.text(`Generated on: ${formatDate(today)}`, 14, 62);
            doc.text(`Total Records: ${filteredData.length}`, 14, 69);

            // Add separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 75, 196, 75);

            // Dataset Report Section
            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("Dataset Report", 14, 85);

            // Summary table
            const summaryData = [];
            if (activeTab === "budget") {
                const totalAllocated = filteredData.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
                summaryData.push(
                    ["Description", "Report Type", "Total Amount", "Number of Records"],
                    ["Budget Report", "Budget Report", `₹${totalAllocated.toLocaleString()}`, filteredData.length.toString()]
                );
            } else {
                const totalAmount = filteredData.reduce((acc, e) => acc + (e.amount || 0), 0);
                summaryData.push(
                    ["Description", "Report Type", "Total Amount", "Number of Records"],
                    ["Expense Report", "Expense Report", `₹${totalAmount.toLocaleString()}`, filteredData.length.toString()]
                );
            }

            autoTable(doc, {
                startY: 90,
                head: [summaryData[0]],
                body: [summaryData[1]],
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                margin: { left: 14, right: 14 }
            });

            // Settings Section
            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("Settings", 14, doc.lastAutoTable.finalY + 15);

            // Main data table
            if (rows.length > 0) {
                autoTable(doc, {
                    startY: doc.lastAutoTable.finalY + 20,
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
                        cellPadding: 4,
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245],
                    },
                    margin: { left: 14, right: 14 },
                    pageBreak: 'auto'
                });
            } else {
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text("No data found for the selected date range", 14, doc.lastAutoTable.finalY + 20);
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
                doc.text('Generated by DemandCurve Talent Management System', 105, 290, { align: 'center' });
            }

            // Save the PDF
            doc.save(`${activeTab}-report-${new Date().toISOString().split("T")[0]}.pdf`);

            // Reset dates after report generation
            setStartDate("");
            setEndDate("");

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error exporting PDF. Please check the console for details and try again.');
        }
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


            </Box>
        </Paper>
    );
};

export default TabButtonsWithReport;