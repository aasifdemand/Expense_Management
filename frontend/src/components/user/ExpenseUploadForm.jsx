import React, { useState } from "react";
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
  Stack,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch } from "react-redux";
import { addExpense } from "../../store/expenseSlice";
import { SectionCard } from "../../styles/budgeting.styles"; // design wrapper

const departments = ["Data", "IT", "SALES"];

export default function CreateExpenseForm() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    paidTo: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    department: "",
    isReimbursed: false,
    proof: null,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
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
        throw new Error(resultAction.payload || "Failed to add expense");
      }
      setResponse("Expense created successfully");
      setForm({
        paidTo: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        department: "",
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create Expense
        </Typography>
        <Divider sx={{ mb: 3 }} />

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
            />

            {/* Amount + Date */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
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

            {/* Department */}
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

            {/* Reimbursed Checkbox */}
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

            {/* File Upload */}
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

            {/* Submit (Gradient button style) */}
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              sx={{
                mt: 2,
                background:
                  "linear-gradient(90deg, #1E88E5 0%, #42A5F5 100%)",
                textTransform: "none",
                fontWeight: "600",
                borderRadius: 2,
                py: 1.2,
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #1565C0 0%, #1E88E5 100%)",
                },
              }}
            >
              {loading ? "Submitting..." : "Create Expense"}
            </Button>

            {/* Response/Error */}
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
      </Box>
    </SectionCard>
  );
}
