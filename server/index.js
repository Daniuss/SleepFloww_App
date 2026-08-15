const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;

// Tudo em memória — sem banco de dados. Reinicia o servidor, perde os dados.
const users = new Map(); // email -> { password }
const sessions = new Map(); // token -> email
const nightsByUser = new Map(); // email -> Night[]
const recordsByUser = new Map(); // email -> ManualRecord[]

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function seedNights() {
  const nights = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const eventsCount = Math.floor(Math.random() * 12) + 1;
    nights.push({
      id: crypto.randomUUID(),
      date: date.toISOString().slice(0, 10),
      weekdayLabel: WEEKDAY_LABELS[date.getDay()],
      eventsCount,
      snoreMinutes: Math.floor(Math.random() * 50) + 5,
      sleepDurationHours: Math.round((Math.random() * 2.5 + 5.5) * 10) / 10,
      severity: eventsCount <= 4 ? 'baixo' : eventsCount <= 8 ? 'moderado' : 'alto',
    });
  }
  return nights;
}

const app = express();
app.use(cors());
app.use(express.json());

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const email = token && sessions.get(token);
  if (!email) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  req.email = email;
  next();
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || email.trim().length <= 3 || password.length < 4) {
    return res.status(400).json({ error: 'E-mail (4+ caracteres) e senha (4+ caracteres) são obrigatórios' });
  }

  const existing = users.get(email);
  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
  } else {
    users.set(email, { password });
    nightsByUser.set(email, seedNights());
    recordsByUser.set(email, []);
  }

  const token = crypto.randomUUID();
  sessions.set(token, email);
  res.json({ token, email });
});

app.get('/nights', requireAuth, (req, res) => {
  res.json(nightsByUser.get(req.email) || []);
});

app.post('/records', requireAuth, (req, res) => {
  const record = { ...req.body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const list = recordsByUser.get(req.email) || [];
  list.push(record);
  recordsByUser.set(req.email, list);
  res.status(201).json(record);
});

app.get('/records', requireAuth, (req, res) => {
  res.json(recordsByUser.get(req.email) || []);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SleepFlow backend rodando em http://0.0.0.0:${PORT}`);
});
