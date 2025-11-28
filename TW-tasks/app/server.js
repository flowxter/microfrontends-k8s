const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8084;
const HEALTH_PORT = process.env.HEALTH_PORT || 84;

// =====================
//  Middleware
// =====================
app.use(express.json());

// =====================
//  Archivos estáticos
// =====================
app.use('/static', express.static(path.join(__dirname, 'static')));

// =====================
//  Datos en memoria
// =====================
let tasks = [];
let nextId = 1;

// =====================
//  Ruta principal
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// =====================
//  API REST
// =====================

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'title required' });
    }

    const task = {
        id: nextId++,
        title,
        description: description || '',
        done: false,
        createdAt: Date.now()
    };

    tasks.push(task);
    res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ error: 'not found' });
    }

    const { title, description, done } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (done !== undefined) task.done = !!done;

    res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const before = tasks.length;

    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length === before) {
        return res.status(404).json({ error: 'not found' });
    }

    res.status(204).end();
});

// =====================
//  Health Check Server
// =====================
const healthApp = express();

healthApp.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'tw-tasks',
        timestamp: new Date().toISOString()
    });
});

healthApp.listen(HEALTH_PORT, () => {
    console.log(`[TASKS] Health check running on port ${HEALTH_PORT}`);
});

// =====================
//  Servidor principal
// =====================
app.listen(PORT, () => {
    console.log(`[TASKS] Microfrontend TW-tasks running on port ${PORT}`);
    console.log(`[TASKS] Environment: ${process.env.NODE_ENV || 'development'}`);
});