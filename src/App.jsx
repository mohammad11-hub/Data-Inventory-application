import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import AllData from "./AllData";
import AmazonSales from "./amazonSales";
import FlipkartMergedData from "./FlipkartMergedData";
import FileConverter from "./fileConverter/FileConverter";

import FlipkartSales from "./pages/FlipkartSales";
import MergedSales from "./pages/MergedSales";
import Reports from "./pages/Reports";
import BackupRestore from "./pages/BackupRestore";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1890ff",
      borderRadius: 6,
    },
  };

  return (
      <ConfigProvider theme={themeConfig}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-data"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AllData />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/amazon-sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AmazonSales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flipkart-sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FlipkartSales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/merged-sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MergedSales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/file-import"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FileConverter />
          </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/backup-restore"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <BackupRestore />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      </ConfigProvider>
  );
};

export default App;
