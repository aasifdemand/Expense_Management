import React, { useState } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    language: 'english',
    fontSize: 'medium',
    twoFactor: false,
    sound: true,
    vibration: true
  });

  const [activeSection, setActiveSection] = useState('account');
  const [saveStatus, setSaveStatus] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Software developer and tech enthusiast',
    location: 'New York, USA'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // API Functions
  const changePasswordAPI = async (passwordData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (passwordData.currentPassword !== 'currentPassword123') {
          reject({ message: 'Current password is incorrect' });
        } else if (passwordData.newPassword.length < 6) {
          reject({ message: 'New password must be at least 6 characters' });
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
          reject({ message: 'New passwords do not match' });
        } else {
          resolve({ message: 'Password changed successfully' });
        }
      }, 1500);
    });
  };

  const updateProfileAPI = async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Profile updated successfully', data: profileData });
      }, 1000);
    });
  };

  const saveSettingsAPI = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Settings saved successfully' });
      }, 1000);
    });
  };

  // Event Handlers
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (key, value) => {
    setUserProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (key, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [key]: value
    }));
    if (passwordErrors[key]) {
      setPasswordErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  // Validation Functions
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Action Functions
  const saveSettings = async () => {
    setSaveStatus('Saving settings...');
    try {
      await saveSettingsAPI(settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setSaveStatus('Error saving settings. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const resetSettings = () => {
    setSettings({
      notifications: true,
      emailUpdates: false,
      autoSave: true,
      language: 'english',
      fontSize: 'medium',
      twoFactor: false,
      sound: true,
      vibration: true
    });
    setSaveStatus('Settings reset to default!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const saveProfile = async () => {
    setSaveStatus('Saving profile...');
    try {
      const result = await updateProfileAPI(userProfile);
      setUserProfile(result.data);
      setIsEditingProfile(false);
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setSaveStatus('Error updating profile. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setSaveStatus('Changing password...');
    try {
      await changePasswordAPI(passwordForm);
      setSaveStatus('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus(error.message);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  // CSS Styles
  const cssStyles = `
    .settings-container {
      display: flex;
      min-height: 100vh;
      background-color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
    }

    /* Sidebar Styles */
    .settings-sidebar {
      width: 280px;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .sidebar-header {
      padding: 30px 25px;
      border-bottom: 1px solid #e2e8f0;
    }

    .sidebar-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1a202c;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 2px;
    }

    .user-email {
      font-size: 14px;
      color: #718096;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
    }

    .sidebar-item {
      position: relative;
      display: flex;
      align-items: center;
      padding: 15px 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
    }

    .sidebar-item:hover {
      background-color: #edf2f7;
    }

    .sidebar-item.active {
      background-color: #ebf8ff;
      border-left-color: #3182ce;
    }

    .sidebar-item.active .sidebar-label {
      color: #3182ce;
      font-weight: 600;
    }

    .sidebar-icon {
      margin-right: 12px;
      font-size: 18px;
    }

    .sidebar-label {
      font-size: 15px;
      font-weight: 500;
      color: #4a5568;
    }

    .active-indicator {
      position: absolute;
      right: 20px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #3182ce;
    }

    .sidebar-footer {
      padding: 20px 25px;
      border-top: 1px solid #e2e8f0;
    }

    .app-version {
      font-size: 12px;
      color: #a0aec0;
      text-align: center;
    }

    /* Content Styles */
    .settings-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;
    }

    .content-header {
      padding: 30px 40px 20px 40px;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1a202c;
    }

    .section-description {
      font-size: 16px;
      color: #718096;
      margin: 0;
    }

    .settings-scrollable {
      flex: 1;
      overflow-y: auto;
      padding: 0 40px;
    }

    .settings-section {
      padding: 30px 0;
    }

    .setting-group {
      margin-bottom: 40px;
    }

    .setting-group-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #2d3748;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }

    .setting-item:hover {
      border-color: #cbd5e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .setting-info {
      flex: 1;
    }

    .setting-label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #2d3748;
    }

    .setting-description {
      font-size: 14px;
      color: #718096;
      line-height: 1.4;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e0;
      transition: 0.4s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: #3182ce;
    }

    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    /* Buttons */
    .action-button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .action-button.primary {
      background: #3182ce;
      color: white;
    }

    .action-button.primary:hover {
      background: #2c5aa0;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
    }

    .action-button.secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .action-button.secondary:hover {
      background: #cbd5e0;
      transform: translateY(-1px);
    }

    .action-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .action-button:disabled:hover {
      transform: none;
      box-shadow: none;
    }

    /* Forms */
    .profile-form, .password-form {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .password-section {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .password-header {
      margin-bottom: 25px;
    }

    .password-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1a202c;
    }

    .password-description {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .form-input.error {
      border-color: #e53e3e;
    }

    .form-input.error:focus {
      border-color: #e53e3e;
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }

    .error-message {
      color: #e53e3e;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 25px;
    }

    /* Account Card */
    .account-card {
      display: flex;
      align-items: center;
      padding: 25px;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      gap: 20px;
      margin-bottom: 30px;
    }

    .account-avatar-large {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: white;
    }

    .account-details {
      flex: 1;
    }

    .account-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1a202c;
    }

    .account-email {
      font-size: 16px;
      color: #718096;
      margin-bottom: 4px;
    }

    .account-detail {
      font-size: 14px;
      color: #a0aec0;
      margin-bottom: 2px;
    }

    /* Password Requirements */
    .password-requirements {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
    }

    .requirements-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
    }

    .requirement {
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .requirement.valid {
      color: #38a169;
    }

    .requirement.valid::before {
      content: "✓ ";
      font-weight: bold;
    }

    /* Footer */
    .settings-footer {
      padding: 30px 40px;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
    }

    .button-group {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .save-button, .reset-button {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 160px;
    }

    .save-button.primary {
      background: #3182ce;
      color: white;
    }

    .save-button.primary:hover {
      background: #2c5aa0;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
    }

    .reset-button.secondary {
      background: transparent;
      border: 2px solid #a0aec0;
      color: #4a5568;
    }

    .reset-button.secondary:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
    }

    /* Status Message */
    .status-message {
      margin-top: 15px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
      animation: fadeIn 0.5s ease-out;
    }

    .status-message.success {
      background-color: #c6f6d5;
      color: #276749;
      border: 1px solid #9ae6b4;
    }

    .status-message.info {
      background-color: #bee3f8;
      color: #2c5aa0;
      border: 1px solid #90cdf4;
    }

    .status-message.error {
      background-color: #fed7d7;
      color: #c53030;
      border: 1px solid #feb2b2;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .settings-container {
        flex-direction: column;
      }
      
      .settings-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .content-header,
      .settings-scrollable,
      .settings-footer {
        padding: 20px;
      }
      
      .button-group {
        flex-direction: column;
      }
      
      .save-button,
      .reset-button {
        width: 100%;
      }
      
      .account-card {
        flex-direction: column;
        text-align: center;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style>{cssStyles}</style>
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Settings</h2>
            <div className="user-profile">
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <div className="user-name">{userProfile.name}</div>
                <div className="user-email">{userProfile.email}</div>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            {[
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
              { id: 'account', label: 'Account', icon: '👤' }
            ].map((section) => (
              <div
                key={section.id}
                className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="sidebar-icon">{section.icon}</span>
                <span className="sidebar-label">{section.label}</span>
                {activeSection === section.id && <div className="active-indicator"></div>}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="app-version">Version 2.1.4</div>
          </div>
        </div>

        <div className="settings-content">
          <div className="content-header">
            <h1 className="section-title">
              {activeSection === 'notifications' && 'Notification Settings'}
              {activeSection === 'privacy' && 'Privacy & Security'}
              {activeSection === 'account' && 'Account Settings'}
            </h1>
            <p className="section-description">
              {activeSection === 'notifications' && 'Manage how and when you receive notifications'}
              {activeSection === 'privacy' && 'Control your privacy and security settings'}
              {activeSection === 'account' && 'Manage your account preferences and profile'}
            </p>
          </div>

          <div className="settings-scrollable">
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3 className="setting-group-title">Push Notifications</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Enable Notifications</div>
                      <div className="setting-description">Receive push notifications for important updates</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Email Updates</div>
                      <div className="setting-description">Receive regular updates via email</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <h3 className="setting-group-title">Notification Types</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Sound</div>
                      <div className="setting-description">Play sound for notifications</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={(e) => handleSettingChange('sound', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Vibration</div>
                      <div className="setting-description">Vibrate for notifications</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.vibration}
                        onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3 className="setting-group-title">Security</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Two-Factor Authentication</div>
                      <div className="setting-description">Add an extra layer of security to your account</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactor}
                        onChange={(e) => handleSettingChange('twoFactor', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="settings-section">
                {/* Profile Information Section */}
                <div className="setting-group">
                  <h3 className="setting-group-title">Profile Information</h3>

                  {!isEditingProfile ? (
                    <div className="account-card">
                      <div className="account-avatar-large">👤</div>
                      <div className="account-details">
                        <div className="account-name">{userProfile.name}</div>
                        <div className="account-email">{userProfile.email}</div>
                        <div className="account-detail">{userProfile.phone}</div>
                        <div className="account-detail">{userProfile.location}</div>
                        <div className="account-detail">{userProfile.bio}</div>
                      </div>
                      <button
                        className="action-button primary"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div className="profile-form">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={userProfile.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={userProfile.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={userProfile.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-input"
                          value={userProfile.location}
                          onChange={(e) => handleProfileChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                          className="form-input form-textarea"
                          value={userProfile.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          placeholder="Tell us about yourself"
                          rows="3"
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          className="action-button primary"
                          onClick={saveProfile}
                          disabled={saveStatus.includes('Saving')}
                        >
                          {saveStatus.includes('Saving') ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="action-button secondary"
                          onClick={() => setIsEditingProfile(false)}
                          disabled={saveStatus.includes('Saving')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Password Section */}
                <div className="setting-group">
                  <h3 className="setting-group-title">Security</h3>

                  <div className="password-section">
                    <div className="password-header">
                      <h4 className="password-title">Change Password</h4>
                      <p className="password-description">Update your password for enhanced security</p>
                    </div>

                    {!isChangingPassword ? (
                      <button
                        className="action-button primary"
                        onClick={() => setIsChangingPassword(true)}
                      >
                        Change Password
                      </button>
                    ) : (
                      <div className="password-form">
                        <div className="form-group">
                          <label className="form-label">Current Password</label>
                          <input
                            type="password"
                            className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                            value={passwordForm.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            placeholder="Enter your current password"
                          />
                          {passwordErrors.currentPassword && (
                            <span className="error-message">{passwordErrors.currentPassword}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                            value={passwordForm.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            placeholder="Enter your new password"
                          />
                          {passwordErrors.newPassword && (
                            <span className="error-message">{passwordErrors.newPassword}</span>
                          )}

                          <div className="password-requirements">
                            <div className="requirements-title">Password Requirements:</div>
                            <div className={`requirement ${passwordForm.newPassword.length >= 6 ? 'valid' : ''}`}>
                              At least 6 characters long
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your new password"
                          />
                          {passwordErrors.confirmPassword && (
                            <span className="error-message">{passwordErrors.confirmPassword}</span>
                          )}
                        </div>

                        <div className="form-actions">
                          <button
                            className="action-button primary"
                            onClick={changePassword}
                            disabled={saveStatus.includes('Changing')}
                          >
                            {saveStatus.includes('Changing') ? 'Changing...' : 'Update Password'}
                          </button>
                          <button
                            className="action-button secondary"
                            onClick={cancelPasswordChange}
                            disabled={saveStatus.includes('Changing')}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="settings-footer">
            <div className="button-group">
              <button
                className="save-button primary"
                onClick={saveSettings}
                disabled={saveStatus.includes('Saving') && !saveStatus.includes('Profile') && !saveStatus.includes('Password')}
              >
                {saveStatus.includes('Saving settings') ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="reset-button secondary"
                onClick={resetSettings}
                disabled={saveStatus.includes('Saving')}
              >
                Reset to Default
              </button>
            </div>

            {saveStatus && (
              <div className={`status-message ${saveStatus.includes('successfully') ? 'success' :
                saveStatus.includes('Error') || saveStatus.includes('incorrect') || saveStatus.includes('do not match') ? 'error' : 'info'
                }`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;