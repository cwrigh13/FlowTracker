// API service layer for FlowTracker frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Types matching backend API
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'patron';
  library: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Collection {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  item_id?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'problem' | 'suggestion';
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  collections?: Collection[];
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  old_status?: string;
  new_status: string;
  changed_by: string;
  reason?: string;
  created_at: string;
  changer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface IssueWithHistory extends Issue {
  status_history?: IssueStatusHistory[];
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  item_id?: string;
  type: 'problem' | 'suggestion';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  collection_ids?: string[];
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  item_id?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  collection_ids?: string[];
}

// Metrics types
export interface MetricsOverview {
  total_issues: number;
  open_issues: number;
  resolved_this_period: number;
  avg_resolution_hours: number;
  avg_first_response_hours: number;
  sla_compliance: number;
  active_users: number;
}

export interface ResolutionTimeData {
  period: string;
  issue_count: number;
  avg_resolution_hours: number;
  median_resolution_hours: number;
  p90_resolution_hours: number;
}

export interface TeamPerformanceData {
  user_id: string;
  user_name: string;
  role: string;
  assigned_issues: number;
  resolved_issues: number;
  open_issues: number;
  overdue_issues: number;
  avg_resolution_hours: number;
  comments_posted: number;
  last_activity: string;
}

export interface IssueTrendsData {
  period: string;
  created: number;
  resolved: number;
  net_change: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  avg_age_days: number;
  oldest_issue_date: string;
  most_recent_update: string;
}

export interface PriorityBreakdown {
  priority: string;
  open: number;
  in_progress: number;
  resolved: number;
  total: number;
  avg_resolution_hours: number;
}

export interface CollectionStats {
  collection_id: string;
  collection_name: string;
  collection_color: string;
  issue_count: number;
  resolved_count: number;
  open_issues: number;
  avg_resolution_hours: number;
  most_recent_issue: string;
}

export interface WorkloadBalance {
  user_id: string;
  user_name: string;
  current_workload: number;
  open_count: number;
  in_progress_count: number;
  urgent_count: number;
  overdue_count: number;
  avg_workload: number;
  workload_status: 'overloaded' | 'balanced' | 'underutilized';
}

export interface LoginRequest {
  email: string;
  password: string;
  library_slug: string;
}

export interface ForgotPasswordRequest {
  email: string;
  library_slug: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface TrialSignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  library_name: string;
  library_code?: string;
  library_slug: string;
  phone?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'patron';
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'staff' | 'patron';
  is_active?: boolean;
}

export interface UserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'patron';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API service class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<ApiResponse<{ token: string; user: User }>>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'staff' | 'patron';
    library_slug: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/api/auth/verify');
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Password reset methods
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyResetToken(token: string): Promise<ApiResponse<{
    email: string;
    first_name: string;
    last_name: string;
    expires_at: string;
  }>> {
    return this.request<ApiResponse<{
      email: string;
      first_name: string;
      last_name: string;
      expires_at: string;
    }>>(`/api/auth/verify-reset-token/${token}`);
  }

  async trialSignup(data: TrialSignupRequest): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<ApiResponse<{ token: string; user: User }>>('/api/auth/trial-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // If signup successful and we got a token, store it
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // Issue methods
  async getIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: 'problem' | 'suggestion';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    collection_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Issue>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/issues${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Issue>>(endpoint);
  }

  async getIssue(id: string): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>(`/api/issues/${id}`);
  }

  async createIssue(issueData: CreateIssueRequest): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>('/api/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(id: string, issueData: UpdateIssueRequest): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issueData),
    });
  }

  async deleteIssue(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/issues/${id}`, {
      method: 'DELETE',
    });
  }

  async getIssueHistoryByBarcode(barcode: string): Promise<ApiResponse<IssueWithHistory[]>> {
    return this.request<ApiResponse<IssueWithHistory[]>>(`/api/issues/history/by-item/${encodeURIComponent(barcode)}`);
  }

  // Collection methods
  async getCollections(): Promise<ApiResponse<Collection[]>> {
    return this.request<ApiResponse<Collection[]>>('/api/collections');
  }

  // User management methods (Admin only)
  async getUsers(): Promise<ApiResponse<UserDetail[]>> {
    return this.request<ApiResponse<UserDetail[]>>('/api/users');
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<UserDetail>> {
    return this.request<ApiResponse<UserDetail>>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<UserDetail>> {
    return this.request<ApiResponse<UserDetail>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Metrics methods (Admin only)
  async getMetricsOverview(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<MetricsOverview>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    return this.request<ApiResponse<MetricsOverview>>(
      `/api/metrics/overview${queryString ? `?${queryString}` : ''}`
    );
  }

  async getResolutionTimeMetrics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    priority?: string;
    assignedTo?: string;
  }): Promise<ApiResponse<ResolutionTimeData[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<ApiResponse<ResolutionTimeData[]>>(
      `/api/metrics/resolution-time${queryString ? `?${queryString}` : ''}`
    );
  }

  async getTeamPerformanceMetrics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TeamPerformanceData[]>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    return this.request<ApiResponse<TeamPerformanceData[]>>(
      `/api/metrics/team-performance${queryString ? `?${queryString}` : ''}`
    );
  }

  async getIssueTrendsMetrics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<IssueTrendsData[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<ApiResponse<IssueTrendsData[]>>(
      `/api/metrics/issue-trends${queryString ? `?${queryString}` : ''}`
    );
  }

  async getStatusDistribution(): Promise<ApiResponse<StatusDistribution[]>> {
    return this.request<ApiResponse<StatusDistribution[]>>('/api/metrics/status-distribution');
  }

  async getPriorityBreakdown(): Promise<ApiResponse<PriorityBreakdown[]>> {
    return this.request<ApiResponse<PriorityBreakdown[]>>('/api/metrics/priority-breakdown');
  }

  async getCollectionStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<CollectionStats[]>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    return this.request<ApiResponse<CollectionStats[]>>(
      `/api/metrics/collection-stats${queryString ? `?${queryString}` : ''}`
    );
  }

  async getWorkloadBalance(): Promise<ApiResponse<WorkloadBalance[]>> {
    return this.request<ApiResponse<WorkloadBalance[]>>('/api/metrics/workload-balance');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export default for convenience
export default apiService;
