const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'sleepflow.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nights (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    date TEXT NOT NULL,
    weekday_label TEXT NOT NULL,
    events_count INTEGER NOT NULL,
    snore_minutes INTEGER NOT NULL,
    sleep_duration_hours REAL NOT NULL,
    severity TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL
  );
`);

const statements = {
  getUser: db.prepare('SELECT email, password FROM users WHERE email = ?'),
  createUser: db.prepare('INSERT INTO users (email, password) VALUES (?, ?)'),
  listNights: db.prepare('SELECT * FROM nights WHERE email = ? ORDER BY date ASC'),
  insertNight: db.prepare(`
    INSERT INTO nights (id, email, date, weekday_label, events_count, snore_minutes, sleep_duration_hours, severity)
    VALUES (@id, @email, @date, @weekdayLabel, @eventsCount, @snoreMinutes, @sleepDurationHours, @severity)
  `),
  listRecords: db.prepare('SELECT * FROM records WHERE email = ? ORDER BY created_at ASC'),
  insertRecord: db.prepare('INSERT INTO records (id, email, created_at, payload) VALUES (?, ?, ?, ?)'),
};

function nightRowToNight(row) {
  return {
    id: row.id,
    date: row.date,
    weekdayLabel: row.weekday_label,
    eventsCount: row.events_count,
    snoreMinutes: row.snore_minutes,
    sleepDurationHours: row.sleep_duration_hours,
    severity: row.severity,
  };
}

function getUser(email) {
  return statements.getUser.get(email);
}

function createUser(email, password) {
  statements.createUser.run(email, password);
}

function listNights(email) {
  return statements.listNights.all(email).map(nightRowToNight);
}

function insertNight(email, night) {
  statements.insertNight.run({ ...night, email });
}

function listRecords(email) {
  return statements.listRecords.all(email).map((row) => ({
    ...JSON.parse(row.payload),
    id: row.id,
    createdAt: row.created_at,
  }));
}

function insertRecord(email, id, createdAt, record) {
  statements.insertRecord.run(id, email, createdAt, JSON.stringify(record));
}

module.exports = {
  getUser,
  createUser,
  listNights,
  insertNight,
  listRecords,
  insertRecord,
};
