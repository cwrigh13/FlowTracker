import React from 'react';
import type { StatusDistribution, PriorityBreakdown, CollectionStats } from '../services/apiFactory';

interface IssueDistributionChartsProps {
  statusData: StatusDistribution[] | null;
  priorityData: PriorityBreakdown[] | null;
  collectionData: CollectionStats[] | null;
  isLoading: boolean;
}

const IssueDistributionCharts: React.FC<IssueDistributionChartsProps> = ({
  statusData,
  priorityData,
  collectionData,
  isLoading
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#F59E0B',
      in_progress: '#3B82F6',
      resolved: '#10B981',
      closed: '#6B7280'
    };
    return colors[status] || '#9CA3AF';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: '#DC2626',
      high: '#F97316',
      medium: '#FBBF24',
      low: '#10B981'
    };
    return colors[priority] || '#9CA3AF';
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  const statusTotal = statusData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const priorityTotal = priorityData?.reduce((sum, item) => sum + item.total, 0) || 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Status</h3>
          <div className="space-y-4">
            {statusData?.map((item) => {
              const percentage = calculatePercentage(item.count, statusTotal);
              const color = getStatusColor(item.status);
              
              return (
                <div key={item.status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Avg age: {item.avg_age_days.toFixed(1)} days
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Priority</h3>
          <div className="space-y-4">
            {priorityData?.map((item) => {
              const percentage = calculatePercentage(item.total, priorityTotal);
              const color = getPriorityColor(item.priority);
              
              return (
                <div key={item.priority}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.priority}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.total}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Open: {item.open}</span>
                    <span>In Progress: {item.in_progress}</span>
                    <span>Resolved: {item.resolved}</span>
                  </div>
                  {item.avg_resolution_hours && (
                    <div className="text-xs text-gray-500 mt-1">
                      Avg resolution: {formatHours(item.avg_resolution_hours)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Collection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collectionData?.map((collection) => {
                const resolutionRate = collection.issue_count > 0
                  ? ((collection.resolved_count / collection.issue_count) * 100).toFixed(0)
                  : '0';
                
                return (
                  <tr key={collection.collection_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: collection.collection_color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {collection.collection_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {collection.issue_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collection.open_issues > 10 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {collection.open_issues}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {collection.resolved_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${resolutionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{resolutionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {collection.avg_resolution_hours ? formatHours(collection.avg_resolution_hours) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssueDistributionCharts;

