export const downloadCSV = (generatedReport, setAnimationClass) => {
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
