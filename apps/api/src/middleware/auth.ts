import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { WorkspaceRole } from '@proofpulse/shared-types';
import { db } from '../data/store';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      correlationId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7).trim();

  // Handle mock / test tokens or Supabase JWT decoding
  try {
    if (token.startsWith('mock_user_') || token.startsWith('test_')) {
      // Deterministic test token: format 'mock_user_<uuid>' or 'test_token'
      const userId = token.replace('mock_user_', '').replace('test_token_', '');
      const user = db.getProfileById(userId) || {
        id: userId.length === 36 ? userId : '00000000-0000-0000-0000-000000000001',
        email: 'merchant@example.com',
        full_name: 'Merchant Test User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      req.user = user;
    } else {
      // In production / Supabase integration: decode JWT payload
      // Base64URL decode middle segment
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        req.user = {
          id: payload.sub || payload.id,
          email: payload.email || 'user@example.com',
          full_name: payload.user_metadata?.full_name || payload.name
        };
      } else {
        // Fallback default dev user
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@proofpulse.in',
          full_name: 'Default Admin'
        };
      }
    }
  } catch (e) {
    // Malformed token
    req.user = undefined;
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AppError('Authentication required. Missing or invalid Bearer token.', 401);
  }
  next();
}

export function requireWorkspaceAccess(minimumRole: WorkspaceRole = 'viewer') {
  const roleHierarchy: Record<WorkspaceRole, number> = {
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4
  };

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const workspaceId =
      (req.params.workspaceId as string) ||
      (req.query.workspace_id as string) ||
      (req.body?.workspace_id as string);

    // If no workspace context provided, check user's primary workspace
    const userWorkspaces = db.getUserWorkspaces(req.user.id);
    if (userWorkspaces.length === 0) {
      throw new AppError('User does not belong to any active workspace.', 403);
    }

    const targetWorkspace = workspaceId
      ? userWorkspaces.find((w) => w.id === workspaceId)
      : userWorkspaces[0];

    if (!targetWorkspace) {
      throw new AppError('Access denied: You are not a member of this workspace.', 403);
    }

    const userRole = targetWorkspace.role as WorkspaceRole;
    if (roleHierarchy[userRole] < roleHierarchy[minimumRole]) {
      throw new AppError(
        `Insufficient permissions. Requires minimum role: ${minimumRole}. Current role: ${userRole}`,
        403
      );
    }

    (req as any).workspace = targetWorkspace;
    next();
  };
}
