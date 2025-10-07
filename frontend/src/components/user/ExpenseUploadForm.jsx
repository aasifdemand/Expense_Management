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
    Paper,
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
        vendorName: "",
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
                vendorName: "",
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
                    <Stack spacing={4}>
                        {/* Amount Only */}
                        <Box sx={{ width: '100%' }}>
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
                                sx={{ maxWidth: { sm: '100%' } }}
                            />
                        </Box>

                        {/* First Row: Department + Payment Mode */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                width: '100%'
                            }}
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
                        </Box>

                        {/* Second Row: Vendor Name + Sub-Department in same line with same size */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                width: '100%'
                            }}
                        >
                            {/* Vendor Name */}
                            <StyledTextField
                                fullWidth
                                label="Vendor Name"
                                name="vendorName"
                                value={form.vendorName}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="Enter vendor name"
                                sx={{ flex: 1 }}
                            />

                            {/* Sub-Department Dropdown */}
                            {reduxSubDept.length > 0 ? (
                                <FormControl fullWidth required sx={{ flex: 1 }}>
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
                            ) : (
                                <Box sx={{ flex: 1 }} />
                            )}
                        </Box>

                        {/* Description Section */}
                        <Paper elevation={0}>
                            {/* <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    fontWeight: 600,
                                    color: "text.primary"
                                }}
                            >
                                Description
                            </Typography> */}
                            <StyledTextField
                                fullWidth
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="Enter expense description"
                                multiline
                                rows={4}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'background.paper',
                                    }
                                }}
                            />
                        </Paper>

                        {/* File Upload Section */}
                        <Card
                            variant="outlined"
                            sx={{
                                border: "3px dashed",
                                borderColor: form.proof ? "success.main" : "primary.main",
                                backgroundColor: form.proof
                                    ? "success.lightest"
                                    : "primary.lightest",
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: form.proof ? "success.dark" : "primary.dark",
                                    backgroundColor: form.proof
                                        ? "success.light"
                                        : "primary.light",
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 600,
                                        color: form.proof ? "success.dark" : "primary.dark"
                                    }}
                                >
                                    UPLOAD BILL PROOF
                                </Typography>
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
                                        size="large"
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {form.proof ? "Proof Uploaded" : "Upload Bill Proof"}
                                    </Button>
                                </label>
                                {form.proof && (
                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                        sx={{ mt: 2, fontWeight: 600 }}
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
                            size="large"
                            sx={{
                                py: 2,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: 2,
                            }}
                        >
                            {loading ? "Creating Expense..." : "CREATE EXPENSE"}
                        </PrimaryButton>

                        {/* Response/Error Messages */}
                        {response && (
                            <Alert
                                severity="success"
                                sx={{ borderRadius: 2, fontSize: '1rem' }}
                                onClose={() => setResponse(null)}
                            >
                                {response}
                            </Alert>
                        )}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ borderRadius: 2, fontSize: '1rem' }}
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