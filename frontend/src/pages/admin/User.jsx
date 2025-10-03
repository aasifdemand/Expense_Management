import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [hoverStates, setHoverStates] = useState({
        addUser: false,
        searchFocus: false,
        rows: {}
    });
    const [resetPasswordModal, setResetPasswordModal] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Sample data initialization
    useEffect(() => {
        // Simulate API call delay
        setTimeout(() => {
            const sampleUsers = [
                { id: 1, name: 'John Smith', email: 'john@company.com', department: 'IT', status: 'active', joinDate: '2023-01-15' },
                { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Marketing', status: 'active', joinDate: '2023-02-20' },
                { id: 3, name: 'Michael Brown', email: 'michael@company.com', department: 'Sales', status: 'active', joinDate: '2022-11-05' },
                { id: 4, name: 'Emily Davis', email: 'emily@company.com', department: 'HR', status: 'active', joinDate: '2023-03-10' },
                { id: 5, name: 'Robert Wilson', email: 'robert@company.com', department: 'Finance', status: 'active', joinDate: '2022-09-18' }
            ];

            setUsers(sampleUsers);
            setFilteredUsers(sampleUsers);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    // Handle adding a new user
    const handleAddUser = (e) => {
        e.preventDefault();
        const newUserObj = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            ...newUser,
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
        };

        const updatedUsers = [...users, newUserObj];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setNewUser({ name: '', email: '', password: '', department: '' });

        // Show success message
        alert('User added successfully!');
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
    const openResetPasswordModal = (user) => {
        setResetPasswordModal({
            isOpen: true,
            userId: user.id,
            userName: user.name,
            currentPassword: '',
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
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    // Handle reset password submission
    const handleResetPassword = (e) => {
        e.preventDefault();

        // Validate passwords
        if (resetPasswordModal.newPassword !== resetPasswordModal.confirmPassword) {
            alert('New password and confirm password do not match!');
            return;
        }

        if (resetPasswordModal.newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        // Simulate password reset
        console.log('Password reset for user:', resetPasswordModal.userId);
        console.log('New password:', resetPasswordModal.newPassword);

        // Show success message
        alert('Password reset successfully!');
        closeResetPasswordModal();
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

    // CSS styles
    const styles = {
        dashboard: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            minHeight: '100vh',
            width: '100%',
            padding: '0',
            color: '#1e293b',
            lineHeight: '1.6',
            overflow: 'hidden',
        },
        mainContent: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '30px 20px',
            overflow: 'visible'
        },
        addUserSection: {
            background: 'white',
            borderRadius: '16px',
            padding: '35px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
        },
        sectionTitle: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'end'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column'
        },
        label: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        input: {
            padding: '14px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#f8fafc',
            width: '100%',
            boxSizing: 'border-box'
        },
        inputFocus: {
            outline: 'none',
            borderColor: '#3b82f6',
            backgroundColor: 'white',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        },
        addButton: {
            padding: '16px 32px',
            borderRadius: '10px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            height: 'fit-content',
            minHeight: '52px',
            width: '100%'
        },
        buttonHover: {
            background: '#2563eb',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
        },
        usersSection: {
            background: 'white',
            borderRadius: '16px',
            padding: '35px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'visible'
        },
        searchHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            gap: '20px',
            flexWrap: 'wrap'
        },
        searchTitle: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        searchContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
        },
        searchBox: {
            padding: '14px 20px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#f8fafc',
            minWidth: '300px',
            maxWidth: '400px'
        },
        userCount: {
            fontSize: '1rem',
            color: '#3b82f6',
            fontWeight: '600',
            background: '#dbeafe',
            padding: '10px 20px',
            borderRadius: '8px',
            whiteSpace: 'nowrap'
        },
        tableContainer: {
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'visible',
            maxHeight: 'none'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
        },
        tableHeader: {
            backgroundColor: '#f8fafc',
            padding: '18px 20px',
            textAlign: 'left',
            fontWeight: '600',
            color: '#374151',
            borderBottom: '2px solid #e2e8f0',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            position: 'sticky',
            top: 0,
            zIndex: 10
        },
        tableCell: {
            padding: '18px 20px',
            borderBottom: '1px solid #f1f5f9',
            transition: 'all 0.2s ease'
        },
        tableRow: {
            transition: 'all 0.3s ease'
        },
        tableRowHover: {
            backgroundColor: '#f8fafc'
        },
        statusBadge: {
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-block'
        },
        statusActive: {
            backgroundColor: '#dcfce7',
            color: '#166534'
        },
        resetPasswordButton: {
            padding: '8px 16px',
            borderRadius: '8px',
            border: '2px solid #3b82f6',
            background: 'transparent',
            color: '#3b82f6',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        resetPasswordButtonHover: {
            background: '#3b82f6',
            color: 'white',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        },
        // Modal Styles
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            background: 'white',
            borderRadius: '16px',
            padding: '35px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
            padding: '5px',
            borderRadius: '5px',
            transition: 'all 0.3s ease'
        },
        closeButtonHover: {
            backgroundColor: '#f1f5f9',
            color: '#374151'
        },
        modalForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        modalButtonGroup: {
            display: 'flex',
            gap: '15px',
            marginTop: '10px'
        },
        cancelButton: {
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
        cancelButtonHover: {
            backgroundColor: '#f8fafc',
            borderColor: '#cbd5e1'
        },
        submitButton: {
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
        submitButtonHover: {
            background: '#2563eb',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        },
        userInfo: {
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
        },
        userInfoText: {
            margin: '5px 0',
            color: '#374151',
            fontSize: '0.95rem'
        },
        animation: `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.6s ease-out;
            }
        `
    };

    return (
        <div style={styles.dashboard}>
            <style>{styles.animation}</style>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Add New User Section */}
                <section style={styles.addUserSection} className="fade-in">
                    <h2 style={styles.sectionTitle}>
                        <span>👤</span>
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
                                    <span>📧</span>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>🔒</span>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                    required
                                    placeholder="Enter password"
                                    minLength="6"
                                />
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
                    <div style={styles.searchHeader}>
                        <h2 style={styles.searchTitle}>
                            <span>👥</span>
                            User Management
                        </h2>

                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="🔍 Search users by name, email, or department..."
                                style={{ ...styles.searchBox, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => handleMouseEnter('searchFocus')}
                                onBlur={() => handleMouseLeave('searchFocus')}
                            />
                            <div style={styles.userCount}>
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </div>

                    <div style={styles.tableContainer}>
                        {filteredUsers.length === 0 ? (
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
                                    {filteredUsers.map(user => (
                                        <tr
                                            key={user.id}
                                            style={{ ...styles.tableRow, ...(hoverStates.rows[user.id] ? styles.tableRowHover : {}) }}
                                            onMouseEnter={() => handleMouseEnter('rows', user.id)}
                                            onMouseLeave={() => handleMouseLeave('rows', user.id)}
                                        >
                                            <td style={styles.tableCell}>
                                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>
                                                    {user.name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                                    Joined: {user.joinDate}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}>
                                                    {user.email}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
                                                    {user.department}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...styles.statusActive
                                                }}>
                                                    Active
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button
                                                    style={{
                                                        ...styles.resetPasswordButton,
                                                        ...(hoverStates.rows[user.id] ? styles.resetPasswordButtonHover : {})
                                                    }}
                                                    onClick={() => openResetPasswordModal(user)}
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
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent} className="fade-in">
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                <span>🔒</span>
                                Reset Password
                            </h2>
                            <button
                                style={styles.closeButton}
                                onClick={closeResetPasswordModal}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={styles.userInfo}>
                            <div style={{ ...styles.userInfoText, fontWeight: '600' }}>
                                User: {resetPasswordModal.userName}
                            </div>
                            <div style={styles.userInfoText}>
                                Please enter the new password for this user
                            </div>
                        </div>

                        <form onSubmit={handleResetPassword} style={styles.modalForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>🔑</span>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={resetPasswordModal.newPassword}
                                    onChange={handleResetPasswordInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                    required
                                    placeholder="Enter new password"
                                    minLength="6"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <span>✅</span>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    style={{ ...styles.input, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={resetPasswordModal.confirmPassword}
                                    onChange={handleResetPasswordInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                    required
                                    placeholder="Confirm new password"
                                    minLength="6"
                                />
                            </div>

                            <div style={styles.modalButtonGroup}>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
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
                                    style={styles.submitButton}
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