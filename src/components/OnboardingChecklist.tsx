import { FC, useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

export const OnboardingChecklist: FC = () => {
  const { state, restartOnboarding } = useOnboarding();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if onboarding hasn't been started
  if (state.path === 'none') {
    return null;
  }

  const completedSteps = state.steps.filter(s => s.completed).length;
  const totalSteps = state.steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;
  const isComplete = state.completedAt !== undefined;

  if (isComplete && !isExpanded) {
    // Show compact completed badge
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-green-600 text-white rounded-lg px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Setup Complete</span>
        </button>
      </div>
    );
  }

  if (!isExpanded && !state.isActive) {
    // Show compact progress indicator
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all border-2 border-blue-200"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPercent / 100)}`}
                  className="text-blue-600 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
                {completedSteps}/{totalSteps}
              </div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">Setup Progress</div>
              <div className="text-xs text-gray-600">{Math.round(progressPercent)}% complete</div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">
              {isComplete ? '✓ All Set!' : 'Getting Started'}
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!isComplete && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-blue-400 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {state.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  step.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${step.completed ? 'text-green-900' : 'text-gray-700'}`}>
                    {step.title}
                  </div>
                  {!step.completed && (
                    <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isComplete ? (
              <button
                onClick={restartOnboarding}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                🔄 Restart Tour
              </button>
            ) : (
              <button
                onClick={restartOnboarding}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Continue Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

