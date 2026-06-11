import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StyleProvider } from './context/StyleContext';
import { ToastProvider } from './context/ToastContext';

import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

import {
  AdminDashboard, AdminWorks, AdminUsers, AdminStyles, AdminMessages, AdminSettings, AdminOperationLogs,
  Home, Works, Login, Register, Profile, WorkDetail
} from './pages';

const App = () => {
  return (
    <AuthProvider>
      <StyleProvider>
        <BrowserRouter>
          <ToastProvider>
            <Routes>
              {/* Public Routes with Header/Footer Wrap */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/works" element={<Works />} />
                <Route path="/works/:id" element={<WorkDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Admin Routes with Sidebar Wrap */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="works" element={<AdminWorks />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="styles" element={<AdminStyles />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="logs" element={<AdminOperationLogs />} />
              </Route>

              {/* 404 block */}
              <Route path="*" element={<div className="p-8 text-center text-red-500">Page not found</div>} />
            </Routes>
          </ToastProvider>
        </BrowserRouter>
      </StyleProvider>
    </AuthProvider>
  );
};

export default App;
