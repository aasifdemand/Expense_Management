export const styles = {
    dashboard: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: '100vh',
        width: '100%',
        padding: '0',
        color: '#1e293b',
        lineHeight: '1.6',
        overflow: 'hidden',
    },
    mainContent: {
        // maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px 20px',
        overflow: 'visible'
    },
    addUserSection: {
        background: 'white',
        borderRadius: '16px',
        padding: '35px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        alignItems: 'end'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    input: {
        padding: '14px 16px',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8fafc',
        width: '100%',
        boxSizing: 'border-box'
    },
    inputFocus: {
        outline: 'none',
        borderColor: '#3b82f6',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    addButton: {
        padding: '16px 32px',
        borderRadius: '10px',
        border: 'none',
        background: '#3b82f6',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        height: 'fit-content',
        minHeight: '52px',
        width: '100%'
    },
    buttonHover: {
        background: '#2563eb',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    usersSection: {
        background: 'white',
        borderRadius: '16px',
        padding: '35px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'visible'
    },
    searchHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        gap: '20px',
        flexWrap: 'wrap'
    },
    searchTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
    },
    searchBox: {
        padding: '14px 20px',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8fafc',
        minWidth: '300px',
        maxWidth: '400px'
    },
    userCount: {
        fontSize: '1rem',
        color: '#3b82f6',
        fontWeight: '600',
        background: '#dbeafe',
        padding: '10px 20px',
        borderRadius: '8px',
        whiteSpace: 'nowrap'
    },
    tableContainer: {
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'visible',
        maxHeight: 'none'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px'
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
        padding: '18px 20px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#374151',
        borderBottom: '2px solid #e2e8f0',
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: 10
    },
    tableCell: {
        padding: '18px 20px',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s ease'
    },
    tableRow: {
        transition: 'all 0.3s ease'
    },
    tableRowHover: {
        backgroundColor: '#f8fafc'
    },
    statusBadge: {
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'inline-block'
    },
    statusActive: {
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    resetPasswordButton: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '2px solid #3b82f6',
        background: 'transparent',
        color: '#3b82f6',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    resetPasswordButtonHover: {
        background: '#3b82f6',
        color: 'white',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    animation: `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.6s ease-out;
            }
        `
};