import React, { useState } from "react";
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
    Divider,
    Card,
    CardContent,
    Alert,
    Fade,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import { useDispatch } from "react-redux";
import { addExpense } from "../../store/expenseSlice";
import { SectionCard } from "../../styles/budgeting.styles";


// Department structure with sub-departments
const departmentStructure = {
    "Data": [
        "Linkedin",
        "Ai Ark",
        "VPN",
        "Zoom info",
        "E-mail verifier",
        "Appolo"
    ],
    "IT": [
        "Software Development",
        "Infrastructure",
        "Network Administration",
        "Cyber Security",
        "IT Support",
        "Cloud Services"
    ],
    "SALES": [
        "Google work space ",
        "Go-Daddy",
        "Contabo",
        "Instantly",
        "Domain Renewal "
    ],
    "Office-Expenses": [
        "Rent",
        "Electricity Bill",
        "Office Maintenance",
        "Team Events",
        "Travel & Accommodation",
        "Apna Subscription",
        "Naukri Subscription",
        "Milk Bill ",
        "Cake ",
        "Swiggy",
        "Stationery ",
        "Laptop repair charges",
        "Courier Charges",
        "Salary ",
        "Remaining salary arrears",
        "Incentives ",
        "Remaining Incentives arrears",
        "Internet Bill",
        "Invoice Payments"



    ]
};

const paymentModes = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "UPI", "Cheque", "Online Payment"];

export default function CreateExpenseForm() {
    const dispatch = useDispatch();



    const [form, setForm] = useState({
        paidTo: "",
        amount: "",
        date: "",
        department: "",
        subDepartment: "",
        paymentMode: "",
        isReimbursed: false,
        proof: null,
        budget: ""
    });
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    // Get sub-departments based on selected department
    const getSubDepartments = () => departmentStructure[form.department] || [];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "checkbox") {
            setForm({ ...form, [name]: checked });
        } else if (type === "file") {
            setForm({ ...form, proof: files[0] });
        } else if (name === "department") {
            setForm({ ...form, department: value, subDepartment: "" });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

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

        if (!form.paidTo || !form.amount || !form.date || !form.department || !form.paymentMode) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }

        const hasSubDepartments = getSubDepartments().length > 0;
        if (hasSubDepartments && !form.subDepartment) {
            setError("Please select a sub-department");
            setLoading(false);
            return;
        }

        try {
            const resultAction = await dispatch(addExpense(form));
            if (addExpense.rejected.match(resultAction)) {
                throw new Error(resultAction.payload || "Failed to add expense");
            }

            setResponse("Expense created successfully!");
            setForm({
                paidTo: "",
                amount: "",
                date: new Date().toISOString().slice(0, 10),
                department: "",
                subDepartment: "",
                paymentMode: "",
                isReimbursed: false,
                proof: null,
                budget: ""
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const subDepartments = getSubDepartments();
    const showSubDepartment = subDepartments.length > 0;

    return (
        <SectionCard>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    {/* <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                        }}
                    >
                        Create New Expense
                    </Typography> */}
                    {/* <Typography variant="body1" color="primary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Add your expense details and upload bill proof
                    </Typography> */}
                </Box>

                {/* <Divider sx={{ mb: 4 }} /> */}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3}>

                        {/* Paid To */}
                        <TextField
                            fullWidth
                            label="Paid To"
                            name="paidTo"
                            value={form.paidTo}
                            onChange={handleChange}
                            required
                            variant="outlined"
                            size="medium"
                            placeholder="Enter recipient name"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } } }}
                        />


                        {/* Amount + Date */}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
                            <TextField
                                fullWidth
                                label="Amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="medium"
                                placeholder="0.00"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } } }}
                            />

                            <TextField
                                fullWidth
                                label="Date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                variant="outlined"
                                size="medium"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } } }}
                            />
                        </Stack>

                        {/* Department + Payment Mode */}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    label="Department"
                                    variant="outlined"
                                    sx={{ borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } }}
                                >
                                    {Object.keys(departmentStructure).map((dept) => (
                                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Payment Mode</InputLabel>
                                <Select
                                    name="paymentMode"
                                    value={form.paymentMode}
                                    onChange={handleChange}
                                    label="Payment Mode"
                                    variant="outlined"
                                    sx={{ borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } }}
                                >
                                    {paymentModes.map((mode) => (
                                        <MenuItem key={mode} value={mode}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PaymentIcon sx={{ fontSize: 18 }} />{mode}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        {/* Sub-Department */}
                        <Fade in={showSubDepartment} timeout={300}>
                            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                                <FormControl fullWidth required sx={{ flex: 1 }}>
                                    <InputLabel>Sub-Department</InputLabel>
                                    <Select
                                        name="subDepartment"
                                        value={form.subDepartment}
                                        onChange={handleChange}
                                        label="Sub-Department"
                                        variant="outlined"
                                        sx={{ borderRadius: 2, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'grey.50' } }}
                                    >
                                        {subDepartments.map((subDept) => (
                                            <MenuItem key={subDept} value={subDept}>{subDept}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {showSubDepartment && !form.subDepartment && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                                        ❌ Please select a sub-department for {form.department}
                                    </Typography>
                                )}
                            </Box>
                        </Fade>

                        {/* File Upload Section */}
                        <Card
                            variant="outlined"
                            sx={{ border: '2px dashed', borderColor: form.proof ? 'success.main' : 'primary.light', backgroundColor: form.proof ? 'success.lightest' : 'primary.lightest', borderRadius: 3, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { borderColor: form.proof ? 'success.dark' : 'primary.main', backgroundColor: form.proof ? 'success.50' : 'primary.50' } }}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <input type="file" hidden id="proof-upload" name="proof" onChange={handleChange} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />
                                <label htmlFor="proof-upload" style={{ cursor: 'pointer' }}>
                                    <Button component="span" startIcon={<UploadFileIcon />} variant={form.proof ? "contained" : "outlined"} color={form.proof ? "success" : "primary"} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1 }}>
                                        {form.proof ? 'Proof Uploaded' : 'Upload Bill Proof'}
                                    </Button>
                                </label>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Supported formats: JPG, PNG, PDF, DOC (Max 10MB)
                                </Typography>
                                {form.proof && <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 600 }}>✅ {form.proof.name}</Typography>}
                            </CardContent>
                        </Card>

                        {/* Validation Message */}
                        {!form.proof && <Alert severity="error" sx={{ borderRadius: 2, border: '1px solid #f44336' }}>❌ Bill proof is required to create an expense</Alert>}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={loading || !form.proof || (showSubDepartment && !form.subDepartment)}
                            fullWidth
                            size="medium"
                            sx={{
                                background: (form.proof && (!showSubDepartment || form.subDepartment)) ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "grey.400",
                                textTransform: "none",
                                fontWeight: "600",
                                borderRadius: 3,
                                py: 1.5,
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                boxShadow: (form.proof && (!showSubDepartment || form.subDepartment)) ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': (form.proof && (!showSubDepartment || form.subDepartment)) ? { background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)", transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' } : {},
                                '&:disabled': { background: 'grey.300', transform: 'none', boxShadow: 'none' }
                            }}
                        >
                            {loading ? "Creating Expense..." : "Create Expense"}
                        </Button>

                        {/* Response/Error Messages */}
                        {response && <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setResponse(null)}>{response}</Alert>}
                        {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                    </Stack>
                </Box>
            </Box>
        </SectionCard>
    );
}
