import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
  margin-top: 0;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarOpen ? '300px' : ''};
  transition: margin-left 0.3s ease;
  width: ${props => props.sidebarOpen ? 'calc(100% - 300px)' : '100%'};
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentArea = styled.div`
  padding: 10px;
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  margin-top: 1px;

  @media (max-width: 768px) {
    padding: 16px;
    margin-top: 16px;
  }
`;




const StatsGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin: 32px 0;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

// Updated StatCard with exact AdminDashboard sizing
const StatCard = styled.div`
  background: ${props => `linear-gradient(135deg, ${props.color} 0%, ${props.color}dd 100%)`};
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5;
  flex: 1;
  min-height: 140px;
  width: 100%;
  mt:3

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  background: rgba(9, 63, 158, 0.2);
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const StatSubtitle = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
`;

const TabsContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  color:blue;
  
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#383737ff'};
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 140px;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.$active ? 'white' : '#667eea'};
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9rem;
    min-width: 120px;
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h2`
  color: #1a202c;
  margin-bottom: 28px;
  font-size: 1.75rem;
  font-weight: 700;
  border-bottom: 2px solid #f1f3f9;
  padding-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
`;

// Enhanced Select with custom styling
const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='m2 0 2 4H0z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  option {
    padding: 12px;
    font-size: 0.95rem;
  }
`;

// Enhanced Input with better styling
const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 120px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FileUpload = styled.div`
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f7fafc;
  
  &:hover {
    border-color: #667eea;
    background: #edf2f7;
  }
  
  input[type="file"] {
    display: none;
  }
`;

const FileUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #667eea;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 24px;
  background: white;
  border-radius: 8px;
  border: 2px solid #667eea;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const FileName = styled.div`
  margin-top: 16px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 800px;
`;

const TableHeader = styled.th`
  background: #f7fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
`;

const TableRow = styled.tr`
  transition: background 0.2s ease;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  
  background: ${props => {
    switch (props.status) {
      case 'submitted': return '#e9f7fe';
      case 'approved': return '#e6f4ea';
      case 'rejected': return '#fce8e6';
      case 'reimbursed': return '#f0e8ff';
      default: return '#f1f3f4';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'submitted': return '#0366d6';
      case 'approved': return '#0d652d';
      case 'rejected': return '#c5221f';
      case 'reimbursed': return '#5e4db2';
      default: return '#5f6368';
    }
  }};
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#667eea' :
    props.variant === 'success' ? '#48bb78' :
      props.variant === 'danger' ? '#f56565' : '#e2e8f0'};
  color: ${props => props.variant ? 'white' : '#4a5568'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: 2px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 24px;
    margin: 20px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f3f9;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1a202c;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  
  &:hover {
    background: #f7fafc;
    color: #2d3748;
  }
`;

const ProofImage = styled.img`
  width: 100%;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// New Category Dropdown Container
const CategoryDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CategorySelectButton = styled.button`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  text-align: left;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::after {
    content: '▼';
    font-size: 0.8rem;
    color: #718096;
    transition: transform 0.3s ease;
    transform: ${props => props.open ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const CategoryDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 4px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  display: ${props => props.open ? 'block' : 'none'};
`;

const CategoryOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f9;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
`;

const SubCategoryOption = styled(CategoryOption)`
  padding-left: 32px;
  font-size: 0.9rem;
  color: #4a5568;
  
  &:hover {
    background: #edf2f7;
  }
  
  &.selected {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-weight: 600;
  }
`;

// SVG Icons matching AdminDashboard
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const PaymentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </svg>
);

const PendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const Expenses = () => {
  // State for expense submission
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    subCategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    proofFile: null
  });

  // State for expenses data
  const [expenses, setExpenses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('submitExpense');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Enhanced category structure with subcategories
  const expenseCategories = {
    'Sales': ['Google work space', 'Go-Daddy', 'Contabo', 'Instantly', 'Domain Renewal', 'Client Meetings'],
    'Data': ['VPN', 'Zoom info', 'E-mail verifier', 'Appolo', 'linkedin', 'Ai Ark'],
    'IT': ['Hardware', 'Software', 'Cloud Services', 'IT Support', 'Cybersecurity', 'Laptop services'],
    'Office Expenses': ['Rent', 'Apna Subscription', 'Naukri Subscription ', 'Milk Bill ', 'Electricity Bill', 'Swiggy', 'Maintenance', 'Stationery', 'Laptop repair charges', 'Courier Charges', 'Salary', 'Remaining salary arrears', 'Incentives', 'Remaining Incentives arrears', 'Internet Bill', 'Invoice Payments', 'Cake'],
    'Marketing': ['Advertising', 'Social Media', 'Events', 'Print Materials', 'Digital Marketing'],
    'Travel': ['Flights', 'Hotels', 'Transportation', 'Meals - Travel', 'Conference Fees'],
    'Training': ['Courses', 'Certifications', 'Workshops', 'Books & Materials'],
    'Others': ['Miscellaneous', 'Professional Fees', 'Consulting', 'Legal Fees']
  };

  // Sample initial data
  const initialExpenses = [
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      category: 'Sales - Client Meetings',
      amount: 150,
      date: '2024-01-15',
      description: 'Client lunch meeting at restaurant',
      status: 'approved',
      proofImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      proofUploadDate: '2024-01-15',
      submittedDate: '2024-01-15',
      approvedDate: '2024-01-16',
      reimbursed: false
    },
    {
      id: 2,
      userId: 2,
      userName: 'Jane Smith',
      category: 'Travel - Flights',
      amount: 300,
      date: '2024-01-16',
      description: 'Flight ticket for conference',
      status: 'approved',
      proofImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      proofUploadDate: '2024-01-16',
      submittedDate: '2024-01-16',
      approvedDate: '2024-01-17',
      reimbursed: true,
      reimbursedDate: '2024-01-20'
    },
    {
      id: 3,
      userId: 1,
      userName: 'John Doe',
      category: 'Marketing - Events',
      amount: 200,
      date: '2024-01-17',
      description: 'Team building activity',
      status: 'submitted',
      proofImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      proofUploadDate: '2024-01-17',
      submittedDate: '2024-01-17',
      reimbursed: false
    },
    {
      id: 4,
      userId: 3,
      userName: 'Mike Johnson',
      category: 'IT - Software',
      amount: 120,
      date: '2024-01-18',
      description: 'Office software subscription',
      status: 'rejected',
      proofImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      proofUploadDate: '2024-01-18',
      submittedDate: '2024-01-18',
      rejectedDate: '2024-01-19',
      reimbursed: false
    }
  ];

  useEffect(() => {
    setExpenses(initialExpenses);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpenseForm(prev => ({
        ...prev,
        proofFile: file
      }));
    }
  };

  const handleCategorySelect = (mainCategory, subCategory = '') => {
    const fullCategory = subCategory ? `${mainCategory} - ${subCategory}` : mainCategory;
    setExpenseForm(prev => ({
      ...prev,
      category: fullCategory,
      subCategory: subCategory
    }));
    setCategoryDropdownOpen(false);
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();

    const newExpense = {
      id: expenses.length + 1,
      userId: 1,
      userName: 'Super Admin',
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      description: expenseForm.description,
      status: 'submitted',
      proofImage: expenseForm.proofFile ? URL.createObjectURL(expenseForm.proofFile) : '',
      proofUploadDate: new Date().toISOString().split('T')[0],
      submittedDate: new Date().toISOString().split('T')[0],
      reimbursed: false
    };

    setExpenses(prev => [newExpense, ...prev]);
    setExpenseForm({
      category: '',
      subCategory: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      proofFile: null
    });

    alert('Expense submitted successfully!');
  };

  const updateExpenseStatus = (expenseId, status) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId
        ? {
          ...expense,
          status,
          ...(status === 'approved' && { approvedDate: new Date().toISOString().split('T')[0] }),
          ...(status === 'rejected' && { rejectedDate: new Date().toISOString().split('T')[0] })
        }
        : expense
    );
    setExpenses(updatedExpenses);
    setShowProofModal(false);
  };

  const markAsReimbursed = (expenseId) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId
        ? {
          ...expense,
          reimbursed: true,
          reimbursedDate: new Date().toISOString().split('T')[0]
        }
        : expense
    );
    setExpenses(updatedExpenses);
  };

  const viewProof = (expense) => {
    setSelectedExpense(expense);
    setShowProofModal(true);
  };

  const closeProofModal = () => {
    setShowProofModal(false);
    setSelectedExpense(null);
  };

  const filteredExpenses = filterStatus === 'all'
    ? expenses
    : expenses.filter(expense => expense.status === filterStatus);

  // Statistics - Updated to match AdminDashboard
  const monthlyBudget = 15500;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = monthlyBudget - totalSpent;
  const budgetUsedPercentage = ((totalSpent / monthlyBudget) * 100).toFixed(1);
  const pendingReimbursements = expenses.filter(expense => expense.reimbursement && !expense.reimbursed).length;

  const isFormValid = expenseForm.category && expenseForm.amount && expenseForm.date && expenseForm.description && expenseForm.proofFile;

  // Stats data matching AdminDashboard exactly
  const statsData = [
    {
      title: "TOTAL ALLOCATED",
      value: `₹${monthlyBudget.toLocaleString()}`,
      icon: <WalletIcon />,
      color: "#4361ee",
      subtitle: "Monthly budget allocation"
    },
    {
      title: "TOTAL SPENT",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: <PaymentIcon />,
      color: "#ef476f",
      subtitle: `${budgetUsedPercentage}% of budget used`
    },
    {
      title: "REMAINING BALANCE",
      value: `₹${remainingBalance.toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: "#06d6a0",
      subtitle: "Available funds"
    },
    {
      title: "PENDING REIMBURSEMENTS",
      value: pendingReimbursements.toString(),
      icon: <PendingIcon />,
      color: "#ffd166",
      subtitle: "Awaiting payment"
    }
  ];

  return (
    <DashboardContainer>
      <MainContentWrapper>
        <MainContent>
          <ContentArea>
            {/* Stats Cards - Exact same size and layout as AdminDashboard */}
            <StatsGrid>
              {statsData.map((stat, index) => (
                <StatCard
                  key={index}
                  color={stat.color}
                  onClick={() => {
                    if (index === 1 || index === 2) setActiveTab('myExpenses');
                    if (index === 0) setActiveTab('submitExpense');
                  }}
                >
                  <StatIcon>
                    {stat.icon}
                  </StatIcon>
                  <StatContent>
                    <StatNumber>{stat.value}</StatNumber>
                    <StatLabel>{stat.title}</StatLabel>
                    <StatSubtitle>{stat.subtitle}</StatSubtitle>
                  </StatContent>
                </StatCard>
              ))}
            </StatsGrid>

            <TabsContainer>
              <Tab active={activeTab === 'submitExpense'} onClick={() => setActiveTab('submitExpense')}>
                Submit Expense
              </Tab>
              <Tab active={activeTab === 'myExpenses'} onClick={() => setActiveTab('myExpenses')}>
                My Expenses
              </Tab>
              <Tab active={activeTab === 'reimbursement'} onClick={() => setActiveTab('reimbursement')}>
                Reimbursement Management
              </Tab>
            </TabsContainer>

            {activeTab === 'submitExpense' && (
              <ContentContainer>
                <SectionTitle>Submit New Expense</SectionTitle>
                <form onSubmit={handleSubmitExpense}>
                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="category">Expense Category </Label>
                      <CategoryDropdownContainer>
                        <CategorySelectButton
                          type="button"
                          open={categoryDropdownOpen}
                          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        >
                          {expenseForm.category || 'Select Category'}
                        </CategorySelectButton>
                        <CategoryDropdown open={categoryDropdownOpen}>
                          {Object.entries(expenseCategories).map(([mainCategory, subCategories]) => (
                            <div key={mainCategory}>
                              <CategoryOption
                                onClick={() => handleCategorySelect(mainCategory)}
                                className={expenseForm.category === mainCategory ? 'selected' : ''}
                              >
                                <strong>{mainCategory}</strong>
                              </CategoryOption>
                              {subCategories.map(subCategory => (
                                <SubCategoryOption
                                  key={subCategory}
                                  onClick={() => handleCategorySelect(mainCategory, subCategory)}
                                  className={expenseForm.category === `${mainCategory} - ${subCategory}` ? 'selected' : ''}
                                >
                                  {subCategory}
                                </SubCategoryOption>
                              ))}
                            </div>
                          ))}
                        </CategoryDropdown>
                      </CategoryDropdownContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        type="number"
                        id="amount"
                        name="amount"
                        value={expenseForm.amount}
                        onChange={handleInputChange}
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="date">Expense Date </Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={expenseForm.date}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup>
                    <Label htmlFor="description">Description </Label>
                    <TextArea
                      id="description"
                      name="description"
                      value={expenseForm.description}
                      onChange={handleInputChange}
                      placeholder="Provide a detailed description of the expense..."
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Proof of Payment </Label>
                    <FileUpload>
                      <FileUploadLabel htmlFor="proofFile">
                        📎 {expenseForm.proofFile ? 'Change File' : 'Choose File'}
                      </FileUploadLabel>
                      <input
                        type="file"
                        id="proofFile"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                      {expenseForm.proofFile && (
                        <FileName>📄 {expenseForm.proofFile.name}</FileName>
                      )}
                      {!expenseForm.proofFile && (
                        <div style={{ color: '#718096', marginTop: '12px' }}>
                          Upload receipt or proof of payment (Image or PDF)
                        </div>
                      )}
                    </FileUpload>
                  </FormGroup>

                  <Button type="submit" disabled={!isFormValid}>
                    📤 Submit Expense
                  </Button>
                </form>
              </ContentContainer>
            )}

            {activeTab === 'myExpenses' && (
              <ContentContainer>
                <SectionTitle>My Expense History</SectionTitle>
                <FilterContainer>
                  {['all', 'submitted', 'approved', 'rejected'].map(status => (
                    <FilterButton
                      key={status}
                      active={filterStatus === status}
                      onClick={() => setFilterStatus(status)}
                    >
                      {status === 'all' ? 'All Expenses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </FilterButton>
                  ))}
                </FilterContainer>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Date</TableHeader>
                        <TableHeader>Category</TableHeader>
                        <TableHeader>Description</TableHeader>
                        <TableHeader>Amount</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actions</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <StatusBadge status={expense.status}>
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                              {expense.reimbursed && ' • Reimbursed'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <ActionButton onClick={() => viewProof(expense)}>
                              👁️ View
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              </ContentContainer>
            )}

            {activeTab === 'reimbursement' && (
              <ContentContainer>
                <SectionTitle>Reimbursement Management</SectionTitle>
                <p>Reimbursement features coming soon...</p>
              </ContentContainer>
            )}

            {showProofModal && selectedExpense && (
              <ModalOverlay onClick={closeProofModal}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                  <ModalHeader>
                    <ModalTitle>Expense Details</ModalTitle>
                    <CloseButton onClick={closeProofModal}>×</CloseButton>
                  </ModalHeader>
                  <div>
                    <strong>User:</strong> {selectedExpense.userName}<br />
                    <strong>Amount:</strong> ₹{selectedExpense.amount.toFixed(2)}<br />
                    <strong>Category:</strong> {selectedExpense.category}<br />
                    <strong>Description:</strong> {selectedExpense.description}<br />
                    <strong>Expense Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}<br />
                    <strong>Status:</strong> <StatusBadge status={selectedExpense.status}>
                      {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                      {selectedExpense.reimbursed && ' • Reimbursed'}
                    </StatusBadge>
                  </div>
                  {selectedExpense.proofImage && (
                    <ProofImage src={selectedExpense.proofImage} alt="Expense proof" />
                  )}
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedExpense.status === 'submitted' && (
                      <>
                        <ActionButton variant="success" onClick={() => updateExpenseStatus(selectedExpense.id, 'approved')}>
                          ✓ Approve
                        </ActionButton>
                        <ActionButton variant="danger" onClick={() => updateExpenseStatus(selectedExpense.id, 'rejected')}>
                          ✗ Reject
                        </ActionButton>
                      </>
                    )}
                    {selectedExpense.status === 'approved' && !selectedExpense.reimbursed && (
                      <ActionButton variant="success" onClick={() => markAsReimbursed(selectedExpense.id)}>
                        💳 Mark as Reimbursed
                      </ActionButton>
                    )}
                  </div>
                </ModalContent>
              </ModalOverlay>
            )}
          </ContentArea>
        </MainContent>
      </MainContentWrapper>
    </DashboardContainer>
  );
};

export default Expenses;