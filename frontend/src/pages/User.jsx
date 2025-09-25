import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
    // State management
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [budget, setBudget] = useState(50000);
    const [auditLogs, setAuditLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [userFilter, setUserFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'user',
        department: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Sample data initialization
    useEffect(() => {
        // Simulate API call delay
        setTimeout(() => {
            const sampleUsers = [
                { id: 1, name: 'John Smith', email: 'john@company.com', role: 'admin', department: 'IT', status: 'active', joinDate: '2023-01-15' },
                { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'user', department: 'Marketing', status: 'active', joinDate: '2023-02-20' },
                { id: 3, name: 'Michael Brown', email: 'michael@company.com', role: 'manager', department: 'Sales', status: 'inactive', joinDate: '2022-11-05' },
                { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'user', department: 'HR', status: 'active', joinDate: '2023-03-10' },
                { id: 5, name: 'Robert Wilson', email: 'robert@company.com', role: 'admin', department: 'Finance', status: 'active', joinDate: '2022-09-18' }
            ];

            const sampleLogs = [
                { id: 1, userId: 1, userName: 'John Smith', action: 'User login', timestamp: '2023-06-15 09:30:22', ip: '192.168.1.101' },
                { id: 2, userId: 2, userName: 'Sarah Johnson', action: 'Password change', timestamp: '2023-06-15 10:15:45', ip: '192.168.1.102' },
                { id: 3, userId: 1, userName: 'John Smith', action: 'User created', timestamp: '2023-06-14 14:20:33', ip: '192.168.1.101' },
                { id: 4, userId: 5, userName: 'Robert Wilson', action: 'Permission updated', timestamp: '2023-06-14 16:45:12', ip: '192.168.1.105' },
                { id: 5, userId: 3, userName: 'Michael Brown', action: 'User deactivated', timestamp: '2023-06-13 11:30:55', ip: '192.168.1.103' },
                { id: 6, userId: 4, userName: 'Emily Davis', action: 'Profile updated', timestamp: '2023-06-13 09:15:20', ip: '192.168.1.104' }
            ];

            setUsers(sampleUsers);
            setFilteredUsers(sampleUsers);
            setAuditLogs(sampleLogs);
            setFilteredLogs(sampleLogs);
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

    // Filter audit logs
    useEffect(() => {
        let filtered = [...auditLogs];

        if (userFilter !== 'all') {
            filtered = filtered.filter(log => log.userId === parseInt(userFilter));
        }

        if (dateFilter) {
            filtered = filtered.filter(log => log.timestamp.startsWith(dateFilter));
        }

        setFilteredLogs(filtered);
    }, [userFilter, dateFilter, auditLogs]);

    // Handle adding a new user
    const handleAddUser = (e) => {
        e.preventDefault();
        const newUserObj = {
            id: users.length + 1,
            ...newUser,
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
        };

        setUsers([...users, newUserObj]);
        setFilteredUsers([...users, newUserObj]);
        setNewUser({ name: '', email: '', role: 'user', department: '' });

        // Add to audit log
        const newLog = {
            id: auditLogs.length + 1,
            userId: newUserObj.id,
            userName: newUserObj.name,
            action: 'User created',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ip: '192.168.1.100'
        };

        setAuditLogs([newLog, ...auditLogs]);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    // Toggle user status
    const toggleUserStatus = (userId) => {
        const updatedUsers = users.map(user =>
            user.id === userId
                ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
                : user
        );

        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);

        // Find user for audit log
        const user = users.find(u => u.id === userId);
        const action = user.status === 'active' ? 'User deactivated' : 'User activated';

        const newLog = {
            id: auditLogs.length + 1,
            userId: userId,
            userName: user.name,
            action: action,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ip: '192.168.1.100'
        };

        setAuditLogs([newLog, ...auditLogs]);
    };

    // Handle budget change
    const handleBudgetChange = (e) => {
        setBudget(parseInt(e.target.value));
    };

    // CSS styles
    const styles = {
        dashboard: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: '#f5f7fa',
            minHeight: '100vh',
            padding: '20px',
            color: '#333'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            animation: 'fadeIn 0.8s ease-out'
        },
        title: {
            fontSize: '2.5rem',
            color: '#2c3e50',
            marginBottom: '10px',
            fontWeight: '600'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#7f8c8d'
        },
        tabs: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap'
        },
        tab: {
            padding: '12px 24px',
            margin: '0 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500',
            fontSize: '1rem',
            border: 'none',
            backgroundColor: '#ecf0f1',
            color: '#2c3e50'
        },
        activeTab: {
            backgroundColor: '#3498db',
            color: 'white',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)'
        },
        content: {
            maxWidth: '1200px',
            margin: '0 auto',
            animation: 'slideUp 0.5s ease-out'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        },
        cardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #ecf0f1'
        },
        cardTitle: {
            fontSize: '1.5rem',
            color: '#2c3e50',
            fontWeight: '600'
        },
        searchBox: {
            padding: '10px 15px',
            borderRadius: '6px',
            border: '1px solid #bdc3c7',
            width: '250px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
        },
        searchBoxFocus: {
            outline: 'none',
            borderColor: '#3498db',
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '15px'
        },
        tableHeader: {
            backgroundColor: '#f8f9fa',
            padding: '12px 15px',
            textAlign: 'left',
            fontWeight: '600',
            color: '#2c3e50',
            borderBottom: '2px solid #e9ecef'
        },
        tableCell: {
            padding: '12px 15px',
            borderBottom: '1px solid #e9ecef',
            transition: 'background-color 0.2s ease'
        },
        tableRow: {
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        },
        tableRowHover: {
            backgroundColor: '#f8f9fa',
            transform: 'scale(1.01)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        },
        status: {
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '500'
        },
        statusActive: {
            backgroundColor: '#d4edda',
            color: '#155724'
        },
        statusInactive: {
            backgroundColor: '#f8d7da',
            color: '#721c24'
        },
        button: {
            padding: '8px 15px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        },
        buttonPrimary: {
            backgroundColor: '#3498db',
            color: 'white'
        },
        buttonDanger: {
            backgroundColor: '#e74c3c',
            color: 'white'
        },
        buttonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: '500',
            color: '#2c3e50'
        },
        input: {
            width: '100%',
            padding: '10px 15px',
            borderRadius: '6px',
            border: '1px solid #bdc3c7',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
        },
        inputFocus: {
            outline: 'none',
            borderColor: '#3498db',
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
        },
        select: {
            width: '100%',
            padding: '10px 15px',
            borderRadius: '6px',
            border: '1px solid #bdc3c7',
            fontSize: '1rem',
            backgroundColor: 'white',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
        },
        budgetContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '20px'
        },
        budgetInput: {
            flex: '1',
            padding: '10px 15px',
            borderRadius: '6px',
            border: '1px solid #bdc3c7',
            fontSize: '1rem'
        },
        budgetDisplay: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#2c3e50',
            textAlign: 'center',
            margin: '20px 0'
        },
        filterContainer: {
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap'
        },
        loading: {
            textAlign: 'center',
            fontSize: '1.2rem',
            color: '#7f8c8d',
            padding: '40px'
        },
        animation: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
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
    `
    };

    // Add hover effects
    const [hoverStates, setHoverStates] = useState({
        card: false,
        buttons: {},
        rows: {}
    });

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

    // Render loading state
    if (loading) {
        return (
            <div style={styles.dashboard}>
                <style>{styles.animation}</style>
                <div style={styles.loading}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
                    Loading Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.dashboard}>
            <style>{styles.animation}</style>

            <header style={styles.header}>
                <h1 style={styles.title}>User Management Dashboard</h1>
                <p style={styles.subtitle}>Administration & Auditing System</p>
            </header>

            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('users')}
                >
                    <i className="fas fa-users" style={{ marginRight: '8px' }}></i>
                    User List & Management
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'budget' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('budget')}
                >
                    <i className="fas fa-chart-pie" style={{ marginRight: '8px' }}></i>
                    Budget Allocation
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'audit' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('audit')}
                >
                    <i className="fas fa-clipboard-list" style={{ marginRight: '8px' }}></i>
                    Audit Logs
                </button>
            </div>

            <div style={styles.content}>
                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div
                        style={{ ...styles.card, ...(hoverStates.card ? styles.cardHover : {}) }}
                        onMouseEnter={() => handleMouseEnter('card')}
                        onMouseLeave={() => handleMouseLeave('card')}
                    >
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>User Management</h2>
                            <input
                                type="text"
                                placeholder="Search users..."
                                style={{ ...styles.searchBox, ...(hoverStates.searchFocus ? styles.searchBoxFocus : {}) }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => handleMouseEnter('searchFocus')}
                                onBlur={() => handleMouseLeave('searchFocus')}
                            />
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Name</th>
                                    <th style={styles.tableHeader}>Email</th>
                                    <th style={styles.tableHeader}>Role</th>
                                    <th style={styles.tableHeader}>Department</th>
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
                                        <td style={styles.tableCell}>{user.name}</td>
                                        <td style={styles.tableCell}>{user.email}</td>
                                        <td style={styles.tableCell}>{user.role}</td>
                                        <td style={styles.tableCell}>{user.department}</td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.status,
                                                ...(user.status === 'active' ? styles.statusActive : styles.statusInactive)
                                            }}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <button
                                                style={{
                                                    ...styles.button,
                                                    ...(user.status === 'active' ? styles.buttonDanger : styles.buttonPrimary),
                                                    ...(hoverStates.buttons[user.id] ? styles.buttonHover : {})
                                                }}
                                                onClick={() => toggleUserStatus(user.id)}
                                                onMouseEnter={() => handleMouseEnter('buttons', user.id)}
                                                onMouseLeave={() => handleMouseLeave('buttons', user.id)}
                                            >
                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#2c3e50' }}>Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        style={styles.input}
                                        value={newUser.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        style={styles.input}
                                        value={newUser.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Role</label>
                                    <select
                                        name="role"
                                        style={styles.select}
                                        value={newUser.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        style={styles.input}
                                        value={newUser.department}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    ...(hoverStates.addUser ? styles.buttonHover : {})
                                }}
                                onMouseEnter={() => handleMouseEnter('addUser')}
                                onMouseLeave={() => handleMouseLeave('addUser')}
                            >
                                <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
                                Add User
                            </button>
                        </form>
                    </div>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && (
                    <div
                        style={{ ...styles.card, ...(hoverStates.budgetCard ? styles.cardHover : {}) }}
                        onMouseEnter={() => handleMouseEnter('budgetCard')}
                        onMouseLeave={() => handleMouseLeave('budgetCard')}
                    >
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Budget Allocation</h2>
                        </div>

                        <div style={styles.budgetDisplay}>
                            ₹{budget.toLocaleString()}
                        </div>

                        <div style={styles.budgetContainer}>
                            <span style={{ fontWeight: '500', color: '#2c3e50' }}>Adjust Budget:</span>
                            <input
                                type="range"
                                min="0"
                                max="100000"
                                step="1000"
                                value={budget}
                                onChange={handleBudgetChange}
                                style={{ flex: '1' }}
                            />
                            <input
                                type="number"
                                value={budget}
                                onChange={handleBudgetChange}
                                style={styles.budgetInput}
                            />
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Budget Distribution</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <div style={{ padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#3498db' }}>User Management</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>₹{Math.round(budget * 0.4).toLocaleString()}</p>
                                    <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '10px' }}>
                                        <div style={{ width: '40%', height: '100%', backgroundColor: '#3498db', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ padding: '15px', backgroundColor: '#e8f6f3', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#27ae60' }}>Security</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>₹{Math.round(budget * 0.3).toLocaleString()}</p>
                                    <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '10px' }}>
                                        <div style={{ width: '30%', height: '100%', backgroundColor: '#27ae60', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ padding: '15px', backgroundColor: '#fef9e7', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#f39c12' }}>Training</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>₹{Math.round(budget * 0.2).toLocaleString()}</p>
                                    <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '10px' }}>
                                        <div style={{ width: '20%', height: '100%', backgroundColor: '#f39c12', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ padding: '15px', backgroundColor: '#fbeeee', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#e74c3c' }}>Miscellaneous</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>₹{Math.round(budget * 0.1).toLocaleString()}</p>
                                    <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '10px' }}>
                                        <div style={{ width: '10%', height: '100%', backgroundColor: '#e74c3c', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit' && (
                    <div
                        style={{ ...styles.card, ...(hoverStates.auditCard ? styles.cardHover : {}) }}
                        onMouseEnter={() => handleMouseEnter('auditCard')}
                        onMouseLeave={() => handleMouseLeave('auditCard')}
                    >
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Audit Logs</h2>
                        </div>

                        <div style={styles.filterContainer}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Filter by User</label>
                                <select
                                    style={styles.select}
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                >
                                    <option value="all">All Users</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Filter by Date</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>

                            <button
                                style={{
                                    ...styles.button,
                                    alignSelf: 'flex-end',
                                    ...(hoverStates.clearFilters ? styles.buttonHover : {})
                                }}
                                onClick={() => {
                                    setUserFilter('all');
                                    setDateFilter('');
                                }}
                                onMouseEnter={() => handleMouseEnter('clearFilters')}
                                onMouseLeave={() => handleMouseLeave('clearFilters')}
                            >
                                Clear Filters
                            </button>
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Timestamp</th>
                                    <th style={styles.tableHeader}>User</th>
                                    <th style={styles.tableHeader}>Action</th>
                                    <th style={styles.tableHeader}>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr
                                        key={log.id}
                                        style={{ ...styles.tableRow, ...(hoverStates.logRows[log.id] ? styles.tableRowHover : {}) }}
                                        onMouseEnter={() => handleMouseEnter('logRows', log.id)}
                                        onMouseLeave={() => handleMouseLeave('logRows', log.id)}
                                    >
                                        <td style={styles.tableCell}>{log.timestamp}</td>
                                        <td style={styles.tableCell}>{log.userName}</td>
                                        <td style={styles.tableCell}>{log.action}</td>
                                        <td style={styles.tableCell}>{log.ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredLogs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
                                No audit logs match the current filters.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;