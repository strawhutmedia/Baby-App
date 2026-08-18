// First Bites family-sync server.
// Runs anywhere Node runs; on Railway attach a volume and set DATA_DIR to its
// mount path so the SQLite database survives redeploys.
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import webpush from 'web-push'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const PORT = process.env.PORT || 3001
const DATA_DIR = process.env.DATA_DIR || './data'
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'First Bites <onboarding@resend.dev>'
const APP_URL = process.env.APP_URL || 'https://first100.baby'
const emailEnabled = Boolean(RESEND_API_KEY)

fs.mkdirSync(DATA_DIR, { recursive: true })
const db = new Database(path.join(DATA_DIR, 'first-bites.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
create table if not exists users (
  id text primary key,
  email text unique not null,
  pass_hash text not null,
  created_at text not null default (datetime('now'))
);
create table if not exists sessions (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  created_at text not null default (datetime('now'))
);
create table if not exists families (
  id text primary key,
  join_code text unique not null,
  baby_name text not null,
  birthdate text not null,
  created_at text not null default (datetime('now'))
);
create table if not exists members (
  family_id text not null references families(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  display_name text not null,
  notify_email integer not null default 0,
  primary key (family_id, user_id)
);
create table if not exists tries (
  id text primary key,
  family_id text not null references families(id) on delete cascade,
  food_id text not null,
  tried_on text not null,
  rating text,
  reaction integer not null default 0,
  notes text not null default '',
  fed_by text not null default '',
  created_at text not null default (datetime('now'))
);
create index if not exists tries_family on tries(family_id);
create table if not exists food_notes (
  family_id text not null references families(id) on delete cascade,
  food_id text not null,
  body text not null default '',
  updated_at text not null default (datetime('now')),
  primary key (family_id, food_id)
);
`)

// Migration for databases created before roles existed.
try {
  db.exec(`alter table members add column role text not null default 'member'`)
} catch {
  // column already exists
}
try {
  db.exec(`alter table members add column notify_push integer not null default 0`)
} catch {
  // column already exists
}
db.exec(`
create table if not exists push_subs (
  endpoint text primary key,
  user_id text not null references users(id) on delete cascade,
  sub_json text not null,
  created_at text not null default (datetime('now'))
);
`)

// Web push (free, no third-party account): VAPID keys are generated once and
// persisted next to the database so subscriptions survive restarts.
const vapidPath = path.join(DATA_DIR, 'vapid.json')
let vapid
if (fs.existsSync(vapidPath)) {
  vapid = JSON.parse(fs.readFileSync(vapidPath, 'utf8'))
} else {
  vapid = webpush.generateVAPIDKeys()
  fs.writeFileSync(vapidPath, JSON.stringify(vapid))
}
webpush.setVapidDetails('mailto:hello@first100.baby', vapid.publicKey, vapid.privateKey)

// ---------- helpers ----------
const uid = () => crypto.randomUUID()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'))
}
function makeJoinCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L lookalikes
  for (;;) {
    let code = ''
    for (let i = 0; i < 6; i++) code += alphabet[crypto.randomInt(alphabet.length)]
    if (!db.prepare('select 1 from families where join_code = ?').get(code)) return code
  }
}
function memberOf(userId) {
  return db
    .prepare(
      `select m.family_id, m.display_name, m.notify_email, m.notify_push, m.role, f.join_code, f.baby_name, f.birthdate
       from members m join families f on f.id = m.family_id where m.user_id = ?`,
    )
    .get(userId)
}
function familyPayload(userId) {
  const m = memberOf(userId)
  if (!m) return { family: null, members: [], myName: null, notifyEmail: false, notifyPush: false, myRole: null }
  const members = db
    .prepare(
      'select user_id as userId, display_name as displayName, notify_email as notifyEmail, role from members where family_id = ? order by role desc, display_name',
    )
    .all(m.family_id)
    .map((x) => ({ userId: x.userId, displayName: x.displayName, notifyEmail: Boolean(x.notifyEmail), role: x.role }))
  return {
    family: { id: m.family_id, joinCode: m.join_code, babyName: m.baby_name, birthdate: m.birthdate },
    members,
    myName: m.display_name,
    notifyEmail: Boolean(m.notify_email),
    notifyPush: Boolean(m.notify_push),
    myRole: m.role,
  }
}

async function sendEmail(to, subject, text) {
  if (!emailEnabled) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, text }),
    })
  } catch (e) {
    console.error('email send failed:', e.message)
  }
}

function notifyFamily(familyId, actorUserId, message) {
  const fam = db.prepare('select baby_name from families where id = ?').get(familyId)
  const title = `🥣 ${fam.baby_name} tried something new!`
  if (emailEnabled) {
    const rows = db
      .prepare(
        `select u.email from members m join users u on u.id = m.user_id
         where m.family_id = ? and m.notify_email = 1 and m.user_id != ?`,
      )
      .all(familyId, actorUserId)
    for (const r of rows) {
      sendEmail(r.email, title, `${message}\n\nSee the full journal: ${APP_URL}`)
    }
  }
  const pushRows = db
    .prepare(
      `select p.endpoint, p.sub_json from members m join push_subs p on p.user_id = m.user_id
       where m.family_id = ? and m.notify_push = 1 and m.user_id != ?`,
    )
    .all(familyId, actorUserId)
  const payload = JSON.stringify({ title, body: message, url: APP_URL })
  for (const r of pushRows) {
    webpush.sendNotification(JSON.parse(r.sub_json), payload).catch((e) => {
      // Expired or revoked subscription — drop it.
      if (e.statusCode === 404 || e.statusCode === 410) {
        db.prepare('delete from push_subs where endpoint = ?').run(r.endpoint)
      }
    })
  }
}

// ---------- app ----------
const app = express()
app.use(cors()) // public API; data protected by bearer tokens, not origin
app.use(express.json({ limit: '1mb' }))

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '')
  const session = token && db.prepare('select user_id from sessions where token = ?').get(token)
  if (!session) return res.status(401).json({ error: 'Not signed in' })
  req.userId = session.user_id
  req.token = token
  next()
}
function requireFamily(req, res, next) {
  const m = memberOf(req.userId)
  if (!m) return res.status(400).json({ error: 'No family yet' })
  req.familyId = m.family_id
  req.myName = m.display_name
  next()
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/config', (_req, res) => res.json({ emailEnabled }))

app.post('/api/signup', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'That email doesn\'t look right' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (db.prepare('select 1 from users where email = ?').get(email))
    return res.status(400).json({ error: 'That email already has an account — sign in instead' })
  const id = uid()
  db.prepare('insert into users (id, email, pass_hash) values (?, ?, ?)').run(id, email, hashPassword(password))
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare('insert into sessions (token, user_id) values (?, ?)').run(token, id)
  res.json({ token, user: { id, email } })
})

app.post('/api/signin', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const user = db.prepare('select * from users where email = ?').get(email)
  if (!user || !verifyPassword(password, user.pass_hash))
    return res.status(401).json({ error: 'Wrong email or password' })
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare('insert into sessions (token, user_id) values (?, ?)').run(token, user.id)
  res.json({ token, user: { id: user.id, email: user.email } })
})

app.post('/api/signout', auth, (req, res) => {
  db.prepare('delete from sessions where token = ?').run(req.token)
  res.json({ ok: true })
})

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('select id, email from users where id = ?').get(req.userId)
  res.json({ user, ...familyPayload(req.userId) })
})

app.put('/api/me', auth, requireFamily, (req, res) => {
  if (typeof req.body.displayName === 'string' && req.body.displayName.trim()) {
    db.prepare('update members set display_name = ? where family_id = ? and user_id = ?').run(
      req.body.displayName.trim(),
      req.familyId,
      req.userId,
    )
  }
  if (typeof req.body.notifyEmail === 'boolean') {
    db.prepare('update members set notify_email = ? where family_id = ? and user_id = ?').run(
      req.body.notifyEmail ? 1 : 0,
      req.familyId,
      req.userId,
    )
  }
  if (typeof req.body.notifyPush === 'boolean') {
    db.prepare('update members set notify_push = ? where family_id = ? and user_id = ?').run(
      req.body.notifyPush ? 1 : 0,
      req.familyId,
      req.userId,
    )
  }
  res.json(familyPayload(req.userId))
})

// Change sign-in email and/or password. Requires the current password.
app.put('/api/account', auth, (req, res) => {
  const user = db.prepare('select * from users where id = ?').get(req.userId)
  const current = String(req.body.currentPassword || '')
  if (!current || !verifyPassword(current, user.pass_hash))
    return res.status(401).json({ error: 'Current password is wrong' })
  if (req.body.email !== undefined) {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'That email doesn\'t look right' })
    const taken = db.prepare('select 1 from users where email = ? and id != ?').get(email, req.userId)
    if (taken) return res.status(400).json({ error: 'That email is already used by another account' })
    db.prepare('update users set email = ? where id = ?').run(email, req.userId)
  }
  if (req.body.newPassword !== undefined) {
    const next = String(req.body.newPassword || '')
    if (next.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
    db.prepare('update users set pass_hash = ? where id = ?').run(hashPassword(next), req.userId)
    // Sign out every other device; this session stays valid.
    db.prepare('delete from sessions where user_id = ? and token != ?').run(req.userId, req.token)
  }
  const updated = db.prepare('select id, email from users where id = ?').get(req.userId)
  res.json({ user: updated })
})

app.get('/api/push/key', (_req, res) => res.json({ publicKey: vapid.publicKey }))

app.post('/api/push/subscribe', auth, (req, res) => {
  const sub = req.body.subscription
  if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid push subscription' })
  db.prepare(
    `insert into push_subs (endpoint, user_id, sub_json) values (?, ?, ?)
     on conflict(endpoint) do update set user_id=excluded.user_id, sub_json=excluded.sub_json`,
  ).run(sub.endpoint, req.userId, JSON.stringify(sub))
  res.json({ ok: true })
})

app.post('/api/push/unsubscribe', auth, (req, res) => {
  const endpoint = String(req.body.endpoint || '')
  db.prepare('delete from push_subs where endpoint = ? and user_id = ?').run(endpoint, req.userId)
  res.json({ ok: true })
})

app.post('/api/family', auth, (req, res) => {
  if (memberOf(req.userId)) return res.status(400).json({ error: 'You are already in a family' })
  const babyName = String(req.body.babyName || '').trim()
  const birthdate = String(req.body.birthdate || '').trim()
  const displayName = String(req.body.displayName || '').trim() || 'Parent'
  if (!babyName || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate))
    return res.status(400).json({ error: 'Baby name and birthdate are required' })
  const id = uid()
  db.prepare('insert into families (id, join_code, baby_name, birthdate) values (?, ?, ?, ?)').run(
    id,
    makeJoinCode(),
    babyName,
    birthdate,
  )
  db.prepare("insert into members (family_id, user_id, display_name, role) values (?, ?, ?, 'owner')").run(
    id,
    req.userId,
    displayName,
  )
  res.json(familyPayload(req.userId))
})

// Owner: remove a member (not yourself — transfer or delete-family flows handle that).
app.post('/api/members/remove', auth, requireFamily, (req, res) => {
  const me = memberOf(req.userId)
  if (me.role !== 'owner') return res.status(403).json({ error: 'Only the family owner can remove members' })
  const target = String(req.body.userId || '')
  if (target === req.userId) return res.status(400).json({ error: 'You can\'t remove yourself — transfer ownership first' })
  db.prepare('delete from members where family_id = ? and user_id = ?').run(req.familyId, target)
  res.json(familyPayload(req.userId))
})

// Owner: hand the family to another member.
app.post('/api/family/transfer', auth, requireFamily, (req, res) => {
  const me = memberOf(req.userId)
  if (me.role !== 'owner') return res.status(403).json({ error: 'Only the family owner can transfer ownership' })
  const target = String(req.body.userId || '')
  const exists = db.prepare('select 1 from members where family_id = ? and user_id = ?').get(req.familyId, target)
  if (!exists) return res.status(404).json({ error: 'That person isn\'t in the family' })
  db.prepare("update members set role = 'member' where family_id = ? and user_id = ?").run(req.familyId, req.userId)
  db.prepare("update members set role = 'owner' where family_id = ? and user_id = ?").run(req.familyId, target)
  res.json(familyPayload(req.userId))
})

// Any non-owner member can leave on their own.
app.post('/api/members/leave', auth, requireFamily, (req, res) => {
  const me = memberOf(req.userId)
  if (me.role === 'owner')
    return res.status(400).json({ error: 'Owners must transfer ownership before leaving' })
  db.prepare('delete from members where family_id = ? and user_id = ?').run(req.familyId, req.userId)
  res.json(familyPayload(req.userId))
})

app.post('/api/family/join', auth, (req, res) => {
  if (memberOf(req.userId)) return res.status(400).json({ error: 'You are already in a family' })
  const code = String(req.body.code || '').trim().toUpperCase()
  const displayName = String(req.body.displayName || '').trim() || 'Family member'
  const fam = db.prepare('select id from families where join_code = ?').get(code)
  if (!fam) return res.status(404).json({ error: 'No family found for that code' })
  db.prepare('insert into members (family_id, user_id, display_name) values (?, ?, ?)').run(
    fam.id,
    req.userId,
    displayName,
  )
  res.json(familyPayload(req.userId))
})

app.put('/api/baby', auth, requireFamily, (req, res) => {
  const name = String(req.body.name || '').trim()
  const birthdate = String(req.body.birthdate || '').trim()
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) return res.status(400).json({ error: 'Invalid name or birthdate' })
  db.prepare('update families set baby_name = ?, birthdate = ? where id = ?').run(name, birthdate, req.familyId)
  res.json(familyPayload(req.userId))
})

app.get('/api/state', auth, requireFamily, (req, res) => {
  const tries = db
    .prepare('select id, food_id, tried_on, rating, reaction, notes, fed_by from tries where family_id = ?')
    .all(req.familyId)
  const log = {}
  for (const t of tries) {
    ;(log[t.food_id] ||= []).push({
      id: t.id,
      date: t.tried_on,
      rating: t.rating,
      reaction: Boolean(t.reaction),
      notes: t.notes,
      by: t.fed_by,
    })
  }
  for (const arr of Object.values(log)) arr.sort((a, b) => (a.date < b.date ? -1 : 1))
  const notes = {}
  for (const n of db.prepare('select food_id, body from food_notes where family_id = ?').all(req.familyId)) {
    if (n.body) notes[n.food_id] = n.body
  }
  res.json({ log, notes })
})

app.put('/api/tries', auth, requireFamily, (req, res) => {
  const t = req.body
  if (!t.id || !t.foodId || !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date || '')))
    return res.status(400).json({ error: 'Invalid try entry' })
  const isNew = !db.prepare('select 1 from tries where id = ?').get(t.id)
  db.prepare(
    `insert into tries (id, family_id, food_id, tried_on, rating, reaction, notes, fed_by)
     values (?, ?, ?, ?, ?, ?, ?, ?)
     on conflict(id) do update set tried_on=excluded.tried_on, rating=excluded.rating,
       reaction=excluded.reaction, notes=excluded.notes, fed_by=excluded.fed_by`,
  ).run(
    t.id,
    req.familyId,
    String(t.foodId),
    String(t.date),
    t.rating ? String(t.rating) : null,
    t.reaction ? 1 : 0,
    String(t.notes || ''),
    String(t.by || ''),
  )
  if (isNew) {
    const firstTimeFood = db.prepare('select count(*) as c from tries where family_id = ? and food_id = ?').get(req.familyId, String(t.foodId)).c === 1
    if (firstTimeFood) {
      const who = t.by || req.myName || 'Someone'
      notifyFamily(req.familyId, req.userId, `${who} logged a new first food: ${t.foodId.replace(/-/g, ' ')} (${t.date}).`)
    }
  }
  res.json({ ok: true })
})

app.delete('/api/tries/:id', auth, requireFamily, (req, res) => {
  db.prepare('delete from tries where id = ? and family_id = ?').run(req.params.id, req.familyId)
  res.json({ ok: true })
})

app.delete('/api/tries/food/:foodId', auth, requireFamily, (req, res) => {
  db.prepare('delete from tries where family_id = ? and food_id = ?').run(req.familyId, req.params.foodId)
  res.json({ ok: true })
})

app.put('/api/notes/:foodId', auth, requireFamily, (req, res) => {
  const body = String(req.body.body || '').trim()
  if (body) {
    db.prepare(
      `insert into food_notes (family_id, food_id, body, updated_at) values (?, ?, ?, datetime('now'))
       on conflict(family_id, food_id) do update set body=excluded.body, updated_at=excluded.updated_at`,
    ).run(req.familyId, req.params.foodId, body)
  } else {
    db.prepare('delete from food_notes where family_id = ? and food_id = ?').run(req.familyId, req.params.foodId)
  }
  res.json({ ok: true })
})

app.listen(PORT, () => console.log(`First Bites server on :${PORT} (data: ${DATA_DIR}, email: ${emailEnabled ? 'on' : 'off'})`))
