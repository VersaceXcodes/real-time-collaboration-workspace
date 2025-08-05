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
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Home Dashboard</h1>
          <div className="space-x-4">
            <Link to="/kanban" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              View Kanban
            </Link>
            <Link to="/calendar" className="bg-green-600 text-white px-4 py-2 rounded-md">
              Calendar
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-md shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            {loadingActivities ? (
              <p>Loading activities...</p>
            ) : errorActivities ? (
              <p className="text-red-600">Error loading activities.</p>
            ) : (
              <ul className="space-y-3">
                {(activities as Activity[]).map((activity, idx) => (
                  <li key={idx} className="border-b py-2">
                    <strong>{activity.activity_type}</strong>: {activity.content}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded-md shadow">
            <h2 className="text-xl font-semibold mb-4">Workspace Statistics</h2>
            {loadingStats ? (
              <p>Loading statistics...</p>
            ) : errorStats ? (
              <p className="text-red-600">Error loading statistics.</p>
            ) : (
              <div>
                <p>Total Channels: {(statistics as WorkspaceStatistics).total_channels}</p>
                <p>Total Members: {(statistics as WorkspaceStatistics).total_members}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_HomeDashboard;