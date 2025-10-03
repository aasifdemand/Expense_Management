export const getStyles = (mobileView) => ({
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
});