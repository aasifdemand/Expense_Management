// Budget summary
export const budgetData = {
  monthlyBudget: 100000,
  totalSpent: 42000,
  remainingBalance: 58000,
  pendingReimbursements: 15000,
};
 
// Monthly totals for bar chart
export const monthlyTotals = [
  { month: "Jan", total: 8000, approved: 6000, pending: 1500, rejected: 500 },
  { month: "Feb", total: 12000, approved: 9000, pending: 2000, rejected: 1000 },
  { month: "Mar", total: 9500, approved: 7500, pending: 1500, rejected: 500 },
  { month: "Apr", total: 15000, approved: 12000, pending: 2000, rejected: 1000 },
  { month: "May", total: 11000, approved: 8500, pending: 2000, rejected: 500 },
  { month: "Jun", total: 13000, approved: 10000, pending: 2500, rejected: 500 },
];
 
// Expenses list
export const expenses = [
  {
    id: 1,
    description: "Team lunch at restaurant",
    amount: 2500,
    department: "HR",
    date: "2025-09-01",
    receipt: "Invoice #1234",
    status: "approved",
    paidTo: "Restaurant ABC"
  },
  {
    id: 2,
    description: "Travel reimbursement - client visit",
    amount: 5000,
    department: "Sales",
    date: "2025-09-05",
    receipt: "Invoice #5678",
    status: "pending",
    paidTo: "Airline XYZ"
  },
  {
    id: 3,
    description: "Laptop accessories purchase",
    amount: 3500,
    department: "IT",
    date: "2025-09-10",
    receipt: "Invoice #9101",
    status: "rejected",
    paidTo: "Electronics Store"
  },
  {
    id: 4,
    description: "Stationery supplies",
    amount: 1200,
    department: "Admin",
    date: "2025-09-15",
    receipt: "Invoice #1213",
    status: "approved",
    paidTo: "Office Supplies Ltd"
  },
];
 
// Reimbursement status
export const reimbursementStatuses = [
  {
    id: 1,
    description: "Flight tickets - Bangalore to Delhi",
    amount: 8000,
    status: "approved",
    submittedDate: "2025-09-01",
    completionDate: "2025-09-07",
  },
  {
    id: 2,
    description: "Hotel accommodation - Delhi trip",
    amount: 6000,
    status: "pending",
    submittedDate: "2025-09-08",
    estimatedCompletion: "2025-09-20",
  },
  {
    id: 3,
    description: "Client entertainment expenses",
    amount: 4500,
    status: "rejected",
    submittedDate: "2025-09-10",
  },
];
 
// Pending requests
export const pendingRequests = [
  {
    id: 1,
    description: "Team outing budget approval",
    amount: 10000,
    department: "HR",
    date: "2025-09-12",
  },
  {
    id: 2,
    description: "Office renovation request",
    amount: 25000,
    department: "Admin",
    date: "2025-09-15",
  },
];