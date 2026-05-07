import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

const getPrismaCollection = (name: string) => {
  const map: any = {
    'companies': prisma.company,
    'leads': prisma.lead,
    'deals': prisma.deal,
    'tasks': prisma.task,
    'contacts': prisma.contact,
    'activities': prisma.activityLog,
    'pipelines': prisma.pipeline,
    'stages': prisma.stage,
    'notes': prisma.note,
    'tags': prisma.tag,
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

    // Auto-log creation to ActivityLog
    let title = '';
    let content = '';
    if (collection === 'tasks') {
      title = `Created Task: ${body.title}`;
      content = body.description || '(No description)';
    } else if (collection === 'notes') {
       title = 'Added Note';
       content = body.content || '';
    } else if (collection === 'deals') {
       title = `Created Deal: ${body.title}`;
       content = `Value: $${body.value}`;
    }

    if (title) {
       try {
          await prisma.activityLog.create({
             data: {
                organizationId: req.tenantId!,
                type: collection === 'notes' ? 'note' : 'system',
                title,
                content,
                userId: (req as any).user?.id,
                dealId: created.dealId || (collection === 'deals' ? created.id : null),
                companyId: created.companyId || (collection === 'companies' ? created.id : null),
                contactId: created.contactId || (collection === 'contacts' ? created.id : null),
                leadId: created.leadId || (collection === 'leads' ? created.id : null),
             }
          });
       } catch(e) {}
    }

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

    // Get current to compare
    const current = await model.findUnique({ where: { id, organizationId: req.tenantId } });

    const updated = await model.update({
      where: { id, organizationId: req.tenantId },
      data: body
    });

    // Auto-log status or stage changes
    if (current) {
      if (body.status && body.status !== current.status) {
        let title = '';
        if (collection === 'leads') title = `Lead status changed to ${body.status}`;
        if (collection === 'tasks') title = `Task status changed to ${body.status}`;
        
        if (title) {
          try {
            await prisma.activityLog.create({
              data: {
                organizationId: req.tenantId!,
                type: 'system',
                title,
                content: `Changed from ${current.status || 'unknown'} to ${body.status}`,
                userId: (req as any).user?.id, 
                // We'll set the appropriate related ref:
                [`${collection.replace(/s$/, '')}Id`]: updated.id
              }
            });
          } catch(e) {}
        }
      }
      
      if (body.stage && body.stage !== current.stage && collection === 'deals') {
         try {
           await prisma.activityLog.create({
             data: {
                organizationId: req.tenantId!,
                type: 'system',
                title: `Deal stage changed to ${body.stage.replace('_', ' ')}`,
                content: `Moved from ${current.stage.replace('_', ' ')}`,
                userId: (req as any).user?.id,
                dealId: updated.id
             }
           });
         } catch(e) {}
      }
    }

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
