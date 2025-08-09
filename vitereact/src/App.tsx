import React, { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';

// Import critical views directly
import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_SideNav from '@/components/views/GV_SideNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';
import GV_NotificationPanel from '@/components/views/GV_NotificationPanel.tsx';
import UV_Login from '@/components/views/UV_Login.tsx';

// Lazy load non-critical views
const UV_HomeDashboard = lazy(() => import('@/components/views/UV_HomeDashboard.tsx'));
const UV_WorkspaceCreation = lazy(() => import('@/components/views/UV_WorkspaceCreation.tsx'));
const UV_ChannelView = lazy(() => import('@/components/views/UV_ChannelView.tsx'));
const UV_DirectMessage = lazy(() => import('@/components/views/UV_DirectMessage.tsx'));
const UV_KanbanBoard = lazy(() => import('@/components/views/UV_KanbanBoard.tsx'));
const UV_TaskDetailView = lazy(() => import('@/components/views/UV_TaskDetailView.tsx'));
const UV_DocumentEditor = lazy(() => import('@/components/views/UV_DocumentEditor.tsx'));
const UV_Calendar = lazy(() => import('@/components/views/UV_Calendar.tsx'));
const UV_UserSettings = lazy(() => import('@/components/views/UV_UserSettings.tsx'));
const UV_Files = lazy(() => import('@/components/views/UV_Files.tsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});



const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const LoginRoute: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <UV_Login />;
};

const App: React.FC = () => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const initializeAuth = useAppStore(state => state.initialize_auth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          {isAuthenticated && <GV_TopNav />}
          {isAuthenticated && <GV_SideNav />}
          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
              <Routes>
                <Route path="/login" element={<LoginRoute />} />

                <Route path="/" element={<ProtectedRoute><UV_HomeDashboard /></ProtectedRoute>} />
                <Route path="/workspace/create" element={<ProtectedRoute><UV_WorkspaceCreation /></ProtectedRoute>} />
                <Route path="/channel/:channel_id" element={<ProtectedRoute><UV_ChannelView /></ProtectedRoute>} />
                <Route path="/direct-message/:user_id" element={<ProtectedRoute><UV_DirectMessage /></ProtectedRoute>} />
                <Route path="/kanban/:board_id" element={<ProtectedRoute><UV_KanbanBoard /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><UV_KanbanBoard /></ProtectedRoute>} />
                <Route path="/task/:task_id" element={<ProtectedRoute><UV_TaskDetailView /></ProtectedRoute>} />
                <Route path="/document/:document_id" element={<ProtectedRoute><UV_DocumentEditor /></ProtectedRoute>} />
                <Route path="/files" element={<ProtectedRoute><UV_Files /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><UV_Calendar /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><UV_UserSettings /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          {isAuthenticated && <GV_NotificationPanel />}
          {isAuthenticated && <GV_Footer />}
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;