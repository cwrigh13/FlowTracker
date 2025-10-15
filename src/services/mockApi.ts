// Mock API service for testing admin dashboard without backend
import { UserDetail, CreateUserRequest, UpdateUserRequest, ApiResponse, Issue, CreateIssueRequest, UpdateIssueRequest, PaginatedResponse, IssueWithHistory } from './api';

// Mock data
let mockUsers: UserDetail[] = [
  {
    id: '1',
    email: 'admin@library.com',
    first_name: 'John',
    last_name: 'Admin',
    role: 'admin',
    is_active: true,
    last_login: '2024-12-06T10:30:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-12-06T10:30:00Z'
  },
  {
    id: '2',
    email: 'staff1@library.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'staff',
    is_active: true,
    last_login: '2024-12-05T14:20:00Z',
    created_at: '2024-02-10T11:30:00Z',
    updated_at: '2024-12-05T14:20:00Z'
  },
  {
    id: '3',
    email: 'staff2@library.com',
    first_name: 'Mike',
    last_name: 'Wilson',
    role: 'staff',
    is_active: true,
    last_login: '2024-12-04T16:45:00Z',
    created_at: '2024-03-20T13:15:00Z',
    updated_at: '2024-12-04T16:45:00Z'
  },
  {
    id: '4',
    email: 'patron1@library.com',
    first_name: 'Emily',
    last_name: 'Davis',
    role: 'patron',
    is_active: true,
    last_login: '2024-12-03T12:10:00Z',
    created_at: '2024-04-05T08:45:00Z',
    updated_at: '2024-12-03T12:10:00Z'
  },
  {
    id: '5',
    email: 'patron2@library.com',
    first_name: 'David',
    last_name: 'Brown',
    role: 'patron',
    is_active: false,
    last_login: '2024-11-28T09:30:00Z',
    created_at: '2024-05-12T14:20:00Z',
    updated_at: '2024-11-28T09:30:00Z'
  }
];

let nextId = 6;

// Mock issues data
let mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Broken printer in Computer Lab',
    description: 'The printer on the second floor is not responding to print jobs. Error message shows "Paper jam" but there is no paper visible.',
    item_id: 'PRT-001',
    status: 'Newly Reported',
    priority: 'high',
    type: 'problem',
    created_by: '1',
    assigned_to: '2',
    due_date: '2024-12-10T17:00:00Z',
    created_at: '2024-12-06T09:30:00Z',
    updated_at: '2024-12-06T09:30:00Z',
    creator: {
      id: '1',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin@demo.com'
    },
    assignee: {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'staff1@library.com'
    },
    collections: [
      { id: '1', name: 'Equipment & Tools', color: '#3B82F6' }
    ]
  },
  {
    id: '2',
    title: 'Request for more study tables',
    description: 'The study area on the third floor needs more tables. Currently only 4 tables available for 20+ students.',
    item_id: '',
    status: 'Received',
    priority: 'medium',
    type: 'suggestion',
    created_by: '4',
    assigned_to: '2',
    due_date: '2024-12-15T17:00:00Z',
    created_at: '2024-12-05T14:20:00Z',
    updated_at: '2024-12-05T14:20:00Z',
    creator: {
      id: '4',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'patron1@library.com'
    },
    assignee: {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'staff1@library.com'
    },
    collections: [
      { id: '2', name: 'Furniture & Space', color: '#10B981' }
    ]
  },
  {
    id: '3',
    title: 'WiFi connection issues in Reading Room',
    description: 'WiFi keeps dropping in the main reading room. Very frustrating when trying to do research.',
    item_id: 'WIFI-001',
    status: 'Under Assessment',
    priority: 'high',
    type: 'problem',
    created_by: '5',
    assigned_to: '3',
    due_date: '2024-12-08T17:00:00Z',
    created_at: '2024-12-04T11:15:00Z',
    updated_at: '2024-12-06T10:45:00Z',
    creator: {
      id: '5',
      first_name: 'David',
      last_name: 'Brown',
      email: 'patron2@library.com'
    },
    assignee: {
      id: '3',
      first_name: 'Mike',
      last_name: 'Wilson',
      email: 'staff2@library.com'
    },
    collections: [
      { id: '3', name: 'Technology', color: '#F59E0B' }
    ]
  },
  {
    id: '4',
    title: 'Suggestion: Add more charging stations',
    description: 'Would be great to have more charging stations around the library. Current ones are always full.',
    item_id: '',
    status: 'In Progress',
    priority: 'low',
    type: 'suggestion',
    created_by: '4',
    assigned_to: '2',
    due_date: '2024-12-20T17:00:00Z',
    created_at: '2024-12-03T16:30:00Z',
    updated_at: '2024-12-05T09:15:00Z',
    creator: {
      id: '4',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'patron1@library.com'
    },
    assignee: {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'staff1@library.com'
    },
    collections: [
      { id: '3', name: 'Technology', color: '#F59E0B' }
    ]
  },
  {
    id: '5',
    title: 'Air conditioning not working in Reference Section',
    description: 'The AC unit in the reference section is making loud noises and not cooling properly.',
    item_id: 'HVAC-001',
    status: 'Awaiting Parts',
    priority: 'urgent',
    type: 'problem',
    created_by: '1',
    assigned_to: '3',
    due_date: '2024-12-07T17:00:00Z',
    created_at: '2024-12-02T08:45:00Z',
    updated_at: '2024-12-06T14:20:00Z',
    creator: {
      id: '1',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin@demo.com'
    },
    assignee: {
      id: '3',
      first_name: 'Mike',
      last_name: 'Wilson',
      email: 'staff2@library.com'
    },
    collections: [
      { id: '4', name: 'HVAC & Environment', color: '#EF4444' }
    ]
  }
];

let nextIssueId = 6;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service class
class MockApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Simulate network delay
    await delay(300 + Math.random() * 500);

    // Simulate authentication check
    if (endpoint.includes('/api/') && !this.token) {
      throw new Error('Unauthorized: No authentication token');
    }

    // Route to appropriate mock handler
    const url = `${this.baseURL}${endpoint}`;
    
    if (endpoint === '/api/users' && options.method === 'GET') {
      return this.getUsers() as T;
    } else if (endpoint === '/api/users' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      return this.createUser(body) as T;
    } else if (endpoint.startsWith('/api/users/') && options.method === 'PUT') {
      const id = endpoint.split('/')[3];
      const body = JSON.parse(options.body as string);
      return this.updateUser(id, body) as T;
    } else if (endpoint.startsWith('/api/users/') && options.method === 'DELETE') {
      const id = endpoint.split('/')[3];
      return this.deleteUser(id) as T;
    } else if (endpoint.startsWith('/api/issues/history/by-item/') && options.method === 'GET') {
      const barcode = decodeURIComponent(endpoint.split('/').pop() || '');
      return this.getIssueHistoryByBarcode(barcode) as T;
    } else if (endpoint.startsWith('/api/issues') && options.method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      return this.getIssues({
        page: parseInt(params.get('page') || '1'),
        limit: parseInt(params.get('limit') || '100'),
        type: params.get('type') as 'problem' | 'suggestion' | undefined,
        status: params.get('status') || undefined,
        priority: params.get('priority') as 'low' | 'medium' | 'high' | 'urgent' | undefined,
        assigned_to: params.get('assigned_to') || undefined,
        collection_id: params.get('collection_id') || undefined,
        search: params.get('search') || undefined
      }) as T;
    } else if (endpoint.startsWith('/api/issues') && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      return this.createIssue(body) as T;
    } else if (endpoint.startsWith('/api/issues/') && options.method === 'PUT') {
      const id = endpoint.split('/')[3];
      const body = JSON.parse(options.body as string);
      return this.updateIssue(id, body) as T;
    } else if (endpoint.startsWith('/api/issues/') && options.method === 'DELETE') {
      const id = endpoint.split('/')[3];
      return this.deleteIssue(id) as T;
    } else if (endpoint === '/api/collections' && options.method === 'GET') {
      return this.getCollections() as T;
    } else if (endpoint === '/health') {
      return {
        success: true,
        message: 'Mock API server is running',
        timestamp: new Date().toISOString()
      } as T;
    }

    throw new Error(`Mock API: Endpoint ${endpoint} not implemented`);
  }

  // User management methods
  async getUsers(): Promise<ApiResponse<UserDetail[]>> {
    console.log('Mock API: Getting users');
    return {
      success: true,
      data: [...mockUsers]
    };
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<UserDetail>> {
    console.log('Mock API: Creating user', userData);
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser: UserDetail = {
      id: nextId.toString(),
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockUsers.push(newUser);
    nextId++;

    return {
      success: true,
      data: newUser,
      message: 'User created successfully'
    };
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<UserDetail>> {
    console.log('Mock API: Updating user', id, userData);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    };
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    console.log('Mock API: Deleting user', id);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers.splice(userIndex, 1);

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  // Issue methods
  async getIssues(params?: {
    page?: number;
    limit?: number;
    type?: 'problem' | 'suggestion';
    status?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    collection_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Issue>> {
    console.log('Mock API: Getting issues', params);
    
    let filteredIssues = [...mockIssues];
    
    // Apply filters
    if (params?.type) {
      filteredIssues = filteredIssues.filter(issue => issue.type === params.type);
    }
    if (params?.status) {
      filteredIssues = filteredIssues.filter(issue => issue.status === params.status);
    }
    if (params?.priority) {
      filteredIssues = filteredIssues.filter(issue => issue.priority === params.priority);
    }
    if (params?.assigned_to) {
      filteredIssues = filteredIssues.filter(issue => issue.assigned_to === params.assigned_to);
    }
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredIssues = filteredIssues.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm) ||
        issue.description?.toLowerCase().includes(searchTerm) ||
        issue.item_id?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIssues = filteredIssues.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedIssues,
      pagination: {
        page,
        limit,
        total: filteredIssues.length,
        total_pages: Math.ceil(filteredIssues.length / limit)
      }
    };
  }

  async createIssue(issueData: CreateIssueRequest): Promise<ApiResponse<Issue>> {
    console.log('Mock API: Creating issue', issueData);
    
    const newIssue: Issue = {
      id: nextIssueId.toString(),
      title: issueData.title,
      description: issueData.description || '',
      item_id: issueData.item_id || '',
      status: issueData.type === 'problem' ? 'Newly Reported' : 'Received',
      priority: issueData.priority || 'medium',
      type: issueData.type,
      created_by: '1', // Mock admin user
      assigned_to: issueData.assigned_to,
      due_date: issueData.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: '1',
        first_name: 'John',
        last_name: 'Admin',
        email: 'admin@demo.com'
      },
      assignee: issueData.assigned_to ? {
        id: issueData.assigned_to,
        first_name: 'Staff',
        last_name: 'Member',
        email: 'staff@demo.com'
      } : undefined,
      collections: issueData.collection_ids?.map(id => ({
        id,
        name: `Collection ${id}`,
        color: '#3B82F6'
      })) || []
    };

    mockIssues.unshift(newIssue);
    nextIssueId++;

    return {
      success: true,
      data: newIssue,
      message: 'Issue created successfully'
    };
  }

  async updateIssue(id: string, issueData: UpdateIssueRequest): Promise<ApiResponse<Issue>> {
    console.log('Mock API: Updating issue', id, issueData);
    
    const issueIndex = mockIssues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    const updatedIssue = {
      ...mockIssues[issueIndex],
      ...issueData,
      updated_at: new Date().toISOString()
    };

    mockIssues[issueIndex] = updatedIssue;

    return {
      success: true,
      data: updatedIssue,
      message: 'Issue updated successfully'
    };
  }

  async deleteIssue(id: string): Promise<ApiResponse> {
    console.log('Mock API: Deleting issue', id);
    
    const issueIndex = mockIssues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    mockIssues.splice(issueIndex, 1);

    return {
      success: true,
      message: 'Issue deleted successfully'
    };
  }

  async getIssueHistoryByBarcode(barcode: string): Promise<ApiResponse<IssueWithHistory[]>> {
    console.log('Mock API: Getting issue history for barcode', barcode);
    
    // Find all issues with this barcode
    const issuesForBarcode = mockIssues.filter(issue => issue.item_id === barcode);
    
    // Add mock status history for each issue
    const issuesWithHistory: IssueWithHistory[] = issuesForBarcode.map(issue => ({
      ...issue,
      status_history: [
        {
          id: `${issue.id}-history-1`,
          issue_id: issue.id,
          old_status: undefined,
          new_status: issue.type === 'problem' ? 'Newly Reported' : 'Received',
          changed_by: issue.created_by,
          reason: 'Issue created',
          created_at: issue.created_at,
          changer: issue.creator
        },
        ...(issue.status !== (issue.type === 'problem' ? 'Newly Reported' : 'Received') ? [{
          id: `${issue.id}-history-2`,
          issue_id: issue.id,
          old_status: issue.type === 'problem' ? 'Newly Reported' : 'Received',
          new_status: issue.status,
          changed_by: issue.assigned_to || issue.created_by,
          reason: 'Status updated',
          created_at: issue.updated_at,
          changer: issue.assignee || issue.creator
        }] : [])
      ]
    }));

    return {
      success: true,
      data: issuesWithHistory,
      message: `Found ${issuesWithHistory.length} issue(s) for item ${barcode}`
    };
  }

  // Collection methods
  async getCollections(): Promise<ApiResponse<{ id: string; name: string; color: string }[]>> {
    console.log('Mock API: Getting collections');
    
    const collections = [
      { id: '1', name: 'Equipment & Tools', color: '#3B82F6' },
      { id: '2', name: 'Furniture & Space', color: '#10B981' },
      { id: '3', name: 'Technology', color: '#F59E0B' },
      { id: '4', name: 'HVAC & Environment', color: '#EF4444' },
      { id: '5', name: 'Security & Safety', color: '#8B5CF6' }
    ];

    return {
      success: true,
      data: collections
    };
  }

  // Trial signup - Mock implementation
  async trialSignup(data: any): Promise<ApiResponse<{ token: string; user: any }>> {
    console.log('Mock API: Trial signup', data);
    await delay(800); // Simulate signup processing time
    
    // Mock successful trial signup
    const mockUser = {
      id: String(nextId++),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'admin' as const,
      library: {
        id: String(nextId++),
        name: data.library_name,
        slug: data.library_slug
      }
    };
    
    // Generate mock token
    const mockToken = `mock-trial-token-${Date.now()}`;
    this.setToken(mockToken);
    
    return {
      success: true,
      data: {
        token: mockToken,
        user: mockUser
      },
      message: 'Trial account created successfully. Welcome to FlowTracker!'
    };
  }

  // Metrics methods (Admin only) - Mock implementations
  async getMetricsOverview(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> {
    console.log('Mock API: Getting metrics overview', params);
    await delay(500);
    
    return {
      success: true,
      data: {
        total_issues: 247,
        open_issues: 42,
        resolved_this_period: 89,
        avg_resolution_hours: 24.5,
        avg_first_response_hours: 3.2,
        sla_compliance: 87.5,
        active_users: 15
      }
    };
  }

  async getResolutionTimeMetrics(params?: any): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting resolution time metrics', params);
    await delay(500);
    
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        period: date.toISOString(),
        issue_count: Math.floor(Math.random() * 10) + 5,
        avg_resolution_hours: Math.random() * 40 + 10,
        median_resolution_hours: Math.random() * 30 + 8,
        p90_resolution_hours: Math.random() * 60 + 20
      };
    });
    
    return { success: true, data };
  }

  async getTeamPerformanceMetrics(params?: any): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting team performance metrics', params);
    await delay(500);
    
    return {
      success: true,
      data: [
        {
          user_id: '1',
          user_name: 'John Admin',
          role: 'admin',
          assigned_issues: 35,
          resolved_issues: 28,
          open_issues: 7,
          overdue_issues: 2,
          avg_resolution_hours: 18.5,
          comments_posted: 124,
          last_activity: new Date().toISOString()
        },
        {
          user_id: '2',
          user_name: 'Sarah Johnson',
          role: 'staff',
          assigned_issues: 42,
          resolved_issues: 38,
          open_issues: 4,
          overdue_issues: 1,
          avg_resolution_hours: 22.3,
          comments_posted: 156,
          last_activity: new Date().toISOString()
        },
        {
          user_id: '3',
          user_name: 'Mike Wilson',
          role: 'staff',
          assigned_issues: 38,
          resolved_issues: 30,
          open_issues: 8,
          overdue_issues: 3,
          avg_resolution_hours: 28.7,
          comments_posted: 98,
          last_activity: new Date().toISOString()
        }
      ]
    };
  }

  async getIssueTrendsMetrics(params?: any): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting issue trends', params);
    await delay(500);
    
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const created = Math.floor(Math.random() * 15) + 5;
      const resolved = Math.floor(Math.random() * 12) + 3;
      return {
        period: date.toISOString(),
        created,
        resolved,
        net_change: created - resolved
      };
    });
    
    return { success: true, data };
  }

  async getStatusDistribution(): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting status distribution');
    await delay(500);
    
    return {
      success: true,
      data: [
        { status: 'open', count: 28, avg_age_days: 8.3, oldest_issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), most_recent_update: new Date().toISOString() },
        { status: 'in_progress', count: 14, avg_age_days: 5.1, oldest_issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), most_recent_update: new Date().toISOString() },
        { status: 'resolved', count: 145, avg_age_days: 15.7, oldest_issue_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), most_recent_update: new Date().toISOString() },
        { status: 'closed', count: 60, avg_age_days: 32.4, oldest_issue_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), most_recent_update: new Date().toISOString() }
      ]
    };
  }

  async getPriorityBreakdown(): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting priority breakdown');
    await delay(500);
    
    return {
      success: true,
      data: [
        { priority: 'urgent', open: 5, in_progress: 3, resolved: 22, total: 30, avg_resolution_hours: 8.2 },
        { priority: 'high', open: 12, in_progress: 6, resolved: 45, total: 63, avg_resolution_hours: 18.5 },
        { priority: 'medium', open: 18, in_progress: 4, resolved: 67, total: 89, avg_resolution_hours: 32.1 },
        { priority: 'low', open: 7, in_progress: 1, resolved: 58, total: 66, avg_resolution_hours: 48.7 }
      ]
    };
  }

  async getCollectionStats(params?: any): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting collection stats', params);
    await delay(500);
    
    return {
      success: true,
      data: [
        { collection_id: '1', collection_name: 'Equipment & Tools', collection_color: '#3B82F6', issue_count: 58, resolved_count: 42, open_issues: 16, avg_resolution_hours: 28.3, most_recent_issue: new Date().toISOString() },
        { collection_id: '2', collection_name: 'Furniture & Space', collection_color: '#10B981', issue_count: 45, resolved_count: 38, open_issues: 7, avg_resolution_hours: 22.5, most_recent_issue: new Date().toISOString() },
        { collection_id: '3', collection_name: 'Technology', collection_color: '#F59E0B', issue_count: 72, resolved_count: 58, open_issues: 14, avg_resolution_hours: 35.7, most_recent_issue: new Date().toISOString() },
        { collection_id: '4', collection_name: 'HVAC & Environment', collection_color: '#EF4444', issue_count: 38, resolved_count: 32, open_issues: 6, avg_resolution_hours: 42.1, most_recent_issue: new Date().toISOString() },
        { collection_id: '5', collection_name: 'Security & Safety', collection_color: '#8B5CF6', issue_count: 34, resolved_count: 30, open_issues: 4, avg_resolution_hours: 18.9, most_recent_issue: new Date().toISOString() }
      ]
    };
  }

  async getWorkloadBalance(): Promise<ApiResponse<any[]>> {
    console.log('Mock API: Getting workload balance');
    await delay(500);
    
    return {
      success: true,
      data: [
        { user_id: '2', user_name: 'Sarah Johnson', current_workload: 12, open_count: 8, in_progress_count: 4, urgent_count: 2, overdue_count: 1, avg_workload: 8.5, workload_status: 'overloaded' },
        { user_id: '1', user_name: 'John Admin', current_workload: 9, open_count: 6, in_progress_count: 3, urgent_count: 1, overdue_count: 2, avg_workload: 8.5, workload_status: 'balanced' },
        { user_id: '3', user_name: 'Mike Wilson', current_workload: 7, open_count: 5, in_progress_count: 2, urgent_count: 0, overdue_count: 0, avg_workload: 8.5, workload_status: 'balanced' },
        { user_id: '5', user_name: 'Lisa Brown', current_workload: 4, open_count: 3, in_progress_count: 1, urgent_count: 0, overdue_count: 0, avg_workload: 8.5, workload_status: 'underutilized' }
      ]
    };
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

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Create and export singleton instance
export const mockApiService = new MockApiService();

// Export default for convenience
export default mockApiService;
