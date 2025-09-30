import React, { useState } from 'react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        theme: 'dark',
        notifications: true,
        emailUpdates: false,
        autoSave: true,
        language: 'english',
        fontSize: 'medium',
        privacy: 'friends',
        twoFactor: false,
        soundEffects: true,
        reduceMotion: false,
        highContrast: false
    });

    const [activeSection, setActiveSection] = useState('general');
    const [saveStatus] = useState('');

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Inline CSS as a string to be injected
    const cssStyles = `
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .settings-container {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a202c;
      padding: 1px;
    }
    
    .settings-sidebar {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      padding: 30px 20px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
      animation: slideInLeft 0.4s ease-out;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }
    
    .sidebar-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 40px;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .sidebar-title::before {
      content: '⚙️';
      font-size: 24px;
    }
    
    .sidebar-item {
      padding: 16px 20px;
      margin: 6px 0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      font-size: 15px;
      font-weight: 500;
      color: #4a5568;
      border: 1px solid transparent;
    }
    
    .sidebar-item:hover {
      background: #f7fafc;
      color: #2d3748;
      transform: translateX(4px);
      border-color: #e2e8f0;
    }
    
    .sidebar-item.active {
      background: linear-gradient(135deg, #667eea 0%, #667eea 100%);
      color: white;
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      border-color: transparent;
    }
    
    .sidebar-icon {
      margin-right: 12px;
      font-size: 18px;
      width: 20px;
      text-align: center;
    }
    
    .settings-content {
      flex: 1;
      background: #ffffff;
      margin-left: 280px;
      padding: 40px;
      animation: slideInRight 0.4s ease-out 0.1s both;
      min-height: 100vh;
    }
    
    .section-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 30px;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .setting-group {
      margin-bottom: 40px;
      animation: fadeIn 0.5s ease-out;
    }
    
    .setting-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #2d3748;
      padding-bottom: 10px;
      border-bottom: 2px solid #f1f5f9;
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }
    
    .setting-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: linear-gradient(135deg, #667eea 0%, #667eea 100%);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }
    
    .setting-item:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #cbd5e0;
    }
    
    .setting-item:hover::before {
      transform: scaleY(1);
    }
    
    .setting-info {
      flex: 1;
    }
    
    .setting-label {
      display: block;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 6px;
      font-size: 16px;
    }
    
    .setting-description {
      margin: 0;
      color: #718096;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .toggle {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 30px;
    }
    
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
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
    
    .slider::before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    input:checked + .slider {
      background: linear-gradient(135deg, #667eea 0%, #667eea 100%);
    }
    
    input:checked + .slider::before {
      transform: translateX(30px);
    }
    
    .select {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e0;
      background: white;
      font-size: 14px;
      width: 200px;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    
    .select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .button-group {
      display: flex;
      gap: 16px;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
    }
    
    .button {
      padding: 14px 28px;
      border-radius: 10px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }
    
    .save-button {
      background: linear-gradient(135deg, #667eea 0%, #667eea 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .reset-button {
      background: transparent;
      border: 2px solid #e53e3e;
      color: #e53e3e;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .save-button:hover {
      animation: pulse 0.6s ease;
    }
    
    .status-message {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      transition: all 0.3s ease;
      animation: fadeIn 0.5s ease-out;
      border: 1px solid;
    }
    
    .status-success {
      background-color: #f0fff4;
      color: #2d7840;
      border-color: #9ae6b4;
    }
    
    .status-saving {
      background-color: #ebf8ff;
      color: #2c5aa0;
      border-color: #90cdf4;
    }
    
    .radio-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .radio-option {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 12px 20px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
      background: white;
    }
    
    .radio-option:hover {
      border-color: #cbd5e0;
      transform: translateY(-1px);
    }
    
    .radio-option.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      color: #667eea;
      font-weight: 600;
    }
    
    .radio-input {
      margin-right: 10px;
      accent-color: #667eea;
    }
    
    .color-picker {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 3px solid transparent;
    }
    
    .color-option:hover {
      transform: scale(1.1);
    }
    
    .color-option.selected {
      border-color: #2d3748;
      transform: scale(1.1);
    }
    
    .slider-container {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 250px;
    }
    
    .range-slider {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #e2e8f0;
      outline: none;
      -webkit-appearance: none;
    }
    
    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    
    .range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: #5a6fd8;
    }
    
    .slider-value {
      min-width: 60px;
      text-align: center;
      font-weight: 600;
      color: #4a5568;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 6px;
    }
    
    @media (max-width: 768px) {
      .settings-container {
        flex-direction: column;
      }
      
      .settings-sidebar {
        position: static;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .settings-content {
        margin-left: 0;
        padding: 30px 20px;
      }
      
      .sidebar-item {
        display: inline-flex;
        margin: 4px;
        padding: 12px 16px;
      }
      
      .button-group {
        flex-direction: column;
      }
    }
  `;

    // Render function
    return (
        <>
            <style>{cssStyles}</style>
            <div className="settings-container">
                <div className="settings-sidebar">
                    <div className="sidebar-title">Settings</div>
                    {[
                        { id: 'general', label: 'General', icon: '⚙️' },
                        { id: 'appearance', label: 'Appearance', icon: '🎨' },
                        { id: 'notifications', label: 'Notifications', icon: '🔔' },
                        // { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
                        // { id: 'accessibility', label: 'Accessibility', icon: '👁️' },
                        // { id: 'account', label: 'Account', icon: '👤' }
                    ].map((section) => (
                        <div
                            key={section.id}
                            className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="sidebar-icon">{section.icon}</span>
                            {section.label}
                        </div>
                    ))}
                </div>

                <div className="settings-content">
                    <div className="section-title">
                        {/* {activeSection === 'general' && '⚙️ General Settings'}
                        {activeSection === 'appearance' && '🎨 Appearance'}
                        {activeSection === 'notifications' && '🔔 Notifications'} */}
                        {/* {activeSection === 'privacy' && '🔒 Privacy & Security'}
                        {activeSection === 'accessibility' && '👁️ Accessibility'}
                        {activeSection === 'account' && '👤 Account Settings'} */}
                    </div>

                    {activeSection === 'general' && (
                        <div className="setting-group">
                            <div className="setting-title">Application Preferences</div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Auto Save</span>
                                    <span className="setting-description">Automatically save your work as you type</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoSave}
                                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            {/* <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Language</span>
                                    <span className="setting-description">Choose your preferred language</span>
                                </div>
                                <select
                                    className="select"
                                    value={settings.language}
                                    onChange={(e) => handleSettingChange('language', e.target.value)}
                                >
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                    <option value="japanese">Japanese</option>
                                </select>
                            </div> */}
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Font Size</span>
                                    <span className="setting-description">Adjust the text size throughout the application</span>
                                </div>
                                <div className="radio-group">
                                    {['small', 'medium', 'large'].map((size) => (
                                        <label
                                            key={size}
                                            className={`radio-option ${settings.fontSize === size ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="fontSize"
                                                value={size}
                                                checked={settings.fontSize === size}
                                                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                                            />
                                            {size.charAt(0).toUpperCase() + size.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="setting-group">
                            <div className="setting-title">Theme & Display</div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Theme</span>
                                    <span className="setting-description">Choose your preferred theme style</span>
                                </div>
                                <div className="radio-group">
                                    {['light', 'dark', 'auto'].map((theme) => (
                                        <label
                                            key={theme}
                                            className={`radio-option ${settings.theme === theme ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="theme"
                                                value={theme}
                                                checked={settings.theme === theme}
                                                onChange={(e) => handleSettingChange('theme', e.target.value)}
                                            />
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Accent Color</span>
                                    <span className="setting-description">Choose your primary color theme</span>
                                </div>
                                <div className="color-picker">
                                    {['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'].map((color) => (
                                        <div
                                            key={color}
                                            className={`color-option ${settings.theme === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleSettingChange('theme', color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="setting-group">
                            <div className="setting-title">Notification Preferences</div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Enable Notifications</span>
                                    <span className="setting-description">Receive desktop and browser notifications</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications}
                                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Email Updates</span>
                                    <span className="setting-description">Receive important updates via email</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailUpdates}
                                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Sound Effects</span>
                                    <span className="setting-description">Play sounds for notifications</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.soundEffects}
                                        onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* {activeSection === 'accessibility' && (
                        <div className="setting-group">
                            <div className="setting-title">Accessibility Features</div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Reduce Motion</span>
                                    <span className="setting-description">Minimize animations and transitions</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.reduceMotion}
                                        onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">High Contrast</span>
                                    <span className="setting-description">Increase color contrast for better visibility</span>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings.highContrast}
                                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    )} */}

                    {/* {activeSection === 'account' && (
                        <div className="setting-group">
                            <div className="setting-title">Account Management</div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Change Password</span>
                                    <span className="setting-description">Update your account password</span>
                                </div>
                                <button className="button" style={{ padding: '10px 20px', fontSize: '14px' }}>
                                    Change Password
                                </button>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Export Data</span>
                                    <span className="setting-description">Download a copy of your data</span>
                                </div>
                                <button className="button" style={{ padding: '10px 20px', fontSize: '14px' }}>
                                    Export Data
                                </button>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-label">Delete Account</span>
                                    <span className="setting-description">Permanently delete your account and all data</span>
                                </div>
                                <button className="button reset-button" style={{ padding: '10px 20px', fontSize: '14px' }}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )} */}

                    {/* <div className="button-group">
                        <button className="button save-button" onClick={saveSettings}>
                            💾 Save Settings
                        </button>
                        <button className="button reset-button" onClick={resetSettings}>
                            🔄 Reset to Default
                        </button>
                    </div> */}

                    {saveStatus && (
                        <div className={`status-message ${saveStatus.includes('Saving') ? 'status-saving' : 'status-success'}`}>
                            {saveStatus}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SettingsPage;