import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// Middleware to check authentication (would be replaced by actual auth in production)
const checkAuth = (req: any, res: any, next: any) => {
  if (!req.tenantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(checkAuth);

// Get all webhooks
router.get('/', async (req: any, res) => {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { organizationId: req.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(webhooks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create webhook
router.post('/', async (req: any, res) => {
  try {
    const { name, url, events } = req.body;
    
    // Validate
    if (!name || !url || !events || !Array.isArray(events)) {
       return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhook = await prisma.webhook.create({
      data: {
        organizationId: req.tenantId,
        name,
        url,
        events: JSON.stringify(events),
        secret: Math.random().toString(36).substring(2, 15) // Generate simple secret
      }
    });
    
    res.json(webhook);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete webhook
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.webhook.delete({
      where: { id, organizationId: req.tenantId }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
