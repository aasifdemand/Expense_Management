export const generateReport = ({ setLoading, setAnimationClass, filter, getReportTypeLabel, setGeneratedReport }) => {
    setLoading(true);
    setAnimationClass('pulse');

    setTimeout(() => {
        let filteredReports = [];

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