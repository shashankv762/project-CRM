import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../lib/prisma.js';

export interface TenantRequest extends AuthRequest {
  tenantId?: string;
  organization?: any;
  tenantRole?: string;
}

export const requireTenant = async (req: TenantRequest, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required in x-tenant-id header' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: tenantId,
        },
      },
      include: {
        organization: true,
        role: true,
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this organization' });
    }

    req.tenantId = tenantId;
    req.organization = membership.organization;
    req.tenantRole = membership.role.name;

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
