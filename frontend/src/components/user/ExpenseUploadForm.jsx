import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Button,
    Grid,
    Box,
    InputAdornment,
    useTheme,
    alpha,
    Chip,
    Avatar,
    Divider,
    Snackbar,
    Alert
} from "@mui/material";
import {
    AttachFile,
    CloudUpload,
    Receipt,
    CurrencyRupee,
    CalendarToday,
    Business,
    Payment,
    Person
} from "@mui/icons-material";
import { useExpenses } from "../../hooks/useExpenses";
import { useDispatch } from "react-redux";
const ExpenseUploadForm = ({ open, onClose }) => {
    const theme = useTheme();
    const { handleAdd, fetchExpenses } = useExpenses();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        paidTo: "",
        amount: "",
        date: "",
        mode: "",
        department: "",
        subDepartment: "",
        proof: null
    });

    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const paymentModes = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "UPI"];
    const departments = [
        { name: "Sales", value: "Sales", subDepartments: [] },
        { name: "Data", value: "Data", subDepartments: [] },
        { name: "IT", value: "IT", subDepartments: ["Software", "Hardware", "Network", "Support"] },
        { name: "Others", value: "Others", subDepartments: [] },
    ];

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "department" && value !== "IT" ? { subDepartment: "" } : {}),
        }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, proof: "File size must be less than 5MB" }));
            return;
        }
        setFormData((prev) => ({ ...prev, proof: file || null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.paidTo.trim()) newErrors.paidTo = "Paid To is required";
        if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Valid amount is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.mode) newErrors.mode = "Payment mode is required";
        if (!formData.department) newErrors.department = "Department is required";
        if (formData.department === "IT" && !formData.subDepartment) newErrors.subDepartment = "Select a sub-department";
        if (!formData.proof) newErrors.proof = "Proof of payment is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const resp = await dispatch(handleAdd(formData));
            if (resp) {
                await fetchExpenses(); // refresh list
                setSnackbar({ open: true, message: "Expense submitted successfully!", severity: "success" });
                setFormData({ paidTo: "", amount: "", date: "", mode: "", department: "", subDepartment: "", proof: null });
                onClose();
            }
        } catch (err) {
            console.log("error: ", err);

            setSnackbar({ open: true, message: "Failed to submit expense", severity: "error" });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            <Receipt />
                        </Avatar>
                        <Typography variant="h6" fontWeight={700}>
                            Submit New Expense
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    <Card elevation={0}>
                        <CardContent>
                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Paid To"
                                            value={formData.paidTo}
                                            onChange={handleChange("paidTo")}
                                            error={!!errors.paidTo}
                                            helperText={errors.paidTo}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Amount"
                                            type="number"
                                            value={formData.amount}
                                            onChange={handleChange("amount")}
                                            error={!!errors.amount}
                                            helperText={errors.amount}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CurrencyRupee />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Date"
                                            type="date"
                                            value={formData.date}
                                            onChange={handleChange("date")}
                                            error={!!errors.date}
                                            helperText={errors.date}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarToday />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Payment Mode"
                                            value={formData.mode}
                                            onChange={handleChange("mode")}
                                            error={!!errors.mode}
                                            helperText={errors.mode}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Payment />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {paymentModes.map((mode) => (
                                                <MenuItem key={mode} value={mode}>
                                                    {mode}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Department"
                                            value={formData.department}
                                            onChange={handleChange("department")}
                                            error={!!errors.department}
                                            helperText={errors.department}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Business />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {departments.map((dept) => (
                                                <MenuItem key={dept.value} value={dept.value}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    {formData.department === "IT" && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="IT Sub-Department"
                                                value={formData.subDepartment}
                                                onChange={handleChange("subDepartment")}
                                                error={!!errors.subDepartment}
                                                helperText={errors.subDepartment}
                                            >
                                                {departments
                                                    .find((dept) => dept.value === "IT")
                                                    ?.subDepartments.map((subDept) => (
                                                        <MenuItem key={subDept} value={subDept}>
                                                            {subDept}
                                                        </MenuItem>
                                                    ))}
                                            </TextField>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={<AttachFile />}
                                            fullWidth
                                            sx={{ py: 2, borderStyle: "dashed" }}
                                        >
                                            {formData.proof ? formData.proof.name : "Upload Proof of Payment"}
                                            <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} />
                                        </Button>
                                        {errors.proof && (
                                            <Typography color="error" variant="caption">
                                                {errors.proof}
                                            </Typography>
                                        )}
                                        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                                            {["PDF", "JPG", "PNG", "DOC"].map((format) => (
                                                <Chip key={format} label={format} size="small" />
                                            ))}
                                            <Chip label="Max 5MB" size="small" color="warning" />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
};

export default ExpenseUploadForm;
