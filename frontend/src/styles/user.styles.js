export const styles = {
    dashboard: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: '100vh',
        width: '100%',
        padding: '0',
        color: '#1e293b',
        lineHeight: '1.6',
        overflow: 'hidden',
        '@media (max-width: 768px)': {
            overflowX: 'hidden'
        }
    },
    mainContent: {
        margin: '0 auto',
        padding: '30px 20px',
        overflow: 'visible',
        '@media (max-width: 768px)': {
            padding: '15px 12px'
        }
    },
    addUserSection: {
        background: 'white',
        borderRadius: '16px',
        padding: '35px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        '@media (max-width: 768px)': {
            padding: '20px 16px',
            marginBottom: '20px',
            borderRadius: '12px'
        }
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        '@media (max-width: 768px)': {
            fontSize: '1.4rem',
            marginBottom: '20px',
            gap: '8px'
        }
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        alignItems: 'end',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '16px'
        }
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 768px)': {
            width: '100%'
        }
    },
    label: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '@media (max-width: 768px)': {
            fontSize: '0.9rem',
            marginBottom: '8px'
        }
    },
    input: {
        padding: '14px 16px',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8fafc',
        width: '100%',
        boxSizing: 'border-box',
        '@media (max-width: 768px)': {
            padding: '12px 14px',
            fontSize: '0.9rem',
            borderRadius: '8px'
        }
    },
    inputFocus: {
        outline: 'none',
        borderColor: '#3b82f6',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        '@media (max-width: 768px)': {
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
        }
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
        width: '100%',
        '@media (max-width: 768px)': {
            padding: '14px 24px',
            fontSize: '0.9rem',
            minHeight: '48px',
            borderRadius: '8px'
        }
    },
    buttonHover: {
        background: '#2563eb',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
        '@media (max-width: 768px)': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
        }
    },
    usersSection: {
        background: 'white',
        borderRadius: '16px',
        padding: '35px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'visible',
        '@media (max-width: 768px)': {
            padding: '20px 16px',
            borderRadius: '12px',
            overflow: 'hidden'
        }
    },
    searchHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        gap: '20px',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '16px',
            marginBottom: '20px'
        }
    },
    searchTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        '@media (max-width: 768px)': {
            fontSize: '1.4rem',
            justifyContent: 'center'
        }
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
        }
    },
    searchBox: {
        padding: '14px 20px',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8fafc',
        minWidth: '300px',
        maxWidth: '400px',
        '@media (max-width: 768px)': {
            minWidth: '100%',
            maxWidth: '100%',
            padding: '12px 16px',
            fontSize: '0.9rem',
            borderRadius: '8px'
        }
    },
    userCount: {
        fontSize: '1rem',
        color: '#3b82f6',
        fontWeight: '600',
        background: '#dbeafe',
        padding: '10px 20px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        '@media (max-width: 768px)': {
            fontSize: '0.9rem',
            padding: '8px 16px',
            textAlign: 'center',
            width: '100%'
        }
    },
    tableContainer: {
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'auto',
        maxHeight: 'none',
        '@media (max-width: 768px)': {
            borderRadius: '8px',
            border: 'none',
            overflowX: 'auto'
        }
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
        '@media (max-width: 768px)': {
            minWidth: '600px'
        }
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
        zIndex: 10,
        '@media (max-width: 768px)': {
            padding: '14px 16px',
            fontSize: '0.85rem'
        }
    },
    tableCell: {
        padding: '18px 20px',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s ease',
        '@media (max-width: 768px)': {
            padding: '14px 16px',
            fontSize: '0.85rem'
        }
    },
    tableRow: {
        transition: 'all 0.3s ease',
        '@media (max-width: 768px)': {
            '&:hover': {
                backgroundColor: '#f8fafc'
            }
        }
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
        display: 'inline-block',
        '@media (max-width: 768px)': {
            padding: '6px 12px',
            fontSize: '0.75rem',
            letterSpacing: '0.3px'
        }
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
        gap: '8px',
        '@media (max-width: 768px)': {
            padding: '6px 12px',
            fontSize: '0.8rem',
            gap: '6px',
            width: '100%',
            justifyContent: 'center'
        }
    },
    resetPasswordButtonHover: {
        background: '#3b82f6',
        color: 'white',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        '@media (max-width: 768px)': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }
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
        
        @media (max-width: 768px) {
            .fade-in {
                animation: fadeIn 0.4s ease-out;
            }
        }
    `
};