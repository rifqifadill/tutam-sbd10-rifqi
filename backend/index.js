const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tutam-sbd10-rifqi-secret-key';

app.use(cors());
app.use(express.json());

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Silakan login terlebih dahulu' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesi habis, silakan login ulang' });
    req.user = user;
    next();
  });
};

router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, name: name || email.split('@')[0] }
    });
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    res.status(500).json({ error: 'Email sudah terdaftar' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.id },
      orderBy: { deadline: 'asc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/todos', authenticateToken, async (req, res) => {
  const { task, course, deadline } = req.body;
  if (!task || !course || !deadline) return res.status(400).json({ error: 'Data tidak lengkap' });
  try {
    const todo = await prisma.todo.create({
      data: { task, course, deadline: new Date(deadline), userId: req.user.id }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const todo = await prisma.todo.update({
      where: { id, userId: req.user.id },
      data: { completed }
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.todo.delete({
      where: { id, userId: req.user.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notes', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Data tidak lengkap' });
  try {
    const note = await prisma.note.create({
      data: { title, content, userId: req.user.id }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/notes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const note = await prisma.note.update({
      where: { id, userId: req.user.id },
      data: { title, content }
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/notes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.note.delete({
      where: { id, userId: req.user.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', (req, res) => res.json({ status: 'ok' }));

const apiPrefix = process.env.VERCEL ? '/' : '/api';
app.use(apiPrefix, router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
