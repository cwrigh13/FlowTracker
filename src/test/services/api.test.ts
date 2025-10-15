import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as api from '../../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should make a POST request to login endpoint', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', role: 'staff' },
        token: 'mock-jwt-token'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.login({
        email: 'test@example.com',
        password: 'password123',
        library_slug: 'test-library'
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          library_slug: 'test-library'
        })
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

      await expect(api.login({
        email: 'test@example.com',
        password: 'wrongpassword',
        library_slug: 'test-library'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.login({
        email: 'test@example.com',
        password: 'password123',
        library_slug: 'test-library'
      })).rejects.toThrow('Network error');
    });
  });

  describe('verifyToken', () => {
    it('should make a GET request to verify endpoint with token', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'staff' };
      const token = 'mock-jwt-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      });

      const result = await api.verifyToken(token);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error for invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid token' })
      });

      await expect(api.verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('getIssues', () => {
    it('should make a GET request to issues endpoint', async () => {
      const mockIssues = [
        { id: '1', title: 'Test Issue', status: 'open' },
        { id: '2', title: 'Another Issue', status: 'closed' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ issues: mockIssues })
      });

      const result = await api.getIssues();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/issues', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual({ issues: mockIssues });
    });

    it('should include query parameters when provided', async () => {
      const mockIssues = [{ id: '1', title: 'Test Issue', status: 'open' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ issues: mockIssues })
      });

      await api.getIssues({ status: 'open', type: 'problem' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/issues?status=open&type=problem',
        expect.any(Object)
      );
    });
  });

  describe('createIssue', () => {
    it('should make a POST request to create issue', async () => {
      const issueData = {
        title: 'New Issue',
        description: 'Issue description',
        item_id: 'ITEM-001',
        status: 'open',
        type: 'problem' as const,
        priority: 'medium' as const,
        collection_ids: ['collection-1']
      };

      const mockIssue = { id: '1', ...issueData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ issue: mockIssue })
      });

      const result = await api.createIssue(issueData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData)
      });

      expect(result).toEqual({ issue: mockIssue });
    });
  });

  describe('updateIssue', () => {
    it('should make a PUT request to update issue', async () => {
      const issueId = 'issue-1';
      const updateData = {
        title: 'Updated Issue',
        status: 'in_progress' as const
      };

      const mockIssue = { id: issueId, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ issue: mockIssue })
      });

      const result = await api.updateIssue(issueId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3001/api/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      expect(result).toEqual({ issue: mockIssue });
    });
  });

  describe('deleteIssue', () => {
    it('should make a DELETE request to delete issue', async () => {
      const issueId = 'issue-1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await api.deleteIssue(issueId);

      expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3001/api/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });
  });

  describe('getCollections', () => {
    it('should make a GET request to collections endpoint', async () => {
      const mockCollections = [
        { id: '1', name: 'Books', color: '#3B82F6' },
        { id: '2', name: 'DVDs', color: '#EF4444' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ collections: mockCollections })
      });

      const result = await api.getCollections();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/collections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual({ collections: mockCollections });
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(api.getIssues()).rejects.toThrow('Invalid JSON');
    });

    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(api.getIssues()).rejects.toThrow('Internal Server Error');
    });
  });
});
