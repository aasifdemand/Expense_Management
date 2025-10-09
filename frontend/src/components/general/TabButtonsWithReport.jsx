
import { Box, Button, Typography, Paper } from "@mui/material";



const TabButtonsWithReport = ({ activeTab, setActiveTab }) => {




    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                mb: 1,
                borderRadius: 1,

                width: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", md: "center" },
                    gap: 3,
                    width: "100%",
                }}
            >
                {/* Tabs Section */}
                <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 40%" } }}>
                    <Typography
                        variant="h5"
                        sx={{ mb: 2, color: "text.primary", fontWeight: "700" }}
                    >
                        Recents
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            variant={activeTab === "budget" ? "contained" : "outlined"}
                            color="primary"
                            sx={{
                                borderRadius: "8px",
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: "600",
                                fontSize: "0.975rem",
                                boxShadow: activeTab === "budget" ? 2 : 0,
                                minWidth: "100px",
                            }}
                            onClick={() => setActiveTab("budget")}
                        >
                            Budgets
                        </Button>
                        <Button
                            variant={activeTab === "expense" ? "contained" : "outlined"}
                            color="secondary"
                            sx={{
                                borderRadius: "8px",
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: "600",
                                fontSize: "0.975rem",
                                boxShadow: activeTab === "expense" ? 2 : 0,
                                minWidth: "100px",
                            }}
                            onClick={() => setActiveTab("expense")}
                        >
                            Expenses
                        </Button>
                    </Box>
                </Box>


            </Box>
        </Paper>
    );
};

export default TabButtonsWithReport;