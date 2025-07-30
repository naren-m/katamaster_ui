import React from 'react';
import { KataProgress } from '../shared/KataProgress';
import { AuthStatusCheck } from '../auth/AuthStatusCheck';
import { useAuth } from '../../contexts/AuthContext';

export const KataProgressTest: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kata Progress Test Page</h1>
          <p className="text-gray-600">Test the kata progress tracking functionality</p>
        </div>

        <div className="space-y-6">
          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <AuthStatusCheck />
          </div>

          {/* Kata Progress Components */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Heian Shodan Progress</h2>
                <KataProgress 
                  kataId="heian-shodan" 
                  kataName="Heian Shodan"
                  onPracticeRecord={() => console.log('Heian Shodan practice recorded')}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Heian Nidan Progress</h2>
                <KataProgress 
                  kataId="heian-nidan" 
                  kataName="Heian Nidan"
                  onPracticeRecord={() => console.log('Heian Nidan practice recorded')}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Bassai Dai Progress</h2>
                <KataProgress 
                  kataId="bassai-dai" 
                  kataName="Bassai Dai"
                  onPracticeRecord={() => console.log('Bassai Dai practice recorded')}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Kanku Dai Progress</h2>
                <KataProgress 
                  kataId="kanku-dai" 
                  kataName="Kanku Dai"
                  onPracticeRecord={() => console.log('Kanku Dai practice recorded')}
                />
              </div>
            </div>
          )}

          {/* API Test Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Test Information</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Backend API:</strong> http://localhost:8083</p>
              <p><strong>Kata Progress Endpoint:</strong> GET /api/kata/progress</p>
              <p><strong>Record Practice Endpoint:</strong> POST /api/kata/practice</p>
              <p><strong>Authentication:</strong> Bearer token required</p>
              
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2">Test Credentials (if needed):</h4>
                <p>Email: test@example.com</p>
                <p>Password: password123</p>
                <p className="text-xs mt-2 text-gray-500">
                  Use these credentials to sign up/sign in for testing the kata progress functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};