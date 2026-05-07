import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Register User (and optionally create first organization)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    // Create organization if provided
    let org = null;
    if (organizationName) {
      org = await prisma.organization.create({
        data: {
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          ownerId: user.id,
          settings: {
            create: {} // default settings
          },
          subscription: {
            create: { planTier: 'FREE', features: '[]' }
          }
        }
      });
      
      // Create Admin Role
      const role = await prisma.role.create({
        data: {
          name: 'Admin',
          organizationId: org.id,
          isSystem: true
        }
      });

      // Tie user to org via membership
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          roleId: role.id
        }
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });

    res.status(201).json({ user, organization: org, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });

    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get Current Auth State
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true
          }
        }
      }
    });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
