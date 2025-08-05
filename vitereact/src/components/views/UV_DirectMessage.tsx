import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Message {
  message_id: string;
  user_id: string;
  content: string;
  sent_at: string;
}

const UV_DirectMessage: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const [newMessage, setNewMessage] = useState('');

  const authToken = useAppStore(
    (state) => state.authentication_state.auth_token
  );
  const currentUser = useAppStore(
    (state) => state.authentication_state.current_user
  );

  const queryClient = useQueryClient();

  const fetchMessages = async (): Promise<Message[]> => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/${user_id}/messages`,
      { 
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    return data;
  }

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['directMessages', user_id],
    queryFn: fetchMessages
  });

  const sendMessageMutation = useMutation({
    mutationFn: (newMessageData: { user_id: string; content: string }) =>
      axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users/${newMessageData.user_id}/messages`,
        { content: newMessageData.content },
        { headers: { Authorization: `Bearer ${authToken}` } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directMessages', user_id] });
      setNewMessage('');
    },
  });

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (newMessage.trim() !== '') {
      sendMessageMutation.mutate({ user_id: user_id!, content: newMessage });
    }
  };

  return (
    <>
      <div className="min-h-screen p-4 bg-white flex flex-col">
        <div className="text-lg font-bold mb-2">Chat with User ID: {user_id}</div>
        
        <div className="flex-1 overflow-auto p-2">
          {isLoading ? (
            <div>Loading messages...</div>
          ) : error ? (
            <div className="bg-red-200 text-red-800 p-2 rounded-md">
              Error loading messages.
            </div>
          ) : (
            <ul className="space-y-2">
              {messages?.map((msg) => (
                <li key={msg.message_id} className="border p-2 rounded">
                  <span className="font-semibold">{currentUser?.name}:</span> {msg.content}
                  <span className="float-right text-xs text-gray-500">{new Date(msg.sent_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-2 flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border rounded p-2"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2"
            disabled={sendMessageMutation.isPending}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default UV_DirectMessage;
