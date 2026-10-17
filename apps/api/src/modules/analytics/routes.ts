import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';

export const analyticsRouter = Router();

analyticsRouter.get('/websites/:websiteId/analytics', requireAuth, (req: Request, res: Response) => {
  const { websiteId } = req.params;
  const site = db.getWebsiteById(websiteId);
  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(req.user!.id);
  const belongs = userWorkspaces.some((w) => w.id === site.workspace_id);
  if (!belongs) {
    throw new AppError('Forbidden: Access denied to website analytics.', 403);
  }

  const fromDate = req.query.from as string;
  const toDate = req.query.to as string;

  const summary = db.getWebsiteAnalytics(websiteId, fromDate, toDate);
  res.status(200).json({ data: summary });
});

analyticsRouter.get('/websites/:websiteId/usage', requireAuth, (req: Request, res: Response) => {
  const { websiteId } = req.params;
  const site = db.getWebsiteById(websiteId);
  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(req.user!.id);
  const belongs = userWorkspaces.some((w) => w.id === site.workspace_id);
  if (!belongs) {
    throw new AppError('Forbidden: Access denied to usage data.', 403);
  }

  const usage = db.getUsageSummary(site.workspace_id);
  res.status(200).json({ data: usage });
});
