import React from 'react';
import { getDemoUsers, isDemoMode } from '../config/demo';

interface DemoQuickLoginProps {
  onUserSelect: (email: string, password: string) => void;
  className?: string;
}

export const DemoQuickLogin: React.FC<DemoQuickLoginProps> = ({ 
  onUserSelect, 
  className = '' 
}) => {
  if (!isDemoMode()) {
    return null;
  }

  const demoUsers = getDemoUsers();

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Demo Quick Login</h3>
          <p className="text-sm text-gray-600">Click any user to auto-fill login form</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {demoUsers.map((user) => (
          <button
            key={user.email}
            onClick={() => onUserSelect(user.email, user.password)}
            className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-blue-900">
                  {user.name}
                </div>
                <div className="text-sm text-gray-600 group-hover:text-blue-700">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Role: {user.role}
                </div>
              </div>
              <div className="ml-2">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-800 font-medium">
            All demo users use password: demo123
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoQuickLogin;
