import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Import views
import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_SideNav from '@/components/views/GV_SideNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';
import GV_NotificationPanel from '@/components/views/GV_NotificationPanel.tsx';
import UV_HomeDashboard from '@/components/views/UV_HomeDashboard.tsx';
import UV_WorkspaceCreation from '@/components/views/UV_WorkspaceCreation.tsx';
import UV_ChannelView from '@/components/views/UV_ChannelView.tsx';
import UV_DirectMessage from '@/components/views/UV_DirectMessage.tsx';
import UV_KanbanBoard from '@/components/views/UV_KanbanBoard.tsx';
import UV_TaskDetailView from '@/components/views/UV_TaskDetailView.tsx';
import UV_DocumentEditor from '@/components/views/UV_DocumentEditor.tsx';
import UV_Calendar from '@/components/views/UV_Calendar.tsx';
import UV_UserSettings from '@/components/views/UV_UserSettings.tsx';
// Mocked Login component as placeholder
const UV_Login: React.FC = () => <div>Login Page</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore(state => state.initialize_auth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          <GV_TopNav />
          <GV_SideNav />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<UV_Login />} />

              <Route path="/" element={<ProtectedRoute><UV_HomeDashboard /></ProtectedRoute>} />
              <Route path="/workspace/create" element={<ProtectedRoute><UV_WorkspaceCreation /></ProtectedRoute>} />
              <Route path="/channel/:channel_id" element={<ProtectedRoute><UV_ChannelView /></ProtectedRoute>} />
              <Route path="/direct-message/:user_id" element={<ProtectedRoute><UV_DirectMessage /></ProtectedRoute>} />
              <Route path="/kanban/:board_id" element={<ProtectedRoute><UV_KanbanBoard /></ProtectedRoute>} />
              <Route path="/task/:task_id" element={<ProtectedRoute><UV_TaskDetailView /></ProtectedRoute>} />
              <Route path="/document/:document_id" element={<ProtectedRoute><UV_DocumentEditor /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><UV_Calendar /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><UV_UserSettings /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <GV_NotificationPanel />
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;