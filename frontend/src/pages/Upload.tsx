import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExpense, Transaction } from '../contexts/ExpenseContext';

interface UploadResponse {
  status?: string;
  rows?: number;
  message?: string;
  error?: string;
}

const Upload: React.FC = () => {
  const { setTransactions, calculateSummary } = useExpense();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<string>('0 KB');
  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'success' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setUploadStatus('error');
        setErrorMessage('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setFileSize(formatFileSize(selectedFile.size));
      setUploadStatus('ready');
      setErrorMessage('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', { // Default FastAPI port is 8000
        method: 'POST',
        body: formData,
      });

      if (!response.ok) { // Check for HTTP errors first
        let errorText = `File upload failed with status: ${response.status}`;
        try {
          const errorData = await response.json(); // Attempt to get error message from JSON
          if (errorData.error) {
            errorText += ` - ${errorData.error}`;
          }
        } catch (jsonError) {
          // If JSON parsing fails, just use the status text
        }
        throw new Error(errorText); // Throw an error to be caught
      }

      const data: UploadResponse = await response.json();
      if (data.status === 'success') {
        // Use data.rows and data.message if needed
        const mockTransactions: Transaction[] = Array.from({ length: data.rows || 0 }, (_, index) => ({
          id: index + 1,
          date: new Date().toISOString().split('T')[0],
          amount: Math.random() * 1000,
          paymentMethod: 'Unknown',
          recipient: 'Unknown',
          remarks: 'Processed from upload',
        }));

        setTransactions(mockTransactions);
        calculateSummary();
        setUploadStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else if (data.error) {
        setUploadStatus('error');
        setErrorMessage(data.error);
      } else {
        setUploadStatus('error');
        setErrorMessage('File upload failed.');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload the file. Please try again.');
    } finally {
      if (uploadStatus !== 'success') {
        setTimeout(() => {
          setUploadStatus('ready');
        }, 3000);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Upload Data</h1>
      <p className="text-gray-600 mb-8">Upload your expense data file to generate insights</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Upload Status</h2>
          <div className="text-2xl font-bold">
            {uploadStatus === 'success' ? (
              <span className="text-green-600">Success</span>
            ) : uploadStatus === 'error' ? (
              <span className="text-red-600">Error</span>
            ) : uploadStatus === 'uploading' ? (
              <span className="text-blue-600 animate-pulse">Uploading...</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">File Name</h2>
          <div className="text-2xl font-bold">{file ? file.name : 'No file'}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">File Size</h2>
          <div className="text-2xl font-bold">{fileSize}</div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <UploadCloud className="h-8 w-8 text-blue-600" />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop Excel file here...' : 'Drag and drop Excel file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              File must contain columns for Amount, Payment Method, and Recipient
            </p>
          </div>
        </div>
      </div>

      {uploadStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>File uploaded and processed successfully! Redirecting to dashboard...</span>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={processFile}
          disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Process File
        </button>
      </div>
    </div>
  );
};

export default Upload;

