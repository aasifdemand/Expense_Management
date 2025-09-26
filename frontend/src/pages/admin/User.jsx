import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'user',
        department: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [hoverStates, setHoverStates] = useState({
        addUser: false,
        searchFocus: false,
        rows: {}
    });

    // Sample data initialization
    useEffect(() => {
        // Simulate API call delay
        setTimeout(() => {
            const sampleUsers = [
                { name: 'John Smith', email: 'john@company.com', role: 'admin', department: 'IT', status: 'active', joinDate: '2023-01-15' },
                { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'user', department: 'Marketing', status: 'active', joinDate: '2023-02-20' },
                { name: 'Michael Brown', email: 'michael@company.com', role: 'manager', department: 'Sales', status: 'active', joinDate: '2022-11-05' },
                { name: 'Emily Davis', email: 'emily@company.com', role: 'user', department: 'HR', status: 'active', joinDate: '2023-03-10' },
                { name: 'Robert Wilson', email: 'robert@company.com', role: 'admin', department: 'Finance', status: 'active', joinDate: '2022-09-18' }
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
            id: users.length > 0 ? Math.max(...users.map(u => u)) + 1 : 1,
            ...newUser,
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
        };

        const updatedUsers = [...users, newUserObj];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setNewUser({ name: '', email: '', role: 'user', department: '' });
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
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
            // backgroundColor: '#f8fafc',
            minHeight: '100vh',
            width: '100%',
            padding: '0',
            color: '#1e293b',
            lineHeight: '1.6',
            overflow: 'hidden'
        },
        // mainContent: {
        //     maxWidth: '1400px',
        //     margin: '0 auto',
        //     padding: '30px 20px',
        //     overflow: 'visible'
        // },
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
        select: {
            padding: '14px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            backgroundColor: '#f8fafc',
            transition: 'all 0.3s ease',
            width: '100%',
            boxSizing: 'border-box',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23374151'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            backgroundSize: '16px'
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
        roleBadge: {
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'capitalize',
            display: 'inline-block'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        },
        loadingText: {
            fontSize: '1.2rem',
            color: '#64748b',
            fontWeight: '500'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
        },
        idBadge: {
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '8px'
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
            
            /* Hide scrollbars */
            ::-webkit-scrollbar {
                display: none;
            }
            * {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
        `
    };

    // Render loading state
    if (loading) {
        // return (
        //     <div style={styles.dashboard}>
        //         <style>{styles.animation}</style>
        //         <div style={styles.loading}>
        //             <div style={styles.spinner}></div>
        //             <div style={styles.loadingText}>Loading User Dashboard...</div>
        //         </div>
        //     </div>
        // );
    }

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
                                    <span>🎯</span>
                                    Role
                                </label>
                                <select
                                    name="role"
                                    style={{ ...styles.select, ...(hoverStates.searchFocus ? styles.inputFocus : {}) }}
                                    value={newUser.role}
                                    onChange={handleInputChange}
                                    onFocus={() => handleMouseEnter('searchFocus')}
                                    onBlur={() => handleMouseLeave('searchFocus')}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
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
                            <span>📊</span>
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
                                        <th style={styles.tableHeader}>Contact</th>
                                        <th style={styles.tableHeader}>Role</th>
                                        <th style={styles.tableHeader}>Department</th>
                                        <th style={styles.tableHeader}>Status</th>
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
                                                <div style={{ color: '#3b82f6', fontWeight: '600' }}>{user.email}</div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.roleBadge,
                                                    backgroundColor: user.role === 'admin' ? '#dbeafe' :
                                                        user.role === 'manager' ? '#fef3c7' : '#f3f4f6',
                                                    color: user.role === 'admin' ? '#1e40af' :
                                                        user.role === 'manager' ? '#92400e' : '#374151'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{ fontWeight: '500', color: '#475569' }}>
                                                    {user.department}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...styles.statusActive
                                                }}>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;