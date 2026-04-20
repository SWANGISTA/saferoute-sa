const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const user = {
      id: result.id,
      name: result.name,
      email: result.email,
      created_at: result.createdAt
    };
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to log in' });
  }
});

module.exports = router;
