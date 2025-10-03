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

// const types = [
//     { value: "Normal", label: "Normal" },
//     { value: "Reimbursement", label: "Reimbursement" },

// ];

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

                {/* <StyledFormControl sx={{ flex: "1 1 200px" }}>
                    <InputLabel>Types</InputLabel>
                    <StyledSelect
                        name="Types"
                        value={formData.type}
                        onChange={handleChange}
                        label="Types"
                    >
                        {types.map((m) => (
                            <MenuItem key={m.value} value={m.value}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl> */}


                <PrimaryButton
                    variant="contained"
                    loading={loading}
                    onClick={handleAdd}
                    sx={{
                        minWidth: "auto",
                        p: 1.2,
                        borderRadius: 2,
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                        },
                    }}
                >
                    <AddIcon />
                </PrimaryButton>
            </div>
        </SectionCard>
    );
};

export default BudgetForm;
