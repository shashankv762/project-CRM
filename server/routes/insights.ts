import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

router.get('/', async (req: TenantRequest, res) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: { organizationId: req.tenantId! },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
