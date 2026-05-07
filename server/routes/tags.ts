import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

// Get all tags for org
router.get('/', async (req: TenantRequest, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { organizationId: req.tenantId! },
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new tag
router.post('/', async (req: TenantRequest, res) => {
  try {
    const { name, color } = req.body;
    let tag = await prisma.tag.findUnique({
      where: {
        organizationId_name: {
          organizationId: req.tenantId!,
          name: name.toLowerCase().trim()
        }
      }
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          organizationId: req.tenantId!,
          name: name.toLowerCase().trim(),
          color: color || '#e2e8f0'
        }
      });
    }

    res.json(tag);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get tag links for an entity
router.get('/links', async (req: TenantRequest, res) => {
  try {
    const { entityId, entityType } = req.query;
    if (!entityId || !entityType) {
      return res.status(400).json({ error: "Missing entityId or entityType" });
    }

    const where: any = {};
    where[`${entityType}Id`] = entityId;

    const links = await prisma.tagLink.findMany({
      where,
      include: { tag: true }
    });
    
    // return array of tags directly for convenience
    res.json(links.map(l => l.tag));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Link a tag
router.post('/links', async (req: TenantRequest, res) => {
  try {
    const { tagId, entityId, entityType } = req.body;
    
    const data: any = { tagId };
    data[`${entityType}Id`] = entityId;

    const existing = await prisma.tagLink.findFirst({
      where: data
    });

    if (!existing) {
      await prisma.tagLink.create({ data });
    }

    res.json({ success: true });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Unlink a tag
router.delete('/links', async (req: TenantRequest, res) => {
  try {
    const { tagId, entityId, entityType } = req.query;
    
    const where: any = { tagId: String(tagId) };
    where[`${entityType}Id`] = String(entityId);

    const link = await prisma.tagLink.findFirst({ where });
    if (link) {
      await prisma.tagLink.delete({ where: { id: link.id } });
    }

    res.json({ success: true });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
