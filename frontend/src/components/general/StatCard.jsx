import { alpha, Box, Card, CardContent, Typography } from '@mui/material';


const StatCard = ({ stat }) => (
    <Card
        sx={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            height: { xs: "140px", sm: "150px", md: "160px" },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            "&:hover": {
                transform: { xs: "none", sm: "translateY(-4px)" },
                boxShadow: {
                    xs: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    sm: "0 8px 32px rgba(0, 0, 0, 0.12)",
                },
            },
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
            },
        }}
    >
        <CardContent
            sx={{
                p: { xs: 2.5, sm: 3 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            {/* Top Section - Icon and Amount */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: { xs: 2, sm: 2.5 },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: 44, sm: 48, md: 52 },
                            height: { xs: 44, sm: 48, md: 52 },
                            borderRadius: "12px",
                            backgroundColor: alpha(stat.color, 0.1),
                            color: stat.color,
                            flexShrink: 0,
                        }}
                    >
                        {stat.icon}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "#1e293b",
                                fontWeight: 700,
                                fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.7rem", lg: "1.9rem" },
                                lineHeight: 1.1,
                                wordBreak: "break-word",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {stat.value}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Bottom Section - Title and Subtitle */}
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: "#1e293b",
                        fontWeight: 700,
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                        lineHeight: 1.2,
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {stat.title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#6b7280",
                        fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                        fontWeight: 500,
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {stat.subtitle}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);
export default StatCard
