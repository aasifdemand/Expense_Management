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
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import { useDispatch, useSelector } from "react-redux";
import { addExpense } from "../../store/expenseSlice";
import { PrimaryButton, StyledSelect, StyledTextField } from "../../styles/budgeting.styles";
import {
    fetchDepartments,
    fetchSubDepartments,
} from "../../store/departmentSlice";
import { useNavigate } from "react-router-dom";
import { AccountBalance, Add, Business, Check, CheckCircle, Description, FolderSpecial, UploadFile } from "@mui/icons-material";

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
        console.log("form: ", form);


        if (!form.proof) {
            setError("Please upload proof/bill for the expense");
            setLoading(false);
            return;
        }

        if (
            !form.amount ||
            !form.department ||
            !form.paymentMode || !form.vendorName
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
            const resultAction = await dispatch(addExpense({ ...form, vendor: form?.vendorName }));
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
        <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'visible',
            margin: { xs: 1, sm: 1, md: 4 }
        }}>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={4}>
                        {/* Header */}
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    mb: 1
                                }}
                            >
                                Create New Expense
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    opacity: 0.8
                                }}
                            >
                                Fill in the details below to record your expense
                            </Typography>
                        </Box>

                        {/* Amount Section - More Prominent */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                backgroundColor: 'primary.lightest',
                                border: '2px solid',
                                borderColor: 'primary.light',
                                borderRadius: 2
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    color: 'primary.dark',
                                    mb: 1
                                }}
                            >
                                AMOUNT
                            </Typography>
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="h6" color="primary.main">
                                                ₹
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    maxWidth: { sm: '100%' },
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        fontSize: '1.2rem',
                                        fontWeight: 600
                                    }
                                }}
                            />
                        </Paper>

                        {/* First Row: Department + Payment Mode */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 3,
                                width: '100%'
                            }}
                        >
                            {/* Department Dropdown */}
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel sx={{ fontWeight: 600 }}>Department</InputLabel>
                                <StyledSelect
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    label="Department"
                                    variant="outlined"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center'
                                        }
                                    }}
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept._id} value={dept._id}>
                                            <Box sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                width: '100%'
                                            }}>
                                                <AccountBalance sx={{ fontSize: 20, color: 'primary.main' }} />
                                                <Typography>{dept.name}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>

                            {/* Payment Mode Dropdown */}
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel sx={{ fontWeight: 600 }}>Payment Mode</InputLabel>
                                <StyledSelect
                                    name="paymentMode"
                                    value={form.paymentMode}
                                    onChange={handleChange}
                                    label="Payment Mode"
                                    variant="outlined"
                                >
                                    {paymentModes.map((mode) => (
                                        <MenuItem key={mode} value={mode}>
                                            <Box sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5
                                            }}>
                                                <PaymentIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                                                <Typography>{mode}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                        </Box>

                        {/* Second Row: Vendor Name + Sub-Department */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 3,
                                width: '100%'
                            }}
                        >
                            {/* Vendor Name */}
                            <FormControl fullWidth sx={{ flex: 1 }}>
                                <StyledTextField
                                    fullWidth
                                    label="Vendor Name"
                                    name="vendorName"
                                    value={form.vendorName}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Enter vendor name"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Business color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </FormControl>

                            {/* Sub-Department Dropdown */}
                            {reduxSubDept.length > 0 ? (
                                <FormControl fullWidth required sx={{ flex: 1 }}>
                                    <InputLabel sx={{ fontWeight: 600 }}>Sub-Department</InputLabel>
                                    <StyledSelect
                                        name="subDepartment"
                                        value={form.subDepartment}
                                        onChange={handleChange}
                                        label="Sub-Department"
                                        variant="outlined"
                                    >
                                        {reduxSubDept.map((sub) => (
                                            <MenuItem key={sub._id} value={sub._id}>
                                                <Box sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5
                                                }}>
                                                    <FolderSpecial sx={{ fontSize: 20, color: 'info.main' }} />
                                                    <Typography>{sub.name}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </StyledSelect>
                                </FormControl>
                            ) : (
                                <Box sx={{ flex: 1 }} />
                            )}
                        </Box>

                        {/* Description Section */}
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mb: 2,
                                    fontWeight: 600,
                                    color: "text.primary",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Description color="primary" />
                                Description
                            </Typography>
                            <StyledTextField
                                fullWidth
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="Provide a detailed description of this expense..."
                                multiline
                                rows={4}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'background.paper',
                                        fontSize: '1rem'
                                    }
                                }}
                            />
                        </Paper>

                        {/* File Upload Section */}
                        <Card
                            variant="outlined"
                            sx={{
                                border: "3px dashed",
                                borderColor: form.proof ? "success.main" : "grey.300",
                                backgroundColor: form.proof ? "success.50" : "grey.50",
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    borderColor: form.proof ? "success.dark" : "primary.main",
                                    backgroundColor: form.proof ? "success.100" : "grey.100",
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", py: 5 }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '50%',
                                            backgroundColor: form.proof ? "success.main" : "primary.main",
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {form.proof ? (
                                            <Check sx={{ fontSize: 30 }} />
                                        ) : (
                                            <UploadFile sx={{ fontSize: 30 }} />
                                        )}
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 1,
                                                fontWeight: 600,
                                                color: form.proof ? "success.dark" : "text.primary"
                                            }}
                                        >
                                            {form.proof ? "Bill Proof Uploaded" : "Upload Bill Proof"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                mb: 2
                                            }}
                                        >
                                            {form.proof
                                                ? "Your document has been successfully uploaded"
                                                : "Supported formats: JPG, PNG, PDF, DOC (Max 10MB)"
                                            }
                                        </Typography>
                                    </Box>

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
                                            startIcon={form.proof ? <Check /> : <UploadFile />}
                                            variant={form.proof ? "outlined" : "contained"}
                                            color={form.proof ? "success" : "primary"}
                                            size="large"
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                borderRadius: 2
                                            }}
                                        >
                                            {form.proof ? "Change File" : "Choose File"}
                                        </Button>
                                    </label>

                                    {form.proof && (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mt: 2,
                                            p: 2,
                                            backgroundColor: 'success.50',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'success.200'
                                        }}>
                                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                            <Typography
                                                variant="body2"
                                                color="success.main"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {form.proof.name}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <PrimaryButton
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                            disabled={
                                loading || !form.proof || (reduxSubDept.length > 0 && !form.subDepartment)
                            }
                            fullWidth
                            size="large"
                            sx={{
                                py: 2.5,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: 2,
                                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px 0 rgba(0,0,0,0.25)',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? "Creating Expense..." : "CREATE EXPENSE"}
                        </PrimaryButton>

                        {/* Response/Error Messages */}
                        {response && (
                            <Alert
                                severity="success"
                                sx={{
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    alignItems: 'center',
                                    '& .MuiAlert-message': {
                                        py: 1
                                    }
                                }}
                                onClose={() => setResponse(null)}
                            >
                                <Typography fontWeight={600}>{response}</Typography>
                            </Alert>
                        )}
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    alignItems: 'center',
                                    '& .MuiAlert-message': {
                                        py: 1
                                    }
                                }}
                                onClose={() => setError(null)}
                            >
                                <Typography fontWeight={600}>{error}</Typography>
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Card>
    );
}