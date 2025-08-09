import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { notificationSchema } from '@/types';
import api from '@/lib/api';

const GV_NotificationPanel: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading, isError, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
    enabled: !!authToken
  });

  // Mutation to mark a notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: (notification_id: string) => {
      return api.patch(`/notifications/${notification_id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
    }
  });

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