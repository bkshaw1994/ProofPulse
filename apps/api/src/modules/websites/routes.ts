import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';
import { CreateWebsiteSchema, UpdateWebsiteSchema, normalizeDomain } from '@proofpulse/validation';
import { PLAN_CONFIGS } from '@proofpulse/config';

export const websitesRouter = Router();

// List websites in workspace
websitesRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const workspaces = db.getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    throw new AppError('No active workspace found for user.', 404);
  }

  const requestedWorkspaceId = req.query.workspace_id as string;
  const workspace = requestedWorkspaceId
    ? workspaces.find((w) => w.id === requestedWorkspaceId)
    : workspaces[0];

  if (!workspace) {
    throw new AppError('Forbidden: Not a member of the requested workspace.', 403);
  }

  const websites = db.listWebsites(workspace.id);
  res.status(200).json({ data: websites });
});

// Register new website
websitesRouter.post('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const validated = CreateWebsiteSchema.parse(req.body);

  const workspaces = db.getUserWorkspaces(user.id);
  const workspace = validated.workspace_id
    ? workspaces.find((w) => w.id === validated.workspace_id)
    : workspaces[0];

  if (!workspace) {
    throw new AppError('Forbidden: Target workspace not found or inaccessible.', 403);
  }

  // Quota enforcement: check website limit for workspace plan
  const sub = db.getSubscription(workspace.id);
  const plan = PLAN_CONFIGS[sub?.plan_tier || 'free'];
  const currentSites = db.listWebsites(workspace.id);

  if (currentSites.length >= plan.features.websites_limit) {
    throw new AppError(
      `Plan website quota exceeded. Your current plan (${plan.name}) allows up to ${plan.features.websites_limit} website(s). Please upgrade to add more stores.`,
      403
    );
  }

  const domain = normalizeDomain(validated.domain);
  const { website, rawApiKey } = db.createWebsite(workspace.id, domain);

  db.logAudit(workspace.id, 'website.created', 'website', website.id, user.id, { domain });

  res.status(201).json({
    data: {
      ...website,
      private_api_key: rawApiKey
    }
  });
});

// Get website by ID
websitesRouter.get('/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const site = db.getWebsiteById(req.params.id);

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  // Authorization check: user must belong to site's workspace
  const userWorkspaces = db.getUserWorkspaces(user.id);
  const belongs = userWorkspaces.some((w) => w.id === site.workspace_id);
  if (!belongs) {
    throw new AppError('Forbidden: Access denied to this website.', 403);
  }

  res.status(200).json({ data: site });
});

// Update website
websitesRouter.patch('/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const site = db.getWebsiteById(req.params.id);

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(user.id);
  const member = userWorkspaces.find((w) => w.id === site.workspace_id);
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new AppError('Forbidden: Only workspace owners and admins can modify website settings.', 403);
  }

  const validated = UpdateWebsiteSchema.parse(req.body);
  const updates: any = {};
  if (validated.domain) {
    updates.domain = normalizeDomain(validated.domain);
    updates.canonical_url = `https://${updates.domain}`;
  }

  const updated = db.updateWebsite(site.id, updates);
  db.logAudit(site.workspace_id, 'website.updated', 'website', site.id, user.id, updates);

  res.status(200).json({ data: updated });
});

// Delete website
websitesRouter.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const site = db.getWebsiteById(req.params.id);

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(user.id);
  const member = userWorkspaces.find((w) => w.id === site.workspace_id);
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new AppError('Forbidden: Only workspace owners and admins can delete websites.', 403);
  }

  db.deleteWebsite(site.id);
  db.logAudit(site.workspace_id, 'website.deleted', 'website', site.id, user.id);

  res.status(204).send();
});

// Verify website domain ownership
websitesRouter.post('/:id/verify', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const site = db.getWebsiteById(req.params.id);

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(user.id);
  const member = userWorkspaces.find((w) => w.id === site.workspace_id);
  if (!member) {
    throw new AppError('Forbidden: Access denied.', 403);
  }

  // Mark verified
  const updated = db.updateWebsite(site.id, {
    is_verified: true,
    verified_at: new Date().toISOString()
  });

  db.logAudit(site.workspace_id, 'website.verified', 'website', site.id, user.id);

  res.status(200).json({
    data: {
      is_verified: true,
      verified_at: updated?.verified_at
    }
  });
});
