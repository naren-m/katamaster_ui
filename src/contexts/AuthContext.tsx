import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiService } from '../services/apiService';

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'email';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isSignUp?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('katamaster_token');
      console.log('Checking existing session, token exists:', !!token);
      
      if (token) {
        // Validate token with backend
        const userData = await apiService.validateSession(token);
        console.log('Session validation response:', userData);
        
        if (userData) {
          setUser(userData);
          console.log('User set from existing session:', userData.email);
        } else {
          console.log('Invalid session, removing token');
          localStorage.removeItem('katamaster_token');
        }
      } else {
        console.log('No existing token found');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('katamaster_token');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Initialize Google OAuth
      if (!window.google) {
        throw new Error('Google OAuth not loaded');
      }

      // Configure Google OAuth
      const response = await new Promise<any>((resolve, reject) => {
        window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          scope: 'email profile',
          callback: (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error));
            } else {
              resolve(tokenResponse);
            }
          },
        }).requestAccessToken();
      });

      // Get user info from Google
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      }).then(res => res.json());

      // Send to backend for authentication
      const authData = await apiService.signInWithGoogle({
        googleToken: response.access_token,
        userInfo: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      });

      // Store tokens and user data
      localStorage.setItem('katamaster_token', authData.token);
      if (authData.refresh_token) {
        localStorage.setItem('katamaster_refresh_token', authData.refresh_token);
      }
      setUser({
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name,
        avatar: authData.user.avatar,
        provider: 'google',
      });
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string, isSignUp = false) => {
    setLoading(true);
    try {
      console.log(`Attempting ${isSignUp ? 'signup' : 'signin'} for:`, email);
      
      const authData = isSignUp 
        ? await apiService.signUp({ email, password })
        : await apiService.signIn({ email, password });

      console.log('Auth response received:', { hasToken: !!authData.token, userId: authData.user?.id });

      if (!authData.token || !authData.user) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user data
      localStorage.setItem('katamaster_token', authData.token);
      if (authData.refresh_token) {
        localStorage.setItem('katamaster_refresh_token', authData.refresh_token);
      }
      setUser({
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name || email.split('@')[0],
        provider: 'email',
      });
      
      console.log('User signed in successfully:', authData.user.email);
    } catch (error) {
      console.error('Email sign in failed:', error);
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('401')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please check your internet connection.');
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('katamaster_refresh_token');
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.log('Token refresh failed:', response.status);
        // Clear invalid tokens
        localStorage.removeItem('katamaster_token');
        localStorage.removeItem('katamaster_refresh_token');
        setUser(null);
        return false;
      }

      const authData = await response.json();
      
      // Update stored tokens
      localStorage.setItem('katamaster_token', authData.token);
      if (authData.refresh_token) {
        localStorage.setItem('katamaster_refresh_token', authData.refresh_token);
      }

      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('katamaster_token');
      localStorage.removeItem('katamaster_refresh_token');
      setUser(null);
      return false;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Optionally notify backend of sign out
      const token = localStorage.getItem('katamaster_token');
      if (token) {
        await apiService.signOut(token);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear local data regardless of backend response
      localStorage.removeItem('katamaster_token');
      localStorage.removeItem('katamaster_refresh_token');
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add Google OAuth script to window
declare global {
  interface Window {
    google: any;
  }
}