// ============================================================
// VITASYNC — Main Application
// Metropolitan Hospital Nurse Scheduling System
// ============================================================

import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { DashboardPage, WardsPage } from './pages/manager/DashboardAndWards';
import { NursesPage, ConstraintsPage } from './pages/manager/NursesAndConstraints';
import { GenerateRosterPage, RostersPage } from './pages/manager/SchedulingPage';
import { SwapRequestsPage, ReportsPage } from './pages/manager/ManagementPage';
import { MySchedulePage, LeavePage, SwapPage } from './pages/nurse/NursePortal';
import { AdminUsersPage, AdminSettingsPage } from './pages/admin/AdminPage';
import type { UserRole } from './types';

function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'manager':
      return '/dashboard';
    case 'nurse':
      return '/my-schedule';
    case 'admin':
      return '/admin/users';
    default:
      return '/login';
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center text-white">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl font-bold border border-white/10">
          VS
        </div>
        <div className="animate-spin-slow text-3xl mb-3">⚙️</div>
        <p className="text-sm text-primary-200">Loading VitaSync workspace...</p>
      </div>
    </div>
  );
}

function RoleHomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return <Navigate to={homePathForRole(user.role)} replace />;
}

function PublicLoginRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <LoginPage />;
}

function ProtectedScreen({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicLoginRoute />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <DashboardPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/wards"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <WardsPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/nurses"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <NursesPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/constraints"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <ConstraintsPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <GenerateRosterPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/rosters"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <RostersPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/swap-requests"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <SwapRequestsPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedScreen allowedRoles={['manager']}>
                <ReportsPage />
              </ProtectedScreen>
            }
          />

          <Route
            path="/my-schedule"
            element={
              <ProtectedScreen allowedRoles={['nurse']}>
                <MySchedulePage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/leave"
            element={
              <ProtectedScreen allowedRoles={['nurse']}>
                <LeavePage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/swap"
            element={
              <ProtectedScreen allowedRoles={['nurse']}>
                <SwapPage />
              </ProtectedScreen>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedScreen allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedScreen>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedScreen allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedScreen>
            }
          />

          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="*" element={<RoleHomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
