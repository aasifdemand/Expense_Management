import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Typography,
    InputLabel,
    Select,
    FormControl,
    Paper,
    Stack,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch } from 'react-redux';
import { addExpense } from '../../store/expenseSlice';

const departments = ['Data', 'IT', 'SALES'];

export default function CreateExpenseForm() {
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        paidTo: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        department: '',
        isReimbursed: false,
        proof: null,
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            setForm({ ...form, [name]: checked });
        } else if (type === 'file') {
            setForm({ ...form, proof: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const resultAction = await dispatch(addExpense(form));
            if (addExpense.rejected.match(resultAction)) {
                throw new Error(resultAction.payload || 'Failed to add expense');
            }
            setResponse('Expense created successfully');
            setForm({
                paidTo: '',
                amount: '',
                date: new Date().toISOString().slice(0, 10),
                department: '',
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
        <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4, mt: 6 }}>
            <Typography variant="h4" gutterBottom align="center">
                Create Expense
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="Paid To"
                        name="paidTo"
                        value={form.paidTo}
                        onChange={handleChange}
                        required
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={form.amount}
                            onChange={handleChange}
                            required
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
                        />
                    </Stack>

                    <FormControl fullWidth required>
                        <InputLabel>Department</InputLabel>
                        <Select
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            label="Department"
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                    {dept}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.isReimbursed}
                                onChange={handleChange}
                                name="isReimbursed"
                            />
                        }
                        label="Is Reimbursed?"
                    />

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                    >
                        Upload Proof (Optional)
                        <input type="file" hidden name="proof" onChange={handleChange} />
                    </Button>

                    {form.proof && (
                        <Typography variant="body2" color="text.secondary">
                            Selected file: {form.proof.name}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? 'Submitting...' : 'Create Expense'}
                    </Button>

                    {response && (
                        <Typography color="success.main" sx={{ mt: 2 }}>
                            ✅ {response}
                        </Typography>
                    )}

                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            ❌ {error}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}
