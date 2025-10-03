import React, { useEffect, useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    InputLabel,
    Select,
    FormControl,
    Stack,
    Card,
    CardContent,
    Alert,
    Fade,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import { useDispatch, useSelector } from "react-redux";
import { addExpense } from "../../store/expenseSlice";
import { PrimaryButton, SectionCard, StyledSelect, StyledTextField } from "../../styles/budgeting.styles";
import {
    fetchDepartments,
    fetchSubDepartments,
} from "../../store/departmentSlice";
import { useNavigate } from "react-router-dom";

const paymentModes = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "UPI",
    "Cheque",
    "Online Payment",
];

export default function CreateExpenseForm() {
    const dispatch = useDispatch();
    const navigation = useNavigate()
    const { departments, subDepartments: reduxSubDept } = useSelector(
        (state) => state?.department
    );

    const [form, setForm] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        department: "",
        subDepartment: "",
        paymentMode: "",
        isReimbursed: false,
        proof: null,
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    // fetch departments when component mounts
    useEffect(() => {
        dispatch(fetchDepartments());
    }, [dispatch]);

    // handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "checkbox") {
            setForm({ ...form, [name]: checked });
        } else if (type === "file") {
            setForm({ ...form, proof: files[0] });
        } else if (name === "department") {
            setForm({ ...form, department: value, subDepartment: "" });
            // fetch subDepartments for selected dept
            dispatch(fetchSubDepartments(value));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse(null);

        if (!form.proof) {
            setError("Please upload proof/bill for the expense");
            setLoading(false);
            return;
        }

        if (

            !form.amount ||
            !form.date ||
            !form.department ||
            !form.paymentMode
        ) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }

        if (reduxSubDept.length > 0 && !form.subDepartment) {
            setError("Please select a sub-department");
            setLoading(false);
            return;
        }

        try {
            const resultAction = await dispatch(addExpense(form));
            if (addExpense.rejected.match(resultAction)) {
                throw new Error(resultAction.payload || "Failed to add expense");
            }

            navigation("/user/expenses")

            setResponse("Expense created successfully!");
            setForm({
                description: "",
                amount: "",
                date: new Date().toISOString().slice(0, 10),
                department: "",
                subDepartment: "",
                paymentMode: "",
                isReimbursed: false,
                proof: null,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SectionCard>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3}>
                        {/* Paid To */}
                        {/* <StyledTextField
                            fullWidth
                            label="Paid To"
                            name="paidTo"
                            value={form.paidTo}
                            onChange={handleChange}
                            required
                            variant="outlined"
                            placeholder="Enter recipient name"
                        /> */}

                        {/* Amount + Date */}
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ width: "100%" }}
                        >
                            <StyledTextField
                                fullWidth
                                label="Amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                placeholder="0.00"
                            />


                        </Stack>

                        {/* Department + Payment Mode */}
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ width: "100%" }}
                        >
                            {/* Department Dropdown */}
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Department</InputLabel>
                                <StyledSelect
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    label="Department"
                                    variant="outlined"
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>

                            {/* Payment Mode Dropdown */}
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Payment Mode</InputLabel>
                                <StyledSelect
                                    name="paymentMode"
                                    value={form.paymentMode}
                                    onChange={handleChange}
                                    label="Payment Mode"
                                    variant="outlined"
                                >
                                    {paymentModes.map((mode) => (
                                        <MenuItem key={mode} value={mode}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <PaymentIcon sx={{ fontSize: 18 }} /> {mode}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                        </Stack>

                        {/* Sub-Department Dropdown */}
                        {reduxSubDept.length > 0 && (
                            <Fade in={true} timeout={300}>
                                <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Sub-Department</InputLabel>
                                        <StyledSelect
                                            name="subDepartment"
                                            value={form.subDepartment}
                                            onChange={handleChange}
                                            label="Sub-Department"
                                            variant="outlined"
                                        >
                                            {reduxSubDept.map((sub) => (
                                                <MenuItem key={sub._id} value={sub._id}>
                                                    {sub.name}
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>

                                </Box>
                            </Fade>
                        )}

                        {/* Description Text Area */}
                        <StyledTextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="Enter expense description (optional)"
                            multiline
                            rows={3}
                        />

                        {/* File Upload */}
                        <Card
                            variant="outlined"
                            sx={{
                                border: "2px dashed",
                                borderColor: form.proof ? "success.main" : "primary.light",
                                backgroundColor: form.proof
                                    ? "success.lightest"
                                    : "primary.lightest",
                                borderRadius: 3,
                                cursor: "pointer",
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 3 }}>
                                <input
                                    type="file"
                                    hidden
                                    id="proof-upload"
                                    name="proof"
                                    onChange={handleChange}
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                />
                                <label htmlFor="proof-upload" style={{ cursor: "pointer" }}>
                                    <Button
                                        component="span"
                                        startIcon={<UploadFileIcon />}
                                        variant={form.proof ? "contained" : "outlined"}
                                        color={form.proof ? "success" : "primary"}
                                    >
                                        {form.proof ? "Proof Uploaded" : "Upload Bill Proof"}
                                    </Button>
                                </label>
                                {form.proof && (
                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                        sx={{ mt: 1, fontWeight: 600 }}
                                    >
                                        ✅ {form.proof.name}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <PrimaryButton
                            type="submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={
                                loading || !form.proof || (reduxSubDept.length > 0 && !form.subDepartment)
                            }
                            fullWidth
                        >
                            {loading ? "Creating Expense..." : "Create Expense"}
                        </PrimaryButton>

                        {/* Response/Error Messages */}
                        {response && (
                            <Alert
                                severity="success"
                                sx={{ borderRadius: 2 }}
                                onClose={() => setResponse(null)}
                            >
                                {response}
                            </Alert>
                        )}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ borderRadius: 2 }}
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Box>
        </SectionCard>
    );
}