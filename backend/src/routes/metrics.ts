import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { MetricsService } from '../services/metricsService';

const router = Router();

// All metrics routes require admin role
router.use(authenticateToken);
router.use(requireRole(['admin', 'manager']));

/**
 * GET /api/metrics/overview
 * Get high-level KPI metrics
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getOverviewMetrics(
      libraryId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch overview metrics' 
    });
  }
});

/**
 * GET /api/metrics/resolution-time
 * Get resolution time metrics with breakdown
 */
router.get('/resolution-time', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy, priority, assignedTo } = req.query;
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getResolutionTimeMetrics(
      libraryId,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: (groupBy as 'day' | 'week' | 'month') || 'day',
        priority: priority as string,
        assignedTo: assignedTo as string
      }
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching resolution time metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resolution time metrics' 
    });
  }
});

/**
 * GET /api/metrics/team-performance
 * Get team performance metrics
 */
router.get('/team-performance', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getTeamPerformanceMetrics(
      libraryId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching team performance metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch team performance metrics' 
    });
  }
});

/**
 * GET /api/metrics/issue-trends
 * Get issue creation and resolution trends
 */
router.get('/issue-trends', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getIssueTrendsMetrics(
      libraryId,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: (groupBy as 'day' | 'week' | 'month') || 'day'
      }
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching issue trends metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch issue trends metrics' 
    });
  }
});

/**
 * GET /api/metrics/status-distribution
 * Get distribution of issues by status
 */
router.get('/status-distribution', async (req: Request, res: Response) => {
  try {
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getStatusDistribution(libraryId);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch status distribution' 
    });
  }
});

/**
 * GET /api/metrics/priority-breakdown
 * Get breakdown of issues by priority with metrics
 */
router.get('/priority-breakdown', async (req: Request, res: Response) => {
  try {
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getPriorityBreakdown(libraryId);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching priority breakdown:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch priority breakdown' 
    });
  }
});

/**
 * GET /api/metrics/collection-stats
 * Get statistics for each collection
 */
router.get('/collection-stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getCollectionStats(
      libraryId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch collection stats' 
    });
  }
});

/**
 * GET /api/metrics/workload-balance
 * Get workload distribution across team members
 */
router.get('/workload-balance', async (req: Request, res: Response) => {
  try {
    const libraryId = req.user?.library_id;

    if (!libraryId) {
      return res.status(400).json({ error: 'Library ID not found' });
    }

    const metrics = await MetricsService.getWorkloadBalance(libraryId);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching workload balance:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workload balance' 
    });
  }
});

export default router;

