import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, fetchUser } from "../../store/authSlice"
import '../../styles/settings.styles.css';

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

  });


  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  console.log("user: ", user);





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






  return (


    <div className="settings-container">
      <div className="settings-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Settings</h2>
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
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
                      <div className="account-name">{user?.name}</div>
                      <div className="account-email">{user?.email}</div>
                      <div className="account-detail">{user?.phone}</div>
                      <div className="account-detail">{user?.userLoc}</div>
                      <div className="account-detail">
                        Role: {user?.role === 'superadmin' ? 'Super Admin' : 'User'}
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

  );
};

export default SettingsPage;