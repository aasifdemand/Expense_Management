// src/pages/user/UserSettings.jsx
import React, { useState } from "react";
import {
  PersonOutline,
  LockOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

const UserSettings = () => {
  const initial = {
    name: "Jeevan",
    email: "jeevan@example.com",
    avatar: null, // File or URL
    twoFactor: false,
    theme: "dark",
    currency: "INR",
  };

  const [settings, setSettings] = useState(initial);
  const [activeSection, setActiveSection] = useState("profile");
  const [saveStatus, setSaveStatus] = useState("");

  const handleSettingChange = (key, value) =>
    setSettings((p) => ({ ...p, [key]: value }));

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSettings((p) => ({ ...p, avatar: { file, preview } }));
  };

  const saveSettings = () => {
    setSaveStatus("Saving...");
    setTimeout(() => {
      setSaveStatus("Settings saved successfully.");
      setTimeout(() => setSaveStatus(""), 2500);
    }, 700);
  };

  const resetSettings = () => {
    setSettings(initial);
    setSaveStatus("Settings reset to defaults.");
    setTimeout(() => setSaveStatus(""), 1800);
  };

  const css = `
    .us-container { display:flex; min-height:100vh; font-family:Inter, sans-serif; background:#f8fafc; }
    .us-sidebar { width:260px; background:#fff; border-right:1px solid #e2e8f0; padding:22px; position:fixed; height:100vh; box-shadow:0 6px 20px rgba(0,0,0,0.04);}
    .us-title { font-weight:700; font-size:20px; margin-bottom:18px; color:#2d3748;}
    .us-item { padding:12px 14px; border-radius:10px; margin-bottom:8px; color:#4a5568; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all .18s; border:1px solid transparent;}
    .us-item:hover { background:#f7fafc; transform:translateX(4px); border-color:#e6eefc;}
    .us-item.active { background:linear-gradient(135deg,#667eea 0%,#667eea 100%); color:white; transform:translateX(6px); box-shadow:0 8px 20px rgba(102,126,234,0.15);}
    .us-content { margin-left:280px; padding:28px; flex:1; }
    .us-section { background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 4px 18px rgba(3,7,18,0.02); }
    .us-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;}
    .us-h1 { font-size:20px; font-weight:700; color:#1f2937; }
    .us-field { display:flex; gap:16px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
    .us-label { min-width:120px; font-weight:600; color:#374151; }
    .us-input { padding:10px 12px; border-radius:8px; border:1px solid #e2e8f0; background:white; width:320px; }
    .us-toggle { width:48px; height:28px; position:relative; display:inline-block; }
    .us-toggle input { display:none; }
    .us-slider { position:absolute; inset:0; border-radius:20px; background:#e6eefc; transition:all .25s; }
    .us-slider::before { content:''; position:absolute; width:20px; height:20px; left:4px; top:4px; background:white; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.08); transition:all .25s; }
    .us-toggle input:checked + .us-slider { background:linear-gradient(135deg,#667eea,#764ba2); }
    .us-toggle input:checked + .us-slider::before { transform:translateX(20px); }
    .us-avatar { width:72px; height:72px; border-radius:12px; object-fit:cover; border:1px solid #e2e8f0; }
    .us-actions { margin-top:18px; display:flex; gap:12px; }
    .us-btn { padding:10px 18px; border-radius:8px; cursor:pointer; border:none; font-weight:700; }
    .us-save { background:linear-gradient(135deg,#667eea,#764ba2); color:white; }
    .us-reset { border:1px solid #e53e3e; background:transparent; color:#e53e3e; }
    .us-note { margin-top:12px; color:#64748b; font-size:13px; }
    @media (max-width:900px) {
      .us-sidebar { position:static; width:100%; height:auto; display:flex; overflow:auto; gap:8px; padding:12px; }
      .us-item { white-space:nowrap; }
      .us-content { margin-left:0; padding:16px; }
      .us-input { width:100%; max-width:420px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="us-container">
        <div className="us-sidebar">
          <div>
            <div className="us-title">User Settings</div>
            {[
              { id: "profile", label: "Profile", icon: <PersonOutline fontSize="small" /> },
              { id: "security", label: "Security", icon: <LockOutlined fontSize="small" /> },
              { id: "prefs", label: "Preferences", icon: <SettingsOutlined fontSize="small" /> },
            ].map((s) => (
              <div
                key={s.id}
                className={`us-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <div style={{ width: 22 }}>{s.icon}</div>
                <div>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="us-content">
          <div className="us-section">
            <div className="us-head">
              <div className="us-h1">
                {activeSection === "profile"
                  ? "Profile"
                  : activeSection === "security"
                  ? "Security"
                  : "Preferences"}
              </div>
            </div>

            {activeSection === "profile" && (
              <>
                <div className="us-field">
                  <div className="us-label">Name</div>
                  <input
                    className="us-input"
                    value={settings.name}
                    onChange={(e) => handleSettingChange("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="us-field">
                  <div className="us-label">Email</div>
                  <input
                    className="us-input"
                    value={settings.email}
                    onChange={(e) => handleSettingChange("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="us-field">
                  <div className="us-label">Avatar</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={
                        settings.avatar?.preview ||
                        "https://via.placeholder.com/72x72?text=Avatar"
                      }
                      alt="avatar"
                      className="us-avatar"
                    />
                    <div>
                      <input type="file" accept="image/*" onChange={handleAvatar} />
                      <div className="us-note">
                        PNG / JPG, max 2MB (preview shown)
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "security" && (
              <>
                <div className="us-field">
                  <div className="us-label">Change password</div>
                  <input
                    type="password"
                    className="us-input"
                    placeholder="Enter new password"
                    onChange={(e) =>
                      handleSettingChange("password", e.target.value)
                    }
                  />
                </div>

                <div className="us-field">
                  <div className="us-label">Two-Factor</div>
                  <label className="us-toggle">
                    <input
                      type="checkbox"
                      checked={!!settings.twoFactor}
                      onChange={(e) =>
                        handleSettingChange("twoFactor", e.target.checked)
                      }
                    />
                    <span className="us-slider"></span>
                  </label>
                </div>

                <div className="us-note">
                  Enable two-factor authentication for improved account security.
                </div>
              </>
            )}

            {activeSection === "prefs" && (
              <>
                <div className="us-field">
                  <div className="us-label">Theme</div>
                  <select
                    className="us-input"
                    value={settings.theme}
                    onChange={(e) => handleSettingChange("theme", e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="us-field">
                  <div className="us-label">Currency</div>
                  <select
                    className="us-input"
                    value={settings.currency}
                    onChange={(e) =>
                      handleSettingChange("currency", e.target.value)
                    }
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
            
                  </select>
                </div>
              </>
            )}

            <div className="us-actions">
              <button className="us-btn us-save" onClick={saveSettings}>
                Save
              </button>
              <button className="us-btn us-reset" onClick={resetSettings}>
                Reset
              </button>
            </div>

            {saveStatus && (
              <div style={{ marginTop: 12, color: "#475569", fontWeight: 600 }}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettings;
