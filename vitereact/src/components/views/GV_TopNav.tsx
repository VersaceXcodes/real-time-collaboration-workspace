import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';

const GV_TopNav: React.FC = () => {
  // Zustand state selectors
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const current_user = useAppStore(state => state.authentication_state.current_user);
  const theme = useAppStore(state => state.theme_state.theme);
  const switch_theme = useAppStore(state => state.switch_theme);
  const logout_user = useAppStore(state => state.logout_user);

  // Local state
  const [search_query, setSearchQuery] = useState('');
  const notification_count = useQuery({
    queryKey: ['notificationsCount'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/notifications/count`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`
          }
        }
      );
      return response.data.unread_count;
    },
    enabled: !!auth_token, // Only fetch if token exists
    refetchInterval: 60000 // Refetch every minute
  });

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-600 font-bold text-xl">
            CollabSync
          </Link>
          <div className="relative">
            <input
              type="text"
              value={search_query}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="border rounded pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-blue-500"
            />
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative focus:outline-none" aria-label="Notifications">
            <FaBell className="text-gray-500" />
            {!notification_count.isLoading && notification_count.data && notification_count.data > 0 && (
              <span aria-live="polite" className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {notification_count.data}
              </span>
            )}
          </button>
          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none" aria-label="User Menu">
              <FaUserCircle className="text-gray-500" />
              <span>{current_user?.name}</span>
            </button>
            <div className="dropdown-content absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <button
                onClick={switch_theme}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Switch to {theme === 'light' ? 'dark' : 'light'} mode
              </button>
              <button
                onClick={logout_user}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_TopNav;