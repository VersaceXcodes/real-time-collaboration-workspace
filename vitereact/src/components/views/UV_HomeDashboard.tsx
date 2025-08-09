import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

// Define types for activities and statistics
interface Activity {
  activity_type: string;
  content: string;
}

interface WorkspaceStatistics {
  total_channels: number;
  total_members: number;
}

const fetchRecentActivities = async (workspace_id: string, auth_token: string) => {
  try {
    const { data } = await axios.get<Activity[]>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/workspaces/${workspace_id}/activities`,
      {
        headers: { Authorization: `Bearer ${auth_token}` },
        timeout: 10000,
      }
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    throw error;
  }
};

const fetchWorkspaceStatistics = async (workspace_id: string, auth_token: string) => {
  try {
    const { data } = await axios.get<WorkspaceStatistics>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/workspaces/${workspace_id}/statistics`,
      {
        headers: { Authorization: `Bearer ${auth_token}` },
        timeout: 10000,
      }
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    throw error;
  }
};

const UV_HomeDashboard: React.FC = () => {
  // Accesses from Zustand store
  const selectedWorkspaceId = useAppStore((state) => state.workspace_state.selected_workspace_id);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);

  const {
    data: activities = [],
    isLoading: loadingActivities,
    isError: errorActivities,
  } = useQuery({
    queryKey: ['recentActivities', selectedWorkspaceId],
    queryFn: () => fetchRecentActivities(selectedWorkspaceId!, authToken!),
    enabled: !!selectedWorkspaceId && !!authToken
  });

  const {
    data: statistics = { total_channels: 0, total_members: 0 },
    isLoading: loadingStats,
    isError: errorStats,
  } = useQuery({
    queryKey: ['workspaceStatistics', selectedWorkspaceId],
    queryFn: () => fetchWorkspaceStatistics(selectedWorkspaceId!, authToken!),
    enabled: !!selectedWorkspaceId && !!authToken
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Home Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link 
              to="/kanban" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
              aria-label="View Kanban Board"
            >
              View Kanban
            </Link>
            <Link 
              to="/calendar" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center"
              aria-label="View Calendar"
            >
              Calendar
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Recent Activities</h2>
            {loadingActivities ? (
              <div className="flex items-center justify-center py-8" role="status" aria-label="Loading activities">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading activities...</span>
              </div>
            ) : errorActivities ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200" role="alert">
                <p>Error loading activities. Please try refreshing the page.</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p>No recent activities to display.</p>
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {(activities as Activity[]).map((activity, idx) => (
                  <li key={idx} className="border-b border-gray-100 py-3 last:border-b-0" role="listitem">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-blue-600">{activity.activity_type}</span>
                      <span className="text-gray-600">{activity.content}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Workspace Statistics</h2>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8" role="status" aria-label="Loading statistics">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading statistics...</span>
              </div>
            ) : errorStats ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200" role="alert">
                <p>Error loading statistics. Please try refreshing the page.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <span className="text-gray-700 font-medium">Total Channels</span>
                  <span className="text-2xl font-bold text-blue-600">{(statistics as WorkspaceStatistics).total_channels}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-gray-700 font-medium">Total Members</span>
                  <span className="text-2xl font-bold text-green-600">{(statistics as WorkspaceStatistics).total_members}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_HomeDashboard;