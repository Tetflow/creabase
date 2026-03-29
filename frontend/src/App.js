import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPageEnhanced from './pages/LandingPageEnhanced';
import AuthCallback from './pages/AuthCallback';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './pages/Dashboard';
import BusinessSettings from './pages/BusinessSettings';
import CreatorProfile from './pages/CreatorProfile';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionPage from './pages/SubscriptionPage';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminWalletManagement from './pages/AdminWalletManagement';
import AdminFeeConfiguration from './pages/AdminFeeConfiguration';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDisputesPage from './pages/AdminDisputesPage';
import AdminPayoutsPage from './pages/AdminPayoutsPage';
import AdminPayouts from './pages/AdminPayouts';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import CreatorInvoicesPage from './pages/CreatorInvoicesPage';
import BusinessInvoicesPage from './pages/BusinessInvoicesPage';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorAnalyticsPage from './pages/CreatorAnalyticsPage';
import VerificationPage from './pages/VerificationPage';
import ProjectsPage from './pages/ProjectsPage';
import CreatorProjectsPage from './pages/CreatorProjectsPage';
import DisputesPage from './pages/DisputesPage';
import InvoicePage from './pages/InvoicePage';
import ChatPage from './pages/ChatPage';
import ChatListPage from './pages/ChatListPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import OrderManagement from './pages/OrderManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <>
      <Header />
      <Routes>
      <Route path="/" element={<LandingPageEnhanced />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/pricing" element={<SubscriptionPlans />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/creator/:id" element={<CreatorProfile />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/verify" element={<VerificationPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/settings"
        element={
          <ProtectedRoute>
            <BusinessSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator-projects"
        element={
          <ProtectedRoute>
            <CreatorProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:projectId"
        element={
          <ProtectedRoute>
            <InvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes"
        element={
          <ProtectedRoute>
            <DisputesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wallets"
        element={
          <ProtectedRoute>
            <AdminWalletManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminFeeConfiguration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <ProtectedRoute>
            <AdminDisputesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payouts"
        element={
          <ProtectedRoute>
            <AdminPayoutsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payouts-new"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPayouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute>
            <AdminInvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator-invoices"
        element={
          <ProtectedRoute>
            <CreatorInvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-invoices"
        element={
          <ProtectedRoute>
            <BusinessInvoicesPage />
          </ProtectedRoute>
        }
      />


      <Route
        path="/creator-dashboard"
        element={
          <ProtectedRoute>
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator-analytics"
        element={
          <ProtectedRoute>
            <CreatorAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;