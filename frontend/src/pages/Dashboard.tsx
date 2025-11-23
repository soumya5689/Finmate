import React, { useState, useEffect } from 'react';
import { useExpense } from '../contexts/ExpenseContext';
import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { expenseSummary, fileUploaded } = useExpense();
  const navigate = useNavigate();
  const [activeVisualization, setActiveVisualization] = useState<'withdrawalAmount' | 'topRecipients' | 'paymentMethods'>('paymentMethods'); // Changed 'transactionDateFrequency' to 'topRecipients'
  const [imageUrls, setImageUrls] = useState<{ withdrawalAmount?: string; topRecipients?: string; paymentMethods?: string }>({}); // Changed 'transactionDateFrequency' to 'topRecipients'


  useEffect(() => {
    
      const fetchImageUrls = async () => {
          try {
              
              setImageUrls({
                  withdrawalAmount: 'http://localhost:8000/plots/withdrawal_amount_distribution.png',
                  topRecipients: 'http://localhost:8000/plots/top_recipients_distribution.png', 
                  paymentMethods: 'http://localhost:8000/plots/payment_method_distribution.png',
              });

          } catch (error) {
              console.error("Failed to fetch image URLs:", error);
        
              setImageUrls({}); 
          }
      };

      if(fileUploaded){
        fetchImageUrls();
      }


  }, [fileUploaded]);

  if (!fileUploaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Database className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Data Available</h2>
        <p className="text-gray-500 mb-6">Please upload an Excel file to view dashboard insights</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return "₹0.00";
    }
    return `₹${Number(value).toFixed(2)}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Visualize your transaction data</p>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Transaction Visualizations</h2>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveVisualization('withdrawalAmount')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeVisualization === 'withdrawalAmount'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Withdrawal Amount
          </button>

          <button
            onClick={() => setActiveVisualization('topRecipients')} 
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeVisualization === 'topRecipients'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Top Recipients
          </button>

          <button
            onClick={() => setActiveVisualization('paymentMethods')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeVisualization === 'paymentMethods'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Payment Methods
          </button>
        </div>

        <div className="h-[400px] flex items-center justify-center">
          {activeVisualization === 'paymentMethods' && imageUrls.paymentMethods && (
              <img src={imageUrls.paymentMethods} alt="Payment Methods" className="max-h-full max-w-full" />
          )}
          {activeVisualization === 'withdrawalAmount' && imageUrls.withdrawalAmount && (
              <img src={imageUrls.withdrawalAmount} alt="Withdrawal Amount" className="max-h-full max-w-full" />
          )}
          {activeVisualization === 'topRecipients' && imageUrls.topRecipients && ( 
              <img src={imageUrls.topRecipients} alt="Top Recipients" className="max-h-full max-w-full" /> 
          )}
          {/* Display a message if the image URL is not available */}
          {!imageUrls.paymentMethods && activeVisualization === 'paymentMethods' && <p>Image not available.</p>}
          {!imageUrls.withdrawalAmount && activeVisualization === 'withdrawalAmount' && <p>Image not available.</p>}
          {!imageUrls.topRecipients && activeVisualization === 'topRecipients' && <p>Image not available.</p>} 

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

