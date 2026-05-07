import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

router.get('/', async (req: TenantRequest, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) return res.json({ results: [] });

    // Parallel searches
    const [companies, contacts, leads, deals, tasks] = await Promise.all([
      prisma.company.findMany({
        where: {
          organizationId: req.tenantId,
          OR: [
            { name: { contains: query } },
            { domain: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.contact.findMany({
        where: {
          organizationId: req.tenantId,
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.lead.findMany({
        where: {
          organizationId: req.tenantId,
          OR: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.deal.findMany({
        where: {
          organizationId: req.tenantId,
          title: { contains: query }
        },
        take: 5
      }),
      prisma.task.findMany({
        where: {
          organizationId: req.tenantId,
          title: { contains: query }
        },
        take: 5
      })
    ]);

    const results = [
      ...companies.map(c => ({ id: c.id, type: 'company', label: c.name, subLabel: c.domain, url: '/companies' })),
      ...contacts.map(c => ({ id: c.id, type: 'contact', label: `${c.firstName} ${c.lastName}`, subLabel: c.email, url: '/contacts' })),
      ...leads.map(l => ({ id: l.id, type: 'lead', label: l.name, subLabel: l.email, url: '/leads' })),
      ...deals.map(d => ({ id: d.id, type: 'deal', label: d.title, subLabel: `Value: $${d.value}`, url: '/pipeline' })),
      ...tasks.map(t => ({ id: t.id, type: 'task', label: t.title, subLabel: t.status, url: '/tasks' }))
    ];

    res.json({ results });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
