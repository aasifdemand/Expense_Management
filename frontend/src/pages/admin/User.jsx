import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, fetchAllUsers, resetUserPassword } from '../../store/authSlice';
import { useToastMessage } from '../../hooks/useToast';

// Material-UI Components
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    InputAdornment,
    FormControl,
    Select,
    Avatar,
    Stack,
    Tooltip,
    CircularProgress,
    InputLabel
} from '@mui/material';

// Material-UI Icons
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Business as BusinessIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    LockReset as LockResetIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Key as KeyIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { PrimaryButton, StyledFormControl, StyledSelect, StyledTextField } from '../../styles/budgeting.styles';

const UserDashboard = () => {
    const departments = [
        { value: 'GENERAL', label: 'General' },
        { value: 'HR', label: 'HR' },
        { value: 'IT', label: 'IT' },
        { value: 'DATA', label: 'Data' },
        { value: 'SALES', label: 'Sales' }
    ];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


    // State management
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.auth);
    const { success, error } = useToastMessage();

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const [newUser, setNewUser] = useState({
        name: '',
        password: '',
        department: departments[0].value
    });

    const [passwordVisible, setPasswordVisible] = useState({
        createPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const [resetPasswordModal, setResetPasswordModal] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setPasswordVisible(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Handle adding a new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await dispatch(createUser(newUser));

            if (createUser.fulfilled.match(res)) {
                success("User has been created successfully!");
                dispatch(fetchAllUsers());
                // Reset form
                setNewUser({
                    name: '',
                    password: '',
                    department: ''
                });
            } else {
                error("Error in creating the user");
            }
        } catch (err) {
            console.log(err);
            error("Error in creating the user");
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    // Handle reset password modal input changes
    const handleResetPasswordInputChange = (e) => {
        const { name, value } = e.target;
        setResetPasswordModal(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open reset password modal
    const openResetPasswordModal = (userId, userName) => {
        setResetPasswordModal({
            isOpen: true,
            userId: userId,
            userName: userName,
            newPassword: '',
            confirmPassword: ''
        });
    };

    // Close reset password modal
    const closeResetPasswordModal = () => {
        setResetPasswordModal({
            isOpen: false,
            userId: null,
            userName: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    // Handle reset password submission
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (resetPasswordModal.newPassword !== resetPasswordModal.confirmPassword) {
            error("New password and confirm password do not match!");
            return;
        }

        if (resetPasswordModal.newPassword.length < 6) {
            error("Password must be at least 6 characters long!");
            return;
        }

        try {
            await dispatch(resetUserPassword({
                userId: resetPasswordModal.userId,
                password: resetPasswordModal.newPassword
            })).unwrap();

            success("Password has been updated successfully!");
            closeResetPasswordModal();
        } catch (err) {
            const errorMessage = err?.message || err?.toString() || "Failed to update password. Please try again.";
            error(errorMessage);
        }
    };

    // Department options


    // Format last login date
    const formatLastLogin = (user) => {
        if (!user?.sessions?.length) return '-';

        const lastSession = user.sessions[user.sessions.length - 1];
        return new Date(lastSession?.lastLogin).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };

    return (
        <Box >
            {/* Add New User Section */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    background: 'linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: 'primary.main',
                    }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Add New User
                </Typography>

                <Box sx={{ mt: 2 }} component="form" onSubmit={handleAddUser}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            alignItems: 'flex-end',
                        }}
                    >
                        {/* Full Name Field - Takes available space */}
                        <StyledTextField
                            label="Full Name"
                            name="name"
                            value={newUser.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter full name"
                            size="small"
                            sx={{ flex: '1 1 200px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Password Field - Takes available space */}
                        <StyledTextField
                            label="Password"
                            name="password"
                            type={passwordVisible.createPassword ? "text" : "password"}
                            value={newUser.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter password"
                            inputProps={{ minLength: 6 }}
                            size="small"
                            sx={{ flex: '1 1 180px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('createPassword')}
                                            edge="end"
                                            size="small"
                                        >
                                            {passwordVisible.createPassword ?
                                                <VisibilityOffIcon /> :
                                                <VisibilityIcon />
                                            }
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Department Field - Takes available space */}
                        <StyledFormControl size="small" sx={{ flex: '1 1 180px' }}>
                            <InputLabel sx={{ fontWeight: 600 }}>Department</InputLabel>
                            <StyledSelect
                                MenuProps={{ disableScrollLock: true }}
                                select
                                label="Department"
                                name="department"
                                value={newUser.department || ''}
                                onChange={handleInputChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select Department</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </MenuItem>
                                ))}
                            </StyledSelect>
                        </StyledFormControl>

                        {/* Submit Button - Fixed width */}
                        <PrimaryButton
                            type="submit"
                            variant="contained"
                            size="medium"
                            startIcon={<AddIcon />}
                            sx={{
                                height: '50px',
                                borderRadius: 2,
                                minWidth: '120px',
                                flex: '0 0 auto'
                            }}
                        >
                            Add User
                        </PrimaryButton>
                    </Box>
                </Box>
            </Paper>

            {/* Users List Section */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden' // Prevents horizontal scrolling issues
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Users List
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : users?.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No users found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search criteria
                        </Typography>
                    </Box>
                ) : isMobile ? (
                    // Mobile Card View
                    <Stack spacing={2}>
                        {users?.map((user) => (
                            <Card key={user?._id} variant="outlined">
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* User Info */}
                                        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                                            <Typography variant="h6" fontWeight="600" noWrap>
                                                {user?.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 0.5,
                                                    minWidth: 0 // Important for flex truncation
                                                }}
                                                noWrap
                                            >
                                                <EmailIcon fontSize="small" sx={{ mr: 0.5, flexShrink: 0 }} />
                                                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {user?.email}
                                                </Box>
                                            </Typography>
                                        </Box>

                                        {/* Department & Status */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip
                                                icon={<BusinessIcon />}
                                                label={user?.department}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                icon={<CheckCircleIcon />}
                                                label="Active"
                                                color="success"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>

                                        {/* Last Login */}
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Last Login:</strong> {formatLastLogin(user)}
                                        </Typography>

                                        {/* Action Button */}
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<LockResetIcon />}
                                            onClick={() => openResetPasswordModal(user?._id, user?.name)}
                                            size="small"
                                        >
                                            Reset Password
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    // Desktop Table View - FIXED RESPONSIVENESS
                    <TableContainer
                        sx={{
                            maxWidth: '100%',
                            overflowX: 'auto',
                            '& .MuiTableCell-root': {
                                py: 2,
                                px: { xs: 1, sm: 2 }
                            }
                        }}
                    >
                        <Table sx={{ minWidth: 800 }}> {/* Set minimum width for table */}
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>User Information</TableCell>
                                    <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>Contact & Department</TableCell>
                                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users?.map((user) => (
                                    <TableRow
                                        key={user?._id}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="600" noWrap>
                                                    {user?.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    <strong>Last Login:</strong> {formatLastLogin(user)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="primary"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontWeight: 600
                                                    }}
                                                    noWrap
                                                >
                                                    <EmailIcon fontSize="small" sx={{ mr: 0.5, flexShrink: 0 }} />
                                                    {user?.email}
                                                </Typography>
                                                <Chip
                                                    icon={<BusinessIcon />}
                                                    label={user?.department}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ width: 'fit-content' }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<CheckCircleIcon />}
                                                label="Active"
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Reset Password">
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<LockResetIcon />}
                                                    onClick={() => openResetPasswordModal(user?._id, user?.name)}
                                                    size="small"
                                                >
                                                    Reset
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Reset Password Modal */}
            <Dialog
                open={resetPasswordModal.isOpen}
                onClose={closeResetPasswordModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2
                }}>
                    <LockResetIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Reset Password
                    <IconButton
                        aria-label="close"
                        onClick={closeResetPasswordModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'text.secondary',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ mt: 3 }}>
                    {/* User Info */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mb: 3,
                            background: 'grey.50'
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                <strong>User:</strong> &nbsp;{resetPasswordModal.userName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <KeyIcon fontSize="small" sx={{ mr: 1 }} />
                                Please enter the new password for this user
                            </Typography>
                        </Stack>
                    </Paper>

                    <Box component="form" onSubmit={handleResetPassword}>
                        <Stack spacing={3}>
                            {/* New Password Field */}
                            <StyledTextField
                                fullWidth
                                label="New Password"
                                name="newPassword"
                                type={passwordVisible.newPassword ? "text" : "password"}
                                value={resetPasswordModal.newPassword}
                                onChange={handleResetPasswordInputChange}
                                required
                                placeholder="Enter new password"
                                inputProps={{ minLength: 6 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('newPassword')}
                                                edge="end"
                                            >
                                                {passwordVisible.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Confirm Password Field */}
                            <StyledTextField
                                fullWidth
                                label="Confirm New Password"
                                name="confirmPassword"
                                type={passwordVisible.confirmPassword ? "text" : "password"}
                                value={resetPasswordModal.confirmPassword}
                                onChange={handleResetPasswordInputChange}
                                required
                                placeholder="Confirm new password"
                                inputProps={{ minLength: 6 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CheckCircleIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                                edge="end"
                                            >
                                                {passwordVisible.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeResetPasswordModal} size="large">
                        Cancel
                    </Button>
                    <PrimaryButton
                        onClick={handleResetPassword}
                        variant="contained"
                        size="large"
                        startIcon={<LockResetIcon />}
                    >
                        Reset Password
                    </PrimaryButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserDashboard;