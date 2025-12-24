import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from "./pages/LandingPage";
import { ExpenseProvider } from './contexts/ExpenseContext';

import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import FinalOutput from './pages/FinalOutput';
import ExpenseInsights from './pages/ExpenseInsights'; // ✅ NEW
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <ExpenseProvider>
      <Router>
        <Routes>

          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* App Pages */}
          <Route element={<MainLayout />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/final-output" element={<FinalOutput />} />
            <Route path="/insights" element={<ExpenseInsights />} /> {/* ✅ NEW */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ExpenseProvider>
  );
}

export default App;
