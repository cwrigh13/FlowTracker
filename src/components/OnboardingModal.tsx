import { FC, useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingModalProps {
  onCreateIssue?: () => void;
}

export const OnboardingModal: FC<OnboardingModalProps> = ({ onCreateIssue }) => {
  const { state, nextStep, previousStep, skipOnboarding, finishOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [libraryName, setLibraryName] = useState(user?.library.name || '');
  const [libraryType, setLibraryType] = useState('public');
  const [librarySize, setLibrarySize] = useState('medium');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  if (!state.isActive) {
    return null;
  }

  const currentStepData = state.steps[state.currentStep];
  const progress = ((state.currentStep + 1) / state.steps.length) * 100;
  const isLastStep = state.currentStep === state.steps.length - 1;
  const isFirstStep = state.currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      finishOnboarding();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip the tour? You can always restart it from your profile.')) {
      skipOnboarding();
    }
  };

  const toggleCollection = (collection: string) => {
    setSelectedCollections(prev => 
      prev.includes(collection) 
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    );
  };

  const collectionOptions = [
    { id: 'equipment', name: 'Equipment & Tools', icon: '🔧', description: 'Power tools, gardening equipment' },
    { id: 'musical', name: 'Musical Instruments', icon: '🎸', description: 'Guitars, keyboards, drums' },
    { id: 'tech', name: 'Digital & Tech', icon: '💻', description: '3D printers, cameras, laptops' },
    { id: 'sports', name: 'Sports & Recreation', icon: '⚽', description: 'Bikes, sports equipment' },
    { id: 'household', name: 'Household Items', icon: '🏠', description: 'Sewing machines, kitchen appliances' },
    { id: 'other', name: 'Other', icon: '📦', description: 'Everything else' },
  ];

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
              {currentStepData.description}
            </p>
            <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-700 mb-3">
                <strong>What you'll learn:</strong>
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                {state.path === 'admin' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Set up your library profile and collections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Create and manage issue tickets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Use the drag-and-drop workflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Invite your team members</span>
                    </li>
                  </>
                )}
                {state.path === 'staff' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Navigate the FlowTracker interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Create and update issue tickets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Use filters to find issues quickly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Track issues on mobile</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              ⏱️ Takes about {state.path === 'admin' ? '10-15' : '5-8'} minutes
            </div>
          </div>
        );

      case 'library-profile':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Library Name
                </label>
                <input
                  type="text"
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Riverside Community Library"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Library Type
                </label>
                <select
                  value={libraryType}
                  onChange={(e) => setLibraryType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public Library</option>
                  <option value="academic">Academic/University Library</option>
                  <option value="special">Special Collections</option>
                  <option value="community">Community Library</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Library Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLibrarySize(size)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        librarySize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {size === 'small' ? '🏘️' : size === 'medium' ? '🏙️' : '🌆'}
                      </div>
                      <div className="capitalize text-sm">{size}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {size === 'small' && '1-2 locations'}
                        {size === 'medium' && '3-8 locations'}
                        {size === 'large' && '9+ locations'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-green-900 mb-1">Aussie Tip</p>
                    <p className="text-sm text-green-700">
                      Your data stays in Australia and complies with the Privacy Act 1988. 
                      We'll never share your library information without your explicit consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'collections':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">
              Select the types of items your library lends. Don't worry, you can change these later.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {collectionOptions.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => toggleCollection(collection.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCollections.includes(collection.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{collection.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {collection.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {collection.description}
                      </div>
                    </div>
                    {selectedCollections.includes(collection.id) && (
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedCollections.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nice!</strong> You've selected {selectedCollections.length} collection{selectedCollections.length > 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </div>
        );

      case 'first-issue':
      case 'create-issue':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-gray-700 mb-4">
                  Creating issues is the heart of FlowTracker. Let's make your first one together!
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">What to include in an issue:</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">1.</span>
                    <div>
                      <strong>Item barcode or title</strong> - So you know which item it is
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">2.</span>
                    <div>
                      <strong>What's wrong</strong> - Brief description of the problem
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">3.</span>
                    <div>
                      <strong>Collection type</strong> - Helps with filtering later
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">4.</span>
                    <div>
                      <strong>Location (if multiple branches)</strong>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    nextStep();
                    onCreateIssue?.();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Open Issue Creator
                </button>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-medium text-yellow-900 mb-1">Pro Tip</p>
                  <p className="text-sm text-yellow-700">
                    You can create issues from the mobile app too—perfect for when you spot problems while shelving!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'workflow-demo':
      case 'update-status':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-lg font-medium text-gray-800 mb-2">
                  The Magic of Drag-and-Drop
                </p>
                <p className="text-gray-600">
                  This is what makes FlowTracker so easy to use!
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">How it works:</h3>
                
                {/* Visual demo */}
                <div className="flex items-center justify-center gap-4 my-6">
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-yellow-700 mb-1">Newly Reported</div>
                    <div className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">Broken Drill</div>
                    </div>
                  </div>
                  <div className="text-3xl">→</div>
                  <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-blue-700 mb-1">In Repair</div>
                    <div className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">Broken Drill</div>
                    </div>
                  </div>
                </div>

                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</span>
                    <div>Find an issue card on your board</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</span>
                    <div>Click and hold on the card</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</span>
                    <div>Drag it to a new status column</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</span>
                    <div>Drop it—done! Everyone on your team sees the update instantly</div>
                  </li>
                </ol>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Try it yourself! Drag any issue to a different column on your board.
                </p>
              </div>
            </div>
          </div>
        );

      case 'interface-tour':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">Let's explore the FlowTracker interface together</p>

            <div className="space-y-4">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border-2 border-blue-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📍</span>
                  <h3 className="font-semibold text-gray-800">Top Header</h3>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Shows your library name, your profile, and quick access to admin tools (if you're an admin)
                </p>
              </div>

              {/* View Switcher */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔄</span>
                  <h3 className="font-semibold text-gray-800">View Switcher</h3>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Toggle between "Problem Items" (broken/damaged) and "Suggestions" (new items to acquire)
                </p>
              </div>

              {/* Filters */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔍</span>
                  <h3 className="font-semibold text-gray-800">Filter Buttons</h3>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Filter issues by status, urgency, collection type, or branch location—super handy when you've got lots of issues!
                </p>
              </div>

              {/* Kanban Board */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border-2 border-yellow-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-semibold text-gray-800">Kanban Board</h3>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  The main board shows all your issues organized by status. Drag cards between columns to update them!
                </p>
              </div>
            </div>
          </div>
        );

      case 'filters':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 border-2 border-green-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-medium text-gray-800 mb-2">
                  Filters Are Your Best Mate
                </p>
                <p className="text-gray-600">
                  When you've got dozens of issues, filters help you focus on what matters
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Common filtering scenarios:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-600 rounded-lg px-3 py-1 text-sm font-semibold">
                      Urgent
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Show only urgent issues that need immediate attention</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-lg px-3 py-1 text-sm font-semibold">
                      Equipment & Tools
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Focus on a specific collection type</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-lg px-3 py-1 text-sm font-semibold">
                      Riverside Central
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">See issues from just one branch</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-lg px-3 py-1 text-sm font-semibold">
                      In Repair
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">View only issues currently being fixed</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Pro tip:</strong> You can combine multiple filters! Try filtering by "Urgent" + "Equipment & Tools" + your branch.
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Look at the filter buttons above your board and give them a try!
                </p>
              </div>
            </div>
          </div>
        );

      case 'invite-team':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-lg font-medium text-gray-800 mb-2">
                  FlowTracker Works Best with Your Team
                </p>
                <p className="text-gray-600">
                  Get your colleagues on board so everyone's on the same page
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">To invite team members:</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</span>
                    <div>Click the <strong>Admin</strong> button in the top right corner</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</span>
                    <div>Go to the <strong>Users</strong> tab</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</span>
                    <div>Click <strong>Invite User</strong> and enter their email</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</span>
                    <div>Choose their role (Admin or Staff) and send the invitation</div>
                  </li>
                </ol>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ They'll receive an email with a link to join your library's FlowTracker account
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">User roles explained:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👨‍💼</span>
                      <strong className="text-gray-800">Admin</strong>
                    </div>
                    <p className="text-sm text-gray-600">
                      Can manage settings, invite users, view all issues, and access reports
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👨‍💻</span>
                      <strong className="text-gray-800">Staff</strong>
                    </div>
                    <p className="text-sm text-gray-600">
                      Can create and update issues, view all library issues
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'mobile-setup':
      case 'mobile-app':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-8 border-2 border-teal-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-lg font-medium text-gray-800 mb-2">
                  FlowTracker In Your Pocket
                </p>
                <p className="text-gray-600">
                  FlowTracker is mobile-responsive—access it from any device
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">What you can do on mobile:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📸</span>
                    <div>
                      <strong className="text-gray-800">Take photos of damage</strong>
                      <p className="text-sm text-gray-600">Snap a quick pic and attach it to the issue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <strong className="text-gray-800">Update issue status</strong>
                      <p className="text-sm text-gray-600">Drag and drop works great on touchscreens</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <strong className="text-gray-800">Get notifications</strong>
                      <p className="text-sm text-gray-600">Stay updated on issue changes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <strong className="text-gray-800">Report issues on the spot</strong>
                      <p className="text-sm text-gray-600">Found a problem while shelving? Create a ticket right away</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-sm text-teal-800 mb-3">
                    <strong>Add to your home screen for quick access:</strong>
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>iPhone/iPad:</strong> Safari menu → Share → "Add to Home Screen"</div>
                    <div><strong>Android:</strong> Chrome menu → "Add to Home screen"</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Bookmark this page on your phone to access FlowTracker anytime!
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
              You've completed the FlowTracker tour. You're ready to start tracking issues like a pro!
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 max-w-2xl mx-auto border-2 border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-4">Quick recap of what you learned:</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                {state.steps.slice(1, -1).map((step) => (
                  <div key={step.id} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{step.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">What's next?</h4>
                <ul className="space-y-2 text-left text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Start creating real issues for your library items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Invite your team members to collaborate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Explore advanced features like reporting and item history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Check out our Help Center for detailed guides</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div className="text-left">
                  <p className="font-medium text-yellow-900 mb-2">Need help?</p>
                  <p className="text-sm text-yellow-700 mb-3">
                    We're here to help! Our Australian support team is available during business hours.
                  </p>
                  <div className="space-y-1 text-sm text-yellow-800">
                    <div>📧 <a href="mailto:support@flowtracker.au" className="underline">support@flowtracker.au</a></div>
                    <div>💬 Live chat (bottom right corner)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Progress bar */}
        <div className="bg-gray-200 h-2 rounded-t-xl overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer with navigation */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
            >
              Skip tour
            </button>
            <div className="text-sm text-gray-500">
              Step {state.currentStep + 1} of {state.steps.length}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <button
                onClick={previousStep}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              {isLastStep ? '🎉 Finish Tour' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

