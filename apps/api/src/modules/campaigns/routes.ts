import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';
import { CreateCampaignSchema, UpdateCampaignSchema } from '@proofpulse/validation';

export const campaignsRouter = Router();

// Helper to check website ownership for current user
function verifyWebsiteAccess(websiteId: string, userId: string) {
  const site = db.getWebsiteById(websiteId);
  if (!site) {
    throw new AppError('Website not found.', 404);
  }
  const userWorkspaces = db.getUserWorkspaces(userId);
  const member = userWorkspaces.find((w) => w.id === site.workspace_id);
  if (!member) {
    throw new AppError('Forbidden: Access denied to website campaigns.', 403);
  }
  return { site, member };
}

// List campaigns for a website
campaignsRouter.get('/websites/:websiteId/campaigns', requireAuth, (req: Request, res: Response) => {
  const { websiteId } = req.params;
  verifyWebsiteAccess(websiteId, req.user!.id);

  const campaigns = db.listCampaigns(websiteId);
  res.status(200).json({ data: campaigns });
});

// Create campaign
campaignsRouter.post('/websites/:websiteId/campaigns', requireAuth, (req: Request, res: Response) => {
  const { websiteId } = req.params;
  const { site } = verifyWebsiteAccess(websiteId, req.user!.id);

  const validated = CreateCampaignSchema.parse(req.body);

  const campaign = db.createCampaign(websiteId, {
    ...validated,
    status: 'draft',
    priority: 1,
    start_time: validated.start_time || null,
    end_time: validated.end_time || null
  });

  db.logAudit(site.workspace_id, 'campaign.created', 'campaign', campaign.id, req.user!.id, {
    notification_type: campaign.notification_type,
    name: campaign.name
  });

  res.status(201).json({ data: campaign });
});

// Get campaign by ID
campaignsRouter.get('/campaigns/:id', requireAuth, (req: Request, res: Response) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    throw new AppError('Campaign not found.', 404);
  }
  verifyWebsiteAccess(campaign.website_id, req.user!.id);

  res.status(200).json({ data: campaign });
});

// Update campaign
campaignsRouter.patch('/campaigns/:id', requireAuth, (req: Request, res: Response) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    throw new AppError('Campaign not found.', 404);
  }
  const { site } = verifyWebsiteAccess(campaign.website_id, req.user!.id);

  const validated = UpdateCampaignSchema.parse(req.body);
  const updated = db.updateCampaign(campaign.id, validated as any);

  db.logAudit(site.workspace_id, 'campaign.updated', 'campaign', campaign.id, req.user!.id, validated);

  res.status(200).json({ data: updated });
});

// Delete campaign
campaignsRouter.delete('/campaigns/:id', requireAuth, (req: Request, res: Response) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    throw new AppError('Campaign not found.', 404);
  }
  const { site } = verifyWebsiteAccess(campaign.website_id, req.user!.id);

  db.deleteCampaign(campaign.id);
  db.logAudit(site.workspace_id, 'campaign.deleted', 'campaign', campaign.id, req.user!.id);

  res.status(204).send();
});

// Activate campaign (enforces event source requirement)
campaignsRouter.post('/campaigns/:id/activate', requireAuth, (req: Request, res: Response) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    throw new AppError('Campaign not found.', 404);
  }
  const { site } = verifyWebsiteAccess(campaign.website_id, req.user!.id);

  // Verification gate: Check if low_stock or genuine_countdown have valid config
  if (campaign.notification_type === 'genuine_countdown') {
    const deadline = campaign.config.countdown_end_time || campaign.end_time;
    if (!deadline || new Date(deadline).getTime() <= Date.now()) {
      throw new AppError(
        'Cannot activate countdown campaign: Genuine deadline must be configured in the future.',
        400
      );
    }
  }

  const updated = db.updateCampaign(campaign.id, { status: 'active' });
  db.logAudit(site.workspace_id, 'campaign.activated', 'campaign', campaign.id, req.user!.id);

  res.status(200).json({ data: updated });
});

// Pause campaign
campaignsRouter.post('/campaigns/:id/pause', requireAuth, (req: Request, res: Response) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    throw new AppError('Campaign not found.', 404);
  }
  const { site } = verifyWebsiteAccess(campaign.website_id, req.user!.id);

  const updated = db.updateCampaign(campaign.id, { status: 'paused' });
  db.logAudit(site.workspace_id, 'campaign.paused', 'campaign', campaign.id, req.user!.id);

  res.status(200).json({ data: updated });
});
