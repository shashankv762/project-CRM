import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from './routes/auth.js';
import orgRoutes from './routes/organizations.js';
import crmRoutes from './routes/crm.js';
import searchRoutes from './routes/search.js';
import tagRoutes from './routes/tags.js';
import aiRoutes from './routes/ai.js';
import workflowRoutes from './routes/workflows.js';
import insightRoutes from './routes/insights.js';
import webhookRoutes from './routes/webhooks.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0", architecture: "Aegix B2B SaaS" });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/organizations', orgRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/tags', tagRoutes);
  app.use('/api/ai-hub', aiRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/insights', insightRoutes);
  app.use('/api/webhooks', webhookRoutes);

  // AI Gateway mock abstraction (to keep previous logic alive)
  app.post("/api/ai/chat", async (req, res) => {
    // Basic echo for now, as we focus on the CRM platform foundation
    res.json({ response: "AI features will be re-enabled after SaaS foundation is cemented." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch(err) {
      console.log('Vite middleware could not start', err);
    }
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Aegix Platform Foundation running on http://localhost:${PORT}`);
  });
}

startServer();
