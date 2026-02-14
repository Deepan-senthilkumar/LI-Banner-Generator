import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

import Navbar from './components/layout/Navbar';
import DashboardLayout from './features/dashboard/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import AppTracker from './components/common/AppTracker';

const Home = lazy(() => import('./pages/landing/Home'));
const Login = lazy(() => import('./features/auth/Login'));
const Signup = lazy(() => import('./features/auth/Signup'));
const MyDesigns = lazy(() => import('./pages/app/MyDesigns'));
const TemplateLibrary = lazy(() => import('./pages/app/TemplateLibrary'));
const BrandKit = lazy(() => import('./pages/app/BrandKit'));
const Pricing = lazy(() => import('./pages/app/Pricing'));
const Team = lazy(() => import('./pages/app/Team'));
const SharedProjects = lazy(() => import('./pages/app/SharedProjects'));
const ToolsHub = lazy(() => import('./pages/app/ToolsHub'));
const ToolWorkspace = lazy(() => import('./pages/app/ToolWorkspace'));
const Settings = lazy(() => import('./pages/app/Settings'));
const BannerEditor = lazy(() => import('./features/editor/BannerEditor'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminTemplates = lazy(() => import('./pages/admin/Templates'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminModeration = lazy(() => import('./pages/admin/Moderation'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Loader2 className="animate-spin text-blue-500" size={40} />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">
        <Suspense fallback={<PageLoader />}>
          <AppTracker />
          <Routes>
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/privacy" element={<><Navbar /><PrivacyPolicy /></>} />
            <Route path="/terms" element={<><Navbar /><TermsOfService /></>} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/designs" replace />} />
              <Route path="designs" element={<MyDesigns />} />
              <Route path="templates" element={<TemplateLibrary />} />
              <Route path="brand-kit" element={<BrandKit />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="team" element={<Team />} />
              <Route path="shared" element={<SharedProjects />} />
              <Route path="tools" element={<ToolsHub />} />
              <Route path="tools/:toolId" element={<ToolWorkspace />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route
              path="/app/editor/new"
              element={
                <ProtectedRoute>
                  <BannerEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/editor/:projectId"
              element={
                <ProtectedRoute>
                  <BannerEditor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="templates" element={<AdminTemplates />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app/designs" replace />} />
            <Route path="/create" element={<Navigate to="/app/editor/new" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
