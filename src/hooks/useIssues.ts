import { useState, useEffect, useCallback } from 'react';
import { api, Issue, CreateIssueRequest, UpdateIssueRequest } from '../services/apiFactory';

interface UseIssuesReturn {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  fetchIssues: (params?: {
    type?: 'problem' | 'suggestion';
    status?: string;
    search?: string;
  }) => Promise<void>;
  createIssue: (issueData: CreateIssueRequest) => Promise<Issue>;
  updateIssue: (id: string, issueData: UpdateIssueRequest) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  refreshIssues: () => Promise<void>;
}

export const useIssues = (): UseIssuesReturn => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async (params?: {
    type?: 'problem' | 'suggestion';
    status?: string;
    search?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getIssues({
        page: 1,
        limit: 100, // Get all issues for now
        ...params,
      });
      
      if (response.success) {
        setIssues(response.data);
      } else {
        throw new Error('Failed to fetch issues');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
      setError(errorMessage);
      console.error('Error fetching issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIssue = useCallback(async (issueData: CreateIssueRequest): Promise<Issue> => {
    try {
      setError(null);
      
      const response = await api.createIssue(issueData);
      
      if (response.success && response.data) {
        const newIssue = response.data;
        setIssues(prev => [newIssue, ...prev]);
        return newIssue;
      } else {
        throw new Error(response.message || 'Failed to create issue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create issue';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateIssue = useCallback(async (id: string, issueData: UpdateIssueRequest): Promise<Issue> => {
    try {
      setError(null);
      
      const response = await api.updateIssue(id, issueData);
      
      if (response.success && response.data) {
        const updatedIssue = response.data;
        setIssues(prev => 
          prev.map(issue => issue.id === id ? updatedIssue : issue)
        );
        return updatedIssue;
      } else {
        throw new Error(response.message || 'Failed to update issue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update issue';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteIssue = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await api.deleteIssue(id);
      
      if (response.success) {
        setIssues(prev => prev.filter(issue => issue.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete issue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete issue';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshIssues = useCallback(async () => {
    await fetchIssues();
  }, [fetchIssues]);

  // Initial fetch on mount
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    isLoading,
    error,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    refreshIssues,
  };
};
