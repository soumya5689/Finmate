import React, { createContext, useState, useContext } from 'react';

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  paymentMethod: string;
  recipient: string;
  remarks: string;
}

export interface ExpenseSummary {
  totalWithdrawals: number;
  averageWithdrawal: number;
  highestWithdrawal: number;
  mostUsedPaymentMethod: string;
  
}

interface ExpenseContextType {
  transactions: Transaction[];
  expenseSummary: ExpenseSummary;
  fileUploaded: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  calculateSummary: () => void;
  clearData: () => void;
}

const defaultSummary: ExpenseSummary = {
  totalWithdrawals: 0,
  averageWithdrawal: 0,
  highestWithdrawal: 0,
  mostUsedPaymentMethod: ''
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>(defaultSummary);
  const [fileUploaded, setFileUploaded] = useState(false);

  const calculateSummary = () => {
    if (transactions.length === 0) {
      setExpenseSummary(defaultSummary);
      return;
    }

    const totalWithdrawals = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const averageWithdrawal = totalWithdrawals / transactions.length;
    const highestWithdrawal = Math.max(...transactions.map(t => t.amount));
    
    // Count payment methods and find most used
    const paymentMethodCount: Record<string, number> = {};
    transactions.forEach(t => {
      paymentMethodCount[t.paymentMethod] = (paymentMethodCount[t.paymentMethod] || 0) + 1;
    });
    
    let mostUsedPaymentMethod = '';
    let maxCount = 0;
    
    Object.entries(paymentMethodCount).forEach(([method, count]: [string, number]) => {
      if (count > maxCount) {
        mostUsedPaymentMethod = method;
        maxCount = count;
      }
    });
    
    // Count unique recipients
    const uniqueRecipients = new Set(transactions.map(t => t.recipient)).size;
    
    // Count unique payment methods
    const uniquePaymentMethods = Object.keys(paymentMethodCount).length;
    
    setExpenseSummary({
      totalWithdrawals,
      averageWithdrawal,
      highestWithdrawal,
      mostUsedPaymentMethod,
    });
    
    setFileUploaded(true);
  };

  const clearData = () => {
    setTransactions([]);
    setExpenseSummary(defaultSummary);
    setFileUploaded(false);
  };
  const loadDashboardSummaryFromAPI = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/dashboard_data");
    const data = await res.json();

    setExpenseSummary({
      totalWithdrawals: data.total_withdrawals,
      averageWithdrawal: data.average_withdrawal,
      highestWithdrawal: data.highest_withdrawal,
      mostUsedPaymentMethod: data.mostUsedPaymentMethod,
    });

    setFileUploaded(true); // Set true so that frontend shows the summary
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }
};

  const value = {
  transactions,
  expenseSummary,
  fileUploaded,
  setTransactions,
  calculateSummary,
  clearData,
  loadDashboardSummaryFromAPI  // 👈 ADD THIS
  };
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};