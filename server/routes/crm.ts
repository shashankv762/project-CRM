import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireTenant);

const getPrismaCollection = (name: string) => {
  const map: any = {
    'customers': prisma.customer,
    'leads': prisma.lead,
    'deals': prisma.deal,
    'tasks': prisma.task,
    'contacts': prisma.contact,
    'activities': prisma.activityLog
  };
  return map[name];
}

// GET /api/crm/:collection
router.get('/:collection', async (req: TenantRequest, res) => {
  try {
    const { collection } = req.params;
    const model = getPrismaCollection(collection);
    
    if (!model) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const data = await model.findMany({ where: { organizationId: req.tenantId } });
    
    // Map dates to timestamps for old UI compatibility
    const mapped = data.map((d: any) => ({
      ...d,
      createdAt: d.createdAt?.getTime(),
      updatedAt: d.updatedAt?.getTime(),
      lastContacted: d.lastContacted?.getTime(),
      dueDate: d.dueDate?.getTime(),
      expectedCloseAt: d.expectedCloseAt?.getTime()
    }));
    
    res.json(mapped);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/crm/:collection
router.post('/:collection', async (req: TenantRequest, res) => {
  try {
    const { collection } = req.params;
    const model = getPrismaCollection(collection);
    if (!model) return res.status(404).json({ error: 'Collection not found' });
    
    const body = { ...req.body, organizationId: req.tenantId };
    
    // Convert timestamps to Date objects
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.lastContacted) body.lastContacted = new Date(body.lastContacted);
    
    // Clean up unsupported fields by older logic
    delete body.ownerId; // Uses organizationId now

    const created = await model.create({ data: body });
    res.status(201).json(created);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/crm/:collection/:id
router.patch('/:collection/:id', async (req: TenantRequest, res) => {
  try {
    const { collection, id } = req.params;
    const model = getPrismaCollection(collection);
    if (!model) return res.status(404).json({ error: 'Collection not found' });

    const body = { ...req.body };
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.lastContacted) body.lastContacted = new Date(body.lastContacted);

    const updated = await model.update({
      where: { id, organizationId: req.tenantId },
      data: body
    });
    res.json(updated);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/crm/:collection/:id
router.delete('/:collection/:id', async (req: TenantRequest, res) => {
  try {
    const { collection, id } = req.params;
    const model = getPrismaCollection(collection);
    if (!model) return res.status(404).json({ error: 'Collection not found' });

    await model.delete({
      where: { id, organizationId: req.tenantId }
    });
    res.json({ success: true });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
