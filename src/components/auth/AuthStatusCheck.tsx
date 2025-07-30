import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthStatusCheck: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="text-sm text-yellow-700">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <h4 className="font-medium text-red-800 mb-2">Authentication Required</h4>
          <p className="text-sm text-red-600 mb-3">
            You need to sign in to access kata progress tracking features.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="text-center">
        <div className="text-2xl mb-2">✅</div>
        <h4 className="font-medium text-green-800 mb-2">Signed In</h4>
        <p className="text-sm text-green-600">
          Welcome, {user?.name || user?.email}! You can now track your kata progress.
        </p>
      </div>
    </div>
  );
};