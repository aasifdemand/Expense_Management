import React, { useState, useEffect } from 'react';

const ReimbursementManagement = () => {
    // State for reimbursement data
    const [reimbursements, setReimbursements] = useState([]);
    const [filteredReimbursements, setFilteredReimbursements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [newReimbursement, setNewReimbursement] = useState({
        title: '',
        category: 'Travel',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receipt: null,
        userId: ''
    });
    const [filter, setFilter] = useState('All');
    const [userStats, setUserStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Sample initial data with multiple users
    const initialUsers = [
        {
            id: 'user1',
            name: 'Priya Sharma',
            email: 'priya.sharma@company.com',
            department: 'Sales',
            avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
            id: 'user2',
            name: 'Rahul Verma',
            email: 'rahul.verma@company.com',
            department: 'Marketing',
            avatar: 'https://i.pravatar.cc/150?img=2'
        },
        {
            id: 'user3',
            name: 'Anjali Patel',
            email: 'anjali.patel@company.com',
            department: 'Engineering',
            avatar: 'https://i.pravatar.cc/150?img=3'
        }
    ];

    const initialData = [
        {
            id: 1,
            title: 'Client Dinner Meeting',
            category: 'Food',
            amount: 3500,
            date: '2023-10-15',
            status: 'Approved',
            description: 'Dinner with potential clients from ABC Corp',
            receipt: 'receipt_1.jpg',
            userId: 'user1',
            paidDate: null
        },
        {
            id: 2,
            title: 'Taxi to Client Office',
            category: 'Travel',
            amount: 1200,
            date: '2023-10-12',
            status: 'Pending',
            description: 'Round trip taxi fare for client meeting',
            receipt: 'receipt_2.jpg',
            userId: 'user1',
            paidDate: null
        },
        {
            id: 3,
            title: 'Team Lunch',
            category: 'Food',
            amount: 4200,
            date: '2023-10-10',
            status: 'Paid',
            description: 'Monthly team lunch at restaurant',
            receipt: 'receipt_3.jpg',
            userId: 'user2',
            paidDate: '2023-10-18'
        },
        {
            id: 4,
            title: 'Office Supplies',
            category: 'Supplies',
            amount: 2500,
            date: '2023-10-05',
            status: 'Approved',
            description: 'Purchase of stationery and printer ink',
            receipt: 'receipt_4.jpg',
            userId: 'user3',
            paidDate: null
        },
        {
            id: 5,
            title: 'Conference Registration',
            category: 'Training',
            amount: 8000,
            date: '2023-09-28',
            status: 'Pending',
            description: 'Registration fee for Tech Conference 2023',
            receipt: 'receipt_5.jpg',
            userId: 'user2',
            paidDate: null
        }
    ];

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = () => {
            setUsers(initialUsers);
            setReimbursements(initialData);
            setFilteredReimbursements(initialData);
            calculateUserStats(initialData);
            setSelectedUser('user1'); // Default selected user
            setNewReimbursement(prev => ({
                ...prev,
                userId: 'user1'
            }));
            setIsLoading(false);
        };

        initializeData();
    }, []);

    // Calculate user-specific statistics
    const calculateUserStats = (data) => {
        const stats = {};

        initialUsers.forEach(user => {
            const userReimbursements = data.filter(item => item.userId === user.id);
            const totalSpent = userReimbursements.reduce((sum, item) => sum + item.amount, 0);
            const pendingAmount = userReimbursements
                .filter(item => item.status === 'Pending')
                .reduce((sum, item) => sum + item.amount, 0);
            const approvedAmount = userReimbursements
                .filter(item => item.status === 'Approved')
                .reduce((sum, item) => sum + item.amount, 0);
            const paidAmount = userReimbursements
                .filter(item => item.status === 'Paid')
                .reduce((sum, item) => sum + item.amount, 0);
            const toBePaid = pendingAmount + approvedAmount;

            stats[user.id] = {
                totalSpent,
                pendingAmount,
                approvedAmount,
                paidAmount,
                toBePaid,
                totalClaims: userReimbursements.length,
                pendingClaims: userReimbursements.filter(item => item.status === 'Pending').length,
                approvedClaims: userReimbursements.filter(item => item.status === 'Approved').length,
                paidClaims: userReimbursements.filter(item => item.status === 'Paid').length
            };
        });

        setUserStats(stats);
    };

    // Filter reimbursements by status and user
    const handleFilterChange = (status) => {
        setFilter(status);
        let filtered = reimbursements;

        if (selectedUser) {
            filtered = filtered.filter(item => item.userId === selectedUser);
        }

        if (status !== 'All') {
            filtered = filtered.filter(item => item.status === status);
        }

        setFilteredReimbursements(filtered);
    };

    // Handle user selection change
    const handleUserChange = (userId) => {
        setSelectedUser(userId);
        let filtered = reimbursements;

        if (userId) {
            filtered = filtered.filter(item => item.userId === userId);
        }

        if (filter !== 'All') {
            filtered = filtered.filter(item => item.status === filter);
        }

        setFilteredReimbursements(filtered);

        // Update new reimbursement form with selected user
        setNewReimbursement(prev => ({
            ...prev,
            userId: userId
        }));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReimbursement({
            ...newReimbursement,
            [name]: value
        });
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setNewReimbursement({
            ...newReimbursement,
            receipt: e.target.files[0]
        });
    };

    // Submit new reimbursement
    const handleSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: reimbursements.length + 1,
            ...newReimbursement,
            status: 'Pending',
            paidDate: null
        };

        const updatedReimbursements = [...reimbursements, newItem];
        setReimbursements(updatedReimbursements);

        // Update filtered list if it matches current user
        if (!selectedUser || selectedUser === newItem.userId) {
            let filtered = updatedReimbursements;
            if (selectedUser) {
                filtered = filtered.filter(item => item.userId === selectedUser);
            }
            if (filter !== 'All') {
                filtered = filtered.filter(item => item.status === filter);
            }
            setFilteredReimbursements(filtered);
        }

        calculateUserStats(updatedReimbursements);
        setIsModalOpen(false);

        // Reset form
        setNewReimbursement({
            title: '',
            category: 'Travel',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            receipt: null,
            userId: selectedUser
        });
    };

    // Mark reimbursement as paid
    const handleMarkAsPaid = (reimbursementId) => {
        const updatedReimbursements = reimbursements.map(item =>
            item.id === reimbursementId
                ? { ...item, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] }
                : item
        );

        setReimbursements(updatedReimbursements);

        // Update filtered list
        let filtered = updatedReimbursements;
        if (selectedUser) {
            filtered = filtered.filter(item => item.userId === selectedUser);
        }
        if (filter !== 'All') {
            filtered = filtered.filter(item => item.status === filter);
        }
        setFilteredReimbursements(filtered);

        calculateUserStats(updatedReimbursements);
    };

    // Approve reimbursement
    const handleApprove = (reimbursementId) => {
        const updatedReimbursements = reimbursements.map(item =>
            item.id === reimbursementId
                ? { ...item, status: 'Approved' }
                : item
        );

        setReimbursements(updatedReimbursements);

        // Update filtered list
        let filtered = updatedReimbursements;
        if (selectedUser) {
            filtered = filtered.filter(item => item.userId === selectedUser);
        }
        if (filter !== 'All') {
            filtered = filtered.filter(item => item.status === filter);
        }
        setFilteredReimbursements(filtered);

        calculateUserStats(updatedReimbursements);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Get current user with null check
    const getCurrentUser = () => {
        return users.find(user => user.id === selectedUser) || users[0] || {
            id: '',
            name: 'Loading...',
            email: '',
            department: '',
            avatar: 'https://i.pravatar.cc/150?img=0'
        };
    };

    // Get current user stats with null check
    const getCurrentUserStats = () => {
        return userStats[selectedUser] || {
            totalSpent: 0,
            pendingAmount: 0,
            approvedAmount: 0,
            paidAmount: 0,
            toBePaid: 0,
            totalClaims: 0,
            pendingClaims: 0,
            approvedClaims: 0,
            paidClaims: 0
        };
    };

    // CSS Styles
    const styles = {
        reimbursementManagement: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: '#f5f7fb',
            color: '#212529',
            minHeight: '100vh'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
            color: 'white',
            padding: '20px 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            marginBottom: '30px'
        },
        headerContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        logoIcon: {
            fontSize: '2rem'
        },
        logoH1: {
            fontSize: '1.8rem',
            fontWeight: '600'
        },
        userSelector: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
        },
        userSelect: {
            padding: '10px 15px',
            border: '1px solid #e9ecef',
            borderRadius: '5px',
            fontSize: '1rem',
            minWidth: '200px'
        },
        currentUserInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 15px',
            borderRadius: '50px'
        },
        userImg: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
        },
        dashboard: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        card: {
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease'
        },
        statCard: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        },
        statIcon: {
            fontSize: '2.5rem',
            marginBottom: '15px'
        },
        statH3: {
            fontSize: '2rem',
            marginBottom: '5px'
        },
        statP: {
            color: '#6c757d'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e9ecef'
        },
        cardHeaderH2: {
            fontSize: '1.5rem',
            fontWeight: '600'
        },
        btn: {
            background: '#4361ee',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        btnSuccess: {
            background: '#28a745'
        },
        btnWarning: {
            background: '#ffc107',
            color: '#212529'
        },
        btnSecondary: {
            background: '#6c757d'
        },
        filters: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
        },
        filterBtn: {
            padding: '8px 16px',
            border: '1px solid #e9ecef',
            background: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        filterBtnActive: {
            background: '#4361ee',
            color: 'white',
            borderColor: '#4361ee'
        },
        tableContainer: {
            overflowX: 'auto'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        tableTh: {
            padding: '15px',
            textAlign: 'left',
            borderBottom: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa',
            fontWeight: '600'
        },
        tableTd: {
            padding: '15px',
            textAlign: 'left',
            borderBottom: '1px solid #e9ecef'
        },
        claimTitle: {
            display: 'flex',
            flexDirection: 'column'
        },
        claimDescription: {
            fontSize: '0.85rem',
            color: '#6c757d',
            marginTop: '5px'
        },
        category: {
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8rem',
            fontWeight: '500'
        },
        categoryTravel: {
            backgroundColor: 'rgba(76, 201, 240, 0.2)',
            color: '#0a9396'
        },
        categoryFood: {
            backgroundColor: 'rgba(247, 37, 133, 0.2)',
            color: '#f72585'
        },
        categorySupplies: {
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            color: '#ffc107'
        },
        categoryTraining: {
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            color: '#28a745'
        },
        amount: {
            fontWeight: '600'
        },
        status: {
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
        },
        statusPending: {
            backgroundColor: 'rgba(247, 37, 133, 0.2)',
            color: '#f72585'
        },
        statusApproved: {
            backgroundColor: 'rgba(76, 201, 240, 0.2)',
            color: '#0a9396'
        },
        statusPaid: {
            backgroundColor: 'rgba(67, 97, 238, 0.2)',
            color: '#4361ee'
        },
        actionButtons: {
            display: 'flex',
            gap: '10px'
        },
        actionBtn: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6c757d',
            transition: 'color 0.3s ease',
            padding: '5px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6c757d'
        },
        emptyStateIcon: {
            fontSize: '3rem',
            marginBottom: '15px',
            color: '#dee2e6'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        modalContent: {
            background: 'white',
            width: '90%',
            maxWidth: '500px',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        modalHeaderH2: {
            fontSize: '1.5rem'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#6c757d'
        },
        formGroup: {
            marginBottom: '20px'
        },
        formRow: {
            display: 'flex',
            gap: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #e9ecef',
            borderRadius: '5px',
            fontSize: '1rem'
        },
        select: {
            width: '100%',
            padding: '10px',
            border: '1px solid #e9ecef',
            borderRadius: '5px',
            fontSize: '1rem',
            background: 'white'
        },
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #e9ecef',
            borderRadius: '5px',
            fontSize: '1rem',
            resize: 'vertical'
        },
        fileInput: {
            width: '100%',
            padding: '10px 0'
        },
        smallText: {
            fontSize: '0.8rem',
            color: '#6c757d',
            marginTop: '5px',
            display: 'block'
        },
        formActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px'
        },
        userSummary: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px',
            padding: '15px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        summaryItem: {
            textAlign: 'center',
            padding: '10px'
        },
        summaryLabel: {
            fontSize: '0.9rem',
            color: '#6c757d',
            marginBottom: '5px'
        },
        summaryValue: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#4361ee'
        },
        loading: {
            textAlign: 'center',
            padding: '50px 20px',
            color: '#6c757d'
        }
    };

    if (isLoading) {
        return (
            <div style={styles.reimbursementManagement}>
                <div style={styles.loading}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '20px' }}></i>
                    <h3>Loading Reimbursement System...</h3>
                </div>
            </div>
        );
    }

    const currentUser = getCurrentUser();
    const currentStats = getCurrentUserStats();

    return (
        <div style={styles.reimbursementManagement}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.container}>
                    <div style={styles.headerContent}>
                        <div style={styles.logo}>
                            <i className="fas fa-file-invoice-dollar" style={styles.logoIcon}></i>
                            <h1 style={styles.logoH1}>Reimbursement Management</h1>
                        </div>
                        <div style={styles.currentUserInfo}>
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                style={styles.userImg}
                            />
                            <div>
                                <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: '0.8' }}>
                                    {currentUser.department}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div style={styles.container}>
                {/* User Selector */}
                <div style={styles.userSelector}>
                    <label style={{ fontWeight: '500' }}>Select Employee: </label>
                    <select
                        value={selectedUser}
                        onChange={(e) => handleUserChange(e.target.value)}
                        style={styles.userSelect}
                    >
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} - {user.department}
                            </option>
                        ))}
                    </select>
                </div>

                {/* User Summary */}
                <div style={styles.userSummary}>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Total Spent</div>
                        <div style={styles.summaryValue}>{formatCurrency(currentStats.totalSpent)}</div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>To Be Reimbursed</div>
                        <div style={styles.summaryValue}>{formatCurrency(currentStats.toBePaid)}</div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Pending Approval</div>
                        <div style={styles.summaryValue}>{formatCurrency(currentStats.pendingAmount)}</div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Already Paid</div>
                        <div style={styles.summaryValue}>{formatCurrency(currentStats.paidAmount)}</div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div style={styles.dashboard}>
                    <div
                        style={{ ...styles.card, ...styles.statCard }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-money-bill-wave" style={{ ...styles.statIcon, color: '#4361ee' }}></i>
                        <h3 style={styles.statH3}>{currentStats.totalClaims}</h3>
                        <p style={styles.statP}>Total Claims</p>
                    </div>
                    <div
                        style={{ ...styles.card, ...styles.statCard }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-clock" style={{ ...styles.statIcon, color: '#f72585' }}></i>
                        <h3 style={styles.statH3}>{currentStats.pendingClaims}</h3>
                        <p style={styles.statP}>Pending Claims</p>
                    </div>
                    <div
                        style={{ ...styles.card, ...styles.statCard }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-check-circle" style={{ ...styles.statIcon, color: '#0a9396' }}></i>
                        <h3 style={styles.statH3}>{currentStats.approvedClaims}</h3>
                        <p style={styles.statP}>Approved Claims</p>
                    </div>
                    <div
                        style={{ ...styles.card, ...styles.statCard }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-receipt" style={{ ...styles.statIcon, color: '#28a745' }}></i>
                        <h3 style={styles.statH3}>{currentStats.paidClaims}</h3>
                        <p style={styles.statP}>Paid Claims</p>
                    </div>
                </div>

                {/* Actions and Filters */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardHeaderH2}>
                            Reimbursement Claims - {currentUser.name}
                        </h2>
                        <button
                            style={styles.btn}
                            onMouseEnter={(e) => e.target.style.background = '#3f37c9'}
                            onMouseLeave={(e) => e.target.style.background = '#4361ee'}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <i className="fas fa-plus"></i> New Claim
                        </button>
                    </div>

                    <div style={styles.filters}>
                        <button
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'All' ? styles.filterBtnActive : {})
                            }}
                            onClick={() => handleFilterChange('All')}
                        >
                            All
                        </button>
                        <button
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'Pending' ? styles.filterBtnActive : {})
                            }}
                            onClick={() => handleFilterChange('Pending')}
                        >
                            Pending
                        </button>
                        <button
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'Approved' ? styles.filterBtnActive : {})
                            }}
                            onClick={() => handleFilterChange('Approved')}
                        >
                            Approved
                        </button>
                        <button
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'Paid' ? styles.filterBtnActive : {})
                            }}
                            onClick={() => handleFilterChange('Paid')}
                        >
                            Paid
                        </button>
                    </div>

                    {/* Reimbursements Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableTh}>Title</th>
                                    <th style={styles.tableTh}>Category</th>
                                    <th style={styles.tableTh}>Amount</th>
                                    <th style={styles.tableTh}>Date</th>
                                    <th style={styles.tableTh}>Status</th>
                                    <th style={styles.tableTh}>Paid Date</th>
                                    <th style={styles.tableTh}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReimbursements.map(item => (
                                    <tr
                                        key={item.id}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(67, 97, 238, 0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={styles.tableTd}>
                                            <div style={styles.claimTitle}>
                                                <strong>{item.title}</strong>
                                                <span style={styles.claimDescription}>{item.description}</span>
                                            </div>
                                        </td>
                                        <td style={styles.tableTd}>
                                            <span style={{
                                                ...styles.category,
                                                ...styles[`category${item.category}`]
                                            }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.tableTd, ...styles.amount }}>
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td style={styles.tableTd}>{formatDate(item.date)}</td>
                                        <td style={styles.tableTd}>
                                            <span style={{
                                                ...styles.status,
                                                ...styles[`status${item.status}`]
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={styles.tableTd}>
                                            {formatDate(item.paidDate)}
                                        </td>
                                        <td style={styles.tableTd}>
                                            <div style={styles.actionButtons}>
                                                <button
                                                    style={styles.actionBtn}
                                                    onMouseEnter={(e) => e.target.style.color = '#4361ee'}
                                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    style={styles.actionBtn}
                                                    onMouseEnter={(e) => e.target.style.color = '#4361ee'}
                                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                                    title="Download Receipt"
                                                >
                                                    <i className="fas fa-download"></i>
                                                </button>
                                                {item.status === 'Pending' && (
                                                    <button
                                                        style={{ ...styles.actionBtn, color: '#28a745' }}
                                                        onMouseEnter={(e) => e.target.style.color = '#1e7e34'}
                                                        onMouseLeave={(e) => e.target.style.color = '#28a745'}
                                                        title="Approve"
                                                        onClick={() => handleApprove(item.id)}
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
                                                {(item.status === 'Pending' || item.status === 'Approved') && (
                                                    <button
                                                        style={{ ...styles.actionBtn, color: '#4361ee' }}
                                                        onMouseEnter={(e) => e.target.style.color = '#3f37c9'}
                                                        onMouseLeave={(e) => e.target.style.color = '#4361ee'}
                                                        title="Mark as Paid"
                                                        onClick={() => handleMarkAsPaid(item.id)}
                                                    >
                                                        <i className="fas fa-check-double"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredReimbursements.length === 0 && (
                            <div style={styles.emptyState}>
                                <i className="fas fa-inbox" style={styles.emptyStateIcon}></i>
                                <h3>No reimbursement claims found</h3>
                                <p>There are no claims matching your current filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Reimbursement Modal */}
            {isModalOpen && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalHeaderH2}>Submit New Reimbursement</h2>
                            <button
                                style={styles.closeBtn}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label htmlFor="userId" style={styles.label}>Employee *</label>
                                <select
                                    id="userId"
                                    name="userId"
                                    value={newReimbursement.userId || selectedUser}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    required
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} - {user.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="title" style={styles.label}>Expense Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newReimbursement.title}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label htmlFor="category" style={styles.label}>Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={newReimbursement.category}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                        required
                                    >
                                        <option value="Travel">Travel</option>
                                        <option value="Food">Food</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Training">Training</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label htmlFor="amount" style={styles.label}>Amount (₹) *</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        value={newReimbursement.amount}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="date" style={styles.label}>Date of Expense *</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={newReimbursement.date}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="description" style={styles.label}>Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newReimbursement.description}
                                    onChange={handleInputChange}
                                    style={styles.textarea}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="receipt" style={styles.label}>Upload Receipt</label>
                                <input
                                    type="file"
                                    id="receipt"
                                    name="receipt"
                                    onChange={handleFileChange}
                                    style={styles.fileInput}
                                    accept="image/*,.pdf"
                                />
                                <small style={styles.smallText}>
                                    Supported formats: JPG, PNG, PDF (Max 5MB)
                                </small>
                            </div>

                            <div style={styles.formActions}>
                                <button
                                    type="button"
                                    style={{ ...styles.btn, ...styles.btnSecondary }}
                                    onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                                    onMouseLeave={(e) => e.target.style.background = '#6c757d'}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.btn}
                                    onMouseEnter={(e) => e.target.style.background = '#3f37c9'}
                                    onMouseLeave={(e) => e.target.style.background = '#4361ee'}
                                >
                                    Submit Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReimbursementManagement; 