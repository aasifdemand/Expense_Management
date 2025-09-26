import { Modal, Box, Typography, Button } from "@mui/material";
import { StyledTextField } from "../../../styles/budgeting.styles";

const EditBudgetModal = ({ open, handleClose, formData, handleChange, handleSubmit }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: 400,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Edit Budget
                </Typography>

                <StyledTextField
                    fullWidth
                    label="Allocated Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    margin="normal"
                />
                <StyledTextField
                    fullWidth
                    label="Month"
                    name="month"
                    type="number"
                    value={formData.month}
                    onChange={handleChange}
                    margin="normal"
                />
                <StyledTextField
                    fullWidth
                    label="Year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    margin="normal"
                />

                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditBudgetModal;
