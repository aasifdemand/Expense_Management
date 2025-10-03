import React, { useState, useEffect } from 'react';

const Reports = () => {
    // State for reports data and filters
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState({
        type: 'monthly',
        department: 'all',
        reimbursementStatus: 'all',
        dateRange: {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        }
    });
    const [loading, setLoading] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [mobileView, setMobileView] = useState(false);

    // Sample data - in a real app, this would come from an API
    const sampleReports = [
        {
            id: 1,
            title: 'Monthly Expense Report - January 2023',
            type: 'monthly',
            department: 'Engineering',
            date: '2023-01-31',
            totalAmount: 12500,
            status: 'approved',
            trend: 'up',
            change: 15,
            reimbursementStatus: 'paid'
        },
        {
            id: 2,
            title: 'Department-wise Report - Sales Q1 2023',
            type: 'department',
            department: 'Sales',
            date: '2023-03-31',
            totalAmount: 8900,
            status: 'approved',
            trend: 'down',
            change: 8,
            reimbursementStatus: 'paid'
        },
        {
            id: 3,
            title: 'Reimbursement Summary - February 2023',
            type: 'reimbursement',
            department: 'All',
            date: '2023-02-28',
            totalAmount: 21000,
            status: 'approved',
            trend: 'up',
            change: 22,
            reimbursementStatus: 'unpaid'
        },
        {
            id: 4,
            title: 'Monthly Expense Report - March 2023',
            type: 'monthly',
            department: 'Marketing',
            date: '2023-03-31',
            totalAmount: 7500,
            status: 'approved',
            trend: 'up',
            change: 5,
            reimbursementStatus: 'paid'
        },
        {
            id: 5,
            title: 'Reimbursement Summary - Q1 2023',
            type: 'reimbursement',
            department: 'All',
            date: '2023-03-31',
            totalAmount: 18500,
            status: 'approved',
            trend: 'up',
            change: 18,
            reimbursementStatus: 'paid'
        },
        {
            id: 6,
            title: 'Reimbursement Summary - April 2023',
            type: 'reimbursement',
            department: 'All',
            date: '2023-04-30',
            totalAmount: 15200,
            status: 'approved',
            trend: 'down',
            change: 12,
            reimbursementStatus: 'unpaid'
        }
    ];

    // Departments for filter dropdown
    const departments = ['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

    // Reimbursement status options
    const reimbursementStatuses = ['All', 'Paid', 'Unpaid'];

    // Report types with additional options
    const reportTypes = [
        { value: 'monthly', label: 'Monthly Expense Report', icon: '📊' },
        { value: 'department', label: 'Department-wise Report', icon: '🏢' },
        { value: 'reimbursement', label: 'Reimbursement Summary', icon: '💰' },
        { value: 'custom', label: 'Custom Report', icon: '⚙️' },
        { value: 'analytics', label: 'Analytics Dashboard', icon: '📈' }
    ];

    // Check mobile view on resize
    useEffect(() => {
        const checkMobile = () => {
            setMobileView(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize with sample data
    useEffect(() => {
        setReports(sampleReports);
        setAnimationClass('fade-in');
        setTimeout(() => setAnimationClass(''), 1000);
    }, []);

    // Function to generate a report based on filters
    const generateReport = () => {
        setLoading(true);
        setAnimationClass('pulse');

        setTimeout(() => {
            let filteredReports = [...sampleReports];

            // Filter by type
            if (filter.type !== 'all') {
                filteredReports = filteredReports.filter(report => report.type === filter.type);
            }

            // Filter by department (only if not reimbursement type)
            if (filter.department !== 'all' && filter.type !== 'reimbursement') {
                filteredReports = filteredReports.filter(report =>
                    filter.department === 'All' ? true : report.department === filter.department
                );
            }

            // Filter by reimbursement status (only for reimbursement type)
            if (filter.type === 'reimbursement' && filter.reimbursementStatus !== 'all') {
                filteredReports = filteredReports.filter(report =>
                    report.reimbursementStatus === filter.reimbursementStatus.toLowerCase()
                );
            }

            // Filter by date range
            filteredReports = filteredReports.filter(report => {
                const reportDate = new Date(report.date);
                const startDate = new Date(filter.dateRange.start);
                const endDate = new Date(filter.dateRange.end);
                return reportDate >= startDate && reportDate <= endDate;
            });

            const newReport = {
                id: Date.now(),
                title: `${getReportTypeLabel(filter.type)} - ${new Date().toLocaleDateString()}`,
                type: filter.type,
                department: filter.type === 'reimbursement' ? 'All' : filter.department,
                reimbursementStatus: filter.type === 'reimbursement' ? filter.reimbursementStatus : 'N/A',
                date: new Date().toISOString().split('T')[0],
                totalAmount: filteredReports.reduce((sum, report) => sum + report.totalAmount, 0),
                items: filteredReports,
                status: 'generated',
                summary: {
                    totalReports: filteredReports.length,
                    averageAmount: filteredReports.length > 0 ?
                        Math.round(filteredReports.reduce((sum, report) => sum + report.totalAmount, 0) / filteredReports.length) : 0,
                    highestAmount: filteredReports.length > 0 ?
                        Math.max(...filteredReports.map(report => report.totalAmount)) : 0,
                    paidAmount: filteredReports.filter(r => r.reimbursementStatus === 'paid')
                        .reduce((sum, report) => sum + report.totalAmount, 0),
                    unpaidAmount: filteredReports.filter(r => r.reimbursementStatus === 'unpaid')
                        .reduce((sum, report) => sum + report.totalAmount, 0)
                }
            };

            setGeneratedReport(newReport);
            setLoading(false);
            setAnimationClass('slide-in');
            setTimeout(() => setAnimationClass(''), 1500);
        }, 1000);
    };

    // Helper function to get report type label
    const getReportTypeLabel = (type) => {
        const foundType = reportTypes.find(t => t.value === type);
        return foundType ? foundType.label : type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Function to download report as CSV
    const downloadCSV = () => {
        if (!generatedReport) return;

        setAnimationClass('bounce');
        setTimeout(() => setAnimationClass(''), 800);

        const headers = ['ID', 'Title', 'Type', 'Department', 'Date', 'Total Amount', 'Status', 'Reimbursement Status'];
        const csvContent = [
            headers.join(','),
            ...generatedReport.items.map(item => [
                item.id,
                `"${item.title}"`,
                item.type,
                item.department,
                item.date,
                item.totalAmount,
                item.status,
                item.reimbursementStatus || 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedReport.title.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Function to reset filters
    const resetFilters = () => {
        setFilter({
            type: 'monthly',
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

    // Function to print report
    const printReport = () => {
        setAnimationClass('pulse');
        setTimeout(() => setAnimationClass(''), 500);
        window.print();
    };

    // Function to export as PDF
    const exportPDF = () => {
        setAnimationClass('bounce');
        setTimeout(() => setAnimationClass(''), 800);

        // In a real application, you would use a PDF library like jsPDF
        alert('PDF export functionality would be implemented here with a library like jsPDF');
    };

    // Enhanced CSS Styles with perfect responsive design
    const styles = {
        container: {
            padding: mobileView ? '16px' : '24px 32px',
            minHeight: 'calc(100vh - 80px)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            margin: 0,
            width: '100%',
            boxSizing: 'border-box',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            gap: mobileView ? '20px' : '32px',
            width: '100%',
            margin: 0
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: mobileView ? '20px' : '28px',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        },
        cardTitle: {
            marginBottom: mobileView ? '16px' : '24px',
            color: '#1e293b',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            fontSize: mobileView ? '1.25rem' : '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        filterGrid: {
            display: 'grid',
            gridTemplateColumns: mobileView ? '1fr' : 'repeat(2, 1fr)',
            gap: mobileView ? '16px' : '24px',
            marginBottom: mobileView ? '24px' : '32px'
        },
        filterGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        filterLabel: {
            fontWeight: '600',
            color: '#374151',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        filterSelect: {
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            backgroundColor: 'white',
            outline: 'none',
            width: '100%'
        },
        filterSelectDisabled: {
            backgroundColor: '#f9fafb',
            color: '#9ca3af',
            cursor: 'not-allowed'
        },
        filterSelectFocus: {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        },
        dateRangeContainer: {
            display: 'flex',
            flexDirection: mobileView ? 'column' : 'row',
            alignItems: mobileView ? 'stretch' : 'center',
            gap: '12px'
        },
        dateRange: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1
        },
        dateRangeSpan: {
            color: '#64748b',
            fontWeight: '500',
            fontSize: '14px',
            minWidth: '20px',
            textAlign: 'center'
        },
        actionButtons: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
        },
        button: {
            padding: mobileView ? '10px 16px' : '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            position: 'relative',
            overflow: 'hidden',
            outline: 'none',
            flex: mobileView ? '1' : 'none',
            justifyContent: 'center'
        },
        buttonPrimary: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
        },
        buttonSecondary: {
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db'
        },
        buttonSuccess: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
        },
        buttonDanger: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
        },
        reportHeader: {
            display: 'flex',
            flexDirection: mobileView ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: mobileView ? 'stretch' : 'center',
            marginBottom: '24px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '20px',
            gap: '16px'
        },
        reportActions: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        reportSummary: {
            display: 'grid',
            gridTemplateColumns: mobileView ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        },
        summaryItem: {
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease'
        },
        summaryLabel: {
            fontWeight: '600',
            color: '#64748b',
            fontSize: '0.875rem',
            marginBottom: '8px'
        },
        summaryValue: {
            fontSize: '1.25rem',
            color: '#1e293b',
            fontWeight: '700'
        },
        reportTable: {
            overflowX: 'auto',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginTop: '20px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px'
        },
        tableHeader: {
            padding: '16px 20px',
            textAlign: 'left',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontWeight: '600',
            color: '#374151',
            fontSize: '0.875rem'
        },
        tableCell: {
            padding: '14px 20px',
            textAlign: 'left',
            borderBottom: '1px solid #f1f5f9',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s ease'
        },
        tableRow: {
            '&:hover': {
                backgroundColor: '#f8fafc'
            }
        },
        statusBadge: {
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        },
        statusGenerated: {
            backgroundColor: '#faf5ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe'
        },
        reimbursementStatusBadge: {
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        },
        reimbursementPaid: {
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0'
        },
        reimbursementUnpaid: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
        },
        reportsGrid: {
            display: 'grid',
            gridTemplateColumns: mobileView ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
        },
        reportCard: {
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            cursor: 'pointer',
            height: '100%'
        },
        reportInfo: {
            flex: 1
        },
        reportInfoTitle: {
            marginBottom: '12px',
            color: '#1e293b',
            fontSize: '1.1rem',
            fontWeight: '600',
            lineHeight: '1.4'
        },
        reportMeta: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px'
        },
        reportMetaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            color: '#64748b'
        },
        reportFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
        },
        amount: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#1e293b'
        },
        loadingSpinner: {
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,.3)',
            borderRadius: '50%',
            borderTopColor: '#fff',
            animation: 'spin 1s ease-in-out infinite'
        },
        trendIndicator: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px'
        },
        trendUp: {
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0'
        },
        trendDown: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
        },
        infoText: {
            fontSize: '0.875rem',
            color: '#6b7280',
            fontStyle: 'italic',
            marginTop: '4px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
        },
        statsContainer: {
            display: 'grid',
            gridTemplateColumns: mobileView ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        },
        statCard: {
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
        }
    };

    // Helper function to combine styles
    const combineStyles = (baseStyle, additionalStyle) => {
        return additionalStyle ? { ...baseStyle, ...additionalStyle } : baseStyle;
    };

    // Animation keyframes
    const animationStyles = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0,-5px,0); }
            70% { transform: translate3d(0,-3px,0); }
            90% { transform: translate3d(0,-1px,0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-in { animation: slideIn 0.3s ease-out; }
        .pulse { animation: pulse 0.3s ease-in-out; }
        .bounce { animation: bounce 0.5s ease-in-out; }
        .fade-out { animation: fadeOut 0.3s ease-out; }
        
        /* Enhanced hover effects */
        .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .hover-glow:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .summary-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
    `;

    // Add animation styles to document
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = animationStyles;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <div style={styles.container} className={`${animationClass} responsive-container`}>
            <div style={styles.content}>

                {/* Report Generator Section */}
                <div style={styles.card} className="hover-lift">
                    <h2 style={styles.cardTitle}>
                        <i className="fas fa-cogs"></i> Report Generator
                    </h2>

                    <div style={styles.filterGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>
                                <i className="fas fa-chart-pie"></i> Report Type
                            </label>
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
                            <label style={styles.filterLabel}>
                                <i className="fas fa-building"></i> Department
                            </label>
                            <select
                                style={combineStyles(
                                    styles.filterSelect,
                                    styles.filterSelectFocus,
                                    filter.type === 'reimbursement' ? styles.filterSelectDisabled : {}
                                )}
                                value={filter.department}
                                onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                                className="hover-glow"
                                disabled={filter.type === 'reimbursement'}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            {filter.type === 'reimbursement' && (
                                <div style={styles.infoText}>
                                    Department filter is automatically set to "All" for reimbursement reports
                                </div>
                            )}
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>
                                <i className="fas fa-money-bill-wave"></i>
                                {filter.type === 'reimbursement' ? 'Reimbursement Status' : 'Additional Options'}
                            </label>
                            {filter.type === 'reimbursement' ? (
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
                            ) : (
                                <select
                                    style={combineStyles(styles.filterSelect, styles.filterSelectDisabled)}
                                    disabled
                                    className="hover-glow"
                                >
                                    <option>Available for specific report types</option>
                                </select>
                            )}
                            {filter.type !== 'reimbursement' && (
                                <div style={styles.infoText}>
                                    Additional filtering options available based on selected report type
                                </div>
                            )}
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>
                                <i className="fas fa-calendar-alt"></i> Date Range
                            </label>
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
                                    <span style={styles.loadingSpinner}></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic"></i> Generate Report
                                </>
                            )}
                        </button>
                        <button
                            style={combineStyles(styles.button, styles.buttonSecondary)}
                            onClick={resetFilters}
                            className="hover-lift"
                        >
                            <i className="fas fa-redo"></i> Reset Filters
                        </button>
                    </div>
                </div>

                {/* Generated Report Section */}
                {generatedReport && (
                    <div style={styles.card} className={`hover-lift ${animationClass}`}>
                        <div style={styles.reportHeader}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: mobileView ? '1.1rem' : '1.3rem', color: '#1e293b' }}>
                                    {generatedReport.title}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    Generated on {new Date(generatedReport.date).toLocaleDateString()} •
                                    {generatedReport.type === 'reimbursement' ?
                                        ` Reimbursement Status: ${generatedReport.reimbursementStatus}` :
                                        ` Department: ${generatedReport.department}`
                                    } • {generatedReport.items.length} records found
                                </p>
                            </div>
                            <div style={styles.reportActions}>
                                <button
                                    style={combineStyles(styles.button, styles.buttonSuccess)}
                                    onClick={downloadCSV}
                                    className="hover-lift"
                                >
                                    <i className="fas fa-download"></i> {mobileView ? 'CSV' : 'Download CSV'}
                                </button>
                                <button
                                    style={combineStyles(styles.button, styles.buttonPrimary)}
                                    onClick={exportPDF}
                                    className="hover-lift"
                                >
                                    <i className="fas fa-file-pdf"></i> {mobileView ? 'PDF' : 'Export PDF'}
                                </button>
                                <button
                                    style={combineStyles(styles.button, styles.buttonSecondary)}
                                    onClick={printReport}
                                    className="hover-lift"
                                >
                                    <i className="fas fa-print"></i> {mobileView ? 'Print' : 'Print Report'}
                                </button>
                            </div>
                        </div>

                        <div style={styles.reportSummary}>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Report Type</span>
                                <span style={styles.summaryValue}>
                                    {getReportTypeLabel(generatedReport.type)}
                                </span>
                            </div>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Total Amount</span>
                                <span style={styles.summaryValue}>₹{generatedReport.totalAmount.toLocaleString()}</span>
                            </div>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Number of Reports</span>
                                <span style={styles.summaryValue}>{generatedReport.summary.totalReports}</span>
                            </div>
                            <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                <span style={styles.summaryLabel}>Average Amount</span>
                                <span style={styles.summaryValue}>₹{generatedReport.summary.averageAmount.toLocaleString()}</span>
                            </div>
                            {generatedReport.type === 'reimbursement' && (
                                <>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Paid Amount</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={combineStyles(styles.summaryItem, styles.summaryHover)} className="summary-hover">
                                        <span style={styles.summaryLabel}>Unpaid Amount</span>
                                        <span style={styles.summaryValue}>₹{generatedReport.summary.unpaidAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {generatedReport.items.length > 0 ? (
                            <div style={styles.reportTable}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>ID</th>
                                            <th style={styles.tableHeader}>Title</th>
                                            <th style={styles.tableHeader}>Department</th>
                                            <th style={styles.tableHeader}>Date</th>
                                            <th style={styles.tableHeader}>Amount</th>
                                            {generatedReport.type === 'reimbursement' && (
                                                <th style={styles.tableHeader}>Status</th>
                                            )}
                                            <th style={styles.tableHeader}>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedReport.items.map((item, index) => (
                                            <tr key={item.id} style={combineStyles(styles.tableRow, { animationDelay: `${index * 0.1}s` })} className="fade-in">
                                                <td style={styles.tableCell}>#{item.id}</td>
                                                <td style={styles.tableCell}>
                                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                                </td>
                                                <td style={styles.tableCell}>{item.department}</td>
                                                <td style={styles.tableCell}>{item.date}</td>
                                                <td style={styles.tableCell}>
                                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                        ₹{item.totalAmount.toLocaleString()}
                                                    </div>
                                                </td>
                                                {generatedReport.type === 'reimbursement' && (
                                                    <td style={styles.tableCell}>
                                                        <span style={combineStyles(
                                                            styles.reimbursementStatusBadge,
                                                            item.reimbursementStatus === 'paid' ? styles.reimbursementPaid : styles.reimbursementUnpaid
                                                        )}>
                                                            <i className={`fas fa-${item.reimbursementStatus === 'paid' ? 'check-circle' : 'clock'}`}></i>
                                                            {item.reimbursementStatus}
                                                        </span>
                                                    </td>
                                                )}
                                                <td style={styles.tableCell}>
                                                    {item.trend && (
                                                        <span style={combineStyles(
                                                            styles.trendIndicator,
                                                            item.trend === 'up' ? styles.trendUp : styles.trendDown
                                                        )}>
                                                            <i className={`fas fa-arrow-${item.trend}`}></i>
                                                            {item.change}%
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}></i>
                                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No reports found</h3>
                                <p style={{ color: '#94a3b8' }}>Try adjusting your filters to see more results</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Reports Section */}
                <div style={styles.card} className="hover-lift">
                    <h2 style={styles.cardTitle}>
                        <i className="fas fa-history"></i> Recent Reports
                    </h2>
                    <div style={styles.reportsGrid}>
                        {reports.map(report => (
                            <div key={report.id} style={styles.reportCard} className="hover-lift">
                                <div style={styles.reportInfo}>
                                    <h4 style={styles.reportInfoTitle}>{report.title}</h4>
                                    <div style={styles.reportMeta}>
                                        <span style={styles.reportMetaItem}>
                                            <i className="fas fa-building"></i> {report.department}
                                        </span>
                                        <span style={styles.reportMetaItem}>
                                            <i className="fas fa-calendar"></i> {report.date}
                                        </span>
                                        <span style={styles.reportMetaItem}>
                                            <i className="fas fa-chart-line"></i>
                                            <span style={combineStyles(
                                                styles.trendIndicator,
                                                report.trend === 'up' ? styles.trendUp : styles.trendDown
                                            )}>
                                                <i className={`fas fa-arrow-${report.trend}`}></i>
                                                {report.change}% {report.trend}
                                            </span>
                                        </span>
                                        {report.type === 'reimbursement' && (
                                            <span style={styles.reportMetaItem}>
                                                <i className="fas fa-money-bill-wave"></i>
                                                <span style={combineStyles(
                                                    styles.reimbursementStatusBadge,
                                                    report.reimbursementStatus === 'paid' ? styles.reimbursementPaid : styles.reimbursementUnpaid
                                                )}>
                                                    {report.reimbursementStatus}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={styles.reportFooter}>
                                    <div style={styles.amount}>₹{report.totalAmount.toLocaleString()}</div>
                                    <span style={combineStyles(styles.statusBadge, styles.statusGenerated)}>
                                        <i className="fas fa-file"></i>
                                        {report.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;