interface ExpenseEmailData {
    amount: number;
    fromAllocation: number;
    fromReimbursement: number;
    description?: string;
    paymentMode?: string;
    createdAt: Date;
}

interface UserEmailData {
    name: string;
}

interface DepartmentEmailData {
    name: string;
}

interface SubDepartmentEmailData {
    name: string;
}

const createExpenseEmailTemplate = (
    expense: ExpenseEmailData,
    user: UserEmailData,
    department: DepartmentEmailData,
    subDepartment?: SubDepartmentEmailData
): string => {
    const formattedDate = new Date(expense.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Safely handle optional values
    const descriptionHtml = expense.description ? `
    <div class="expense-detail">
      <span class="detail-label">Description:</span>
      <span class="detail-value">${expense.description}</span>
    </div>
  ` : '';

    const subDepartmentHtml = subDepartment ? `
    <div class="expense-detail">
      <span class="detail-label">Sub-Department:</span>
      <span class="detail-value">${subDepartment.name}</span>
    </div>
  ` : '';

    const paymentMode = expense.paymentMode || 'Not specified';
    const appUrl = process.env.APP_URL || 'https://yourapp.com';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Expense Submission</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .expense-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #4f46e5;
        }
        .expense-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .expense-detail:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #64748b;
        }
        .detail-value {
            font-weight: 500;
            color: #1e293b;
        }
        .amount-highlight {
            font-size: 28px;
            font-weight: 700;
            color: #059669;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f0fdf4;
            border-radius: 8px;
            border: 2px solid #10b981;
        }
        .budget-breakdown {
            background: #f0fdf4;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border: 1px solid #bbf7d0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            color: #64748b;
            font-size: 14px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        .badge-allocation {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge-reimbursement {
            background: #fef3c7;
            color: #92400e;
        }
        .action-button {
            background: #4f46e5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
            margin: 10px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .content {
                padding: 20px;
            }
            .expense-detail {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 New Expense Submitted</h1>
        </div>
        
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new expense has been submitted and requires your attention.</p>
            
            <div class="amount-highlight">
                ₹${expense.amount.toLocaleString('en-IN')}
            </div>

            <div class="expense-card">
                <h3 style="margin-top: 0; color: #4f46e5;">Expense Details</h3>
                
                <div class="expense-detail">
                    <span class="detail-label">Submitted By:</span>
                    <span class="detail-value">${user.name}</span>
                </div>
                
                <div class="expense-detail">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${department.name}</span>
                </div>
                
                ${subDepartmentHtml}
                
                ${descriptionHtml}
                
                <div class="expense-detail">
                    <span class="detail-label">Payment Mode:</span>
                    <span class="detail-value">${paymentMode}</span>
                </div>
                
                <div class="expense-detail">
                    <span class="detail-label">Submitted On:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
            </div>

            <div class="budget-breakdown">
                <h4 style="margin-top: 0; color: #059669;">Budget Allocation</h4>
                <div class="expense-detail">
                    <span class="detail-label">From Allocation:</span>
                    <span class="detail-value">
                        ₹${expense.fromAllocation.toLocaleString('en-IN')} 
                        <span class="badge badge-allocation">BUDGET</span>
                    </span>
                </div>
                <div class="expense-detail">
                    <span class="detail-label">From Reimbursement:</span>
                    <span class="detail-value">
                        ₹${expense.fromReimbursement.toLocaleString('en-IN')} 
                        <span class="badge badge-reimbursement">REIMBURSEMENT</span>
                    </span>
                </div>
            </div>

            <div style="text-align: center; margin-top: 25px;">
                <a href="${appUrl}/admin/expenses" class="action-button">
                   Review Expense
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from ExpenseTracker System.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export default createExpenseEmailTemplate;