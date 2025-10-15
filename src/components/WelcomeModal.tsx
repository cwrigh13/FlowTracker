import { FC } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';

export const WelcomeModal: FC = () => {
  const { state, startOnboarding, dismissWelcome } = useOnboarding();
  const { user } = useAuth();

  if (!state.showWelcome || state.isActive) {
    return null;
  }

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  const handleStartAdmin = () => {
    startOnboarding('admin');
  };

  const handleStartStaff = () => {
    startOnboarding('staff');
  };

  const handleSkip = () => {
    dismissWelcome();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header with Australian gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">G'day, {user?.first_name}! 👋</h1>
          <p className="text-lg text-blue-50">
            Welcome to FlowTracker—let's get your library tracking sorted.
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Would you like a quick tour?
            </h2>
            <p className="text-gray-600">
              We'll show you around and help you get started. It only takes 5-10 minutes, 
              and you can skip ahead anytime.
            </p>
          </div>

          {/* Stats to build confidence */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">127+</div>
                <div className="text-sm text-gray-600">Australian Libraries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">3x</div>
                <div className="text-sm text-gray-600">Faster Resolution</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">10 min</div>
                <div className="text-sm text-gray-600">Average Setup</div>
              </div>
            </div>
          </div>

          {/* Role-specific onboarding options */}
          <div className="space-y-3">
            {isAdmin && (
              <button
                onClick={handleStartAdmin}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <span>🎯 Start Setup Guide (Admin)</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {isStaff && !isAdmin && (
              <button
                onClick={handleStartStaff}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <span>🚀 Quick Start Guide (Staff)</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button
              onClick={handleSkip}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              I'll figure it out myself
            </button>
          </div>

          {/* Australian trust indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Data hosted in Australia</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Privacy Act compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

