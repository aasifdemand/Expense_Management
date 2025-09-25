import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Button,
    Grid,
    Box,
    Alert,
    InputAdornment,
    useTheme,
    alpha,
    Chip,
    Avatar,
    Divider
} from "@mui/material";
import {
    AttachFile,
    CloudUpload,
    Receipt,
    CurrencyRupee,
    CalendarToday,
    Business,
    Payment,
    CheckCircle,
    Person
} from "@mui/icons-material";

const ExpenseUploadForm = () => {
    const theme = useTheme();

    const [formData, setFormData] = useState({
        paidTo: '',
        amount: '',
        date: '',
        mode: '',
        department: '',
        subDepartment: '',
        reimbursementFlag: false,
        proof: null
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const paymentModes = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI'];

    const departments = [
        {
            name: 'Sales',
            value: 'Sales',
            subDepartments: []
        },
        {
            name: 'Data',
            value: 'Data',
            subDepartments: []
        },
        {
            name: 'IT',
            value: 'IT',
            subDepartments: ['Software', 'Hardware', 'Network', 'Support']
        },
        {
            name: 'Others',
            value: 'Others',
            subDepartments: []
        }
    ];

    const handleChange = (field) => (event) => {
        const value = event.target.value;

        if (field === 'department' && value !== 'IT') {
            // Reset subDepartment when department is not IT
            setFormData(prev => ({
                ...prev,
                [field]: value,
                subDepartment: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, proof: 'File size must be less than 5MB' }));
            return;
        }
        setFormData(prev => ({ ...prev, proof: file }));
        if (errors.proof) {
            setErrors(prev => ({ ...prev, proof: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.paidTo.trim()) newErrors.paidTo = 'Paid To is required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.mode) newErrors.mode = 'Payment mode is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (formData.department === 'IT' && !formData.subDepartment) {
            newErrors.subDepartment = 'Please select a sub-department';
        }
        if (!formData.proof) newErrors.proof = 'Proof of payment is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateForm()) {
            console.log('Expense submitted:', formData);
            setSuccess(true);
            setFormData({
                paidTo: '',
                amount: '',
                date: '',
                mode: '',
                department: '',
                subDepartment: '',
                reimbursementFlag: false,
                proof: null
            });

            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                mb: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    p: 4,
                }}
            >
                <Box display="flex" alignItems="center" gap={3}>
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 60,
                            height: 60,
                        }}
                    >
                        <Receipt sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.5
                            }}
                        >
                            Submit New Expense
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                        >
                            Fill out the form below to submit your expense for approval
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
                {success && (
                    <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            border: `1px solid ${alpha('#10b981', 0.2)}`,
                            '& .MuiAlert-icon': {
                                color: '#10b981'
                            }
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600}>
                            Expense submitted successfully!
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Notification sent to Kaleem Sir for review and approval.
                        </Typography>
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Basic Information Section */}
                        <Grid item size={{ xs: 12 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: theme.palette.text.primary, mb: 1 }}
                                >
                                    Basic Information
                                </Typography>
                                <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                            </Box>
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Paid To"
                                value={formData.paidTo}
                                onChange={handleChange('paidTo')}
                                error={!!errors.paidTo}
                                helperText={errors.paidTo}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.default,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange('amount')}
                                error={!!errors.amount}
                                helperText={errors.amount}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CurrencyRupee sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.default,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange('date')}
                                error={!!errors.date}
                                helperText={errors.date}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarToday sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.default,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Payment Mode"
                                value={formData.mode}
                                onChange={handleChange('mode')}
                                error={!!errors.mode}
                                helperText={errors.mode}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Payment sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.default,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            >
                                {paymentModes.map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        {mode}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Department Section */}
                        <Grid item size={{ xs: 12 }}>
                            <Box sx={{ my: 3 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: theme.palette.text.primary, mb: 1 }}
                                >
                                    Department Details
                                </Typography>
                                <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                            </Box>
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Department"
                                value={formData.department}
                                onChange={handleChange('department')}
                                error={!!errors.department}
                                helperText={errors.department}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Business sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: theme.palette.background.default,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: theme.palette.background.paper,
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.value} value={dept.value}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Sub-department for IT - appears only when IT is selected */}
                            {formData.department === 'IT' && (
                                <Box sx={{ mt: 3 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="IT Sub-Department"
                                        value={formData.subDepartment}
                                        onChange={handleChange('subDepartment')}
                                        error={!!errors.subDepartment}
                                        helperText={errors.subDepartment}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: theme.palette.background.default,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    bgcolor: theme.palette.background.paper,
                                                },
                                                '&.Mui-focused': {
                                                    bgcolor: theme.palette.background.paper,
                                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Select sub-department</em>
                                        </MenuItem>
                                        {departments.find(dept => dept.value === 'IT')?.subDepartments.map((subDept) => (
                                            <MenuItem key={subDept} value={subDept}>
                                                {subDept}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                            )}
                        </Grid>

                        <Grid item size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    bgcolor: theme.palette.background.default,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.reimbursementFlag}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reimbursementFlag: e.target.checked }))}
                                            sx={{
                                                color: theme.palette.primary.main,
                                                '&.Mui-checked': {
                                                    color: theme.palette.primary.main,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Already Reimbursed
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Check if this expense has been reimbursed
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </Grid>

                        {/* Upload Section */}
                        <Grid item size={{ xs: 12 }}>
                            <Box sx={{ my: 3 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: theme.palette.text.primary, mb: 1 }}
                                >
                                    Supporting Documents
                                </Typography>
                                <Divider sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                            </Box>
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<AttachFile />}
                                fullWidth
                                sx={{
                                    py: 3,
                                    borderRadius: 3,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: errors.proof ? theme.palette.error.main : theme.palette.primary.main,
                                    bgcolor: errors.proof ? alpha(theme.palette.error.main, 0.05) : alpha(theme.palette.primary.main, 0.05),
                                    color: errors.proof ? theme.palette.error.main : theme.palette.primary.main,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        borderColor: errors.proof ? theme.palette.error.dark : theme.palette.primary.dark,
                                        bgcolor: errors.proof ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {formData.proof ? formData.proof.name : 'Upload Proof of Payment'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.7 }}>
                                        Click to browse or drag and drop files here
                                    </Typography>
                                </Box>
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={handleFileChange}
                                    required
                                />
                            </Button>
                            {errors.proof && (
                                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {errors.proof}
                                </Typography>
                            )}
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['PDF', 'JPG', 'PNG', 'DOC'].map((format) => (
                                    <Chip
                                        key={format}
                                        label={format}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontWeight: 500,
                                        }}
                                    />
                                ))}
                                <Chip
                                    label="Max 5MB"
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        color: theme.palette.warning.main,
                                        fontWeight: 500,
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 3,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    boxShadow: `0 8px 25px -8px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 12px 35px -8px ${alpha(theme.palette.primary.main, 0.5)}`,
                                    }
                                }}
                            >
                                Submit Expense for Approval
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ExpenseUploadForm;