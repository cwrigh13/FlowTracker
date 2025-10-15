// API Factory - Switch between real API and mock API
import { apiService } from './api';
import { mockApiService } from './mockApi';

// Re-export all types
export * from './api';

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || 
                     localStorage.getItem('useMockApi') === 'true' ||
                     // Auto-detect if backend is not available (for admin dashboard)
                     true; // Always use mock for now since backend isn't running

// Export the appropriate API service
export const api = USE_MOCK_API ? mockApiService : apiService;

// Export individual methods for convenience
export const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  getCollections,
  // Metrics methods
  getMetricsOverview,
  getResolutionTimeMetrics,
  getTeamPerformanceMetrics,
  getIssueTrendsMetrics,
  getStatusDistribution,
  getPriorityBreakdown,
  getCollectionStats,
  getWorkloadBalance,
  // Utility methods
  healthCheck,
  isAuthenticated,
  getToken,
  setToken,
  logout
} = api;

// Export default
export default api;
