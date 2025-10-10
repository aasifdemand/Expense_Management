import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, fetchUser } from "../../store/authSlice";
import { useToastMessage } from '../../hooks/useToast';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { PrimaryButton, StyledTextField } from '../../styles/budgeting.styles';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, updateProfileLoading } = useSelector((state) => state.auth);
  const { success, error: catchError } = useToastMessage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Initialize user profile from Redux state
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Event Handlers
  const handleProfileChange = (key, value) => {
    setUserProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Action Functions
  const saveProfile = async () => {
    if (!user?._id) {
      catchError("User ID is missing. Please log in again.");
      return;
    }

    try {
      const result = await dispatch(updateUserProfile({
        ...userProfile,
        userId: user._id
      })).unwrap();

      setIsEditingProfile(false);

      if (updateUserProfile.fulfilled.matches(result)) {
        success("Updated profile successfully");
        setTimeout(() => { dispatch(fetchUser()) }, 5000);
      }
    } catch (error) {
      catchError("Error in updating the profile: " + error?.message);
      console.log(error);
    }
  };

  return (
    <Box
      className="settings-container"
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      <Box
        className="settings-content"
        sx={{
          margin: '0 auto',
          p: { xs: 2, sm: 3 },

          width: '100%'
        }}
      >

        {/* Header */}
        <Box className="content-header" sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            className="section-title"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Account Settings
          </Typography>
          <Typography
            variant="h6"
            className="section-description"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Manage your account preferences and profile
          </Typography>
        </Box>

        <Box className="settings-scrollable" sx={{ width: '100%' }}>
          <Box className="settings-section" sx={{ width: '100%' }}>
            {/* Profile Information Section */}
            <Box className="setting-group" sx={{ width: '100%' }}>
              <Typography
                variant="h5"
                className="setting-group-title"
                fontWeight="600"
                gutterBottom
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                Profile Information
              </Typography>

              {!isEditingProfile ? (
                // View Mode - Improved responsive layout
                <Paper
                  className="account-card"
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    gap: { xs: 2, sm: 3 },
                    width: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <Avatar
                    className="account-avatar-large"
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      bgcolor: 'primary.main',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      flexShrink: 0
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Avatar>

                  <Box
                    className="account-details"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      width: '100%',
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  >
                    <Typography
                      variant="h6"
                      className="account-name"
                      fontWeight="600"
                      gutterBottom
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                    >
                      {user?.name}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        gap: 1,
                        mb: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <EmailIcon fontSize="small" color="action" />
                      <Typography
                        variant="body1"
                        className="account-email"
                        color="primary"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          textAlign: { xs: 'center', sm: 'left' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>

                    {user?.phone && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}
                      >
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          className="account-detail"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {user?.phone}
                        </Typography>
                      </Box>
                    )}

                    {user?.userLoc && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}
                      >
                        <LocationIcon fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          className="account-detail"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {user?.userLoc}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}
                    >
                      <AdminIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        className="account-detail"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        Role: {user?.role === 'superadmin' ? 'Super Admin' : 'User'}
                      </Typography>
                    </Box>
                  </Box>

                  <PrimaryButton
                    className="action-button primary"
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditingProfile(true)}
                    sx={{
                      flexShrink: 0,
                      width: { xs: '100%', sm: 'auto' },
                      mt: { xs: 1, sm: 0 }
                    }}
                    size={isMobile ? "small" : "medium"}
                  >
                    Edit Profile
                  </PrimaryButton>
                </Paper>
              ) : (
                // Edit Mode - Improved responsive layout
                <Paper
                  className="profile-form"
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    width: '100%'
                  }}
                >
                  <Box className="form-group" sx={{ mb: 3 }}>
                    <Typography
                      variant="body1"
                      className="form-label"
                      fontWeight="500"
                      gutterBottom
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      Full Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box className="form-group" sx={{ mb: 3 }}>
                    <Typography
                      variant="body1"
                      className="form-label"
                      fontWeight="500"
                      gutterBottom
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      Email Address
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box className="form-group" sx={{ mb: 3 }}>
                    <Typography
                      variant="body1"
                      className="form-label"
                      fontWeight="500"
                      gutterBottom
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      Phone Number
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box
                    className="form-actions"
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}
                  >
                    <PrimaryButton
                      className="action-button primary"
                      variant="contained"
                      onClick={saveProfile}
                      disabled={updateProfileLoading}
                      startIcon={updateProfileLoading ? <CircularProgress size={16} /> : null}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      {updateProfileLoading ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>
                    <Button
                      className="action-button secondary"
                      variant="outlined"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={updateProfileLoading}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;