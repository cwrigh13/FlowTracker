import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';

// Onboarding step types
export type OnboardingPath = 'admin' | 'staff' | 'patron' | 'none';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingState {
  path: OnboardingPath;
  currentStep: number;
  steps: OnboardingStep[];
  isActive: boolean;
  showWelcome: boolean;
  completedAt?: string;
}

interface OnboardingContextValue {
  state: OnboardingState;
  startOnboarding: (path: OnboardingPath) => void;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  finishOnboarding: () => void;
  restartOnboarding: () => void;
  dismissWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'flowtracker_onboarding_state';

// Define steps for each path
const ADMIN_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'G\'day! Welcome to FlowTracker',
    description: 'Let\'s get your library set up in just a few minutes',
    completed: false,
  },
  {
    id: 'library-profile',
    title: 'Set Up Your Library Profile',
    description: 'Tell us a bit about your library',
    completed: false,
  },
  {
    id: 'collections',
    title: 'Choose Your Collections',
    description: 'Select the types of items you\'ll be tracking',
    completed: false,
  },
  {
    id: 'first-issue',
    title: 'Create Your First Issue',
    description: 'Let\'s track your first item issue together',
    completed: false,
  },
  {
    id: 'workflow-demo',
    title: 'Try the Workflow',
    description: 'Drag and drop to update issue status',
    completed: false,
  },
  {
    id: 'invite-team',
    title: 'Invite Your Team',
    description: 'Get your colleagues on board',
    completed: false,
  },
  {
    id: 'mobile-setup',
    title: 'Set Up Mobile Access',
    description: 'Track issues from anywhere in your library',
    completed: false,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Time to start tracking issues',
    completed: false,
  },
];

const STAFF_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Team!',
    description: 'Let\'s show you around FlowTracker',
    completed: false,
  },
  {
    id: 'interface-tour',
    title: 'Quick Interface Tour',
    description: 'Here\'s where everything lives',
    completed: false,
  },
  {
    id: 'create-issue',
    title: 'Report Your First Issue',
    description: 'Creating tickets is easy',
    completed: false,
  },
  {
    id: 'update-status',
    title: 'Update an Issue',
    description: 'Drag and drop to change status',
    completed: false,
  },
  {
    id: 'filters',
    title: 'Use Filters',
    description: 'Find issues quickly with filters',
    completed: false,
  },
  {
    id: 'mobile-app',
    title: 'Get the Mobile App',
    description: 'Track on the go',
    completed: false,
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'Start tracking issues with your team',
    completed: false,
  },
];

const PATRON_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Report an Issue',
    description: 'Help us keep our collection in top shape',
    completed: false,
  },
  {
    id: 'scan-barcode',
    title: 'Scan or Enter Barcode',
    description: 'Find it on the item label',
    completed: false,
  },
  {
    id: 'describe-issue',
    title: 'Describe the Problem',
    description: 'Let us know what\'s wrong',
    completed: false,
  },
  {
    id: 'add-photo',
    title: 'Add a Photo (Optional)',
    description: 'A picture helps us fix it faster',
    completed: false,
  },
  {
    id: 'complete',
    title: 'Thanks!',
    description: 'We\'ll get this sorted',
    completed: false,
  },
];

const getStepsForPath = (path: OnboardingPath): OnboardingStep[] => {
  switch (path) {
    case 'admin':
      return ADMIN_STEPS;
    case 'staff':
      return STAFF_STEPS;
    case 'patron':
      return PATRON_STEPS;
    default:
      return [];
  }
};

export const OnboardingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing onboarding state:', e);
      }
    }
    return {
      path: 'none',
      currentStep: 0,
      steps: [],
      isActive: false,
      showWelcome: true,
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startOnboarding = (path: OnboardingPath) => {
    const steps = getStepsForPath(path);
    setState({
      path,
      currentStep: 0,
      steps,
      isActive: true,
      showWelcome: false,
    });
  };

  const completeStep = (stepId: string) => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      ),
    }));
  };

  const nextStep = () => {
    setState((prev) => {
      const currentStepObj = prev.steps[prev.currentStep];
      const updatedSteps = prev.steps.map((step) =>
        step.id === currentStepObj.id ? { ...step, completed: true } : step
      );

      if (prev.currentStep < prev.steps.length - 1) {
        return {
          ...prev,
          currentStep: prev.currentStep + 1,
          steps: updatedSteps,
        };
      }
      return { ...prev, steps: updatedSteps };
    });
  };

  const previousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  };

  const skipOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      completedAt: new Date().toISOString(),
    }));
  };

  const finishOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      completedAt: new Date().toISOString(),
      steps: prev.steps.map((step) => ({ ...step, completed: true })),
    }));
  };

  const restartOnboarding = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 0,
      isActive: true,
      completedAt: undefined,
      steps: prev.steps.map((step) => ({ ...step, completed: false })),
    }));
  };

  const dismissWelcome = () => {
    setState((prev) => ({
      ...prev,
      showWelcome: false,
    }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        startOnboarding,
        completeStep,
        nextStep,
        previousStep,
        skipOnboarding,
        finishOnboarding,
        restartOnboarding,
        dismissWelcome,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

