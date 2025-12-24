import React, { createContext, useState, useContext } from "react";

/* ============================
   EXISTING INTERFACES
============================ */

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
  averageTimeBetweenTransactions: number | null;
}

/* ============================
   ✅ NEW: Categorized Expense
============================ */

export interface CategorizedExpense {
  id: number;
  withdrawals: number;
  payment_method: string;
  recipient_merchant: string;
  category: string;
  transaction_date: string;
}

/* ============================
   CONTEXT TYPE
============================ */

interface ExpenseContextType {
  transactions: Transaction[];
  expenseSummary: ExpenseSummary;
  categorizedExpenses: CategorizedExpense[]; // ✅ NEW
  fileUploaded: boolean;

  setTransactions: (transactions: Transaction[]) => void;
  calculateSummary: () => void;
  clearData: () => void;

  loadDashboardSummaryFromAPI: () => void;
  loadCategorizedExpensesFromAPI: () => void; // ✅ NEW
}

const defaultSummary: ExpenseSummary = {
  totalWithdrawals: 0,
  averageWithdrawal: 0,
  highestWithdrawal: 0,
  mostUsedPaymentMethod: "",
  averageTimeBetweenTransactions: null,
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

/* ============================
   HOOK
============================ */

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};

/* ============================
   PROVIDER
============================ */

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>(defaultSummary);
  const [categorizedExpenses, setCategorizedExpenses] = useState<CategorizedExpense[]>([]); // ✅ NEW
  const [fileUploaded, setFileUploaded] = useState(false);

  /* ============================
     EXISTING LOGIC (UNCHANGED)
  ============================ */

  const calculateSummary = () => {
    if (transactions.length === 0) {
      setExpenseSummary(defaultSummary);
      return;
    }

    const totalWithdrawals = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageWithdrawal = totalWithdrawals / transactions.length;
    const highestWithdrawal = Math.max(...transactions.map((t) => t.amount));

    const count: Record<string, number> = {};
    transactions.forEach((t) => {
      count[t.paymentMethod] = (count[t.paymentMethod] || 0) + 1;
    });

    let mostUsed = "";
    let maxCount = 0;
    Object.entries(count).forEach(([method, c]) => {
      if (c > maxCount) {
        mostUsed = method;
        maxCount = c;
      }
    });

    setExpenseSummary({
      totalWithdrawals,
      averageWithdrawal,
      highestWithdrawal,
      mostUsedPaymentMethod: mostUsed,
      averageTimeBetweenTransactions: null,
    });

    setFileUploaded(true);
  };

  const clearData = () => {
    setTransactions([]);
    setExpenseSummary(defaultSummary);
    setCategorizedExpenses([]); // ✅ CLEAR NEW DATA
    setFileUploaded(false);
  };

  /* ============================
     DASHBOARD SUMMARY API
  ============================ */

  const loadDashboardSummaryFromAPI = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/dashboard_data");
      const data = await res.json();

      setExpenseSummary({
        totalWithdrawals: data.totalWithdrawals,
        averageWithdrawal: data.averageWithdrawal,
        highestWithdrawal: data.highestWithdrawal,
        mostUsedPaymentMethod: data.mostUsedPaymentMethod,
        averageTimeBetweenTransactions: data.averageTimeBetweenTransactions,
      });

      setFileUploaded(true);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  /* ============================
     ✅ NEW: CATEGORIZED EXPENSE API
  ============================ */

  const loadCategorizedExpensesFromAPI = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/expenses/categorized");
      const data = await res.json();
      setCategorizedExpenses(data);
    } catch (error) {
      console.error("Failed to load categorized expenses:", error);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        expenseSummary,
        categorizedExpenses,
        fileUploaded,
        setTransactions,
        calculateSummary,
        clearData,
        loadDashboardSummaryFromAPI,
        loadCategorizedExpensesFromAPI,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
