import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();

// Get all orgs for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user.id },
      include: { organization: true, role: true }
    });
    res.json(memberships);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new org
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    // Use transaction for multiple operations
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name, slug, ownerId: req.user.id }
      });
      await tx.organizationSettings.create({ data: { organizationId: org.id } });
      await tx.subscription.create({ data: { organizationId: org.id, features: '[]' } });
      const role = await tx.role.create({ data: { name: 'Admin', isSystem: true, organizationId: org.id } });
      const membership = await tx.organizationMember.create({ data: { userId: req.user.id, organizationId: org.id, roleId: role.id } });
      return { org, role, membership };
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Organization Context details (Needs X-Tenant-Id)
router.get('/context', requireTenant, async (req: TenantRequest, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.tenantId },
      include: { settings: true, subscription: true }
    });
    res.json({ organization: org, role: req.tenantRole });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
