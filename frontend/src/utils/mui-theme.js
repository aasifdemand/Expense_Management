export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    main: '#4361ee',
                    light: '#eef2ff',
                    dark: '#3a56d4',
                },
                secondary: {
                    main: '#7209b7',
                },
                background: {
                    default: '#f8fafc',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1e293b',
                    secondary: '#64748b',
                },
                success: {
                    main: '#06d6a0',
                },
                warning: {
                    main: '#ffd166',
                },
                error: {
                    main: '#ef476f',
                },
            }
            : {
                primary: {
                    main: '#6366f1',
                    light: '#818cf8',
                    dark: '#4f46e5',
                },
                background: {
                    default: '#0f172a',
                    paper: '#1e293b',
                },
                text: {
                    primary: '#f1f5f9',
                    secondary: '#94a3b8',
                },
                success: {
                    main: '#10b981',
                },
                warning: {
                    main: '#f59e0b',
                },
                error: {
                    main: '#ef4444',
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '2rem',
            '@media (max-width:600px)': {
                fontSize: '1.5rem',
            },
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
            '@media (max-width:600px)': {
                fontSize: '1.25rem',
            },
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
            '@media (max-width:600px)': {
                fontSize: '1.1rem',
            },
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '12px 16px',
                    '@media (max-width:600px)': {
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                    },
                },
                head: {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    '@media (max-width:600px)': {
                        fontSize: '0.75rem',
                    },
                },
            },
        },
    },
});