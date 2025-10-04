import { useState, useEffect } from 'react';
import { getStyles } from '../../styles/report.style';
import { useMediaQuery } from '@mui/material';
import { useBudgeting } from '../../hooks/useBudgeting';
import { useExpenses } from '../../hooks/useExpenses';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    const [filter, setFilter] = useState({
        type: 'expenses',
        department: 'all',
        reimbursementStatus: 'all',
        dateRange: {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        }
    });

    const [generatedReport, setGeneratedReport] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [loading, setLoading] = useState(false);

    const isMobile = useMediaQuery('(max-width:768px)');
    const styles = getStyles(isMobile);

    // Get departments from Redux store
    const departments = ['All', ...(reduxDeps?.map(dept => dept.name) || [])];

    const reimbursementStatuses = ['All', 'Paid', 'Unpaid'];

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
            dateRange: {
                start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            }
        });
        setGeneratedReport(null);
        setAnimationClass('fade-out');
        setTimeout(() => setAnimationClass(''), 800);
    };

    // Export to PDF using jsPDF
    const exportPDF = () => {
        if (!generatedReport) {
            alert('No report generated to export');
            return;
        }

        setAnimationClass('bounce');
        setTimeout(() => setAnimationClass(''), 800);

        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text(generatedReport.title, 14, 15);

            // Report details
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date(generatedReport.date).toLocaleDateString()}`, 14, 25);
            doc.text(`Department: ${generatedReport.department}`, 14, 32);
            doc.text(`Total Records: ${generatedReport.items.length}`, 14, 39);

            // Summary table
            const summaryData = [];
            if (generatedReport.type === 'comparison') {
                summaryData.push(
                    ['Total Budget', `₹${generatedReport.summary.totalBudget?.toLocaleString() || '0'}`],
                    ['Total Expense', `₹${generatedReport.summary.totalExpense?.toLocaleString() || '0'}`],
                    ['Utilization Rate', `${generatedReport.summary.utilizationRate?.toFixed(1) || '0'}%`]
                );
            } else if (generatedReport.type === 'reimbursement') {
                summaryData.push(
                    ['Total Amount', `₹${generatedReport.totalAmount?.toLocaleString() || '0'}`],
                    ['Paid Amount', `₹${generatedReport.summary.paidAmount?.toLocaleString() || '0'}`],
                    ['Unpaid Amount', `₹${generatedReport.summary.unpaidAmount?.toLocaleString() || '0'}`],
                    ['Total Records', generatedReport.summary.totalReports || '0']
                );
            } else {
                summaryData.push(
                    ['Total Amount', `₹${generatedReport.totalAmount?.toLocaleString() || '0'}`],
                    ['Average Amount', `₹${generatedReport.summary.averageAmount?.toLocaleString() || '0'}`],
                    ['Total Records', generatedReport.summary.totalReports || '0']
                );
            }

            doc.autoTable({
                startY: 45,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 10 }
            });

            // Main data table
            const tableColumn = [];
            const tableRows = [];

            // Define columns based on report type
            if (generatedReport.type === 'expenses') {
                tableColumn.push(['ID', 'Description', 'Department', 'Date', 'Amount', 'User', 'Payment Mode']);
                generatedReport.items.forEach(item => {
                    tableRows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
                        item.description || 'N/A',
                        item.department || 'N/A',
                        item.date || 'N/A',
                        `₹${(item.amount || 0).toLocaleString()}`,
                        item.user || 'Unknown',
                        item.paymentMode || 'N/A'
                    ]);
                });
            } else if (generatedReport.type === 'budgets') {
                tableColumn.push(['ID', 'User', 'Month', 'Year', 'Allocated Amount', 'Spent Amount', 'Remaining Amount']);
                generatedReport.items.forEach(item => {
                    tableRows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
                        item.user || 'N/A',
                        item.month || 'N/A',
                        item.year || 'N/A',
                        `₹${(item.allocatedAmount || 0).toLocaleString()}`,
                        `₹${(item.spentAmount || 0).toLocaleString()}`,
                        `₹${(item.remainingAmount || 0).toLocaleString()}`
                    ]);
                });
            } else if (generatedReport.type === 'reimbursement') {
                tableColumn.push(['ID', 'Requested By', 'Amount', 'Status', 'Date']);
                generatedReport.items.forEach(item => {
                    tableRows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
                        item.requestedBy || 'N/A',
                        `₹${(item.amount || 0).toLocaleString()}`,
                        item.status || 'unpaid',
                        item.date || 'N/A'
                    ]);
                });
            } else if (generatedReport.type === 'comparison') {
                tableColumn.push(['Department', 'Total Budget', 'Total Expense', 'Utilization Rate']);
                generatedReport.items.forEach(item => {
                    tableRows.push([
                        item.department || 'N/A',
                        `₹${(item.totalBudget || 0).toLocaleString()}`,
                        `₹${(item.totalExpense || 0).toLocaleString()}`,
                        `${(item.utilizationRate || 0).toFixed(1)}%`
                    ]);
                });
            }

            if (tableRows.length > 0) {
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 10,
                    head: tableColumn,
                    body: tableRows,
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    pageBreak: 'auto'
                });
            }

            // Save the PDF
            doc.save(`${generatedReport.type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting PDF. Please try again.');
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
                generatedReport.items.forEach(item => {
                    rows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
                        `"${item.description || 'N/A'}"`,
                        `"${item.department || 'N/A'}"`,
                        item.date || 'N/A',
                        item.amount || 0,
                        `"${item.user || 'Unknown'}"`,
                        `"${item.paymentMode || 'N/A'}"`
                    ]);
                });
            } else if (generatedReport.type === 'budgets') {
                headers.push('ID', 'User', 'Month', 'Year', 'Allocated Amount', 'Spent Amount', 'Remaining Amount');
                generatedReport.items.forEach(item => {
                    rows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
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
                generatedReport.items.forEach(item => {
                    rows.push([
                        `#${item.id?.slice(-6) || 'N/A'}`,
                        `"${item.requestedBy || 'N/A'}"`,
                        item.amount || 0,
                        item.status || 'unpaid',
                        item.date || 'N/A'
                    ]);
                });
            } else if (generatedReport.type === 'comparison') {
                headers.push('Department', 'Total Budget', 'Total Expense', 'Utilization Rate');
                generatedReport.items.forEach(item => {
                    rows.push([
                        `"${item.department || 'N/A'}"`,
                        item.totalBudget || 0,
                        item.totalExpense || 0,
                        item.utilizationRate || 0
                    ]);
                });
            }

            // Add report summary
            csvContent += `Report: ${generatedReport.title}\n`;
            csvContent += `Generated on: ${new Date(generatedReport.date).toLocaleDateString()}\n`;
            csvContent += `Department: ${generatedReport.department}\n`;
            csvContent += `Total Records: ${generatedReport.items.length}\n\n`;

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

            const itemDate = new Date(item.createdAt || item.date || item.submittedAt || item.updatedAt);
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
            const deptName = item.department?.name || item.department;
            return deptName?.toLowerCase() === filter.department.toLowerCase();
        });

        console.log(`Filtered to ${filtered.length} items by department: ${filter.department}`);
        return filtered;
    };

    // Get actual data from hooks/Redux
    const getActualData = () => {
        // Try to get data from all sources, fallback to empty array
        const budgetData = allBudgets || budgets || [];
        const expenseData = allExpenses || expenses || [];
        const reimbursementData = reimbursements || [];

        console.log('Actual data counts:', {
            budgets: budgetData.length,
            expenses: expenseData.length,
            reimbursements: reimbursementData.length
        });

        return { budgetData, expenseData, reimbursementData };
    };

    // Generate expense report - UPDATED for your schema
    const generateExpenseReport = () => {
        const { expenseData } = getActualData();
        console.log('Generating expense report with data:', expenseData);

        let filteredExpenses = filterByDateRange(expenseData);
        filteredExpenses = filterByDepartment(filteredExpenses);

        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

        const report = {
            title: `Expense Report - ${filter.dateRange.start} to ${filter.dateRange.end}`,
            type: 'expenses',
            department: filter.department,
            date: new Date().toISOString(),
            totalAmount,
            items: filteredExpenses.map(expense => ({
                id: expense._id || expense.id || 'unknown',
                description: expense.description || 'No description',
                department: expense.department?.name || 'N/A',
                date: new Date(expense.date || expense.createdAt).toLocaleDateString(),
                amount: expense.amount || 0,
                user: expense.user?.name || 'Unknown',
                paymentMode: expense.paymentMode || 'N/A'
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

    // Generate budget report - UPDATED for your schema
    const generateBudgetReport = () => {
        const { budgetData } = getActualData();
        console.log('Generating budget report with data:', budgetData);

        let filteredBudgets = filterByDateRange(budgetData);

        // For budgets, we need to handle department filtering differently since budgets might not have department field
        // if (filter.department !== 'all') {
        //     // You might need to adjust this based on how budgets are associated with departments
        //     filteredBudgets = filteredBudgets; // Placeholder - adjust as needed
        // }

        const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + (budget.allocatedAmount || 0), 0);
        const totalSpent = filteredBudgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
        const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + (budget.remainingAmount || 0), 0);

        const report = {
            title: `Budget Report - ${filter.dateRange.start} to ${filter.dateRange.end}`,
            type: 'budgets',
            department: filter.department,
            date: new Date().toISOString(),
            totalAmount: totalAllocated,
            items: filteredBudgets.map(budget => ({
                id: budget._id || budget.id || 'unknown',
                user: budget.user?.name || 'Unknown',
                month: budget.month,
                year: budget.year,
                allocatedAmount: budget.allocatedAmount || 0,
                spentAmount: budget.spentAmount || 0,
                remainingAmount: budget.remainingAmount || 0,
                type: budget.type || 'Normal'
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

    // Generate reimbursement report - UPDATED for your schema
    const generateReimbursementReport = () => {
        const { reimbursementData } = getActualData();
        console.log('Generating reimbursement report with data:', reimbursementData);

        let filteredReimbursements = filterByDateRange(reimbursementData);

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

        const report = {
            title: `Reimbursement Report - ${filter.dateRange.start} to ${filter.dateRange.end}`,
            type: 'reimbursement',
            reimbursementStatus: filter.reimbursementStatus,
            date: new Date().toISOString(),
            totalAmount,
            items: filteredReimbursements.map(reimb => ({
                id: reimb._id || reimb.id || 'unknown',
                requestedBy: reimb.requestedBy?.name || 'Unknown',
                amount: reimb.amount || 0,
                status: reimb.isReimbursed ? 'paid' : 'unpaid',
                date: new Date(reimb.createdAt || reimb.date).toLocaleDateString()
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

    // Generate comparison report - UPDATED for your schema
    const generateComparisonReport = () => {
        const { budgetData, expenseData } = getActualData();
        console.log('Generating comparison report with data:', { budgetData, expenseData });

        const filteredBudgets = filterByDateRange(budgetData);
        const filteredExpenses = filterByDateRange(expenseData);

        // Group by department and calculate totals
        const departmentStats = {};

        // Process budgets by department
        filteredBudgets.forEach(budget => {
            // Since budgets might not have department, you might need to get it from user or expense
            const dept = budget.user?.department || 'Unknown Department';
            if (!departmentStats[dept]) {
                departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
            }
            departmentStats[dept].totalBudget += budget.allocatedAmount || 0;
        });

        // Process expenses by department
        filteredExpenses.forEach(expense => {
            const dept = expense.department?.name || expense.department || 'Unknown Department';
            if (!departmentStats[dept]) {
                departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
            }
            departmentStats[dept].totalExpense += expense.amount || 0;
        });

        // Convert to array and calculate utilization rates
        const items = Object.entries(departmentStats).map(([department, stats]) => {
            const utilizationRate = stats.totalBudget > 0 ? (stats.totalExpense / stats.totalBudget) * 100 : 0;
            return {
                id: department,
                title: 'Budget Utilization',
                department,
                date: `${filter.dateRange.start} to ${filter.dateRange.end}`,
                totalBudget: stats.totalBudget,
                totalExpense: stats.totalExpense,
                utilizationRate
            };
        });

        const totalBudget = items.reduce((sum, item) => sum + (item.totalBudget || 0), 0);
        const totalExpense = items.reduce((sum, item) => sum + (item.totalExpense || 0), 0);
        const overallUtilizationRate = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

        const report = {
            title: `Budget vs Expense Report - ${filter.dateRange.start} to ${filter.dateRange.end}`,
            type: 'comparison',
            department: filter.department,
            date: new Date().toISOString(),
            totalAmount: totalExpense,
            items,
            summary: {
                totalBudget,
                totalExpense,
                utilizationRate: overallUtilizationRate,
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
                                style={combineStyles(styles.filterSelect, styles.filterSelectFocus)}
                                value={filter.department}
                                onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                                className="hover-glow"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
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
                                        <option key={status} value={status.toLowerCase()}>
                                            {status === 'Paid' ? '✅' : '⏳'} {status}
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
                                    Generated on {new Date(generatedReport.date).toLocaleDateString()} •
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
                                        <span style={styles.summaryLabel}>Utilization Rate</span>
                                        <span style={styles.summaryValue}>{generatedReport.summary.utilizationRate?.toFixed(1)}%</span>
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
                                                    <th style={styles.tableHeader}>User</th>
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
                                                    <th style={styles.tableHeader}>Utilization Rate</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedReport.items.map((item) => (
                                            <tr key={item.id} style={styles.tableRow} className="fade-in">
                                                {generatedReport.type === 'expenses' && (
                                                    <>
                                                        <td style={styles.tableCell}>#{item.id?.slice(-6)}</td>
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
                                                        <td style={styles.tableCell}>#{item.id?.slice(-6)}</td>
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
                                                        <td style={styles.tableCell}>#{item.id?.slice(-6)}</td>
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
                                                        <td style={styles.tableCell}>
                                                            <span style={combineStyles(
                                                                styles.trendIndicator,
                                                                item.utilizationRate <= 80 ? styles.trendUp : styles.trendDown
                                                            )}>
                                                                {item.utilizationRate?.toFixed(1)}%
                                                            </span>
                                                        </td>
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