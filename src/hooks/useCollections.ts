import { useState, useEffect, useCallback } from 'react';
import { api, Collection } from '../services/apiFactory';

interface UseCollectionsReturn {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  refreshCollections: () => Promise<void>;
}

export const useCollections = (): UseCollectionsReturn => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getCollections();
      
      if (response.success) {
        setCollections(response.data || []);
      } else {
        throw new Error('Failed to fetch collections');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch collections';
      setError(errorMessage);
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCollections = useCallback(async () => {
    await fetchCollections();
  }, [fetchCollections]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    isLoading,
    error,
    fetchCollections,
    refreshCollections,
  };
};
