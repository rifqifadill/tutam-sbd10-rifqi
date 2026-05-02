const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/todos', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { deadline: 'asc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/todos', async (req, res) => {
  const { task, course, deadline } = req.body;
  if (!task || !course || !deadline) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }
  try {
    const todo = await prisma.todo.create({
      data: { 
        task, 
        course, 
        deadline: new Date(deadline)
      }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { completed }
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.todo.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notes', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notes', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }
  try {
    const note = await prisma.note.create({
      data: { title, content }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.note.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const apiPrefix = process.env.VERCEL ? '/' : '/api';
app.use(apiPrefix, router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
