import { pool } from '../database/connection';

interface ResolutionTimeOptions {
  startDate?: string;
  endDate?: string;
  groupBy: 'day' | 'week' | 'month';
  priority?: string;
  assignedTo?: string;
}

interface IssueTrendsOptions {
  startDate?: string;
  endDate?: string;
  groupBy: 'day' | 'week' | 'month';
}

export class MetricsService {
  /**
   * Get overview KPI metrics
   */
  static async getOverviewMetrics(
    libraryId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const query = `
      WITH issue_stats AS (
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open_issues,
          COUNT(*) FILTER (WHERE resolved_at >= $2 AND resolved_at <= $3) as resolved_this_period,
          COUNT(*) as total_issues,
          AVG(
            CASE 
              WHEN resolved_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
            END
          ) as avg_resolution_hours,
          AVG(
            CASE 
              WHEN (SELECT MIN(created_at) FROM issue_comments WHERE issue_id = issues.id) IS NOT NULL
              THEN EXTRACT(EPOCH FROM (
                (SELECT MIN(created_at) FROM issue_comments WHERE issue_id = issues.id) - issues.created_at
              ))/3600
            END
          ) as avg_first_response_hours,
          COUNT(*) FILTER (
            WHERE resolved_at IS NOT NULL 
            AND due_date IS NOT NULL
            AND resolved_at <= due_date
          )::FLOAT / NULLIF(COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND due_date IS NOT NULL), 0) * 100 as sla_compliance
        FROM issues
        WHERE library_id = $1
      ),
      user_stats AS (
        SELECT 
          COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL '7 days') as active_users
        FROM users
        WHERE library_id = $1 AND is_active = true
      )
      SELECT 
        i.total_issues,
        i.open_issues,
        i.resolved_this_period,
        COALESCE(i.avg_resolution_hours, 0) as avg_resolution_hours,
        COALESCE(i.avg_first_response_hours, 0) as avg_first_response_hours,
        COALESCE(i.sla_compliance, 0) as sla_compliance,
        u.active_users
      FROM issue_stats i, user_stats u;
    `;

    const result = await pool.query(query, [libraryId, start, end]);
    return result.rows[0] || {};
  }

  /**
   * Get resolution time metrics with breakdown
   */
  static async getResolutionTimeMetrics(
    libraryId: string,
    options: ResolutionTimeOptions
  ) {
    const { startDate, endDate, groupBy, priority, assignedTo } = options;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const dateGrouping = groupBy === 'week' 
      ? "DATE_TRUNC('week', created_at)" 
      : groupBy === 'month'
      ? "DATE_TRUNC('month', created_at)"
      : "DATE_TRUNC('day', created_at)";

    let whereClause = 'library_id = $1 AND created_at >= $2 AND created_at <= $3 AND resolved_at IS NOT NULL';
    const params: any[] = [libraryId, start, end];

    if (priority) {
      params.push(priority);
      whereClause += ` AND priority = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      whereClause += ` AND assigned_to = $${params.length}`;
    }

    const query = `
      SELECT 
        ${dateGrouping} as period,
        COUNT(*) as issue_count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as median_resolution_hours,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as p90_resolution_hours
      FROM issues
      WHERE ${whereClause}
      GROUP BY ${dateGrouping}
      ORDER BY period;
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get team performance metrics
   */
  static async getTeamPerformanceMetrics(
    libraryId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const query = `
      SELECT 
        u.id as user_id,
        u.first_name || ' ' || u.last_name as user_name,
        u.role,
        COUNT(i.id) as assigned_issues,
        COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN i.status IN ('open', 'in_progress') THEN 1 END) as open_issues,
        COUNT(CASE WHEN i.due_date < NOW() AND i.status NOT IN ('resolved', 'closed') THEN 1 END) as overdue_issues,
        AVG(
          CASE 
            WHEN i.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600 
          END
        ) as avg_resolution_hours,
        COUNT(DISTINCT ic.id) as comments_posted,
        MAX(i.updated_at) as last_activity
      FROM users u
      LEFT JOIN issues i ON i.assigned_to = u.id 
        AND i.created_at >= $2 
        AND i.created_at <= $3
      LEFT JOIN issue_comments ic ON ic.user_id = u.id
        AND ic.created_at >= $2
        AND ic.created_at <= $3
      WHERE u.library_id = $1
        AND u.role IN ('staff', 'admin', 'manager')
        AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY assigned_issues DESC;
    `;

    const result = await pool.query(query, [libraryId, start, end]);
    return result.rows;
  }

  /**
   * Get issue creation and resolution trends
   */
  static async getIssueTrendsMetrics(
    libraryId: string,
    options: IssueTrendsOptions
  ) {
    const { startDate, endDate, groupBy } = options;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const dateGrouping = groupBy === 'week' 
      ? "DATE_TRUNC('week', created_at)" 
      : groupBy === 'month'
      ? "DATE_TRUNC('month', created_at)"
      : "DATE_TRUNC('day', created_at)";

    const query = `
      SELECT 
        ${dateGrouping} as period,
        COUNT(*) as created,
        COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved,
        COUNT(*) - COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as net_change
      FROM issues
      WHERE library_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
      GROUP BY ${dateGrouping}
      ORDER BY period;
    `;

    const result = await pool.query(query, [libraryId, start, end]);
    return result.rows;
  }

  /**
   * Get status distribution
   */
  static async getStatusDistribution(libraryId: string) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_age_days,
        MIN(created_at) as oldest_issue_date,
        MAX(updated_at) as most_recent_update
      FROM issues
      WHERE library_id = $1
      GROUP BY status
      ORDER BY 
        CASE status
          WHEN 'open' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'closed' THEN 4
          ELSE 5
        END;
    `;

    const result = await pool.query(query, [libraryId]);
    return result.rows;
  }

  /**
   * Get priority breakdown
   */
  static async getPriorityBreakdown(libraryId: string) {
    const query = `
      SELECT 
        priority,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) as resolved,
        COUNT(*) as total,
        AVG(
          CASE 
            WHEN resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
          END
        ) as avg_resolution_hours
      FROM issues
      WHERE library_id = $1
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END;
    `;

    const result = await pool.query(query, [libraryId]);
    return result.rows;
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(
    libraryId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const query = `
      SELECT 
        c.id as collection_id,
        c.name as collection_name,
        c.colour as collection_color,
        COUNT(i.id) as issue_count,
        COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_count,
        COUNT(CASE WHEN i.status IN ('open', 'in_progress') THEN 1 END) as open_issues,
        AVG(
          CASE 
            WHEN i.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600 
          END
        ) as avg_resolution_hours,
        MAX(i.created_at) as most_recent_issue
      FROM collections c
      LEFT JOIN issues i ON i.collection_id = c.id 
        AND i.created_at >= $2 
        AND i.created_at <= $3
      WHERE c.library_id = $1 
        AND c.is_active = true
      GROUP BY c.id, c.name, c.colour
      ORDER BY issue_count DESC;
    `;

    const result = await pool.query(query, [libraryId, start, end]);
    return result.rows;
  }

  /**
   * Get workload balance across team
   */
  static async getWorkloadBalance(libraryId: string) {
    const query = `
      WITH team_workload AS (
        SELECT 
          u.id as user_id,
          u.first_name || ' ' || u.last_name as user_name,
          COUNT(i.id) FILTER (WHERE i.status IN ('open', 'in_progress')) as current_workload,
          COUNT(i.id) FILTER (WHERE i.status = 'open') as open_count,
          COUNT(i.id) FILTER (WHERE i.status = 'in_progress') as in_progress_count,
          COUNT(i.id) FILTER (WHERE i.priority = 'urgent') as urgent_count,
          COUNT(i.id) FILTER (WHERE i.due_date < NOW() AND i.status NOT IN ('resolved', 'closed')) as overdue_count
        FROM users u
        LEFT JOIN issues i ON i.assigned_to = u.id
        WHERE u.library_id = $1
          AND u.role IN ('staff', 'admin', 'manager')
          AND u.is_active = true
        GROUP BY u.id, u.first_name, u.last_name
      ),
      team_avg AS (
        SELECT AVG(current_workload) as avg_workload
        FROM team_workload
      )
      SELECT 
        tw.*,
        ta.avg_workload,
        CASE 
          WHEN tw.current_workload > ta.avg_workload * 1.5 THEN 'overloaded'
          WHEN tw.current_workload < ta.avg_workload * 0.5 THEN 'underutilized'
          ELSE 'balanced'
        END as workload_status
      FROM team_workload tw, team_avg ta
      ORDER BY current_workload DESC;
    `;

    const result = await pool.query(query, [libraryId]);
    return result.rows;
  }
}

