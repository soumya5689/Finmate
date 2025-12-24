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
  const [expenseSummary, setExpenseSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const tx = await fetch('http://localhost:8000/api/final-output').then(r => r.json());
      const dash = await fetch('http://localhost:8000/api/dashboard_data').then(r => r.json());

      setTransactions(tx.transactions);
      setExpenseSummary(dash);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (!fileUploaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-300">
        <Database className="h-16 w-16 mb-4 opacity-60" />
        <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2 bg-indigo-600 rounded-lg text-white"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-400 mt-20">Loading…</div>;
  }

  const formatCurrency = (v: number) => `₹${v.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0E1430] to-[#0B1020] p-8 text-white rounded-2xl">
      <h1 className="text-4xl font-bold mb-2">Final Output</h1>
      <p className="text-gray-400 mb-10">MySQL Database Transaction Results</p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        {[
          ['Total Withdrawals', formatCurrency(expenseSummary.totalWithdrawals)],
          ['Average Withdrawal', formatCurrency(expenseSummary.averageWithdrawal)],
          ['Highest Withdrawal', formatCurrency(expenseSummary.highestWithdrawal)],
          ['Most Used Method', expenseSummary.mostUsedPaymentMethod],
          [
            'Avg Time Between Txns',
            expenseSummary.averageTimeBetweenTransactions
              ? `${expenseSummary.averageTimeBetweenTransactions.toFixed(2)} hrs`
              : 'N/A',
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
          >
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h2 className="text-2xl font-semibold">Transaction Data</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/10 rounded-lg flex items-center gap-2">
              <Download size={16} /> CSV
            </button>
            <button className="px-4 py-2 bg-white/10 rounded-lg flex items-center gap-2">
              <FileDown size={16} /> Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                {['ID', 'DATE', 'AMOUNT', 'METHOD', 'RECIPIENT', 'REMARKS'].map(h => (
                  <th key={h} className="px-6 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5">
                  <td className="px-6 py-3">{tx.id}</td>
                  <td className="px-6 py-3">{tx.transaction_date}</td>
                  <td className="px-6 py-3">{formatCurrency(tx.withdrawals)}</td>
                  <td className="px-6 py-3">{tx.payment_method}</td>
                  <td className="px-6 py-3">{tx.recipient_merchant}</td>
                  <td className="px-6 py-3 truncate max-w-[320px]">{tx.remarks}</td>
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
