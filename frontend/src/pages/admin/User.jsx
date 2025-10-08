import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, fetchAllUsers, resetUserPassword } from '../../store/authSlice';
import { useToastMessage } from '../../hooks/useToast';
import { styles } from '../../styles/user.styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const UserDashboard = () => {
    // State management
    const dispatch = useDispatch()
    const { users } = useSelector((state) => state.auth)
    const { success, error } = useToastMessage()

    const [newUser, setNewUser] = useState({
        name: '',
        password: '',
        department: ''
    });

    const [hoverStates, setHoverStates] = useState({
        addUser: false,
        searchFocus: false,
        rows: {}
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
            const res = await dispatch(createUser(newUser))

            if (createUser.fulfilled.match(res)) {
                success("User has been created")
                dispatch(fetchAllUsers())
                // Reset form
                setNewUser({
                    name: '',
                    password: '',
                    department: ''
                });
            } else {
                error("Error in creating the user")
            }
        } catch (err) {
            console.log(err);

            error("Error in creating the user")
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
        console.log('Opening modal for:', userId, userName); // Debug log
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
            // Extract the error message properly
            const errorMessage = err?.message || err?.toString() || "Failed to update password. Please try again.";
            error(errorMessage);
        }
    };

    // Handle hover effects
    const handleMouseEnter = (element, id) => {
        setHoverStates(prev => ({
            ...prev,
            [element]: id ? { ...prev[element], [id]: true } : true
        }));
    };

    const handleMouseLeave = (element, id) => {
        setHoverStates(prev => ({
            ...prev,
            [element]: id ? { ...prev[element], [id]: false } : false
        }));
    };

    // Ensure modal styles exist, if not use fallback
    const modalStyles = {
        modalOverlay: styles.modalOverlay || {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // zIndex: 1000,
            padding: '20px'
        },
        modalContent: styles.modalContent || {
            background: 'white',
            borderRadius: '16px',
            padding: '35px',
            maxWidth: '1200px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0'
        },
        modalHeader: styles.modalHeader || {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
        },
        modalTitle: styles.modalTitle || {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        closeButton: styles.closeButton || {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
            padding: '5px',
            borderRadius: '5px',
            transition: 'all 0.3s ease'
        },
        modalForm: styles.modalForm || {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        modalButtonGroup: styles.modalButtonGroup || {
            display: 'flex',
            gap: '15px',
            marginTop: '10px'
        },
        cancelButton: styles.cancelButton || {
            padding: '12px 24px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            background: 'transparent',
            color: '#64748b',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flex: 1
        },
        submitButton: styles.submitButton || {
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flex: 1
        },
        userInfo: styles.userInfo || {
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
        },
        userInfoText: styles.userInfoText || {
            margin: '5px 0',
            color: '#374151',
            fontSize: '0.95rem'
        }
    };

    return (
        <div style={styles.dashboard}>
            <style>{styles.animation}</style>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Add New User Section */}
                <section style={styles.addUserSection} className="fade-in">
                    <h2 style={styles.sectionTitle}>
                        Add New User
                    </h2>

                    <form onSubmit={handleAddUser}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>👨‍💼</span>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>🔒</span>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={passwordVisible.createPassword ? "text" : "password"}
                                        name="password"
                                        style={{
                                            ...styles.input,
                                            ...(hoverStates.searchFocus ? styles.inputFocus : {}),
                                            paddingRight: '40px'
                                        }}
                                        value={newUser.password}
                                        onChange={handleInputChange}
                                        onFocus={() => handleMouseEnter('searchFocus')}
                                        onBlur={() => handleMouseLeave('searchFocus')}
                                        required
                                        placeholder="Enter password"
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                        onClick={() => togglePasswordVisibility('createPassword')}
                                    >
                                        {passwordVisible.createPassword ? <VisibilityOff /> : <Visibility />}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>🏢</span>
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={newUser.department}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter department"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <button
                                    type="submit"
                                    style={{
                                        ...styles.addButton,
                                        ...(hoverStates.addUser ? styles.buttonHover : {})
                                    }}
                                    onMouseEnter={() => handleMouseEnter('addUser')}
                                    onMouseLeave={() => handleMouseLeave('addUser')}
                                >
                                    <span>➕</span>
                                    Add New User
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Users List Section */}
                <section style={styles.usersSection} className="fade-in">
                    <div style={styles.tableContainer}>
                        {users?.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                                <h3 style={{ color: '#475569', marginBottom: '10px' }}>No users found</h3>
                                <p style={{ color: '#64748b' }}>Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>User Information</th>
                                        <th style={styles.tableHeader}>Contact & Department</th>
                                        <th style={styles.tableHeader}>Status</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map(user => (
                                        <tr
                                            key={user?._id}
                                            style={{
                                                ...styles.tableRow,
                                                ...(hoverStates.rows[user?._id] ? styles.tableRowHover : {})
                                            }}
                                            onMouseEnter={() => handleMouseEnter('rows', user?._id)}
                                            onMouseLeave={() => handleMouseLeave('rows', user?._id)}
                                        >
                                            <td style={styles.tableCell}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                    <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>{user?.name}</p>
                                                    <span>
                                                        <span style={{ color: "blue" }}>Last Login: </span>{user?.sessions?.length === 0
                                                            ? "-"
                                                            : new Date(user?.sessions[user?.sessions?.length - 1]?.lastLogin).toLocaleString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                                timeZone: "Asia/Kolkata",
                                                            })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}>
                                                    {user?.email}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
                                                    {user?.department}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{ ...styles.statusBadge, ...styles.statusActive }}>
                                                    Active
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button
                                                    style={{
                                                        ...styles.resetPasswordButton,
                                                        ...(hoverStates.rows[user?._id] ? styles.resetPasswordButtonHover : {})
                                                    }}
                                                    onClick={() => openResetPasswordModal(user?._id, user?.name)}
                                                >
                                                    <span>🔄</span>
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {/* Reset Password Modal */}
            {resetPasswordModal.isOpen && (
                <div style={modalStyles.modalOverlay}>
                    <div style={modalStyles.modalContent} className="fade-in">
                        <div style={modalStyles.modalHeader}>
                            <h2 style={modalStyles.modalTitle}>
                                <span>🔒</span>
                                Reset Password
                            </h2>
                            <button
                                style={modalStyles.closeButton}
                                onClick={closeResetPasswordModal}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={modalStyles.userInfo}>
                            <div style={{ ...modalStyles.userInfoText, fontWeight: '600' }}>
                                User: {resetPasswordModal.userName}
                            </div>
                            <div style={modalStyles.userInfoText}>
                                Please enter the new password for this user
                            </div>
                        </div>

                        <form onSubmit={handleResetPassword} style={modalStyles.modalForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>🔑</span>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={passwordVisible.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        style={{
                                            ...styles.input,
                                            ...(hoverStates.searchFocus ? styles.inputFocus : {}),
                                            paddingRight: '40px'
                                        }}
                                        value={resetPasswordModal.newPassword}
                                        onChange={handleResetPasswordInputChange}
                                        onFocus={() => handleMouseEnter('searchFocus')}
                                        onBlur={() => handleMouseLeave('searchFocus')}
                                        required
                                        placeholder="Enter new password"
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                        onClick={() => togglePasswordVisibility('newPassword')}
                                    >
                                        {passwordVisible.newPassword ? <VisibilityOff /> : <Visibility />}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>✅</span>
                                    Confirm New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={passwordVisible.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        style={{
                                            ...styles.input,
                                            ...(hoverStates.searchFocus ? styles.inputFocus : {}),
                                            paddingRight: '40px'
                                        }}
                                        value={resetPasswordModal.confirmPassword}
                                        onChange={handleResetPasswordInputChange}
                                        onFocus={() => handleMouseEnter('searchFocus')}
                                        onBlur={() => handleMouseLeave('searchFocus')}
                                        required
                                        placeholder="Confirm new password"
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                    >
                                        {passwordVisible.confirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </button>
                                </div>
                            </div>

                            <div style={modalStyles.modalButtonGroup}>
                                <button
                                    type="button"
                                    style={modalStyles.cancelButton}
                                    onClick={closeResetPasswordModal}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={modalStyles.submitButton}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#2563eb';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#3b82f6';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;