import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Message } from '@schema';

// Component for displaying and interacting within a channel
const UV_ChannelView: React.FC = () => {
  // From URL Params
  const { channel_id } = useParams<{ channel_id: string }>();

  // Global App State
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const socket = useAppStore(state => state.socket);

  // Local State
  const [newMessage, setNewMessage] = useState('');

  // Fetch Messages
  const { data: messages, refetch } = useQuery<Message[], Error>(
    ['channelMessages', channel_id],
    async () => {
      const response = await axios.get<Message[]>(`$\{import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/channels/${channel_id}/messages`, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      return response.data;
    },
    {
      enabled: Boolean(channel_id && auth_token),
    }
  );

  // Send Message Mutation
  const sendMessage = useMutation(
    async (messageContent: string) => {
      return axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        }/channels/${channel_id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
    },
    {
      onSuccess: () => {
        setNewMessage('');
        refetch();
        if (socket && channel_id) {
          socket.emit('channelMessageCreated', {
            channel_id,
            content: newMessage, // Ensure consistency with submitted message
          });
        }
      },
      onError: (error) => {
        console.error('Error sending message:', error);
      },
    }
  );

  // Socket Message Handling
  useEffect(() => {
    if (socket && channel_id) {
      // Connect to channel messages
      socket.on(`channel/${channel_id}/messages`, () => {
        refetch();
      });
    }

    return () => {
      if (socket && channel_id) {
        socket.off(`channel/${channel_id}/messages`);
      }
    };
  }, [socket, channel_id, refetch]);

  // Submit Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Channel Header */}
        <div className="bg-blue-600 text-white p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Channel: {channel_id}</h2>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {messages?.map(msg => (
            <div key={msg.message_id} className="mb-2">
              <p>
                <strong>User {msg.user_id}:</strong> {msg.content}
              </p>
              <span className="text-xs text-gray-500">{new Date(msg.sent_at).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* New Message Entry */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center bg-white border-t p-4"
        >
          <input
            type="text"
            aria-label="New message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded p-2 mr-2 outline-none"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={sendMessage.isLoading || !newMessage}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default UV_ChannelView;