import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';
import api from '@/lib/api';

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
      const response = await api.get('/notifications/count');
      return response.data.unread_count;
    },
    enabled: !!auth_token, // Only fetch if token exists
    refetchInterval: 60000 // Refetch every minute
  });

  return (
    <>
      <div className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Link to="/" className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1">
            CollabSync
          </Link>
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search_query}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Search"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
          <button 
            className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2 hover:bg-gray-100 transition-colors" 
            aria-label="Notifications"
          >
            <FaBell className="text-gray-500 w-5 h-5" />
            {!notification_count.isLoading && notification_count.data && notification_count.data > 0 && (
              <span aria-live="polite" className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium">
                {notification_count.data > 99 ? '99+' : notification_count.data}
              </span>
            )}
          </button>
          <button
            onClick={logout_user}
            className="hidden sm:block px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Logout"
          >
            Logout
          </button>
          <div className="relative group">
            <button 
              className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 px-3 py-2 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              aria-label="User Menu"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <FaUserCircle className="text-gray-500 w-5 h-5" />
              <span className="hidden sm:inline text-gray-700 font-medium">{current_user?.name}</span>
            </button>
            <div className="dropdown-content absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" role="menu">
              <button
                onClick={switch_theme}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                Switch to {theme === 'light' ? 'dark' : 'light'} mode
              </button>
              <button
                onClick={logout_user}
                className="block px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left font-medium transition-colors focus:outline-none focus:bg-red-50"
                role="menuitem"
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