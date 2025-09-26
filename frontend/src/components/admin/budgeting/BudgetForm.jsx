import {
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

const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const BudgetForm = ({ users, formData, setFormData, handleChange, handleAdd, loading }) => {
    return (
        <SectionCard>
            <SectionTitle>Allocate Budget</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <StyledFormControl sx={{ flex: "1 1 300px" }}>
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

                <StyledTextField
                    label="Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    sx={{ flex: "1 1 200px" }}
                />

                <StyledFormControl sx={{ flex: "1 1 200px" }}>
                    <InputLabel>Month</InputLabel>
                    <StyledSelect
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        label="Month"
                    >
                        {months.map((m) => (
                            <MenuItem key={m.value} value={m.value}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl>

                <StyledTextField
                    label="Year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    sx={{ flex: "1 1 150px" }}
                />

                <PrimaryButton
                    variant="contained"
                    color="primary"
                    loading={loading}
                    onClick={handleAdd}
                    sx={{
                        minWidth: "auto",
                        p: 1.2,
                        borderRadius: 2,
                    }}
                >
                    <AddIcon />
                </PrimaryButton>
            </div>
        </SectionCard>
    );
};

export default BudgetForm;
