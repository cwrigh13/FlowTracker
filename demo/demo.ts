// Demo configuration for FlowTracker
export const DEMO_CONFIG = {
  enabled: import.meta.env.VITE_DEMO_MODE === 'true' || window.location.hostname === 'localhost',
  
  // Demo users with their credentials
  users: [
    {
      email: 'admin@demo.library.com',
      password: 'demo123',
      name: 'Demo Admin',
      role: 'admin',
      description: 'Full system access - can manage users, libraries, and all issues'
    },
    {
      email: 'manager@demo.library.com',
      password: 'demo123',
      name: 'Demo Manager',
      role: 'manager',
      description: 'Management access - can manage issues and collections, view reports'
    },
    {
      email: 'staff@demo.library.com',
      password: 'demo123',
      name: 'Demo Staff',
      role: 'staff',
      description: 'Staff access - can create and update issues, manage assigned items'
    },
    {
      email: 'viewer@demo.library.com',
      password: 'demo123',
      name: 'Demo Viewer',
      role: 'viewer',
      description: 'Read-only access - can view issues and reports'
    }
  ],
  
  // Demo library information
  library: {
    name: 'Demo Library',
    code: 'DEMO',
    description: 'Demo Library for FlowTracker showcase',
    address: '123 Demo Street, Demo City, DC 12345',
    phone: '(555) 123-DEMO',
    email: 'demo@library.com',
    website: 'https://demo.library.com'
  },
  
  // Demo collections (Kanban columns)
  collections: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Newly Reported',
      description: 'Issues just submitted by staff or patrons',
      color: '#EF4444'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Under Assessment',
      description: 'Issues being evaluated and prioritized',
      color: '#F59E0B'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Awaiting Parts',
      description: 'Issues waiting for parts or materials',
      color: '#8B5CF6'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'In Repair',
      description: 'Issues currently being fixed',
      color: '#3B82F6'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440014',
      name: 'Resolved/Ready for Circulation',
      description: 'Issues completed and ready for use',
      color: '#10B981'
    }
  ],
  
  // Demo features and tips
  features: [
    'Drag & drop issues between columns',
    'Create new issues with detailed information',
    'Assign issues to team members',
    'Add comments and track status history',
    'Filter and search issues',
    'Manage library collections and users',
    'View comprehensive reports and analytics'
  ],
  
  // Quick start tips
  tips: [
    'Try logging in as different users to see role-based permissions',
    'Create a new issue to see the full workflow',
    'Drag issues between columns to update their status',
    'Click on an issue to see detailed information and comments',
    'Use the search and filter options to find specific issues',
    'Check out the admin panel for user and library management'
  ]
};

// Demo mode detection
export const isDemoMode = (): boolean => {
  return DEMO_CONFIG.enabled;
};

// Get demo user info for display
export const getDemoUserInfo = (email: string) => {
  return DEMO_CONFIG.users.find(user => user.email === email);
};

// Get all demo users for quick login
export const getDemoUsers = () => {
  return DEMO_CONFIG.users;
};

// Get demo library info
export const getDemoLibraryInfo = () => {
  return DEMO_CONFIG.library;
};

// Get demo collections
export const getDemoCollections = () => {
  return DEMO_CONFIG.collections;
};
