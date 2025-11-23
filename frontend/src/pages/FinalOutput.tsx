import React, { useState, useEffect } from 'react';
import { useExpense } from '../contexts/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Database, Download, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Transaction {
  id: number;
  transaction_date: string; 
  withdrawals: number;     
  payment_method: string;
  recipient_merchant: string; 
  remarks: string;
}

const FinalOutput: React.FC = () => {
  const { fileUploaded } = useExpense(); 
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [expenseSummary, setExpenseSummary] = useState<{      
        totalWithdrawals: number;
        averageWithdrawal: number;
        highestWithdrawal: number;
        mostUsedPaymentMethod: string;
    }>({
        totalWithdrawals: 0,
        averageWithdrawal: 0,
        highestWithdrawal: 0,
        mostUsedPaymentMethod: ''
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<keyof Transaction>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch transactions
        const transactionsResponse = await fetch('http://localhost:8000/api/final-output');
        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch transactions: ${transactionsResponse.status} - ${await transactionsResponse.text()}`);
        }
        const transactionsData = await transactionsResponse.json();
        console.log("Transactions Data:", transactionsData);

        // Make sure transactions are in expected format
        if (!Array.isArray(transactionsData.transactions)) {
          throw new Error("Invalid transactions data format");
        }
        setTransactions(transactionsData.transactions);

        // Fetch dashboard data
        const dashboardResponse = await fetch('http://localhost:8000/api/dashboard_data');
        if (!dashboardResponse.ok) {
          throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status} - ${await dashboardResponse.text()}`);
        }
        const dashboardData = await dashboardResponse.json();
        console.log("Dashboard Data:", dashboardData);

        
        setExpenseSummary({
          totalWithdrawals: Number(dashboardData.totalWithdrawals) || 0,
          averageWithdrawal: Number(dashboardData.averageWithdrawal) || 0,
          highestWithdrawal: Number(dashboardData.highestWithdrawal) || 0,
          mostUsedPaymentMethod: dashboardData.mostUsedPaymentMethod || ''
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!fileUploaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Database className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Data Available</h2>
        <p className="text-gray-500 mb-6">Please upload an Excel file to view the final output</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[60vh] text-red-500">Error: {error}</div>;
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return "₹0.00";
    }
    return `₹${Number(value).toFixed(2)}`;
  };

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'transactions.xlsx');
  };

  const exportToCSV = () => {
    const header = [
      "id",
      "transaction_date",
      "withdrawals",
      "payment_method",
      "recipient_merchant",
      "remarks"
    ];
    const rows = transactions.map(row => [
      row.id,
      row.transaction_date,
      row.withdrawals,
      row.payment_method,
      row.recipient_merchant,
      row.remarks
    ]);
    const csvContent = [header, ...rows]
      .map(e => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Final Output</h1>
      <p className="text-gray-600 mb-8">MySQL Database Transaction Results</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Total Withdrawals</h2>
          <p className="text-3xl font-bold">{formatCurrency(expenseSummary.totalWithdrawals)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Average Withdrawal</h2>
          <p className="text-3xl font-bold">{formatCurrency(expenseSummary.averageWithdrawal)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Highest Withdrawal</h2>
          <div>
            <p className="text-3xl font-bold">{formatCurrency(expenseSummary.highestWithdrawal)}</p>
            <p className="text-sm text-gray-500">{expenseSummary.mostUsedPaymentMethod}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Most Used Payment Method</h2>
          <p className="text-3xl font-bold">{expenseSummary.mostUsedPaymentMethod}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Transaction Data</h2>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-5 h-5 mr-2" />
              CSV
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('id')}>
                  ID
                  {sortField === 'id' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('transaction_date')}>
                  Date
                  {sortField === 'transaction_date' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"  onClick={() => handleSort('withdrawals')}>
                  Withdrawal
                  {sortField === 'withdrawals' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('payment_method')}>
                  Payment Method
                  {sortField === 'payment_method' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('recipient_merchant')}>
                  Recipient/Merchant
                  {sortField === 'recipient_merchant' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('remarks')}>
                  Remarks
                  {sortField === 'remarks' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transaction_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.withdrawals)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.recipient_merchant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinalOutput;