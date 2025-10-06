import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, fetchUser } from "../../store/authSlice"

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, updateProfileLoading, updateProfileError } = useSelector((state) => state.auth);

  const [activeSection, setActiveSection] = useState('account');
  const [saveStatus, setSaveStatus] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);


  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    userLoc: ''
  });




  // Initialize user profile from Redux state
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        userLoc: user.userLoc || ''
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
    setSaveStatus('Saving profile...');

    try {
      const result = await dispatch(updateUserProfile({ ...userProfile, userId: user?._id })).unwrap();
      setIsEditingProfile(false);
      setSaveStatus('Profile updated successfully!');

      if (updateUserProfile.fulfilled.matches(result)) {
        await dispatch(fetchUser());
      }


      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus(error || 'Error updating profile. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
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
      .settings-scrollable {
        padding: 20px;
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

  if (!user) {
    return <div>Loading...</div>;
  }

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
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            {[
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
            <div className="app-version">Version 1.0.0</div>
          </div>
        </div>

        <div className="settings-content">
          <div className="content-header">
            <h1 className="section-title">Account Settings</h1>
            <p className="section-description">Manage your account preferences and profile</p>
          </div>

          <div className="settings-scrollable">
            {activeSection === 'account' && (
              <div className="settings-section">
                {/* Profile Information Section */}
                <div className="setting-group">
                  <h3 className="setting-group-title">Profile Information</h3>

                  {!isEditingProfile ? (
                    <div className="account-card">
                      <div className="account-avatar-large">👤</div>
                      <div className="account-details">
                        <div className="account-name">{user.name}</div>
                        <div className="account-email">{user.email}</div>
                        <div className="account-detail">{user.phone}</div>
                        <div className="account-detail">{user.userLoc}</div>
                        <div className="account-detail">
                          Role: {user.role === 'superadmin' ? 'Super Admin' : 'User'}
                        </div>

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
                          value={userProfile.userLoc}
                          onChange={(e) => handleProfileChange('userLoc', e.target.value)}
                          placeholder="Enter your location"
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          className="action-button primary"
                          onClick={saveProfile}
                          disabled={updateProfileLoading}
                        >
                          {updateProfileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="action-button secondary"
                          onClick={() => setIsEditingProfile(false)}
                          disabled={updateProfileLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            )}
          </div>

          <div className="settings-footer">
            {saveStatus && (
              <div className={`status-message ${saveStatus?.includes('successfully') ? 'success' :
                saveStatus?.includes('Error') || saveStatus?.includes('incorrect') || saveStatus?.includes('do not match') ? 'error' : 'info'
                }`}>
                {saveStatus}
              </div>
            )}
            {updateProfileError && (
              <div className="status-message error">
                {updateProfileError}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;