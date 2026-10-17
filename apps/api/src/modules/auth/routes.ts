import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { db } from '../../data/store';

export const authRouter = Router();

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const workspaces = db.getUserWorkspaces(user.id);

  res.status(200).json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'Merchant Admin'
      },
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        role: w.role
      }))
    }
  });
});
