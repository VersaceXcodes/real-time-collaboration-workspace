/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// Define Types
interface User {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
}

interface Workspace {
  workspace_id: string;
  name: string;
  owner_user_id: string;
  settings: { [k: string]: unknown } | null;
}

interface Channel {
  channel_id: string;
  name: string;
  workspace_id: string;
  is_private: boolean;
}

interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

interface AppState {
  authentication_state: AuthenticationState;
  workspace_state: {
    selected_workspace_id: string | null;
    workspaces: Workspace[];
  };
  channel_state: {
    selected_channel_id: string | null;
    channels: Channel[];
  };
  theme_state: {
    theme: 'light' | 'dark';
  };
  socket: Socket | null;

  // Action Methods
  login_user: (email: string, password: string) => Promise<void>;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  logout_user: () => void;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  update_user_profile: (userData: Partial<User>) => void;
  join_workspace: (workspace_id: string) => void;
  switch_theme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial states
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },
      workspace_state: {
        selected_workspace_id: null,
        workspaces: [],
      },
      channel_state: {
        selected_channel_id: null,
        channels: [],
      },
      theme_state: {
        theme: 'light',
      },
      socket: null,

      // Actions
      login_user: async (email: string, password: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/login`,
            { email, password },
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 30000
            }
          );

          const { user, auth_token } = response.data;

          set((_state) => ({
            authentication_state: {
              current_user: user,
              auth_token: auth_token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
            socket: io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`, {
              auth: { token: auth_token },
            }),
          }));
        } catch (error: any) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';
          
          if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            errorMessage = 'Unable to connect to server. Please check your connection and try again.';
          } else if (error.response?.status === 502) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              error_message: errorMessage,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
        }
      },

      register_user: async (email: string, password: string, name: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/register`,
            { email, password, name, role: 'user' },
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 30000
            }
          );

          const { user, auth_token } = response.data;

          set((_state) => ({
            authentication_state: {
              current_user: user,
              auth_token: auth_token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
            socket: io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`, {
              auth: { token: auth_token },
            }),
          }));
        } catch (error: any) {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';
          
          if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            errorMessage = 'Unable to connect to server. Please check your connection and try again.';
          } else if (error.response?.status === 502) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
        }
      },
      
      logout_user: () => {
        const { socket } = get();
        if (socket) socket.disconnect();

          set((_state) => ({
            authentication_state: {
              current_user: user,
              auth_token: auth_token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
            workspace_state: {
              selected_workspace_id: 'workspace1', // Set default workspace
              workspaces: [],
            },
            socket: io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`, {
              auth: { token: auth_token },
            }),
          }));
          
          // Redirect to home page after successful login
          if (window.location.pathname === '/login') {
            window.location.href = '/';
          }
          
          // Redirect to home page after successful registration
          if (window.location.pathname === '/login') {
            window.location.href = '/';
          }
      },
      
      initialize_auth: async () => {
        const { authentication_state } = get();
        const auth_token = authentication_state.auth_token;
        
        if (!auth_token) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/verify`,
            { 
              headers: { Authorization: `Bearer ${auth_token}` },
              timeout: 30000
            }
          );

          const { user } = response.data;

          set((_state) => ({
            authentication_state: {
              current_user: user,
              auth_token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
            workspace_state: {
              selected_workspace_id: 'workspace1', // Set default workspace
              workspaces: [],
            },
            socket: io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`, {
              auth: { token: auth_token },
              transports: ['websocket', 'polling'],
              timeout: 20000,
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
            }),
          }));
        } catch (error: any) {
          console.error('Auth verification error:', error);
          set((_state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        }
      },
      
      clear_auth_error: () => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            error_message: null,
          },
        }));
      },

      update_user_profile: (userData) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            current_user: state.authentication_state.current_user ? {
              ...state.authentication_state.current_user,
              ...userData,
            } : null,
          },
        }));
      },

      join_workspace: (workspace_id) => {
        set((state) => ({
          workspace_state: {
            ...state.workspace_state,
            selected_workspace_id: workspace_id,
          },
        }));
      },

      switch_theme: () => {
        set((state) => ({
          theme_state: {
            theme: state.theme_state.theme === 'light' ? 'dark' : 'light',
          },
        }));
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated
          },
        },
        workspace_state: state.workspace_state,
        channel_state: state.channel_state,
        theme_state: state.theme_state,
      }),
    }
  )
);