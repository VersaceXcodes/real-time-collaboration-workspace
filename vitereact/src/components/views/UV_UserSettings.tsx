import React, { useState } from 'react';
import { useAppStore } from '@/store/main';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User, updateUserInputSchema } from '@schema';
import { z } from 'zod';

const fetchUserSettings = async (user_id: string, authToken: string): Promise<User> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/${user_id}/settings`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return data;
};

const updateUserSettings = async (user_id: string, authToken: string, settings: Partial<User>) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/${user_id}/settings`,
    settings,
    {
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    }
  );
  return data;
};

const UV_UserSettings: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const theme = useAppStore(state => state.theme_state.theme);
  const switchTheme = useAppStore(state => state.switch_theme);
  const updateProfile = useAppStore(state => state.update_user_profile);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [feedback, setFeedback] = useState('');

  const { isLoading } = useQuery(
    ['userSettings', currentUser?.id],
    () => fetchUserSettings(currentUser!.id, authToken!),
    { enabled: !!currentUser }
  );

  const mutation = useMutation(
    (settings) => updateUserSettings(currentUser!.id, authToken!, settings),
    {
      onSuccess: (data) => {
        updateProfile(data);
        setFeedback('Settings updated successfully');
      },
      onError: (error) => {
        setFeedback(`Error: ${(error as Error).message}`);
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    try {
      const validatedData = updateUserInputSchema.parse({ name, email });
      mutation.mutate(validatedData);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setFeedback('Validation Error: ' + err.errors.map(e => e.message).join(', '));
      } else {
        setFeedback('Unexpected error occurred');
      }
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">User Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

          {feedback && (
            <div aria-live="polite" className="text-sm text-blue-600">{feedback}</div>
          )}

          <div className="flex flex-col">
            <label htmlFor="theme" className="mb-1 font-medium text-gray-700">Theme Preference</label>
            <button
              type="button"
              onClick={switchTheme}
              className="py-2 bg-gray-200 rounded shadow"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>

          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setFeedback('');
                setName(e.target.value);
              }}
              className="border rounded p-2 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setFeedback('');
                setEmail(e.target.value);
              }}
              className="border rounded p-2 focus:outline-none focus:ring"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 text-white Rounded shadow"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
};

export default UV_UserSettings;