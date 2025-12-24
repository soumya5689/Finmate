import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Check, AlertCircle, FileText } from 'lucide-react';
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
  const [uploadStatus, setUploadStatus] =
    useState<'ready' | 'uploading' | 'success' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ✅ ADDED: prevent double upload in React StrictMode
  const uploadOnceRef = useRef(false);

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
      uploadOnceRef.current = false; // ✅ reset when new file is selected
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

    // ✅ GUARD: prevents double execution
    if (uploadOnceRef.current) return;
    uploadOnceRef.current = true;

    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data: UploadResponse = await response.json();
      if (data.status === 'success') {
        const mockTransactions: Transaction[] = Array.from(
          { length: data.rows || 0 },
          (_, index) => ({
            id: index + 1,
            date: new Date().toISOString().split('T')[0],
            amount: Math.random() * 1000,
            paymentMethod: 'Unknown',
            recipient: 'Unknown',
            remarks: 'Processed from upload',
          })
        );

        setTransactions(mockTransactions);
        calculateSummary();
        setUploadStatus('success');

        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        uploadOnceRef.current = false; // ✅ reset on failure
        setUploadStatus('error');
        setErrorMessage(data.error || 'Upload failed');
      }
    } catch (error: any) {
      uploadOnceRef.current = false; // ✅ reset on error
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-gray-300 mt-2">
          Upload your expense data to generate insights automatically
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatusCard
          label="Upload Status"
          value={
            uploadStatus === 'success'
              ? 'Success'
              : uploadStatus === 'uploading'
              ? 'Uploading'
              : uploadStatus === 'error'
              ? 'Error'
              : 'Ready'
          }
          status={uploadStatus}
        />
        <StatusCard label="File Name" value={file ? file.name : 'No file'} />
        <StatusCard label="File Size" value={fileSize} />
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl p-12 text-center cursor-pointer
          border-2 border-dashed transition-all duration-300
          bg-white/5 backdrop-blur-xl border-white/10
          ${
            isDragActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'hover:border-indigo-400 hover:bg-indigo-500/5'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-5">
          <div className="h-20 w-20 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400">
            <UploadCloud className="h-10 w-10" />
          </div>

          <div>
            <p className="text-xl font-semibold">
              {isDragActive ? 'Drop the Excel file here' : 'Drag & drop your Excel file'}
            </p>
            <p className="text-gray-400 mt-1">
              or click to browse from your device
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileText className="h-4 w-4" />
            <span>.xlsx or .xls · Bank statement format</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {uploadStatus === 'error' && (
        <div className="mt-6 rounded-xl bg-red-500/10 text-red-400 p-4 flex items-center gap-3">
          <AlertCircle />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-6 rounded-xl bg-green-500/10 text-green-400 p-4 flex items-center gap-3">
          <Check />
          <span>File uploaded successfully! Redirecting…</span>
        </div>
      )}

      {/* Action */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={processFile}
          disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
          className="
            px-8 py-3 rounded-xl font-semibold text-white
            bg-indigo-600 hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-lg shadow-indigo-600/30
          "
        >
          Process File
        </button>
      </div>
    </div>
  );
};

export default Upload;

/* ---------- UI Components ---------- */

function StatusCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: 'ready' | 'uploading' | 'success' | 'error';
}) {
  const color =
    status === 'success'
      ? 'text-green-400'
      : status === 'error'
      ? 'text-red-400'
      : status === 'uploading'
      ? 'text-indigo-400'
      : 'text-white';

  return (
    <div
      className="
        rounded-2xl p-6
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-lg shadow-black/30
      "
    >
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {status === 'uploading' ? 'Uploading…' : value}
      </p>
    </div>
  );
}
