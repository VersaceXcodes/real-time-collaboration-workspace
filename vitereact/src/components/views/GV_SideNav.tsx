import React, { useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace, Channel } from '@schema'; // Importing types from shared schemas

const GV_SideNav: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Zustand store access
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const selected_workspace_id = useAppStore(state => state.workspace_state.selected_workspace_id);
  const workspaces = useAppStore(state => state.workspace_state.workspaces);
  const channels = useAppStore(state => state.channel_state.channels);
  const join_workspace = useAppStore(state => state.join_workspace);

  // Switch Workspace Mutation
  const switchWorkspaceMutation = useMutation({
    mutationFn: (workspace_id: string) => axios.patch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/workspaces/${workspace_id}/switch`,
      null,
      { headers: { Authorization: `Bearer ${auth_token}` } }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] }); // Invalidate channels query to refresh
    },
    onError: (error) => {
      console.error('Error switching workspace:', error);
    }
  });

  const fetchChannels = () => {
    console.warn('MISSING ENDPOINT: Fetch channels per workspace');
    return [];
  };

  useEffect(() => {
    if (selected_workspace_id) {
      fetchChannels();
    }
  }, [selected_workspace_id]);

  // Component rendering
  return (
    <>
      <nav className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white">
        <div className="mt-5 px-4">
          <h1 className="text-lg font-bold">Workspaces</h1>
          <ul className="mt-3 space-y-2">
            {workspaces.map((workspace: Workspace) => (
              <li key={workspace.workspace_id}>
                <button
                  className={`text-left w-full px-2 py-1 rounded ${
                    selected_workspace_id === workspace.workspace_id ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    join_workspace(workspace.workspace_id);
                    switchWorkspaceMutation.mutate(workspace.workspace_id);
                  }}
                >
                  {workspace.name}
                </button>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-lg font-semibold">Channels</h2>
          <ul className="mt-2 space-y-2">
            {channels.map((channel: Channel) => (
              <li key={channel.channel_id}>
                <Link
                  to={`/channel/${channel.channel_id}`}
                  className="block px-2 py-1 rounded hover:bg-gray-700"
                >
                  {channel.name}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-lg font-semibold">Direct Messages</h2>
          <ul className="mt-2 space-y-2">
          </ul>

          <h2 className="mt-6 text-lg font-semibold">Task Management</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <Link to="/kanban/default" className="block px-2 py-1 rounded hover:bg-gray-700">
                Kanban Board
              </Link>
            </li>
            <li>
              <Link to="/tasks" className="block px-2 py-1 rounded hover:bg-gray-700">
                All Tasks
              </Link>
            </li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">Utilities</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <Link to="/calendar" className="block px-2 py-1 rounded hover:bg-gray-700">
                Calendar
              </Link>
            </li>
            <li>
              <Link to="/files" className="block px-2 py-1 rounded hover:bg-gray-700">
                Files
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default GV_SideNav;