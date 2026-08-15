const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const PORT = process.env.PORT || 4000;

// Sessões continuam em memória (token -> email): se o servidor reiniciar,
// todos precisam logar de novo, mas os dados (users/nights/records) persistem
// no SQLite (sleepflow.db).
const sessions = new Map();

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

  const existing = db.getUser(email);
  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
  } else {
    db.createUser(email, password);
  }

  const token = crypto.randomUUID();
  sessions.set(token, email);
  res.json({ token, email });
});

app.get('/nights', requireAuth, (req, res) => {
  res.json(db.listNights(req.email));
});

app.post('/nights', requireAuth, (req, res) => {
  const { date, weekdayLabel, eventsCount, snoreMinutes, sleepDurationHours, severity } = req.body || {};

  if (
    typeof date !== 'string' ||
    typeof weekdayLabel !== 'string' ||
    typeof eventsCount !== 'number' ||
    typeof snoreMinutes !== 'number' ||
    typeof sleepDurationHours !== 'number' ||
    typeof severity !== 'string'
  ) {
    return res.status(400).json({ error: 'Resumo da noite incompleto' });
  }

  const night = {
    id: crypto.randomUUID(),
    date,
    weekdayLabel,
    eventsCount,
    snoreMinutes,
    sleepDurationHours,
    severity,
  };
  db.insertNight(req.email, night);
  res.status(201).json(night);
});

app.post('/records', requireAuth, (req, res) => {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.insertRecord(req.email, id, createdAt, req.body || {});
  res.status(201).json({ ...req.body, id, createdAt });
});

app.get('/records', requireAuth, (req, res) => {
  res.json(db.listRecords(req.email));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SleepFlow backend rodando em http://0.0.0.0:${PORT}`);
});
