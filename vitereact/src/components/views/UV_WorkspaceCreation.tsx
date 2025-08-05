import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { CreateWorkspaceInput } from '@schema'; // Assuming @schema is path to the shared schema

const UV_WorkspaceCreation: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [settings, setSettings] = useState<object>({});
  const [invitees, setInvitees] = useState<{ email: string; role: string }[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const addInvitee = () => {
    if (email && role) {
      setInvitees([...invitees, { email, role }]);
      setEmail('');
      setRole('');
    }
  };

  const createWorkspace = useMutation({
    mutationFn: async (): Promise<void> => {
      const newWorkspace: CreateWorkspaceInput = {
        owner_user_id: currentUser!.id, // Current user ID
        name: workspaceName,
        settings,
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/workspaces`, newWorkspace, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      setWorkspaceName('');
      setSettings({});
      setInvitees([]);
    },
    onError: (error: Error) => {
      console.error('Workspace creation failed:', error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createWorkspace.mutate();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create a New Workspace
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="workspaceName" className="sr-only">
                  Workspace Name
                </label>
                <input
                  id="workspaceName"
                  name="workspaceName"
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Workspace Name"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              {/* Additional settings inputs may be placed here */}
              <div>
                <label htmlFor="inviteEmail" className="sr-only">
                  Invite Member Email
                </label>
                <input
                  id="inviteEmail"
                  name="inviteEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Invite Member Email"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="role" className="sr-only">
                  Role
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role"
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>

              <button
                type="button"
                onClick={addInvitee}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Invitee
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={createWorkspace.isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createWorkspace.isLoading ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
          
          <div>
            {invitees.map((invitee, index) => (
              <div key={index}>
                <p>{invitee.email} - {invitee.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_WorkspaceCreation;