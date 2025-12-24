import React, { useState, useEffect } from 'react';
import { useExpense } from '../contexts/ExpenseContext';
import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { fileUploaded } = useExpense();
  const navigate = useNavigate();

  const [activeVisualization, setActiveVisualization] = useState<
    'withdrawalAmount' | 'topRecipients' | 'paymentMethods'
  >('paymentMethods');

  const [imageUrls, setImageUrls] = useState<{
    withdrawalAmount?: string;
    topRecipients?: string;
    paymentMethods?: string;
  }>({});

  useEffect(() => {
    if (!fileUploaded) return;

    setImageUrls({
      withdrawalAmount: 'http://localhost:8000/plots/withdrawal_amount_distribution.png',
      topRecipients: 'http://localhost:8000/plots/top_recipients_distribution.png',
      paymentMethods: 'http://localhost:8000/plots/payment_method_distribution.png',
    });
  }, [fileUploaded]);

  if (!fileUploaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-300">
        <Database className="h-16 w-16 mb-4 opacity-60" />
        <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
        <p className="text-gray-400 mb-6">
          Please upload an Excel file to view dashboard insights
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0E1430] to-[#0B1020] p-8 text-white rounded-2xl">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-10">Visualize your transaction data</p>

      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Transaction Visualizations
        </h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            ['withdrawalAmount', 'Withdrawal Amount'],
            ['topRecipients', 'Top Recipients'],
            ['paymentMethods', 'Payment Methods'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveVisualization(key as any)}
              className={`px-5 py-2 rounded-xl font-medium transition ${
                activeVisualization === key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart Container */}
        <div className="h-[420px] flex items-center justify-center rounded-2xl bg-black/30 border border-white/10">
          {activeVisualization === 'paymentMethods' && imageUrls.paymentMethods && (
            <img src={imageUrls.paymentMethods} className="max-h-full max-w-full" />
          )}
          {activeVisualization === 'withdrawalAmount' && imageUrls.withdrawalAmount && (
            <img src={imageUrls.withdrawalAmount} className="max-h-full max-w-full" />
          )}
          {activeVisualization === 'topRecipients' && imageUrls.topRecipients && (
            <img src={imageUrls.topRecipients} className="max-h-full max-w-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
