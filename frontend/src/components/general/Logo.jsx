import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Logo = ({ size = 44, logoUrl }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                width: isMobile ? 36 : size,
                height: isMobile ? 36 : size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                }
            }}
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="Expense Tracker Logo"
                    style={{
                        width: '70%',
                        height: '70%',
                        objectFit: 'contain'
                    }}
                />
            ) : (
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                        color: 'white',
                        fontSize: isMobile ? '1rem' : '1.25rem'
                    }}
                >
                    ET
                </Typography>
            )}
        </Box>
    );
};

export default Logo