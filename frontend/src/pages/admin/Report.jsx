import { useState, useEffect } from 'react';
import { getStyles } from '../../styles/report.style';
import { useMediaQuery } from '@mui/material';
import { useBudgeting } from '../../hooks/useBudgeting';
import { useExpenses } from '../../hooks/useExpenses';
import { useSelector } from 'react-redux';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const Reports = () => {
    const { allBudgets, budgets } = useBudgeting();
    const { allExpenses, expenses } = useExpenses();
    const { reimbursements } = useSelector((state) => state?.reimbursement);
    const { departments: reduxDeps } = useSelector((state) => state.department);

    // Debug logging to see what data we have
    console.log('Redux Data:', {
        allBudgets: allBudgets,
        budgets: budgets,
        allExpenses: allExpenses,
        expenses: expenses,
        reimbursements: reimbursements,
        reduxDeps: reduxDeps
    });

    // Get current date for proper date initialization
    const getCurrentDateRange = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Get first day of current month
        const startDate = new Date(currentYear, currentMonth, 1);
        // Get last day of current month
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    };

    const [filter, setFilter] = useState({
        type: 'expenses',
        department: 'all',
        reimbursementStatus: 'all',
        dateRange: getCurrentDateRange()
    });

    const [generatedReport, setGeneratedReport] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [loading, setLoading] = useState(false);

    const isMobile = useMediaQuery('(max-width:768px)');
    const styles = getStyles(isMobile);

    // Get departments from Redux store
    const departments = ['all', ...(reduxDeps?.map(dept => dept.name) || [])];

    const reimbursementStatuses = ['all', 'paid', 'unpaid'];

    const reportTypes = [
        { value: 'expenses', label: 'Expense Report', icon: '📊' },
        { value: 'budgets', label: 'Budget Report', icon: '💰' },
        { value: 'reimbursement', label: 'Reimbursement Summary', icon: '💳' },
        { value: 'comparison', label: 'Budget vs Expense', icon: '⚖️' }
    ];

    useEffect(() => {
        setAnimationClass('fade-in');
        setTimeout(() => setAnimationClass(''), 1000);
    }, []);

    const getReportTypeLabel = (type) => {
        const foundType = reportTypes.find(t => t.value === type);
        return foundType ? foundType.label : type.charAt(0).toUpperCase() + type.slice(1);
    };

    const resetFilters = () => {
        setFilter({
            type: 'expenses',
            department: 'all',
            reimbursementStatus: 'all',
            dateRange: getCurrentDateRange()
        });
        setGeneratedReport(null);
        setAnimationClass('fade-out');
        setTimeout(() => setAnimationClass(''), 800);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const exportPDF = () => {
        try {
            if (!generatedReport) {
                alert('No report generated to export');
                return;
            }

            setAnimationClass('bounce');
            setTimeout(() => setAnimationClass(''), 800);

            const doc = new jsPDF();

            // Add company logo (with error handling)
            try {
                const logo = "/image.png"; // must be in public folder
                doc.addImage(logo, "PNG", 14, 15, 40, 15);
            } catch (logoError) {
                console.warn("Logo not found, continuing without logo");
            }

            // Title Section
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text('DEMANDCURVE', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            doc.text('TALENT INTERPRETED', 105, 28, { align: 'center' });

            // Report Title
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text(generatedReport.title || 'Report', 105, 45, { align: 'center' });

            // Report details
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated on ${formatDate(new Date())} • Department: ${generatedReport.department || 'All'} • ${generatedReport.items?.length || 0} records found`, 105, 52, { align: 'center' });

            // Add separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 58, 196, 58);

            // Dataset Report Section
            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text('Dataset Report', 14, 70);

            // Summary table - Fixed for all report types
            const summaryData = [];
            let totalAmount = 0;

            if (generatedReport.type === 'expenses') {
                totalAmount = generatedReport.totalAmount || generatedReport.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Amount', 'Number of Records'],
                    ['Expense Report', getReportTypeLabel(generatedReport.type), `${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'budgets') {
                totalAmount = generatedReport.totalAmount || generatedReport.items?.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Amount', 'Number of Records'],
                    ['Budget Report', getReportTypeLabel(generatedReport.type), `${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'reimbursement') {
                totalAmount = generatedReport.totalAmount || generatedReport.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Amount', 'Number of Records'],
                    ['Reimbursement Report', getReportTypeLabel(generatedReport.type), `${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'comparison') {
                totalAmount = generatedReport.summary?.totalBudget || generatedReport.items?.reduce((sum, item) => sum + (item.totalBudget || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Budget', 'Number of Records'],
                    ['Budget vs Expense Report', getReportTypeLabel(generatedReport.type), `${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            }

            // Use autoTable correctly - same as in generatePDF
            autoTable(doc, {
                startY: 75,
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
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text('Settings', 14, doc.lastAutoTable.finalY + 15);

            let columns = [];
            let rows = [];

            // Define data based on report type - with proper null checks
            if (!generatedReport.items || generatedReport.items.length === 0) {
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text("No data available for this report", 14, doc.lastAutoTable.finalY + 25);
            } else {
                if (generatedReport.type === 'expenses') {
                    columns = ["ID", "Description", "Department", "Date", "Amount", "User", "Payment Mode"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.description || "N/A",
                            item.department || "N/A",
                            item.date ? formatDate(item.date) : "N/A",
                            `${(item.amount || 0)}`,
                            item.user || "Unknown",
                            item.paymentMode || "N/A"
                        ]);
                    });
                }
                else if (generatedReport.type === 'budgets') {
                    columns = ["ID", "Name", "Month", "Year", "Allocated", "Spent", "Remaining"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.user || "N/A",
                            item.month?.toString() || "N/A",
                            item.year?.toString() || "N/A",
                            `${(item.allocatedAmount || 0)}`,
                            `${(item.spentAmount || 0)}`,
                            `${(item.remainingAmount || 0)}`
                        ]);
                    });
                }
                else if (generatedReport.type === 'reimbursement') {
                    columns = ["ID", "Requested By", "Amount", "Status", "Date"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.requestedBy || "N/A",
                            `${(item.amount || 0)}`,
                            item.status === 'paid' ? 'Paid' : 'Unpaid',
                            item.date ? formatDate(item.date) : "N/A"
                        ]);
                    });
                }
                else if (generatedReport.type === 'comparison') {
                    columns = ["Department", "Total Budget", "Total Expense"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            item.department || "N/A",
                            `${(item.totalBudget || 0)}`,
                            `${(item.totalExpense || 0)}`
                        ]);
                    });
                }

                // Add main data table using autoTable correctly
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
                }
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
            doc.save(`${generatedReport.type}_report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting PDF. Please check the console for details and try again.');
        }
    };

    // Export to CSV
    const exportCSV = () => {
        if (!generatedReport) {
            alert('No report generated to export');
            return;
        }

        setAnimationClass('pulse');
        setTimeout(() => setAnimationClass(''), 500);

        try {
            let csvContent = '';
            const headers = [];
            const rows = [];

            // Define headers and rows based on report type
            if (generatedReport.type === 'expenses') {
                headers.push('ID', 'Description', 'Department', 'Date', 'Amount', 'User', 'Payment Mode');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.description || 'N/A'}"`,
                        `"${item.department || 'N/A'}"`,
                        item.date || 'N/A',
                        item.amount || 0,
                        `"${item.user || 'Unknown'}"`,
                        `"${item.paymentMode || 'N/A'}"`
                    ]);
                });
            } else if (generatedReport.type === 'budgets') {
                headers.push('ID', 'Name', 'Month', 'Year', 'Allocated', 'Spent', 'Remaining');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.user || 'N/A'}"`,
                        item.month || '',
                        item.year || '',
                        item.allocatedAmount || 0,
                        item.spentAmount || 0,
                        item.remainingAmount || 0
                    ]);
                });
            } else if (generatedReport.type === 'reimbursement') {
                headers.push('ID', 'Requested By', 'Amount', 'Status', 'Date');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.requestedBy || 'N/A'}"`,
                        item.amount || 0,
                        item.status || 'unpaid',
                        item.date || 'N/A'
                    ]);
                });
            } else if (generatedReport.type === 'comparison') {
                headers.push('Department', 'Total Budget', 'Total Expense');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        `"${item.department || 'N/A'}"`,
                        item.totalBudget || 0,
                        item.totalExpense || 0
                    ]);
                });
            }

            // Add report summary
            csvContent += `DEMANDCURVE - TALENT INTERPRETED\n`;
            csvContent += `${generatedReport.title}\n`;
            csvContent += `Generated on: ${formatDate(new Date())}\n`;
            csvContent += `Department: ${generatedReport.department}\n`;
            csvContent += `Total Records: ${generatedReport.items.length}\n\n`;

            // Dataset Report Section
            csvContent += `Dataset Report\n`;
            if (generatedReport.type === 'comparison') {
                csvContent += `Description,Report Type,Total Budget,Number of Records\n`;
                csvContent += `${generatedReport.title},${getReportTypeLabel(generatedReport.type)},₹${generatedReport.summary.totalBudget?.toLocaleString() || '0'},${generatedReport.items.length}\n\n`;
            } else {
                csvContent += `Description,Report Type,Total Amount,Number of Records\n`;
                csvContent += `${generatedReport.title},${getReportTypeLabel(generatedReport.type)},₹${generatedReport.totalAmount?.toLocaleString() || '0'},${generatedReport.items.length}\n\n`;
            }

            // Settings Section
            csvContent += `Settings\n`;

            // Add headers
            csvContent += headers.join(',') + '\n';

            // Add rows
            rows.forEach(row => {
                csvContent += row.join(',') + '\n';
            });

            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${generatedReport.type}_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('CSV export error:', error);
            alert('Error exporting CSV. Please try again.');
        }
    };

    // Filter data based on date range
    const filterByDateRange = (items) => {
        if (!items || !Array.isArray(items)) {
            console.log('No items to filter or items is not an array:', items);
            return [];
        }

        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        const filtered = items.filter(item => {
            if (!item) return false;

            // Handle different date fields in your data
            const itemDate = new Date(item.date || item.createdAt || item.submittedAt || item.updatedAt);
            if (isNaN(itemDate.getTime())) {
                console.log('Invalid date for item:', item);
                return false;
            }

            return itemDate >= startDate && itemDate <= endDate;
        });

        console.log(`Filtered ${items.length} items to ${filtered.length} items by date range`);
        return filtered;
    };

    // Filter by department
    const filterByDepartment = (items) => {
        if (filter.department === 'all' || !filter.department) {
            return items;
        }

        const filtered = items.filter(item => {
            if (!item) return false;

            // Handle different department structures
            const deptName = item.department?.name || item.department || item.user?.department;
            return deptName?.toLowerCase() === filter.department.toLowerCase();
        });

        console.log(`Filtered to ${filtered.length} items by department: ${filter.department}`);
        return filtered;
    };

    // Get actual data from hooks/Redux - IMPROVED
    const getActualData = () => {
        // Use the data from hooks that actually contains data
        const budgetData = Array.isArray(allBudgets) && allBudgets.length > 0 ? allBudgets :
            Array.isArray(budgets) && budgets.length > 0 ? budgets : [];

        const expenseData = Array.isArray(allExpenses) && allExpenses.length > 0 ? allExpenses :
            Array.isArray(expenses) && expenses.length > 0 ? expenses : [];

        const reimbursementData = Array.isArray(reimbursements) && reimbursements.length > 0 ? reimbursements : [];

        console.log('Actual data counts:', {
            budgets: budgetData.length,
            expenses: expenseData.length,
            reimbursements: reimbursementData.length
        });

        return { budgetData, expenseData, reimbursementData };
    };

    // Get current month and year for display
    const getCurrentMonthYear = () => {
        const today = new Date();
        return {
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear()
        };
    };

    // Generate expense report
    const generateExpenseReport = () => {
        const { expenseData } = getActualData();
        console.log('Generating expense report with data:', expenseData);

        let filteredExpenses = filterByDateRange(expenseData);
        filteredExpenses = filterByDepartment(filteredExpenses);

        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Expense Report - ${month} ${year}`,
            type: 'expenses',
            department: filter.department === 'all' ? 'All Departments' : filter.department,
            date: new Date().toISOString(),
            totalAmount,
            items: filteredExpenses.map(expense => ({
                id: expense._id || expense.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
                description: expense.description || 'No description',
                department: expense.department?.name || expense.department || 'General',
                date: formatDate(expense.date || expense.createdAt),
                amount: expense.amount || 0,
                user: expense.user?.name || expense.user?.username || 'Unknown User',
                paymentMode: expense.paymentMode || 'Cash'
            })),
            summary: {
                totalReports: filteredExpenses.length,
                averageAmount,
                totalAmount
            }
        };

        console.log('Generated expense report:', report);
        return report;
    };

    // Generate budget report - Department disabled for budget reports
    const generateBudgetReport = () => {
        const { budgetData } = getActualData();
        console.log('Generating budget report with data:', budgetData);

        let filteredBudgets = filterByDateRange(budgetData);
        // For budget reports, we don't filter by department since budgets are usually global
        // filteredBudgets = filterByDepartment(filteredBudgets);

        const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + (budget.allocatedAmount || 0), 0);
        const totalSpent = filteredBudgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
        const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + (budget.remainingAmount || 0), 0);

        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Budget Report - ${month} ${year}`,
            type: 'budgets',
            department: 'All Departments', // Always show "All Departments" for budget reports
            date: new Date().toISOString(),
            totalAmount: totalAllocated,
            items: filteredBudgets.map(budget => ({
                id: budget._id || budget.id || `budget-${Math.random().toString(36).substr(2, 9)}`,
                user: budget.user?.name || budget.user?.username || 'System',
                month: budget.month || new Date().getMonth() + 1,
                year: budget.year || new Date().getFullYear(),
                allocatedAmount: budget.allocatedAmount || 0,
                spentAmount: budget.spentAmount || 0,
                remainingAmount: budget.remainingAmount || 0,
                type: budget.type || 'Monthly'
            })),
            summary: {
                totalReports: filteredBudgets.length,
                averageAmount: filteredBudgets.length > 0 ? totalAllocated / filteredBudgets.length : 0,
                totalAllocated,
                totalSpent,
                totalRemaining
            }
        };

        console.log('Generated budget report:', report);
        return report;
    };

    // Generate reimbursement report
    const generateReimbursementReport = () => {
        const { reimbursementData } = getActualData();
        console.log('Generating reimbursement report with data:', reimbursementData);

        let filteredReimbursements = filterByDateRange(reimbursementData);
        filteredReimbursements = filterByDepartment(filteredReimbursements);

        // Filter by reimbursement status using isReimbursed field
        if (filter.reimbursementStatus !== 'all') {
            filteredReimbursements = filteredReimbursements.filter(reimb => {
                if (filter.reimbursementStatus === 'paid') {
                    return reimb.isReimbursed === true;
                } else if (filter.reimbursementStatus === 'unpaid') {
                    return reimb.isReimbursed === false || reimb.isReimbursed === undefined;
                }
                return true;
            });
        }

        const totalAmount = filteredReimbursements.reduce((sum, reimb) => sum + (reimb.amount || 0), 0);
        const paidAmount = filteredReimbursements
            .filter(reimb => reimb.isReimbursed === true)
            .reduce((sum, reimb) => sum + (reimb.amount || 0), 0);
        const unpaidAmount = filteredReimbursements
            .filter(reimb => reimb.isReimbursed === false || reimb.isReimbursed === undefined)
            .reduce((sum, reimb) => sum + (reimb.amount || 0), 0);
        const averageAmount = filteredReimbursements.length > 0 ? totalAmount / filteredReimbursements.length : 0;

        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Reimbursement Report - ${month} ${year}`,
            type: 'reimbursement',
            reimbursementStatus: filter.reimbursementStatus,
            date: new Date().toISOString(),
            totalAmount,
            items: filteredReimbursements.map(reimb => ({
                id: reimb._id || reimb.id || `reimb-${Math.random().toString(36).substr(2, 9)}`,
                requestedBy: reimb.requestedBy?.name || reimb.user?.name || 'Unknown Employee',
                amount: reimb.amount || 0,
                status: reimb.isReimbursed ? 'paid' : 'unpaid',
                date: formatDate(reimb.createdAt || reimb.date)
            })),
            summary: {
                totalReports: filteredReimbursements.length,
                averageAmount,
                totalAmount,
                paidAmount,
                unpaidAmount
            }
        };

        console.log('Generated reimbursement report:', report);
        return report;
    };

    // Generate comparison report
    const generateComparisonReport = () => {
        const { budgetData, expenseData } = getActualData();
        console.log('Generating comparison report with data:', { budgetData, expenseData });

        const filteredBudgets = filterByDateRange(budgetData);
        const filteredExpenses = filterByDateRange(expenseData);

        // Group by department and calculate totals
        const departmentStats = {};

        // Process budgets by department
        filteredBudgets.forEach(budget => {
            const dept = budget.department?.name || budget.department || budget.user?.department || 'General';
            if (!departmentStats[dept]) {
                departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
            }
            departmentStats[dept].totalBudget += budget.allocatedAmount || 0;
        });

        // Process expenses by department
        filteredExpenses.forEach(expense => {
            const dept = expense.department?.name || expense.department || 'General';
            if (!departmentStats[dept]) {
                departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
            }
            departmentStats[dept].totalExpense += expense.amount || 0;
        });

        // Convert to array
        const items = Object.entries(departmentStats).map(([department, stats]) => {
            return {
                id: department,
                title: 'Budget Utilization',
                department,
                date: `${filter.dateRange.start} to ${filter.dateRange.end}`,
                totalBudget: stats.totalBudget,
                totalExpense: stats.totalExpense
            };
        });

        const totalBudget = items.reduce((sum, item) => sum + (item.totalBudget || 0), 0);
        const totalExpense = items.reduce((sum, item) => sum + (item.totalExpense || 0), 0);

        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Budget vs Expense Report - ${month} ${year}`,
            type: 'comparison',
            department: filter.department === 'all' ? 'All Departments' : filter.department,
            date: new Date().toISOString(),
            totalAmount: totalExpense,
            items,
            summary: {
                totalBudget,
                totalExpense,
                budgetCount: filteredBudgets.length,
                expenseCount: filteredExpenses.length
            }
        };

        console.log('Generated comparison report:', report);
        return report;
    };

    const generateReport = async () => {
        setLoading(true);
        setAnimationClass('pulse');

        try {
            console.log('Generating report with filter:', filter);

            let report;

            switch (filter.type) {
                case 'expenses':
                    report = generateExpenseReport();
                    break;
                case 'budgets':
                    report = generateBudgetReport();
                    break;
                case 'reimbursement':
                    report = generateReimbursementReport();
                    break;
                case 'comparison':
                    report = generateComparisonReport();
                    break;
                default:
                    report = generateExpenseReport();
            }

            console.log('Final generated report:', report);
            setGeneratedReport(report);
            setAnimationClass('fade-in');
            setTimeout(() => setAnimationClass(''), 1000);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report. Please check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    const combineStyles = (baseStyle, additionalStyle) => {
        return additionalStyle ? { ...baseStyle, ...additionalStyle } : baseStyle;
    };

    const animationStyles = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        @keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0,-5px,0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .pulse { animation: pulse 0.3s ease-in-out; }
        .bounce { animation: bounce 0.5s ease-in-out; }
        .fade-out { animation: fadeOut 0.3s ease-out; }
        
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); }
        .hover-glow:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .summary-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        
        .disabled-select {
            background-color: #f8f9fa;
            color: #6c757d;
            cursor: not-allowed;
            opacity: 0.7;
        }
    `;

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = animationStyles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, [animationStyles]);

    return (
        <div style={styles.container} className={`${animationClass} responsive-container`}>
            <div style={styles.content}>
                {/* Report Generator Section */}
                <div style={styles.card} className="hover-lift">
                    <h2 style={styles.cardTitle}>📊 Report Generator</h2>

                    <div style={styles.filterGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>📋 Report Type</label>
                            <select
                                style={combineStyles(styles.filterSelect, styles.filterSelectFocus)}
                                value={filter.type}
                                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                className="hover-glow"
                            >
                                {reportTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>🏢 Department</label>
                            <select
                                style={combineStyles(
                                    styles.filterSelect,
                                    styles.filterSelectFocus,
                                    filter.type === 'budgets' ? { backgroundColor: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed', opacity: 0.7 } : {}
                                )}
                                value={filter.type === 'budgets' ? 'all' : filter.department}
                                onChange={(e) => {
                                    if (filter.type !== 'budgets') {
                                        setFilter({ ...filter, department: e.target.value })
                                    }
                                }}
                                className={filter.type === 'budgets' ? 'disabled-select' : 'hover-glow'}
                                disabled={filter.type === 'budgets'}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept.toLowerCase()}>
                                        {dept === 'all' ? 'All Departments' : dept}
                                    </option>
                                ))}
                            </select>
                            {filter.type === 'budgets' && (
                                <small style={{ color: '#6c757d', fontSize: '0.75rem', marginTop: '4px' }}>
                                    Department filter is disabled for Budget Reports
                                </small>
                            )}
                        </div>

                        {filter.type === 'reimbursement' && (
                            <div style={styles.filterGroup}>
                                <label style={styles.filterLabel}>💰 Reimbursement Status</label>
                                <select
                                    style={combineStyles(styles.filterSelect, styles.filterSelectFocus)}
                                    value={filter.reimbursementStatus}
                                    onChange={(e) => setFilter({ ...filter, reimbursementStatus: e.target.value })}
                                    className="hover-glow"
                                >
                                    {reimbursementStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'paid' ? '✅' : status === 'unpaid' ? '⏳' : '📋'} {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>📅 Date Range</label>
                            <div style={styles.dateRangeContainer}>
                                <div style={styles.dateRange}>
                                    <input
                                        type="date"
                                        style={combineStyles(styles.filterSelect, styles.filterSelectFocus)}
                                        value={filter.dateRange.start}
                                        onChange={(e) => setFilter({
                                            ...filter,
                                            dateRange: { ...filter.dateRange, start: e.target.value }
                                        })}
                                        className="hover-glow"
                                    />
                                    <span style={styles.dateRangeSpan}>to</span>
                                    <input
                                        type="date"
                                        style={combineStyles(styles.filterSelect, styles.filterSelectFocus)}
                                        value={filter.dateRange.end}
                                        onChange={(e) => setFilter({
                                            ...filter,
                                            dateRange: { ...filter.dateRange, end: e.target.value }
                                        })}
                                        className="hover-glow"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.actionButtons}>
                        <button
                            style={combineStyles(styles.button, styles.buttonPrimary)}
                            onClick={generateReport}
                            disabled={loading}
                            className="hover-lift"
                        >
                            {loading ? (
                                <>
                                    <div style={styles.loadingSpinner}></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    🎯 Generate Report
                                </>
                            )}
                        </button>
                        <button
                            style={combineStyles(styles.button, styles.buttonSecondary)}
                            onClick={resetFilters}
                            className="hover-lift"
                        >
                            🔄 Reset Filters
                        </button>
                    </div>
                </div>

                {/* Generated Report Section */}
                {generatedReport && (
                    <div style={styles.card} className={`hover-lift ${animationClass}`}>
                        <div style={styles.reportHeader}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#1e293b' }}>
                                    {generatedReport.title}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    Generated on {formatDate(generatedReport.date)} •
                                    {generatedReport.type === 'reimbursement' ?
                                        ` Status: ${generatedReport.reimbursementStatus}` :
                                        ` Department: ${generatedReport.department}`
                                    } • {generatedReport.items.length} records found
                                </p>
                            </div>
                            <div style={styles.reportActions}>
                                <button
                                    style={combineStyles(styles.button, styles.buttonSuccess)}
                                    onClick={exportCSV}
                                    className="hover-lift"
                                >
                                    📥 Download CSV
                                </button>
                                <button
                                    style={combineStyles(styles.button, styles.buttonPrimary)}
                                    onClick={exportPDF}
                                    className="hover-lift"
                                >
                                    📄 Export PDF
                                </button>
                            </div>
                        </div>

                        <div style={styles.reportSummary}>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Report Type</span>
                                <span style={styles.summaryValue}>{getReportTypeLabel(generatedReport.type)}</span>
                            </div>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Total Amount</span>
                                <span style={styles.summaryValue}>₹{generatedReport.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Number of Records</span>
                                <span style={styles.summaryValue}>{generatedReport.summary.totalReports}</span>
                            </div>

                            {generatedReport.type === 'comparison' && (
                                <>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Total Budget</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.totalBudget?.toLocaleString()}</span>
                                    </div>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Total Expense</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.totalExpense?.toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            {generatedReport.type === 'reimbursement' && (
                                <>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Paid Amount</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.paidAmount?.toLocaleString()}</span>
                                    </div>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Unpaid Amount</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.unpaidAmount?.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {generatedReport.items.length > 0 ? (
                            <div style={styles.reportTable}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {generatedReport.type === 'expenses' && (
                                                <>
                                                    <th style={styles.tableHeader}>ID</th>
                                                    <th style={styles.tableHeader}>Description</th>
                                                    <th style={styles.tableHeader}>Department</th>
                                                    <th style={styles.tableHeader}>Date</th>
                                                    <th style={styles.tableHeader}>Amount</th>
                                                    <th style={styles.tableHeader}>User</th>
                                                    <th style={styles.tableHeader}>Payment Mode</th>
                                                </>
                                            )}
                                            {generatedReport.type === 'budgets' && (
                                                <>
                                                    <th style={styles.tableHeader}>ID</th>
                                                    <th style={styles.tableHeader}>Name</th>
                                                    <th style={styles.tableHeader}>Month</th>
                                                    <th style={styles.tableHeader}>Year</th>
                                                    <th style={styles.tableHeader}>Allocated</th>
                                                    <th style={styles.tableHeader}>Spent</th>
                                                    <th style={styles.tableHeader}>Remaining</th>
                                                </>
                                            )}
                                            {generatedReport.type === 'reimbursement' && (
                                                <>
                                                    <th style={styles.tableHeader}>ID</th>
                                                    <th style={styles.tableHeader}>Requested By</th>
                                                    <th style={styles.tableHeader}>Amount</th>
                                                    <th style={styles.tableHeader}>Status</th>
                                                    <th style={styles.tableHeader}>Date</th>
                                                </>
                                            )}
                                            {generatedReport.type === 'comparison' && (
                                                <>
                                                    <th style={styles.tableHeader}>Department</th>
                                                    <th style={styles.tableHeader}>Total Budget</th>
                                                    <th style={styles.tableHeader}>Total Expense</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedReport.items.map((item, index) => (
                                            <tr key={item.id} style={styles.tableRow} className="fade-in">
                                                {generatedReport.type === 'expenses' && (
                                                    <>
                                                        <td style={styles.tableCell}>{index + 1}</td>
                                                        <td style={styles.tableCell}>{item.description}</td>
                                                        <td style={styles.tableCell}>{item.department}</td>
                                                        <td style={styles.tableCell}>{item.date}</td>
                                                        <td style={styles.tableCell}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                ₹{item.amount?.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td style={styles.tableCell}>{item.user}</td>
                                                        <td style={styles.tableCell}>{item.paymentMode}</td>
                                                    </>
                                                )}
                                                {generatedReport.type === 'budgets' && (
                                                    <>
                                                        <td style={styles.tableCell}>{index + 1}</td>
                                                        <td style={styles.tableCell}>{item.user}</td>
                                                        <td style={styles.tableCell}>{item.month}</td>
                                                        <td style={styles.tableCell}>{item.year}</td>
                                                        <td style={styles.tableCell}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                ₹{item.allocatedAmount?.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td style={styles.tableCell}>₹{item.spentAmount?.toLocaleString()}</td>
                                                        <td style={styles.tableCell}>₹{item.remainingAmount?.toLocaleString()}</td>
                                                    </>
                                                )}
                                                {generatedReport.type === 'reimbursement' && (
                                                    <>
                                                        <td style={styles.tableCell}>{index + 1}</td>
                                                        <td style={styles.tableCell}>{item.requestedBy}</td>
                                                        <td style={styles.tableCell}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                ₹{item.amount?.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td style={styles.tableCell}>
                                                            <span style={combineStyles(
                                                                styles.reimbursementStatusBadge,
                                                                item.status === 'paid' ? styles.reimbursementPaid : styles.reimbursementUnpaid
                                                            )}>
                                                                {item.status === 'paid' ? '✅' : '⏳'}
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.tableCell}>{item.date}</td>
                                                    </>
                                                )}
                                                {generatedReport.type === 'comparison' && (
                                                    <>
                                                        <td style={styles.tableCell}>{item.department}</td>
                                                        <td style={styles.tableCell}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                ₹{item.totalBudget?.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td style={styles.tableCell}>₹{item.totalExpense?.toLocaleString()}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No reports found</h3>
                                <p style={{ color: '#94a3b8' }}>Try adjusting your filters to see more results</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;