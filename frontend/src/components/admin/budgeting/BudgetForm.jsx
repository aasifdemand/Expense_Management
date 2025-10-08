import {
    Box,
    InputLabel,
    MenuItem,
} from "@mui/material";
import {
    SectionCard,
    SectionTitle,
    StyledTextField,
    StyledSelect,
    StyledFormControl,
    PrimaryButton,
} from "../../../styles/budgeting.styles";
import { Add as AddIcon } from "@mui/icons-material";

const BudgetForm = ({ users, formData, setFormData, handleChange, handleAdd, loading }) => {
    return (
        <SectionCard>
            <SectionTitle>Allocate Budget</SectionTitle>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 1.5, sm: 2 }, // responsive gap
                    alignItems: "center",
                }}
            >
                {/* User Dropdown */}
                <StyledFormControl sx={{ flex: { xs: "1 1 100%", sm: "1 1 300px" } }}>
                    <InputLabel>User</InputLabel>
                    <StyledSelect
                        name="userId"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        label="User"
                    >
                        {users?.map((user) => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl>

                {/* Company Dropdown */}
                <StyledFormControl sx={{ flex: { xs: "1 1 100%", sm: "1 1 200px" } }}>
                    <InputLabel>Company</InputLabel>
                    <StyledSelect
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        label="Company"
                    >
                        <MenuItem value="Demand Curve Marketing">Demand Curve Marketing</MenuItem>
                        <MenuItem value="Stackio">Stacko.io</MenuItem>
                    </StyledSelect>
                </StyledFormControl>

                {/* Amount Input */}
                <StyledTextField
                    label="Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 200px" } }}
                />

                {/* Add Button */}
                <PrimaryButton
                    variant="contained"
                    loading={loading}
                    onClick={handleAdd}
                    sx={{
                        flex: { xs: "1 1 100%", sm: "0 0 auto" },
                        p: 1.2,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#1976d2",
                        "&:hover": { backgroundColor: "#1565c0" },
                    }}
                >
                    <AddIcon />
                </PrimaryButton>
            </Box>
        </SectionCard>
    );
};

export default BudgetForm;
