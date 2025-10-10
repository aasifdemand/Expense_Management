import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    useMediaQuery,
    useTheme,
    Grid
} from '@mui/material';
import {
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Refresh as RefreshIcon,
    Analytics as AnalyticsIcon,
    AccountBalance as BudgetIcon,
    Receipt as ReimbursementIcon,
    CompareArrows as CompareIcon,
    DateRange as DateRangeIcon,
    Business as BusinessIcon,
    FolderSpecial as FolderSpecialIcon
} from '@mui/icons-material';
import { useBudgeting } from '../../hooks/useBudgeting';
import { useExpenses } from '../../hooks/useExpenses';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StyledTextField, StyledSelect } from '../../styles/budgeting.styles';
import { useLocation } from '../../contexts/LocationContext';
import { fetchBudgets } from '../../store/budgetSlice';
import { fetchExpenses } from '../../store/expenseSlice';
import { fetchReimbursements } from '../../store/reimbursementSlice';
import { fetchDepartments, fetchSubDepartments } from '../../store/departmentSlice';

const Reports = () => {
    const { currentLoc } = useLocation()
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchBudgets({ location: currentLoc }));
        dispatch(fetchExpenses({ location: currentLoc }));
        dispatch(fetchReimbursements({ location: currentLoc }));
        dispatch(fetchDepartments())
    }, [dispatch, currentLoc]);

    const { allBudgets, budgets } = useBudgeting();
    const { allExpenses, expenses } = useExpenses();
    const { reimbursements } = useSelector((state) => state?.reimbursement);
    const { departments: reduxDeps, subDepartments: reduxSubDept } = useSelector((state) => state.department);

    // Get current date for proper date initialization
    const getCurrentDateRange = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    };

    const [filter, setFilter] = useState({
        type: 'expenses',
        department: 'all',
        subDepartment: 'all',
        reimbursementStatus: 'all',
        dateRange: getCurrentDateRange()
    });

    const [generatedReport, setGeneratedReport] = useState(null);
    const [loading, setLoading] = useState(false);

    // Handle department change to fetch sub-departments
    const handleDepartmentChange = (departmentId) => {
        setFilter({
            ...filter,
            department: departmentId,
            subDepartment: 'all' // Reset sub-department when main department changes
        });

        if (departmentId && departmentId !== 'all') {
            dispatch(fetchSubDepartments(departmentId));
        }
    };

    // Get departments from Redux store
    const departments = [
        { value: 'all', label: 'All Departments' },
        ...(reduxDeps?.map(dept => ({ value: dept._id, label: dept.name })) || [])
    ];

    const reimbursementStatuses = ['all', 'paid', 'unpaid'];

    const reportTypes = [
        { value: 'expenses', label: 'Expense Report', icon: <AnalyticsIcon /> },
        { value: 'budgets', label: 'Budget Report', icon: <BudgetIcon /> },
        { value: 'reimbursement', label: 'Reimbursement Summary', icon: <ReimbursementIcon /> },
        { value: 'comparison', label: 'Budget vs Expense', icon: <CompareIcon /> }
    ];

    const getReportTypeLabel = (type) => {
        const foundType = reportTypes.find(t => t.value === type);
        return foundType ? foundType.label : type.charAt(0).toUpperCase() + type.slice(1);
    };

    const resetFilters = () => {
        setFilter({
            type: 'expenses',
            department: 'all',
            subDepartment: 'all',
            reimbursementStatus: 'all',
            dateRange: getCurrentDateRange()
        });
        setGeneratedReport(null);
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

    // Export PDF function
    const exportPDF = () => {
        try {
            if (!generatedReport) {
                alert('No report generated to export');
                return;
            }

            const doc = new jsPDF();

            // Add company logo (with error handling)
            try {
                const logo = "/image.png";
                doc.addImage(logo, "PNG", 14, 15, 40, 15);
            } catch (logoError) {
                console.warn("Logo not found, continuing without logo", logoError);
            }

            // Title Section
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text('DEMANDCURVE', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            doc.text('Monthly Expense Statement', 105, 28, { align: 'center' });

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
                    ['Expense Report', getReportTypeLabel(generatedReport.type), `₹${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'budgets') {
                totalAmount = generatedReport.totalAmount || generatedReport.items?.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Amount', 'Number of Records'],
                    ['Budget Report', getReportTypeLabel(generatedReport.type), `₹${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'reimbursement') {
                totalAmount = generatedReport.totalAmount || generatedReport.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Amount', 'Number of Records'],
                    ['Reimbursement Report', getReportTypeLabel(generatedReport.type), `₹${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            } else if (generatedReport.type === 'comparison') {
                totalAmount = generatedReport.summary?.totalBudget || generatedReport.items?.reduce((sum, item) => sum + (item.totalBudget || 0), 0) || 0;
                summaryData.push(
                    ['Description', 'Report Type', 'Total Budget', 'Number of Records'],
                    ['Budget vs Expense Report', getReportTypeLabel(generatedReport.type), `₹${totalAmount}`, (generatedReport.items?.length || 0).toString()]
                );
            }

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

            if (!generatedReport.items || generatedReport.items.length === 0) {
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text("No data available for this report", 14, doc.lastAutoTable.finalY + 25);
            } else {
                if (generatedReport.type === 'expenses') {
                    columns = ["ID", "User", "Department", "Sub-Department", "Date", "Amount", "Description", "Payment Mode"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.user || "Unknown",
                            item.department || "N/A",
                            item.subDepartment || "N/A",
                            item.date ? formatDate(item.date) : "N/A",
                            `₹${(item.amount || 0)}`,
                            item.description || "N/A",
                            item.paymentMode || "N/A"
                        ]);
                    });
                }
                else if (generatedReport.type === 'budgets') {
                    columns = ["ID", "Name", "Allocated", "Company", "Months", "Year", "Spent", "Remaining"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.user || "N/A",
                            `₹${(item.allocatedAmount || 0)}`,
                            item.company || "DemandCurve",
                            item.month?.toString() || "N/A",
                            item.year?.toString() || "N/A",
                            `₹${(item.spentAmount || 0)}`,
                            `₹${(item.remainingAmount || 0)}`
                        ]);
                    });
                }
                else if (generatedReport.type === 'reimbursement') {
                    columns = ["ID", "Requested User", "Department", "Sub-Department", "Amount", "Status", "Date"];
                    generatedReport.items.forEach((item, index) => {
                        rows.push([
                            (index + 1).toString(),
                            item.requestedBy || "N/A",
                            item.department || "N/A",
                            item.subDepartment || "N/A",
                            `₹${(item.amount || 0)}`,
                            item.status === 'paid' ? 'Paid' : 'Unpaid',
                            item.date ? formatDate(item.date) : "N/A"
                        ]);
                    });
                }
                else if (generatedReport.type === 'comparison') {
                    columns = ["Department", "Sub-Department", "Total Budget", "Total Expense"];
                    generatedReport.items.forEach((item) => {
                        rows.push([
                            item.department || "N/A",
                            item.subDepartment || "N/A",
                            `₹${(item.totalBudget || 0)}`,
                            `₹${(item.totalExpense || 0)}`
                        ]);
                    });
                }

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

            doc.save(`${generatedReport.type}_report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting PDF. Please check the console for details and try again.');
        }
    };

    // Export CSV function
    const exportCSV = () => {
        if (!generatedReport) {
            alert('No report generated to export');
            return;
        }

        try {
            let csvContent = '';
            const headers = [];
            const rows = [];

            if (generatedReport.type === 'expenses') {
                headers.push('ID', 'User', 'Department', 'Sub-Department', 'Date', 'Amount', 'Description', 'Payment Mode');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.user || 'Unknown'}"`,
                        `"${item.department || 'N/A'}"`,
                        `"${item.subDepartment || 'N/A'}"`,
                        item.date || 'N/A',
                        item.amount || 0,
                        `"${item.description || 'N/A'}"`,
                        `"${item.paymentMode || 'N/A'}"`
                    ]);
                });
            } else if (generatedReport.type === 'budgets') {
                headers.push('ID', 'Name', 'Allocated', 'Company', 'Months', 'Year', 'Spent', 'Remaining');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.user || 'N/A'}"`,
                        item.allocatedAmount || 0,
                        `"${item.company || 'DemandCurve'}"`,
                        item.month || '',
                        item.year || '',
                        item.spentAmount || 0,
                        item.remainingAmount || 0
                    ]);
                });
            } else if (generatedReport.type === 'reimbursement') {
                headers.push('ID', 'Requested User', 'Department', 'Sub-Department', 'Amount', 'Status', 'Date');
                generatedReport.items.forEach((item, index) => {
                    rows.push([
                        index + 1,
                        `"${item.requestedBy || 'N/A'}"`,
                        `"${item.department || 'N/A'}"`,
                        `"${item.subDepartment || 'N/A'}"`,
                        item.amount || 0,
                        item.status || 'unpaid',
                        item.date || 'N/A'
                    ]);
                });
            } else if (generatedReport.type === 'comparison') {
                headers.push('Department', 'Sub-Department', 'Total Budget', 'Total Expense');
                generatedReport.items.forEach((item) => {
                    rows.push([
                        `"${item.department || 'N/A'}"`,
                        `"${item.subDepartment || 'N/A'}"`,
                        item.totalBudget || 0,
                        item.totalExpense || 0
                    ]);
                });
            }

            csvContent += `DEMANDCURVE - Monthly Expense Statement\n`;
            csvContent += `${generatedReport.title}\n`;
            csvContent += `Generated on: ${formatDate(new Date())}\n`;
            csvContent += `Department: ${generatedReport.department}\n`;
            csvContent += `Total Records: ${generatedReport.items.length}\n\n`;

            csvContent += `Dataset Report\n`;
            if (generatedReport.type === 'comparison') {
                csvContent += `Description,Report Type,Total Budget,Number of Records\n`;
                csvContent += `${generatedReport.title},${getReportTypeLabel(generatedReport.type)},₹${generatedReport.summary.totalBudget?.toLocaleString() || '0'},${generatedReport.items.length}\n\n`;
            } else {
                csvContent += `Description,Report Type,Total Amount,Number of Records\n`;
                csvContent += `${generatedReport.title},${getReportTypeLabel(generatedReport.type)},₹${generatedReport.totalAmount?.toLocaleString() || '0'},${generatedReport.items.length}\n\n`;
            }

            csvContent += `Settings\n`;
            csvContent += headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.join(',') + '\n';
            });

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

    const filterByDepartment = (items) => {
        let filtered = items;

        // Filter by main department
        if (filter.department !== 'all' && filter.department) {
            const selectedDept = reduxDeps?.find(dept => dept._id === filter.department);
            if (selectedDept) {
                filtered = filtered.filter(item => {
                    if (!item) return false;
                    const deptName = item.department?.name || item.department;
                    return deptName?.toLowerCase() === selectedDept.name.toLowerCase();
                });
            }
        }

        // Filter by sub-department
        if (filter.subDepartment !== 'all' && filter.subDepartment) {
            const selectedSubDept = reduxSubDept?.find(sub => sub._id === filter.subDepartment);
            if (selectedSubDept) {
                filtered = filtered.filter(item => {
                    if (!item) return false;
                    const subDept = item.subDepartment?.name || item.subDepartment;
                    return subDept?.toLowerCase() === selectedSubDept.name.toLowerCase();
                });
            }
        }

        console.log(`Filtered to ${filtered.length} items by department and sub-department`);
        return filtered;
    };

    const getActualData = () => {
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

    const getCurrentMonthYear = () => {
        const today = new Date();
        return {
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear()
        };
    };

    const getDepartmentInfo = () => {
        if (filter.department === 'all') return 'All Departments';

        const selectedDept = reduxDeps?.find(dept => dept._id === filter.department);
        const deptName = selectedDept?.name || 'Unknown Department';

        if (filter.subDepartment !== 'all') {
            const selectedSubDept = reduxSubDept?.find(sub => sub._id === filter.subDepartment);
            const subDeptName = selectedSubDept?.name || 'Unknown Sub-Department';
            return `${deptName} - ${subDeptName}`;
        }

        return deptName;
    };

    const generateExpenseReport = () => {
        const { expenseData } = getActualData();
        console.log('Generating expense report with data:', expenseData);

        let filteredExpenses = filterByDateRange(expenseData);
        filteredExpenses = filterByDepartment(filteredExpenses);

        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Expense Report - ${month} ${year}`,
            type: 'expenses',
            department: getDepartmentInfo(),
            date: new Date().toISOString(),
            totalAmount,
            items: filteredExpenses.map(expense => ({
                id: expense._id || expense.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
                description: expense.description || 'No description',
                department: expense.department?.name || expense.department || 'General',
                subDepartment: expense.subDepartment?.name || expense.subDepartment || 'General',
                date: formatDate(expense.date || expense.createdAt),
                amount: expense.amount || 0,
                user: expense.user?.name || expense.user?.username || 'Unknown User',
                paymentMode: expense.paymentMode || 'Cash'
            })),
            summary: {
                totalReports: filteredExpenses.length,
                averageAmount: filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0,
                totalAmount
            }
        };

        console.log('Generated expense report:', report);
        return report;
    };

    const generateBudgetReport = () => {
        const { budgetData } = getActualData();
        console.log('Generating budget report with data:', budgetData);

        let filteredBudgets = filterByDateRange(budgetData);

        const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + (budget.allocatedAmount || 0), 0);
        const totalSpent = filteredBudgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
        const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + (budget.remainingAmount || 0), 0);
        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Budget Report - ${month} ${year}`,
            type: 'budgets',
            department: 'All Departments',
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
                company: budget.company || 'DemandCurve',
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

    const generateReimbursementReport = () => {
        const { reimbursementData } = getActualData();
        console.log('Generating reimbursement report with data:', reimbursementData);

        let filteredReimbursements = filterByDateRange(reimbursementData);
        filteredReimbursements = filterByDepartment(filteredReimbursements);

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
        const { month, year } = getCurrentMonthYear();

        const report = {
            title: `Reimbursement Report - ${month} ${year}`,
            type: 'reimbursement',
            reimbursementStatus: filter.reimbursementStatus,
            department: getDepartmentInfo(),
            date: new Date().toISOString(),
            totalAmount,
            items: filteredReimbursements.map(reimb => ({
                id: reimb._id || reimb.id || `reimb-${Math.random().toString(36).substr(2, 9)}`,
                requestedBy: reimb.requestedBy?.name || reimb.user?.name || 'Unknown Employee',
                department: reimb.department?.name || reimb.department || 'General',
                subDepartment: reimb.subDepartment?.name || reimb.subDepartment || 'General',
                amount: reimb.amount || 0,
                status: reimb.isReimbursed ? 'paid' : 'unpaid',
                date: formatDate(reimb.createdAt || reimb.date)
            })),
            summary: {
                totalReports: filteredReimbursements.length,
                averageAmount: filteredReimbursements.length > 0 ? totalAmount / filteredReimbursements.length : 0,
                totalAmount
            }
        };

        console.log('Generated reimbursement report:', report);
        return report;
    };

    const generateComparisonReport = () => {
        const { budgetData, expenseData } = getActualData();
        console.log('Generating comparison report with data:', { budgetData, expenseData });

        const filteredBudgets = filterByDateRange(budgetData);
        const filteredExpenses = filterByDateRange(expenseData);

        const departmentStats = {};

        filteredBudgets.forEach(budget => {
            const dept = budget.department?.name || budget.department || budget.user?.department || 'General';
            const subDept = budget.subDepartment?.name || budget.subDepartment || 'General';
            const key = `${dept}-${subDept}`;

            if (!departmentStats[key]) {
                departmentStats[key] = {
                    department: dept,
                    subDepartment: subDept,
                    totalBudget: 0,
                    totalExpense: 0
                };
            }
            departmentStats[key].totalBudget += budget.allocatedAmount || 0;
        });

        filteredExpenses.forEach(expense => {
            const dept = expense.department?.name || expense.department || 'General';
            const subDept = expense.subDepartment?.name || expense.subDepartment || 'General';
            const key = `${dept}-${subDept}`;

            if (!departmentStats[key]) {
                departmentStats[key] = {
                    department: dept,
                    subDepartment: subDept,
                    totalBudget: 0,
                    totalExpense: 0
                };
            }
            departmentStats[key].totalExpense += expense.amount || 0;
        });

        const items = Object.values(departmentStats).map((stats, index) => {
            return {
                id: `${stats.department}-${stats.subDepartment}-${index}`,
                title: 'Budget Utilization',
                department: stats.department,
                subDepartment: stats.subDepartment,
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
            department: getDepartmentInfo(),
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
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report. Please check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusChip = (status) => {
        return (
            <Chip
                label={status}
                color={status === 'paid' ? 'success' : 'warning'}
                size="small"
                variant="outlined"
            />
        );
    };

    return (
        <Box sx={{
            p: isMobile ? 2 : 3,
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
        }}>
            {/* Main Container */}
            <Box sx={{
                maxWidth: '1750px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Report Generator Section */}
                <Card sx={{
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: isMobile ? '12px' : '16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <CardContent sx={{
                        p: isMobile ? 2 : 4,
                        '&:last-child': {
                            pb: isMobile ? 2 : 4
                        },
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            fontWeight: 'bold',
                            color: '#2D3748',
                            mb: 3,
                            fontSize: isMobile ? '1.5rem' : '2rem'
                        }}>
                            <AnalyticsIcon sx={{
                                fontSize: isMobile ? 24 : 32,
                                color: '#4F46E5'
                            }} />
                            {isMobile ? 'Reports' : 'Report Generator'}
                        </Typography>

                        {/* Filter Controls - 2x2 Grid Layout */}
                        <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
                            {/* Column 1 - Left Side */}
                            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                                <Stack spacing={3} sx={{ width: '100%', height: '100%' }}>
                                    {/* Report Type - Top Left */}
                                    <FormControl fullWidth sx={{ width: '100%' }}>
                                        <InputLabel sx={{ fontWeight: '600' }}>
                                            Report Type
                                        </InputLabel>
                                        <StyledSelect
                                            value={filter.type}
                                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                            label="Report Type"
                                        >
                                            {reportTypes.map(type => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        py: 0.5,
                                                        width: '100%'
                                                    }}>
                                                        {type.icon}
                                                        <Typography variant="body1" fontWeight="500">
                                                            {type.label}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>

                                    {/* Categories - Bottom Left */}
                                    {filter.department !== 'all' && reduxSubDept.length > 0 && (
                                        <FormControl fullWidth disabled={filter.type === 'budgets'} sx={{ width: '100%' }}>
                                            <InputLabel sx={{ fontWeight: '600' }}>
                                                Categories
                                            </InputLabel>
                                            <StyledSelect
                                                value={filter.subDepartment}
                                                onChange={(e) => setFilter({ ...filter, subDepartment: e.target.value })}
                                                label="Categories"
                                            >
                                                <MenuItem value="all">
                                                    <Box sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5
                                                    }}>
                                                        <FolderSpecialIcon sx={{ fontSize: 20, color: 'info.main' }} />
                                                        <Typography>All Categories</Typography>
                                                    </Box>
                                                </MenuItem>
                                                {reduxSubDept?.map((sub) => (
                                                    <MenuItem key={sub._id} value={sub._id}>
                                                        <Box sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.5
                                                        }}>
                                                            <FolderSpecialIcon sx={{ fontSize: 20, color: 'info.main' }} />
                                                            <Typography>{sub?.name}</Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </StyledSelect>
                                        </FormControl>
                                    )}

                                    {/* Empty space for layout consistency when categories not shown */}
                                    {!(filter.department !== 'all' && reduxSubDept.length > 0) && (
                                        <Box sx={{ width: '100%' }} />
                                    )}
                                </Stack>
                            </Grid>

                            {/* Column 2 - Right Side */}
                            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                                <Stack spacing={3} sx={{ width: '100%', height: '100%' }}>
                                    {/* Department - Top Right */}
                                    <FormControl fullWidth disabled={filter.type === 'budgets'} sx={{ width: '100%' }}>
                                        <InputLabel sx={{ fontWeight: '600' }}>
                                            Department
                                        </InputLabel>
                                        <StyledSelect
                                            value={filter.type === 'budgets' ? 'all' : filter.department}
                                            onChange={(e) => handleDepartmentChange(e.target.value)}
                                            label="Department"
                                        >
                                            {departments.map(dept => (
                                                <MenuItem key={dept.value} value={dept.value}>
                                                    <Box sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                        width: '100%'
                                                    }}>
                                                        <BusinessIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                                        <Typography>{dept.label}</Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>

                                    {/* Reimbursement Status - Bottom Right */}
                                    {filter.type === 'reimbursement' && (
                                        <FormControl fullWidth sx={{ width: '100%' }}>
                                            <InputLabel sx={{ fontWeight: '600' }}>
                                                Reimbursement Status
                                            </InputLabel>
                                            <StyledSelect
                                                value={filter.reimbursementStatus}
                                                onChange={(e) => setFilter({ ...filter, reimbursementStatus: e.target.value })}
                                                label="Reimbursement Status"
                                            >
                                                {reimbursementStatuses.map(status => (
                                                    <MenuItem key={status} value={status}>
                                                        <Typography variant="body1" fontWeight="500">
                                                            {status === 'paid' ? 'Paid' :
                                                                status === 'unpaid' ? 'Unpaid' :
                                                                    'All Status'}
                                                        </Typography>
                                                    </MenuItem>
                                                ))}
                                            </StyledSelect>
                                        </FormControl>
                                    )}

                                    {/* Empty space for layout consistency when reimbursement not shown */}
                                    {filter.type !== 'reimbursement' && (
                                        <Box sx={{ width: '100%' }} />
                                    )}
                                </Stack>
                            </Grid>

                            {/* Date Range - Full Width at Bottom */}
                            <Grid item xs={12} sx={{ width: '100%' }}>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="body2" sx={{
                                        mb: 1.5,
                                        fontWeight: '600',
                                        color: '#4A5568'
                                    }}>
                                        📅 Date Range
                                    </Typography>
                                    <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
                                        {/* Start Date - Left side */}
                                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                                            <StyledTextField
                                                type="date"
                                                value={filter.dateRange.start}
                                                onChange={(e) => setFilter({
                                                    ...filter,
                                                    dateRange: { ...filter.dateRange, start: e.target.value }
                                                })}
                                                size="small"
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                        {/* End Date - Right side */}
                                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                                            <StyledTextField
                                                type="date"
                                                value={filter.dateRange.end}
                                                onChange={(e) => setFilter({
                                                    ...filter,
                                                    dateRange: { ...filter.dateRange, end: e.target.value }
                                                })}
                                                size="small"
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>

                        {filter.type === 'budgets' && (
                            <Typography variant="caption" color="text.secondary" sx={{
                                fontStyle: 'italic',
                                display: 'block',
                                textAlign: 'center',
                                p: 1,
                                backgroundColor: '#F7FAFC',
                                borderRadius: '8px',
                                width: '100%',
                                boxSizing: 'border-box',
                                mt: 2
                            }}>
                                Department filter is disabled for Budget Reports
                            </Typography>
                        )}

                        {/* Action Buttons */}
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mt: 4,
                            justifyContent: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <Button
                                variant="contained"
                                onClick={generateReport}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                                size={isMobile ? "medium" : "large"}
                                sx={{
                                    px: isMobile ? 3 : 4,
                                    py: isMobile ? 1 : 1.5,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        boxShadow: '0 6px 20px 0 rgba(79, 70, 229, 0.6)',
                                        transform: 'translateY(-1px)'
                                    },
                                    fontWeight: '600',
                                    width: isMobile ? '100%' : 'auto',
                                    minWidth: isMobile ? '100%' : '200px'
                                }}
                            >
                                {loading ? 'Generating Report...' : 'Generate Report'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={resetFilters}
                                startIcon={<RefreshIcon />}
                                size={isMobile ? "medium" : "large"}
                                sx={{
                                    px: isMobile ? 3 : 4,
                                    py: isMobile ? 1 : 1.5,
                                    borderRadius: '12px',
                                    borderColor: '#E2E8F0',
                                    color: '#4A5568',
                                    fontWeight: '600',
                                    '&:hover': {
                                        borderColor: '#4F46E5',
                                        backgroundColor: 'rgba(79, 70, 229, 0.04)',
                                        transform: 'translateY(-1px)'
                                    },
                                    width: isMobile ? '100%' : 'auto',
                                    minWidth: isMobile ? '100%' : '150px'
                                }}
                            >
                                Reset Filters
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Generated Report Section */}
                {generatedReport && (
                    <Card sx={{
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        borderRadius: isMobile ? '12px' : '16px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <CardContent sx={{
                            p: isMobile ? 2 : 4,
                            '&:last-child': {
                                pb: isMobile ? 2 : 4
                            },
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            {/* Report Header */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                mb: 4,
                                flexWrap: 'wrap',
                                gap: 2,
                                flexDirection: isMobile ? 'column' : 'row',
                                width: '100%'
                            }}>
                                <Box sx={{
                                    width: isMobile ? '100%' : 'auto',
                                    flex: 1
                                }}>
                                    <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{
                                        fontWeight: 'bold',
                                        color: '#2D3748',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                                        wordBreak: 'break-word'
                                    }}>
                                        {generatedReport.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#718096',
                                        fontWeight: '500',
                                        fontSize: isMobile ? '0.8rem' : '0.875rem'
                                    }}>
                                        Generated on {formatDate(generatedReport.date)} •
                                        {generatedReport.type === 'reimbursement' ?
                                            ` Status: ${generatedReport.reimbursementStatus}` :
                                            ` Department: ${generatedReport.department}`
                                        } • {generatedReport.items.length} records found
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    width: isMobile ? '100%' : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-end'
                                }}>
                                    <Button
                                        variant="outlined"
                                        onClick={exportCSV}
                                        startIcon={<DownloadIcon />}
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            px: isMobile ? 2 : 3,
                                            minWidth: isMobile ? '48%' : 'auto'
                                        }}
                                    >
                                        {isMobile ? 'CSV' : 'Download CSV'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={exportPDF}
                                        startIcon={<PdfIcon />}
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                            fontWeight: '600',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #047857 0%, #0D9488 100%)'
                                            },
                                            px: isMobile ? 2 : 3,
                                            minWidth: isMobile ? '48%' : 'auto'
                                        }}
                                    >
                                        {isMobile ? 'PDF' : 'Export PDF'}
                                    </Button>
                                </Box>
                            </Box>

                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 4, width: '100%' }}>
                                <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                                    <Paper
                                        sx={{
                                            p: isMobile ? 2 : 3,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                            color: "white",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.4)",
                                            width: '100%',
                                            height: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{
                                            opacity: 0.9,
                                            fontWeight: "600",
                                        }}>
                                            Report Type
                                        </Typography>
                                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ mt: 1 }}>
                                            {getReportTypeLabel(generatedReport.type)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                                    <Paper
                                        sx={{
                                            p: isMobile ? 2 : 3,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                                            color: "white",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 14px 0 rgba(5, 150, 105, 0.4)",
                                            width: '100%',
                                            height: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{
                                            opacity: 0.9,
                                            fontWeight: "600",
                                        }}>
                                            Total Amount
                                        </Typography>
                                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ mt: 1 }}>
                                            ₹{generatedReport.totalAmount?.toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                                    <Paper
                                        sx={{
                                            p: isMobile ? 2 : 3,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
                                            color: "white",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 14px 0 rgba(220, 38, 38, 0.4)",
                                            width: '100%',
                                            height: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{
                                            opacity: 0.9,
                                            fontWeight: "600",
                                        }}>
                                            Records
                                        </Typography>
                                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ mt: 1 }}>
                                            {generatedReport.summary.totalReports}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Data Table */}
                            {generatedReport.items.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '12px',
                                        overflow: 'auto',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <Table sx={{
                                        minWidth: isMobile ? 600 : '100%',
                                        width: '100%'
                                    }}>
                                        <TableHead>
                                            <TableRow sx={{
                                                backgroundColor: '#4F46E5',
                                                '& th': {
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: isMobile ? '12px' : '14px',
                                                    padding: isMobile ? '12px 8px' : '16px',
                                                    whiteSpace: 'nowrap'
                                                }
                                            }}>
                                                {generatedReport.type === 'expenses' && (
                                                    <>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>User</TableCell>
                                                        <TableCell>Department</TableCell>
                                                        <TableCell>Sub-Department</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Amount</TableCell>
                                                        <TableCell>Description</TableCell>
                                                        <TableCell>Payment Mode</TableCell>
                                                    </>
                                                )}
                                                {generatedReport.type === 'budgets' && (
                                                    <>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Allocated</TableCell>
                                                        <TableCell>Company</TableCell>
                                                        <TableCell>Months</TableCell>
                                                        <TableCell>Year</TableCell>
                                                        <TableCell>Spent</TableCell>
                                                        <TableCell>Remaining</TableCell>
                                                    </>
                                                )}
                                                {generatedReport.type === 'reimbursement' && (
                                                    <>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Requested User</TableCell>
                                                        <TableCell>Department</TableCell>
                                                        <TableCell>Sub-Department</TableCell>
                                                        <TableCell>Amount</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Date</TableCell>
                                                    </>
                                                )}
                                                {generatedReport.type === 'comparison' && (
                                                    <>
                                                        <TableCell>Department</TableCell>
                                                        <TableCell>Sub-Department</TableCell>
                                                        <TableCell>Total Budget</TableCell>
                                                        <TableCell>Total Expense</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {generatedReport.items.map((item, index) => (
                                                <TableRow key={item.id} hover sx={{
                                                    '&:nth-of-type(even)': {
                                                        backgroundColor: '#F7FAFC'
                                                    },
                                                    '&:last-child td, &:last-child th': {
                                                        border: 0
                                                    }
                                                }}>
                                                    {generatedReport.type === 'expenses' && (
                                                        <>
                                                            <TableCell sx={{ fontWeight: '600' }}>{index + 1}</TableCell>
                                                            <TableCell>{item.user}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.department}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.subDepartment}
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{item.date}</TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold" color="#059669">
                                                                    ₹{item.amount?.toLocaleString()}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{
                                                                maxWidth: isMobile ? '120px' : '200px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>{item.description}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.paymentMode}
                                                                    size="small"
                                                                    color="secondary"
                                                                />
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    {generatedReport.type === 'reimbursement' && (
                                                        <>
                                                            <TableCell sx={{ fontWeight: '600' }}>{index + 1}</TableCell>
                                                            <TableCell>{item.requestedBy}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.department}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.subDepartment}
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold" color="#059669">
                                                                    ₹{item.amount?.toLocaleString()}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusChip(item.status)}
                                                            </TableCell>
                                                            <TableCell>{item.date}</TableCell>
                                                        </>
                                                    )}
                                                    {generatedReport.type === 'comparison' && (
                                                        <>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.department}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.subDepartment}
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold" color="#059669">
                                                                    ₹{item.totalBudget?.toLocaleString()}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>₹{item.totalExpense?.toLocaleString()}</TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 6,
                                    backgroundColor: '#F7FAFC',
                                    borderRadius: '12px',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{
                                        fontWeight: '600'
                                    }}>
                                        📭 No reports found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Try adjusting your filters to see more results
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default Reports;