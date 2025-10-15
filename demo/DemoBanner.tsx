import React, { useState } from 'react';
import { DEMO_CONFIG, isDemoMode } from '../config/demo';

interface DemoBannerProps {
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isDemoMode()) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Demo Environment</h3>
              <p className="text-blue-100 text-sm">
                FlowTracker Demo - Try out all features with sample data
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Demo Users */}
              <div>
                <h4 className="font-semibold mb-3 text-yellow-200">Demo Users (Password: demo123)</h4>
                <div className="space-y-2">
                  {DEMO_CONFIG.users.map((user) => (
                    <div key={user.email} className="bg-white/10 rounded-lg p-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-blue-100">{user.email}</div>
                      <div className="text-xs text-blue-200 mt-1">{user.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div>
                <h4 className="font-semibold mb-3 text-yellow-200">Quick Start Tips</h4>
                <ul className="space-y-2">
                  {DEMO_CONFIG.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-100 flex items-start">
                      <span className="text-yellow-300 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4">
              <h4 className="font-semibold mb-3 text-yellow-200">Available Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DEMO_CONFIG.features.map((feature, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-2 text-sm text-center">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoBanner;
