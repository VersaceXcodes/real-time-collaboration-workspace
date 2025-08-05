import React from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { Notification } from '@schema';
import { notificationSchema } from '@schema'; // Ensure Zod schemas are imported correctly
import z from 'zod'; // Ensure Zod is imported

const GV_NotificationPanel: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading, isError, error } = useQuery<Notification[], Error>(
    ['notifications'],
    async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/notifications`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return notificationSchema.array().parse(response.data);
    }
  );

  // Mutation to mark a notification as read
  const { mutate: markAsRead } = useMutation(
    (notification_id: string) => {
      return axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/notifications/${notification_id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  return (
    <>
      <div aria-live="polite" className="bg-white shadow-md rounded p-4 max-w-md mx-auto mt-10">
        <h2 className="text-lg font-bold mb-4">Notifications</h2>
        
        {isLoading && <p>Loading notifications...</p>}
        {isError && <p className="text-red-500">Error loading notifications: {error?.message}</p>}

        <ul>
          {notifications?.map(notification => (
            <li key={notification.notification_id} className={`p-2 ${!notification.is_read ? 'font-bold bg-yellow-50' : ''}`}>
              <div className="flex justify-between items-center">
                <span>{notification.content}</span>
                <button
                  className="ml-2 text-blue-500 hover:underline"
                  onClick={() => markAsRead(notification.notification_id)}
                  aria-label="Mark as read"
                >
                  Mark as read
                </button>
              </div>
              <span className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default GV_NotificationPanel;