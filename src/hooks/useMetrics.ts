import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/apiFactory';
import type {
  MetricsOverview,
  ResolutionTimeData,
  TeamPerformanceData,
  IssueTrendsData,
  StatusDistribution,
  PriorityBreakdown,
  CollectionStats,
  WorkloadBalance
} from '../services/apiFactory';

interface UseMetricsOptions {
  startDate?: Date;
  endDate?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface MetricsData {
  overview: MetricsOverview | null;
  resolutionTime: ResolutionTimeData[] | null;
  teamPerformance: TeamPerformanceData[] | null;
  issueTrends: IssueTrendsData[] | null;
  statusDistribution: StatusDistribution[] | null;
  priorityBreakdown: PriorityBreakdown[] | null;
  collectionStats: CollectionStats[] | null;
  workloadBalance: WorkloadBalance[] | null;
}

export const useMetrics = (options: UseMetricsOptions = {}) => {
  const { startDate, endDate, autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<MetricsData>({
    overview: null,
    resolutionTime: null,
    teamPerformance: null,
    issueTrends: null,
    statusDistribution: null,
    priorityBreakdown: null,
    collectionStats: null,
    workloadBalance: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const formatDate = (date?: Date) => {
    return date?.toISOString();
  };

  const fetchAllMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dateParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      };

      // Fetch all metrics in parallel
      const [
        overviewRes,
        resolutionTimeRes,
        teamPerformanceRes,
        issueTrendsRes,
        statusDistributionRes,
        priorityBreakdownRes,
        collectionStatsRes,
        workloadBalanceRes
      ] = await Promise.all([
        api.getMetricsOverview(dateParams),
        api.getResolutionTimeMetrics({ ...dateParams, groupBy: 'day' }),
        api.getTeamPerformanceMetrics(dateParams),
        api.getIssueTrendsMetrics({ ...dateParams, groupBy: 'day' }),
        api.getStatusDistribution(),
        api.getPriorityBreakdown(),
        api.getCollectionStats(dateParams),
        api.getWorkloadBalance()
      ]);

      setData({
        overview: overviewRes.data || null,
        resolutionTime: resolutionTimeRes.data || null,
        teamPerformance: teamPerformanceRes.data || null,
        issueTrends: issueTrendsRes.data || null,
        statusDistribution: statusDistributionRes.data || null,
        priorityBreakdown: priorityBreakdownRes.data || null,
        collectionStats: collectionStatsRes.data || null,
        workloadBalance: workloadBalanceRes.data || null,
      });

      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Initial fetch - only run when dates change
  useEffect(() => {
    fetchAllMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAllMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchAllMetrics
  };
};

