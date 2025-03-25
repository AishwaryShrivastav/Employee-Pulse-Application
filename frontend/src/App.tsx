import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SurveyManagementPage } from './pages/SurveyManagementPage';
import { SurveyView } from './pages/SurveyView';
import { ResponseHistoryPage } from './pages/ResponseHistoryPage';
import { PrivateRoute } from './components/PrivateRoute';
import { Box } from '@mui/material';
import { SurveyResponsesPage } from './pages/SurveyResponsesPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={['admin']}>
                    <AdminDashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/survey-management"
                element={
                  <PrivateRoute roles={['admin']}>
                    <SurveyManagementPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/surveys/:id"
                element={
                  <PrivateRoute>
                    <SurveyView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/surveys/:id/responses"
                element={
                  <PrivateRoute roles={['admin']}>
                    <SurveyResponsesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/response-history"
                element={
                  <PrivateRoute>
                    <ResponseHistoryPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
};
