import React, { useState, useMemo } from 'react';
import { useMetrics } from '../hooks/useMetrics';
import MetricsOverviewCards from './MetricsOverviewCards';
import TeamPerformanceTable from './TeamPerformanceTable';
import IssueDistributionCharts from './IssueDistributionCharts';

interface MetricsDashboardProps {
  onBack: () => void;
}

type DateRangeOption = '7d' | '30d' | '90d' | 'custom';
type ActiveTab = 'overview' | 'performance' | 'trends' | 'collections';

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onBack }) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const dateRangeParams = useMemo(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    return { startDate, endDate };
  }, [dateRange, customStartDate, customEndDate]);

  const { data, isLoading, error, lastUpdated, refresh } = useMetrics(dateRangeParams);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Team Performance', icon: '👥' },
    { id: 'trends', label: 'Trends & Analysis', icon: '📈' },
    { id: 'collections', label: 'Collections', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-white">Reporting Dashboard</h1>
            </div>
            <p className="text-white opacity-90 ml-9">
              Real-time insights and analytics for your issue tracking system
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center bg-white bg-opacity-20 rounded-lg p-1">
              {[
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as DateRangeOption)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    dateRange === option.value
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Last Updated */}
            <div className="text-xs text-white bg-white bg-opacity-20 px-3 py-2 rounded-lg">
              Updated: {formatLastUpdated(lastUpdated)}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <MetricsOverviewCards metrics={data.overview} isLoading={isLoading} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <IssueDistributionCharts
              statusData={data.statusDistribution}
              priorityData={data.priorityBreakdown}
              collectionData={data.collectionStats}
              isLoading={isLoading}
            />
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <TeamPerformanceTable
              data={data.teamPerformance}
              isLoading={isLoading}
            />
            
            {/* Workload Balance */}
            {data.workloadBalance && data.workloadBalance.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload Balance</h3>
                <div className="space-y-4">
                  {data.workloadBalance.map((member) => (
                    <div key={member.user_id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {member.user_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              member.workload_status === 'overloaded'
                                ? 'bg-red-100 text-red-800'
                                : member.workload_status === 'underutilized'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {member.workload_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Current: {member.current_workload}</span>
                          <span className="text-gray-400">|</span>
                          <span>Avg: {member.avg_workload.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            member.workload_status === 'overloaded'
                              ? 'bg-red-500'
                              : member.workload_status === 'underutilized'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((member.current_workload / (member.avg_workload * 2)) * 100, 100)}%`
                          }}
                        ></div>
                        {/* Average marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
                          style={{ left: '50%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Urgent: {member.urgent_count}</span>
                        <span>Overdue: {member.overdue_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Trends</h3>
            {data.issueTrends && data.issueTrends.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase pb-2 border-b">
                  <div>Date</div>
                  <div className="text-center">Created</div>
                  <div className="text-center">Resolved</div>
                  <div className="text-center">Net Change</div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {data.issueTrends.slice(-30).reverse().map((trend, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 py-2 text-sm hover:bg-gray-50">
                      <div className="text-gray-900">
                        {new Date(trend.period).toLocaleDateString()}
                      </div>
                      <div className="text-center text-blue-600">{trend.created}</div>
                      <div className="text-center text-green-600">{trend.resolved}</div>
                      <div
                        className={`text-center font-medium ${
                          trend.net_change > 0
                            ? 'text-red-600'
                            : trend.net_change < 0
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {trend.net_change > 0 ? '+' : ''}
                        {trend.net_change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No trend data available</p>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <IssueDistributionCharts
            statusData={null}
            priorityData={null}
            collectionData={data.collectionStats}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;

