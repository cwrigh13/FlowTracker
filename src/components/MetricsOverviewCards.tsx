import React from 'react';
import type { MetricsOverview } from '../services/apiFactory';

interface MetricsOverviewCardsProps {
  metrics: MetricsOverview | null;
  isLoading: boolean;
}

const MetricsOverviewCards: React.FC<MetricsOverviewCardsProps> = ({ metrics, isLoading }) => {
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  const cards = [
    {
      title: 'Avg Resolution Time',
      value: metrics ? formatHours(metrics.avg_resolution_hours) : '-',
      icon: '⏱️',
      color: 'blue',
      description: 'Average time to resolve issues'
    },
    {
      title: 'Open Issues',
      value: metrics ? metrics.open_issues.toString() : '-',
      icon: '📋',
      color: 'orange',
      description: `${metrics?.total_issues || 0} total issues`
    },
    {
      title: 'SLA Compliance',
      value: metrics ? formatPercent(metrics.sla_compliance) : '-',
      icon: '✅',
      color: metrics && metrics.sla_compliance >= 90 ? 'green' : metrics && metrics.sla_compliance >= 75 ? 'yellow' : 'red',
      description: 'Issues resolved within SLA'
    },
    {
      title: 'Active Users',
      value: metrics ? metrics.active_users.toString() : '-',
      icon: '👥',
      color: 'purple',
      description: 'Active in last 7 days'
    },
    {
      title: 'Resolved This Period',
      value: metrics ? metrics.resolved_this_period.toString() : '-',
      icon: '🎯',
      color: 'green',
      description: 'Issues completed'
    },
    {
      title: 'First Response Time',
      value: metrics ? formatHours(metrics.avg_first_response_hours) : '-',
      icon: '⚡',
      color: 'teal',
      description: 'Average time to first response'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' }
    };
    return colors[color] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md border ${colors.border} p-6 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </h3>
            <div className={`text-3xl font-bold ${colors.text} mb-1`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsOverviewCards;

