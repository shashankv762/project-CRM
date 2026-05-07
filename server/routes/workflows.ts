import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

// Get all workflows
router.get('/', async (req: TenantRequest, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { organizationId: req.tenantId! },
      orderBy: { createdAt: 'desc' }
    });
    res.json(workflows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create workflow
router.post('/', async (req: TenantRequest, res) => {
  try {
    const { name, description, triggerType, triggerConfig, actions } = req.body;
    
    const workflow = await prisma.workflow.create({
      data: {
        organizationId: req.tenantId!,
        name,
        description,
        triggerType,
        triggerConfig: JSON.stringify(triggerConfig || {}),
        actions: JSON.stringify(actions || [])
      }
    });

    res.json(workflow);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update workflow toggle
router.put('/:id', async (req: TenantRequest, res) => {
  try {
    const { isActive } = req.body;
    const workflow = await prisma.workflow.update({
      where: { id: req.params.id, organizationId: req.tenantId! },
      data: { isActive }
    });
    res.json(workflow);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get executions
router.get('/:id/executions', async (req: TenantRequest, res) => {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: req.params.id },
      orderBy: { startedAt: 'desc' },
      take: 20
    });
    res.json(executions);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
