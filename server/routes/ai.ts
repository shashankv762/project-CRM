import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../middlewares/auth.js';
import { requireTenant, TenantRequest } from '../middlewares/tenant.js';
import { prisma } from '../lib/prisma.js';

const router = Router();
router.use(requireAuth);
router.use(requireTenant);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generic AI Chat Endpoint (Streaming Context-Aware)
router.post('/chat', async (req: TenantRequest, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Add some context about the organization to the system prompt
    // In a real app we'd fetch top deals, leads, etc to inject context.
    const orgData = await prisma.organization.findUnique({
      where: { id: req.tenantId },
      include: {
        deals: { where: { stage: { notIn: ['closed_won', 'closed_lost'] } }, take: 10, orderBy: { value: 'desc' } }
      }
    });

    const activeDeals = orgData?.deals.map(d => `${d.title} ($${d.value})`).join(', ');

    const systemInstruction = `You are Aegix AI, an elite AI assistant for a CRM platform. 
    You are helping the user in the context of their organization. 
    Here is some context: Active Deals: ${activeDeals || 'None'}.
    Answer concisely and intelligently.`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
         systemInstruction: { parts: [{ text: systemInstruction }] },
      }
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
       res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// AI Deal/Lead Scoring Endpoint
router.post('/score-deal', async (req: TenantRequest, res) => {
  try {
    const { dealId } = req.body;
    let entityId = dealId;
    let entityData = null;
    let type = 'deal';

    if (dealId) {
       entityData = await prisma.deal.findUnique({
         where: { id: dealId, organizationId: req.tenantId },
         include: { notes: true, activities: true, company: true }
       });
    }

    if (!entityData) return res.status(404).json({ error: 'Entity not found' });

    const prompt = `Analyze this ${type} and provide a JSON response with 'score' (0-100) and 'reasoning'. Data: ${JSON.stringify(entityData)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch(e) {
      result = { score: 50, reasoning: 'Failed to process AI response' };
    }

    // Save to AI Insights
    await prisma.aIInsight.create({
      data: {
        organizationId: req.tenantId!,
        entityType: type,
        entityId: entityId,
        type: 'score',
        score: result.score,
        content: result.reasoning
      }
    });

    res.json(result);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Summary Endpoint
router.post('/summary', async (req: TenantRequest, res) => {
  try {
    const { entityId, entityType } = req.body;
    let data;

    if (entityType === 'deal') {
       data = await prisma.deal.findUnique({ where: { id: entityId, organizationId: req.tenantId }, include: { notes: true, activities: true } });
    } else if (entityType === 'lead') {
       data = await prisma.lead.findUnique({ where: { id: entityId, organizationId: req.tenantId }, include: { notes: true, activities: true } });
    } else if (entityType === 'company') {
       data = await prisma.company.findUnique({ where: { id: entityId, organizationId: req.tenantId }, include: { notes: true, activities: true } });
    } else if (entityType === 'contact') {
       data = await prisma.contact.findUnique({ where: { id: entityId, organizationId: req.tenantId }, include: { notes: true, activities: true } });
    }

    if (!data) return res.status(404).json({ error: 'Entity not found' });

    const prompt = `Act as an elite Sales CRM Assistant. Provide a concise 3-bullet summary of the recent activity and status for this ${entityType}. Data: ${JSON.stringify(data)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summaryText = response.text || 'No summary generated.';

    // Save insight
    await prisma.aIInsight.create({
      data: {
        organizationId: req.tenantId!,
        entityType: entityType,
        entityId: entityId,
        type: 'summary',
        content: summaryText
      }
    });

    res.json({ summary: summaryText });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
