import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

// Styled Components
const DashboardContainer = styled.div`
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
`;

const HeaderSubtitle = styled.p`
  margin: 10px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TabsContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#718096'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #2d3748;
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-bottom: 2px solid #f1f3f9;
  padding-bottom: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BudgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 25px;
`;

const BudgetCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  border-left: 4px solid ${props => {
        const percentage = props.percentage;
        if (percentage >= 90) return '#f56565';
        if (percentage >= 75) return '#ed8936';
        return '#48bb78';
    }};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 15px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0;
  color: #2d3748;
`;

const UserEmail = styled.p`
  margin: 5px 0 0 0;
  color: #718096;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  margin: 15px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
        const percentage = props.percentage;
        if (percentage >= 90) return '#f56565';
        if (percentage >= 75) return '#ed8936';
        return '#48bb78';
    }};
  width: ${props => props.percentage}%;
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const BudgetInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const BudgetAmount = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const BudgetRemaining = styled.div`
  color: #718096;
  font-size: 0.9rem;
`;

const ExpensesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 25px;
`;

const ExpenseCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  border-left: 4px solid ${props => {
        switch (props.status) {
            case 'approved': return '#48bb78';
            case 'pending': return '#ed8936';
            case 'rejected': return '#f56565';
            default: return '#a0aec0';
        }
    }};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ExpenseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ExpenseUser = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const ExpenseAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
`;

const ExpenseCategory = styled.span`
  background: #edf2f7;
  color: #4a5568;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ExpenseDescription = styled.p`
  color: #718096;
  margin: 10px 0;
`;

const ExpenseDate = styled.div`
  color: #a0aec0;
  font-size: 0.8rem;
  margin-bottom: 15px;
`;

const ExpenseStatus = styled.div`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
        switch (props.status) {
            case 'approved': return '#c6f6d5';
            case 'pending': return '#feebc8';
            case 'rejected': return '#fed7d7';
            default: return '#e2e8f0';
        }
    }};
  color: ${props => {
        switch (props.status) {
            case 'approved': return '#276749';
            case 'pending': return '#9c4221';
            case 'rejected': return '#9b2c2c';
            default: return '#4a5568';
        }
    }};
`;

const ProofButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2d3748;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  
  &:hover {
    color: #2d3748;
  }
`;

const ProofImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ApproveButton = styled.button`
  background: #48bb78;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    background: #3ea76a;
  }
`;

const RejectButton = styled.button`
  background: #f56565;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    background: #e53e3e;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
`;

const Expenses = () => {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [monthlyLimit, setMonthlyLimit] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);
    const [activeTab, setActiveTab] = useState('budgets');

    // Sample initial data
    const initialUsers = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            monthlyLimit: 1000,
            currentSpent: 750,
            department: 'Marketing'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            monthlyLimit: 1500,
            currentSpent: 1200,
            department: 'Sales'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike@example.com',
            monthlyLimit: 800,
            currentSpent: 600,
            department: 'IT'
        },
        {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            monthlyLimit: 2000,
            currentSpent: 950,
            department: 'HR'
        },
    ];

    const initialExpenses = [
        {
            id: 1,
            userId: 1,
            userName: 'John Doe',
            category: 'Food & Dining',
            amount: 150,
            date: '2024-01-15',
            description: 'Client lunch meeting at restaurant',
            status: 'approved',
            proofImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-15'
        },
        {
            id: 2,
            userId: 2,
            userName: 'Jane Smith',
            category: 'Travel',
            amount: 300,
            date: '2024-01-16',
            description: 'Flight ticket for conference',
            status: 'pending',
            proofImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-16'
        },
        {
            id: 3,
            userId: 1,
            userName: 'John Doe',
            category: 'Entertainment',
            amount: 200,
            date: '2024-01-17',
            description: 'Team building activity',
            status: 'pending',
            proofImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-17'
        },
        {
            id: 4,
            userId: 3,
            userName: 'Mike Johnson',
            category: 'Utilities',
            amount: 120,
            date: '2024-01-18',
            description: 'Office software subscription',
            status: 'approved',
            proofImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-18'
        },
        {
            id: 5,
            userId: 4,
            userName: 'Sarah Wilson',
            category: 'Office Supplies',
            amount: 85,
            date: '2024-01-19',
            description: 'Purchase of stationery items',
            status: 'rejected',
            proofImage: 'https://images.unsplash.com/photo-1587334985603-7c303cb89477?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-19'
        },
        {
            id: 6,
            userId: 2,
            userName: 'Jane Smith',
            category: 'Transportation',
            amount: 75,
            date: '2024-01-20',
            description: 'Taxi fares for client visits',
            status: 'pending',
            proofImage: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            proofUploadDate: '2024-01-20'
        },
    ];

    useEffect(() => {
        // In a real app, you would fetch this data from an API
        setUsers(initialUsers);
        setExpenses(initialExpenses);
    }, []);

    const handleSetBudget = (e) => {
        e.preventDefault();
        if (!selectedUser || !monthlyLimit) return;

        const updatedUsers = users.map(user =>
            user.id === parseInt(selectedUser)
                ? { ...user, monthlyLimit: parseFloat(monthlyLimit) }
                : user
        );

        setUsers(updatedUsers);
        setSelectedUser('');
        setMonthlyLimit('');
        alert('Budget allocated successfully!');
    };

    const getRemainingBudget = (user) => {
        return user.monthlyLimit - user.currentSpent;
    };

    const getUsagePercentage = (user) => {
        return (user.currentSpent / user.monthlyLimit) * 100;
    };

    const viewProof = (expense) => {
        setSelectedExpense(expense);
        setShowProofModal(true);
    };

    const closeProofModal = () => {
        setShowProofModal(false);
        setSelectedExpense(null);
    };

    const updateExpenseStatus = (expenseId, status) => {
        const updatedExpenses = expenses.map(expense =>
            expense.id === expenseId
                ? { ...expense, status }
                : expense
        );
        setExpenses(updatedExpenses);
        closeProofModal();
    };

    const filteredExpenses = filterStatus === 'all'
        ? expenses
        : expenses.filter(expense => expense.status === filterStatus);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = expenses.filter(expense => expense.status === 'pending').length;
    const approvedExpenses = expenses.filter(expense => expense.status === 'approved').reduce((sum, expense) => sum + expense.amount, 0);

    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    return (
        <DashboardContainer>
            <Header>
                <HeaderTitle>Expense Management Dashboard</HeaderTitle>
                <HeaderSubtitle>Manage user budgets and review expense claims</HeaderSubtitle>
            </Header>

            <StatsContainer>
                <StatCard color="#667eea">
                    <StatNumber>{users.length}</StatNumber>
                    <StatLabel>Total Users</StatLabel>
                </StatCard>
                <StatCard color="#48bb78">
                    <StatNumber>${totalExpenses.toLocaleString()}</StatNumber>
                    <StatLabel>Total Expenses</StatLabel>
                </StatCard>
                <StatCard color="#ed8936">
                    <StatNumber>{pendingExpenses}</StatNumber>
                    <StatLabel>Pending Approvals</StatLabel>
                </StatCard>
                <StatCard color="#9f7aea">
                    <StatNumber>${approvedExpenses.toLocaleString()}</StatNumber>
                    <StatLabel>Approved Expenses</StatLabel>
                </StatCard>
            </StatsContainer>

            <TabsContainer>
                <Tab
                    active={activeTab === 'budgets'}
                    onClick={() => setActiveTab('budgets')}
                >
                    Budget Allocation
                </Tab>
                <Tab
                    active={activeTab === 'expenses'}
                    onClick={() => setActiveTab('expenses')}
                >
                    Expense Review
                </Tab>
            </TabsContainer>

            {activeTab === 'budgets' && (
                <ContentContainer>
                    <SectionTitle>Allocate Monthly Budgets</SectionTitle>
                    <FormGrid>
                        <FormGroup>
                            <Label htmlFor="userSelect">Select User</Label>
                            <Select
                                id="userSelect"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="">Choose a user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.department})
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="monthlyLimit">Monthly Budget ($)</Label>
                            <Input
                                type="number"
                                id="monthlyLimit"
                                value={monthlyLimit}
                                onChange={(e) => setMonthlyLimit(e.target.value)}
                                min="1"
                                step="0.01"
                                placeholder="Enter budget amount"
                            />
                        </FormGroup>
                    </FormGrid>

                    <Button onClick={handleSetBudget} disabled={!selectedUser || !monthlyLimit}>
                        Set Budget
                    </Button>

                    <SectionTitle>Current Budgets Overview</SectionTitle>
                    <BudgetsGrid>
                        {users.map(user => {
                            const usagePercentage = getUsagePercentage(user);
                            return (
                                <BudgetCard key={user.id} percentage={usagePercentage}>
                                    <UserInfo>
                                        <Avatar>{getInitials(user.name)}</Avatar>
                                        <UserDetails>
                                            <UserName>{user.name}</UserName>
                                            <UserEmail>{user.email}</UserEmail>
                                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>{user.department}</div>
                                        </UserDetails>
                                    </UserInfo>

                                    <ProgressBar>
                                        <ProgressFill percentage={usagePercentage} />
                                    </ProgressBar>

                                    <BudgetInfo>
                                        <div>
                                            <BudgetAmount>${user.currentSpent} / ${user.monthlyLimit}</BudgetAmount>
                                            <BudgetRemaining>${getRemainingBudget(user)} remaining</BudgetRemaining>
                                        </div>
                                        <div style={{ fontWeight: '600', color: usagePercentage >= 90 ? '#f56565' : usagePercentage >= 75 ? '#ed8936' : '#48bb78' }}>
                                            {usagePercentage.toFixed(1)}%
                                        </div>
                                    </BudgetInfo>
                                </BudgetCard>
                            );
                        })}
                    </BudgetsGrid>
                </ContentContainer>
            )}

            {activeTab === 'expenses' && (
                <ContentContainer>
                    <SectionTitle>Expense Claims Review</SectionTitle>

                    <FilterContainer>
                        <FilterButton
                            active={filterStatus === 'all'}
                            onClick={() => setFilterStatus('all')}
                        >
                            All Expenses ({expenses.length})
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'pending'}
                            onClick={() => setFilterStatus('pending')}
                        >
                            Pending ({expenses.filter(e => e.status === 'pending').length})
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'approved'}
                            onClick={() => setFilterStatus('approved')}
                        >
                            Approved ({expenses.filter(e => e.status === 'approved').length})
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'rejected'}
                            onClick={() => setFilterStatus('rejected')}
                        >
                            Rejected ({expenses.filter(e => e.status === 'rejected').length})
                        </FilterButton>
                    </FilterContainer>

                    <ExpensesGrid>
                        {filteredExpenses.map(expense => (
                            <ExpenseCard key={expense.id} status={expense.status}>
                                <ExpenseHeader>
                                    <ExpenseUser>{expense.userName}</ExpenseUser>
                                    <ExpenseAmount>${expense.amount}</ExpenseAmount>
                                </ExpenseHeader>

                                <ExpenseCategory>{expense.category}</ExpenseCategory>

                                <ExpenseDescription>{expense.description}</ExpenseDescription>

                                <ExpenseDate>
                                    Submitted: {new Date(expense.date).toLocaleDateString()}
                                </ExpenseDate>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <ExpenseStatus status={expense.status}>
                                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                    </ExpenseStatus>

                                    <ProofButton onClick={() => viewProof(expense)}>
                                        View Proof
                                    </ProofButton>
                                </div>
                            </ExpenseCard>
                        ))}
                    </ExpensesGrid>
                </ContentContainer>
            )}

            {showProofModal && selectedExpense && (
                <ModalOverlay onClick={closeProofModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Expense Proof</ModalTitle>
                            <CloseButton onClick={closeProofModal}>×</CloseButton>
                        </ModalHeader>

                        <div>
                            <strong>User:</strong> {selectedExpense.userName}<br />
                            <strong>Amount:</strong> ${selectedExpense.amount}<br />
                            <strong>Category:</strong> {selectedExpense.category}<br />
                            <strong>Description:</strong> {selectedExpense.description}<br />
                            <strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}<br />
                            <strong>Status:</strong> {selectedExpense.status}
                        </div>

                        <ProofImage
                            src={selectedExpense.proofImage}
                            alt="Expense proof"
                        />

                        <div>
                            <strong>Proof uploaded:</strong> {new Date(selectedExpense.proofUploadDate).toLocaleDateString()}
                        </div>

                        {selectedExpense.status === 'pending' && (
                            <ActionButtons>
                                <ApproveButton onClick={() => updateExpenseStatus(selectedExpense.id, 'approved')}>
                                    Approve Expense
                                </ApproveButton>
                                <RejectButton onClick={() => updateExpenseStatus(selectedExpense.id, 'rejected')}>
                                    Reject Expense
                                </RejectButton>
                            </ActionButtons>
                        )}
                    </ModalContent>
                </ModalOverlay>
            )}
        </DashboardContainer>
    );
};

export default Expenses;