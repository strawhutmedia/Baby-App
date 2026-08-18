import { useEffect, useMemo, useRef, useState } from 'react'
import { FOODS, CATEGORIES, ALLERGENS, AGE_BANDS, bandForAgeMonths } from './data/foods.js'
import { useLocalStorage } from './lib/storage.js'
import { ageInMonths, formatAge, formatDate, todayISO } from './lib/age.js'
import * as cloud from './lib/cloud.js'

const RATINGS = [
  { key: 'loved', label: 'Loved it', emoji: '😍' },
  { key: 'ok', label: 'It was ok', emoji: '😐' },
  { key: 'refused', label: 'Refused', emoji: '🙅' },
]

const HAZARD_META = {
  high: { label: 'High choking risk — prep carefully', cls: 'hazard-high', icon: '⚠️' },
  moderate: { label: 'Moderate choking risk', cls: 'hazard-mod', icon: '△' },
  low: { label: 'Low choking risk', cls: 'hazard-low', icon: '✓' },
}

const MILESTONES = [
  [100, '💯 ALL 100 FOODS! Your baby is officially a tiny gourmand. Incredible work!'],
  [75, '🌟 75 foods — three quarters of the way. What a little foodie!'],
  [50, '🎉 Halfway there — 50 foods tried!'],
  [25, '🚀 25 foods down. You two are on a roll!'],
  [10, '🥳 First 10 foods — the hardest part is behind you!'],
  [1, '🎊 First food logged — the adventure begins!'],
]

const uid = () =>
  (window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

export default function App() {
  const [profile, setProfile] = useLocalStorage('fb.profile', null)
  const [log, setLog] = useLocalStorage('fb.log', {}) // { foodId: [{id, date, rating, reaction, notes, by}] }
  const [notes, setNotes] = useLocalStorage('fb.notes', {}) // { foodId: 'quick note' }
  const [caregivers, setCaregivers] = useLocalStorage('fb.caregivers', [])
  const [feeder, setFeeder] = useLocalStorage('fb.feeder', '')
  const [tab, setTab] = useState('home')
  const [openFoodId, setOpenFoodId] = useState(null)

  // ----- family sync (active when the app was built with VITE_API_URL) -----
  const [account, setAccount] = useState(null) // null = signed out; {user, family, members, myName, notifyEmail}
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const accountRef = useRef(null)
  accountRef.current = account

  useEffect(() => {
    if (!cloud.cloudEnabled) return
    let cancelled = false
    cloud
      .getMe()
      .then((me) => {
        if (cancelled) return
        setAccount(me)
        if (me?.family) connectFamily(me)
      })
      .catch(() => {})
    cloud.getConfig().then((c) => !cancelled && setEmailEnabled(Boolean(c.emailEnabled))).catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function connectFamily(me) {
    try {
      const remote = await cloud.fetchState()
      const syncedKey = 'fb.syncedFamily'
      if (window.localStorage.getItem(syncedKey) !== me.family.id) {
        // First connection from this device: upload local history the family doesn't have.
        const cloudIds = new Set(Object.values(remote.log).flat().map((e) => e.id))
        for (const [foodId, entries] of Object.entries(log)) {
          for (const e of entries) {
            // History logged before sign-in gets attributed to whoever uploads it.
            const entry = { ...e, id: e.id || uid(), by: e.by || me.myName || '' }
            if (!cloudIds.has(entry.id)) await cloud.pushTry(foodId, entry)
          }
        }
        for (const [foodId, body] of Object.entries(notes)) {
          if (!remote.notes[foodId]) await cloud.pushNote(foodId, body)
        }
        window.localStorage.setItem(syncedKey, me.family.id)
        const merged = await cloud.fetchState()
        setLog(merged.log)
        setNotes(merged.notes)
      } else {
        setLog(remote.log)
        setNotes(remote.notes)
      }
      setProfile({ name: me.family.babyName, birthdate: me.family.birthdate })
      setSyncMsg('')
    } catch (e) {
      setSyncMsg(`Sync problem: ${e.message || e}`)
    }
  }

  // Refresh from the family when the app regains focus (someone else may have logged a food).
  useEffect(() => {
    if (!cloud.cloudEnabled) return
    const refresh = () => {
      if (accountRef.current?.family && document.visibilityState === 'visible') {
        cloud
          .fetchState()
          .then(({ log: l, notes: n }) => {
            setLog(l)
            setNotes(n)
          })
          .catch(() => {
            // Possibly removed from the family — re-check who we are.
            cloud.getMe().then(setAccount).catch(() => {})
          })
      }
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const synced = Boolean(account?.family)
  const currentFeeder = synced ? account.myName : feeder

  // ----- mutations (optimistic local write; push to family when synced) -----
  function addTry(foodId, partial) {
    const entry = { id: uid(), by: currentFeeder || '', ...partial }
    setLog((prev) => ({ ...prev, [foodId]: [...(prev[foodId] || []), entry] }))
    if (synced) cloud.pushTry(foodId, entry).catch((e) => setSyncMsg(`Sync problem: ${e.message}`))
  }
  function removeTry(foodId, index) {
    const entry = (log[foodId] || [])[index]
    setLog((prev) => {
      const next = (prev[foodId] || []).filter((_, i) => i !== index)
      const copy = { ...prev }
      if (next.length === 0) delete copy[foodId]
      else copy[foodId] = next
      return copy
    })
    if (synced && entry?.id) cloud.deleteTryById(entry.id).catch(() => {})
  }
  function checkOff(foodId) {
    addTry(foodId, { date: todayISO(), rating: null, reaction: false, notes: '' })
  }
  function uncheck(foodId, foodName) {
    const count = (log[foodId] || []).length
    const msg =
      count > 1
        ? `Un-checking ${foodName} will delete all ${count} logged tries. Sure?`
        : `Un-check ${foodName}?`
    if (window.confirm(msg)) {
      setLog((prev) => {
        const copy = { ...prev }
        delete copy[foodId]
        return copy
      })
      if (synced) cloud.deleteTriesForFood(foodId).catch(() => {})
    }
  }
  function setNote(foodId, text) {
    const body = text.trim()
    setNotes((prev) => {
      const copy = { ...prev }
      if (body) copy[foodId] = body
      else delete copy[foodId]
      return copy
    })
    if (synced) cloud.pushNote(foodId, body).catch(() => {})
  }
  function saveProfile(next) {
    setProfile(next)
    if (synced) {
      cloud
        .updateBaby(next.name, next.birthdate)
        .then((payload) => setAccount((a) => a && { ...a, ...payload }))
        .catch(() => {})
    }
  }
  function importBackup(data) {
    let added = 0
    const nextLog = { ...log }
    for (const [foodId, entries] of Object.entries(data.log || {})) {
      if (!FOODS.some((f) => f.id === foodId)) continue
      const existing = nextLog[foodId] || []
      const ids = new Set(existing.map((e) => e.id))
      const sig = new Set(existing.map((e) => `${e.date}|${e.rating}|${e.notes}`))
      for (const e of entries) {
        if (e.id && ids.has(e.id)) continue
        if (!e.id && sig.has(`${e.date}|${e.rating}|${e.notes}`)) continue
        const entry = { ...e, id: e.id || uid() }
        nextLog[foodId] = [...(nextLog[foodId] || []), entry]
        added++
        if (synced) cloud.pushTry(foodId, entry).catch(() => {})
      }
    }
    setLog(nextLog)
    const nextNotes = { ...notes }
    for (const [foodId, body] of Object.entries(data.notes || {})) {
      if (!nextNotes[foodId] && body) {
        nextNotes[foodId] = body
        if (synced) cloud.pushNote(foodId, body).catch(() => {})
      }
    }
    setNotes(nextNotes)
    return added
  }

  const months = ageInMonths(profile?.birthdate)
  const band = bandForAgeMonths(months)

  async function handleSignIn(email, password, mode) {
    setSyncMsg('')
    if (mode === 'signup') await cloud.signUp(email, password)
    else await cloud.signIn(email, password)
    const me = await cloud.getMe()
    setAccount(me)
    if (me?.family) await connectFamily(me) // sets the baby profile → leaves onboarding
    return me
  }

  if (!profile) {
    return <Onboarding onDone={setProfile} canSignIn={cloud.cloudEnabled} onSignIn={handleSignIn} />
  }

  const openFood = openFoodId ? FOODS.find((f) => f.id === openFoodId) : null

  const familyProps = {
    account,
    emailEnabled,
    syncMsg,
    onSignIn: handleSignIn,
    onSignOut: async () => {
      await cloud.signOut()
      window.localStorage.removeItem('fb.syncedFamily')
      setAccount(null)
    },
    onCreateFamily: async (displayName) => {
      const payload = await cloud.createFamily(profile.name, profile.birthdate, displayName)
      const me = { ...account, ...payload }
      setAccount(me)
      await connectFamily(me)
    },
    onJoinFamily: async (code, displayName) => {
      const payload = await cloud.joinFamily(code, displayName)
      const me = { ...account, ...payload }
      setAccount(me)
      await connectFamily(me)
    },
    onRename: async (name) => {
      const payload = await cloud.updateMe({ displayName: name })
      setAccount((a) => a && { ...a, ...payload })
    },
    onToggleNotify: async (value) => {
      const payload = await cloud.updateMe({ notifyEmail: value })
      setAccount((a) => a && { ...a, ...payload })
    },
    onTogglePush: async (value) => {
      const payload = value ? await cloud.enablePush() : await cloud.disablePush()
      setAccount((a) => a && { ...a, ...payload })
    },
    onRemoveMember: async (userId) => {
      const payload = await cloud.removeMember(userId)
      setAccount((a) => a && { ...a, ...payload })
    },
    onTransfer: async (userId) => {
      const payload = await cloud.transferOwnership(userId)
      setAccount((a) => a && { ...a, ...payload })
    },
    onLeave: async () => {
      await cloud.leaveFamily()
      window.localStorage.removeItem('fb.syncedFamily')
      const me = await cloud.getMe()
      setAccount(me)
    },
    onUpdateAccount: async (fields) => {
      const { user } = await cloud.updateAccount(fields)
      setAccount((a) => a && { ...a, user })
    },
  }

  return (
    <div className="app">
      <main className="main">
        {openFood ? (
          <FoodDetail
            key={openFood.id}
            food={openFood}
            band={band}
            entries={log[openFood.id] || []}
            note={notes[openFood.id] || ''}
            onSetNote={(t) => setNote(openFood.id, t)}
            onBack={() => setOpenFoodId(null)}
            onAddTry={(entry) => addTry(openFood.id, entry)}
            onRemoveTry={(i) => removeTry(openFood.id, i)}
          />
        ) : tab === 'home' ? (
          <Home
            profile={profile}
            months={months}
            log={log}
            onOpenFood={setOpenFoodId}
            onGoChecklist={() => setTab('first100')}
          />
        ) : tab === 'first100' ? (
          <First100
            log={log}
            notes={notes}
            onOpenFood={setOpenFoodId}
            onCheck={checkOff}
            onUncheck={uncheck}
            onSetNote={setNote}
          />
        ) : tab === 'journal' ? (
          <Journal log={log} onOpenFood={setOpenFoodId} />
        ) : (
          <Profile
            profile={profile}
            months={months}
            log={log}
            notes={notes}
            onSave={saveProfile}
            onResetLog={() => setLog({})}
            onImport={importBackup}
            caregivers={caregivers}
            setCaregivers={setCaregivers}
            feeder={feeder}
            setFeeder={setFeeder}
            familyProps={familyProps}
          />
        )}
      </main>

      {!openFood && (
        <nav className="tabbar">
          <TabButton id="home" icon="🏠" label="Home" tab={tab} setTab={setTab} />
          <TabButton id="first100" icon="✅" label="First 100" tab={tab} setTab={setTab} />
          <TabButton id="journal" icon="📖" label="Journal" tab={tab} setTab={setTab} />
          <TabButton id="baby" icon="👶" label="Baby" tab={tab} setTab={setTab} />
        </nav>
      )}
    </div>
  )
}

function TabButton({ id, icon, label, tab, setTab }) {
  return (
    <button className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  )
}

/* ---------- Onboarding ---------- */

function Onboarding({ onDone, canSignIn, onSignIn }) {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  async function submitSignIn() {
    setBusy(true)
    setErr('')
    try {
      const me = await onSignIn(email, pw, 'signin')
      if (me && !me.family) {
        // Signed in, but this account has no family yet — finish setup below.
        setSigningIn(false)
        setNotice('Signed in! Now set up your baby below, then start or join the family from the Baby tab.')
      }
      // With a family, the profile arrives automatically and this screen closes.
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="onboard">
      <div className="onboard-card page">
        <div className="onboard-logo">🥣</div>
        <h1>First Bites</h1>
        {!signingIn ? (
          <>
            <p className="muted">
              The first 100 foods, free forever: how to serve each one safely by age, a checklist
              to tick off every new taste, and space for your notes. No subscription, ever.
            </p>
            {notice && <p className="small" style={{ color: 'var(--green)' }}>{notice}</p>}
            <label className="field">
              <span>Baby's name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juniper" />
            </label>
            <label className="field">
              <span>Birthdate</span>
              <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} max={todayISO()} />
            </label>
            <button
              className="btn primary big"
              disabled={!name.trim() || !birthdate}
              onClick={() => onDone({ name: name.trim(), birthdate })}
            >
              Let's eat! 🎉
            </button>
            {canSignIn && !notice && (
              <p className="small" style={{ marginTop: 14 }}>
                Already in the family?{' '}
                <button className="link" onClick={() => setSigningIn(true)}>Sign in</button>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="muted">
              Welcome back! Sign in and your family's checklist appears right where you left it.
            </p>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </label>
            {err && <p className="small" style={{ color: 'var(--red)' }}>{err}</p>}
            <button
              className="btn primary big"
              disabled={busy || !email || pw.length < 6}
              onClick={submitSignIn}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="small" style={{ marginTop: 14 }}>
              New here?{' '}
              <button className="link" onClick={() => { setSigningIn(false); setErr('') }}>
                Set up your baby instead
              </button>
            </p>
          </>
        )}
        <p className="fineprint">
          General information only, not medical advice. Always supervise eating, and talk to your
          pediatrician about starting solids and introducing allergens — especially if your baby
          has eczema or an existing food allergy.
        </p>
      </div>
    </div>
  )
}

/* ---------- First 100 checklist (with built-in search & filters) ---------- */

function First100({ log, notes, onOpenFood, onCheck, onUncheck, onSetNote }) {
  const [editingNote, setEditingNote] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filter, setFilter] = useState('all') // all | untried | tried | allergen | iron

  const triedCount = FOODS.filter((f) => log[f.id]).length
  const pct = Math.round((triedCount / FOODS.length) * 100)
  const milestone = MILESTONES.find(([n]) => triedCount >= n)

  const matches = (f) => {
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false
    if (category !== 'all' && f.category !== category) return false
    if (filter === 'untried' && log[f.id]) return false
    if (filter === 'tried' && !log[f.id]) return false
    if (filter === 'allergen' && !f.allergen) return false
    if (filter === 'iron' && !f.ironRich) return false
    return true
  }

  const visibleCategories = CATEGORIES.map((cat) => ({
    cat,
    all: FOODS.filter((f) => f.category === cat.id),
    shown: FOODS.filter((f) => f.category === cat.id && matches(f)),
  })).filter((g) => g.shown.length > 0)

  return (
    <div className="page">
      <header>
        <h1>The First 100 Foods</h1>
        <p className="muted small">
          Tick off every new food your baby tries — tap a food for its full guide.
        </p>
      </header>

      <div className="card progress-card">
        <div className="progress-nums">
          <span className="progress-count">{triedCount}</span>
          <span className="muted"> / 100 foods tried</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {milestone && <p className="milestone">{milestone[1]}</p>}
        {!milestone && <p className="muted small">Log the first food to start the streak! 🎊</p>}
      </div>

      <input
        className="search"
        placeholder="Search foods…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="chip-row">
        <Chip active={category === 'all'} onClick={() => setCategory('all')}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      <div className="chip-row">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Everything</Chip>
        <Chip active={filter === 'untried'} onClick={() => setFilter('untried')}>Not tried</Chip>
        <Chip active={filter === 'tried'} onClick={() => setFilter('tried')}>Tried ✅</Chip>
        <Chip active={filter === 'allergen'} onClick={() => setFilter('allergen')}>Allergens</Chip>
        <Chip active={filter === 'iron'} onClick={() => setFilter('iron')}>Iron-rich</Chip>
      </div>

      {visibleCategories.length === 0 && (
        <p className="muted" style={{ marginTop: 16 }}>No foods match — try clearing the search or filters.</p>
      )}

      {visibleCategories.map(({ cat, all, shown }) => {
        const done = all.filter((f) => log[f.id]).length
        return (
          <section key={cat.id} className="check-group">
            <div className="check-group-head">
              <h2>{cat.emoji} {cat.label}</h2>
              <span className={`group-count ${done === all.length ? 'complete' : ''}`}>
                {done === all.length ? '★ ' : ''}{done}/{all.length}
              </span>
            </div>
            {shown.map((f) => {
              const tried = !!log[f.id]
              const note = notes[f.id] || ''
              const editing = editingNote === f.id
              return (
                <div key={f.id} className={`check-row card ${tried ? 'checked' : ''}`}>
                  <div className="check-row-main">
                    <button
                      className={`checkbox ${tried ? 'on' : ''}`}
                      aria-label={tried ? `Un-check ${f.name}` : `Check off ${f.name}`}
                      onClick={() => (tried ? onUncheck(f.id, f.name) : onCheck(f.id))}
                    >
                      {tried ? '✓' : ''}
                    </button>
                    <button className="check-name" onClick={() => onOpenFood(f.id)}>
                      <span className="check-emoji">{f.emoji}</span>
                      <span className="check-title">
                        {f.name}
                        <span className="check-tags">
                          {f.allergen && <span className="tag allergen">allergen</span>}
                          {f.ironRich && <span className="tag iron">iron</span>}
                          {f.hazard === 'high' && <span className="tag hazard-high">⚠️</span>}
                        </span>
                      </span>
                    </button>
                    <button
                      className={`note-btn ${note ? 'has-note' : ''}`}
                      aria-label={`Notes for ${f.name}`}
                      onClick={() => setEditingNote(editing ? null : f.id)}
                    >
                      {note ? '📝' : '✏️'}
                    </button>
                  </div>
                  {!editing && note && (
                    <button className="note-preview" onClick={() => setEditingNote(f.id)}>
                      {note}
                    </button>
                  )}
                  {editing && (
                    <NoteEditor
                      initial={note}
                      onDone={(text) => {
                        onSetNote(f.id, text)
                        setEditingNote(null)
                      }}
                    />
                  )}
                </div>
              )
            })}
          </section>
        )
      })}

      <p className="fineprint">
        Checking a food logs a try dated today — add details (how it went, reactions) from the
        food's page. Un-checking removes its logged tries.
      </p>
    </div>
  )
}

function NoteEditor({ initial, onDone }) {
  const [text, setText] = useState(initial)
  return (
    <div className="note-editor">
      <textarea
        rows={2}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Loved it mashed with banana… broke out in a rash… gagged at first then asked for more…"
      />
      <div className="btn-row">
        <button className="btn small-btn primary" onClick={() => onDone(text)}>Save note</button>
        {initial && (
          <button className="btn small-btn danger-outline" onClick={() => onDone('')}>Delete</button>
        )}
      </div>
    </div>
  )
}

/* ---------- Home ---------- */

function Home({ profile, months, log, onOpenFood, onGoChecklist }) {
  const triedIds = Object.keys(log)
  const triedCount = triedIds.length
  const band = bandForAgeMonths(months)
  const pct = Math.round((triedCount / FOODS.length) * 100)

  const allergensIntroduced = new Set(
    triedIds.map((id) => FOODS.find((f) => f.id === id)?.allergen).filter(Boolean),
  )
  const ironTried = triedIds.filter((id) => FOODS.find((f) => f.id === id)?.ironRich).length

  const suggestions = useMemo(() => {
    const untried = FOODS.filter((f) => !log[f.id] && (months == null || f.minAge <= Math.max(months, 6)))
    const score = (f) =>
      (f.allergen && !allergensIntroduced.has(f.allergen) ? 2 : 0) + (f.ironRich ? 1 : 0)
    return [...untried].sort((a, b) => score(b) - score(a)).slice(0, 6)
  }, [log, months])

  const readyToStart = months != null && months >= 6

  return (
    <div className="page">
      <header className="hero">
        <h1>Hi, {profile.name}! 👋</h1>
        <p className="muted">
          {months != null ? `${formatAge(months)} old` : ''}
          {band ? ` · ${AGE_BANDS.find((b) => b.key === band)?.label} guidance` : ''}
        </p>
      </header>

      {!readyToStart && months != null && (
        <div className="card notice">
          <strong>Not quite time yet!</strong> Most babies are ready for solids around 6 months,
          when they can sit with minimal support, have good head control, and show interest in
          food. Meanwhile, explore the food guide and get excited. 🎈
        </div>
      )}

      <button className="card progress-card home-progress" onClick={onGoChecklist}>
        <div className="progress-nums">
          <span className="progress-count">{triedCount}</span>
          <span className="muted"> / 100 first foods</span>
          <span className="link" style={{ marginLeft: 'auto' }}>Open checklist →</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </button>

      <section className="stat-row">
        <div className="stat card">
          <div className="stat-num">{allergensIntroduced.size}</div>
          <div className="stat-label">of 9 allergens introduced</div>
        </div>
        <div className="stat card">
          <div className="stat-num">{ironTried}</div>
          <div className="stat-label">iron-rich foods tried</div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Try next</h2>
          <button className="link" onClick={onGoChecklist}>Full checklist →</button>
        </div>
        <p className="muted small">
          Prioritized for you: common allergens you haven't introduced yet, then iron-rich foods —
          the two things that matter most in the first months of solids.
        </p>
        <div className="food-grid">
          {suggestions.map((f) => (
            <FoodCard key={f.id} food={f} tried={!!log[f.id]} onOpen={() => onOpenFood(f.id)} />
          ))}
        </div>
      </section>

      <AllergenTracker log={log} onOpenFood={onOpenFood} />
    </div>
  )
}

function AllergenTracker({ log, onOpenFood }) {
  const triedIds = Object.keys(log)
  return (
    <section>
      <h2>Allergen introduction</h2>
      <p className="muted small">
        Pediatric guidance now favors introducing common allergens early (around 6 months) and
        keeping them in the diet regularly. Introduce one new allergen at a time, early in the day,
        and watch for reactions.
      </p>
      <div className="allergen-list">
        {Object.entries(ALLERGENS).map(([key, label]) => {
          const foods = FOODS.filter((f) => f.allergen === key)
          const tried = foods.some((f) => triedIds.includes(f.id))
          const firstFood = foods[0]
          return (
            <button
              key={key}
              className={`allergen-chip ${tried ? 'done' : ''}`}
              onClick={() => firstFood && onOpenFood(firstFood.id)}
            >
              {tried ? '✅' : '⬜'} {label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

function FoodCard({ food, tried, onOpen }) {
  const hz = HAZARD_META[food.hazard]
  return (
    <button className="food-card card" onClick={onOpen}>
      <div className="food-emoji">{food.emoji}</div>
      <div className="food-name">{food.name}</div>
      <div className="food-tags">
        {tried && <span className="tag tried">✓ tried</span>}
        {food.allergen && <span className="tag allergen">allergen</span>}
        {food.ironRich && <span className="tag iron">iron</span>}
        {food.hazard === 'high' && <span className={`tag ${hz.cls}`}>⚠️</span>}
      </div>
    </button>
  )
}

/* ---------- Food detail ---------- */

function FoodDetail({ food, band, entries, note, onSetNote, onBack, onAddTry, onRemoveTry }) {
  const [showLogForm, setShowLogForm] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const hz = HAZARD_META[food.hazard]
  const cat = CATEGORIES.find((c) => c.id === food.category)

  return (
    <div className="page detail">
      <button className="link back" onClick={onBack}>← Back</button>

      <header className="detail-head">
        <div className="detail-emoji">{food.emoji}</div>
        <div>
          <h1>{food.name}</h1>
          <p className="muted small">{cat?.label} · from {food.minAge} months</p>
        </div>
      </header>

      <div className="badge-row">
        <span className={`badge ${hz.cls}`}>{hz.icon} {hz.label}</span>
        {food.allergen && <span className="badge allergen">⚡ Common allergen: {ALLERGENS[food.allergen]}</span>}
        {food.ironRich && <span className="badge iron">💪 Iron-rich</span>}
      </div>

      {food.hazardNote && <div className="card notice warn">{food.hazardNote}</div>}

      <section className="card">
        <h2>Why it's great</h2>
        <p>{food.nutrition}</p>
      </section>

      <section>
        <h2>How to serve</h2>
        {AGE_BANDS.map((b) => (
          <div key={b.key} className={`card serve-card ${band === b.key ? 'current' : ''}`}>
            <div className="serve-age">
              {b.label} {band === b.key && <span className="tag current-tag">your baby</span>}
            </div>
            <p>{food.serve[b.key]}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h2>Your note</h2>
          {!editingNote && (
            <button className="link" onClick={() => setEditingNote(true)}>
              {note ? 'Edit' : '+ Add note'}
            </button>
          )}
        </div>
        {editingNote ? (
          <NoteEditor
            initial={note}
            onDone={(text) => {
              onSetNote(text)
              setEditingNote(false)
            }}
          />
        ) : note ? (
          <div className="card">{note}</div>
        ) : (
          <p className="muted small">A quick memo that also shows on the First 100 checklist.</p>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Your tries ({entries.length})</h2>
          {!showLogForm && (
            <button className="btn primary" onClick={() => setShowLogForm(true)}>
              + Log a try
            </button>
          )}
        </div>

        {showLogForm && (
          <TryForm
            onCancel={() => setShowLogForm(false)}
            onSave={(entry) => {
              onAddTry(entry)
              setShowLogForm(false)
            }}
          />
        )}

        {entries.length === 0 && !showLogForm && (
          <p className="muted small">Not tried yet — log the first taste when it happens! 🎉</p>
        )}
        {[...entries].reverse().map((e, revIdx) => {
          const idx = entries.length - 1 - revIdx
          const rating = RATINGS.find((r) => r.key === e.rating)
          return (
            <div key={e.id || idx} className="card try-entry">
              <div className="try-head">
                <span>
                  {rating ? `${rating.emoji} ${rating.label}` : '✓ Tried'}
                  {e.by && <span className="muted small"> · by {e.by}</span>}
                </span>
                <span className="muted small">{formatDate(e.date)}</span>
              </div>
              {e.reaction && <div className="reaction-flag">⚠️ Possible reaction noted</div>}
              {e.notes && <p className="small">{e.notes}</p>}
              <button className="link danger small" onClick={() => onRemoveTry(idx)}>Delete</button>
            </div>
          )
        })}
      </section>

      <p className="fineprint">
        If you ever see hives, swelling, vomiting, or trouble breathing after a food, stop feeding
        and seek medical care immediately — call emergency services for breathing difficulty.
      </p>
    </div>
  )
}

function TryForm({ onSave, onCancel }) {
  const [date, setDate] = useState(todayISO())
  const [rating, setRating] = useState('loved')
  const [reaction, setReaction] = useState(false)
  const [notes, setNotes] = useState('')

  return (
    <div className="card try-form">
      <label className="field">
        <span>Date</span>
        <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div className="field">
        <span>How did it go?</span>
        <div className="rating-row">
          {RATINGS.map((r) => (
            <button
              key={r.key}
              className={`chip ${rating === r.key ? 'active' : ''}`}
              onClick={() => setRating(r.key)}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>
      <label className="check-field">
        <input type="checkbox" checked={reaction} onChange={(e) => setReaction(e.target.checked)} />
        <span>Possible reaction (rash, hives, vomiting…)</span>
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Squished it everywhere, ate two whole bites!"
        />
      </label>
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={() => onSave({ date, rating, reaction, notes: notes.trim() })}>
          Save
        </button>
      </div>
    </div>
  )
}

/* ---------- Journal ---------- */

function Journal({ log, onOpenFood }) {
  const entries = useMemo(() => {
    const all = []
    for (const [foodId, tries] of Object.entries(log)) {
      const food = FOODS.find((f) => f.id === foodId)
      if (!food) continue
      tries.forEach((t) => all.push({ ...t, food }))
    }
    return all.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [log])

  return (
    <div className="page">
      <header>
        <h1>Journal</h1>
        <p className="muted small">Every taste, in order. {entries.length} entries so far.</p>
      </header>
      {entries.length === 0 && (
        <div className="card notice">
          Nothing logged yet. Check off a food on the <strong>First 100</strong> list or open any
          food and tap <strong>Log a try</strong> — future-you (and your pediatrician) will thank you.
        </div>
      )}
      {entries.map((e, i) => {
        const rating = RATINGS.find((r) => r.key === e.rating)
        return (
          <button key={e.id || i} className="card journal-entry" onClick={() => onOpenFood(e.food.id)}>
            <span className="journal-emoji">{e.food.emoji}</span>
            <span className="journal-body">
              <span className="journal-title">
                {e.food.name} {rating ? rating.emoji : '✓'}
                {e.reaction && ' ⚠️'}
              </span>
              {(e.by || e.notes) && (
                <span className="muted small">
                  {e.by && `by ${e.by}`}
                  {e.by && e.notes && ' — '}
                  {e.notes}
                </span>
              )}
            </span>
            <span className="muted small">{formatDate(e.date)}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Baby tab: profile, family, caregivers, data ---------- */

function Profile({
  profile, months, log, notes, onSave, onResetLog, onImport,
  caregivers, setCaregivers, feeder, setFeeder, familyProps,
}) {
  const [name, setName] = useState(profile.name)
  const [birthdate, setBirthdate] = useState(profile.birthdate)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)
  const synced = Boolean(familyProps.account?.family)

  const dirty = name.trim() !== profile.name || birthdate !== profile.birthdate

  function exportData() {
    const data = JSON.stringify({ profile, log, notes }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `first-bites-${profile.name.toLowerCase()}-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const added = onImport(data)
        setImportMsg(`Imported ✓ — ${added} new ${added === 1 ? 'entry' : 'entries'} merged in.`)
      } catch {
        setImportMsg('That file could not be read as a First Bites backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="page">
      <header>
        <h1>👶 {profile.name}</h1>
        <p className="muted">{months != null ? `${formatAge(months)} old` : ''}</p>
      </header>

      <FamilySection {...familyProps} />

      {familyProps.account && (
        <AccountCard account={familyProps.account} onUpdateAccount={familyProps.onUpdateAccount} />
      )}

      {!synced && (
        <section className="card">
          <h2>Who's feeding today?</h2>
          <p className="muted small">
            Add the grown-ups; logged foods will show who served them.
          </p>
          <div className="allergen-list">
            {caregivers.map((c) => (
              <button
                key={c}
                className={`allergen-chip ${feeder === c ? 'done' : ''}`}
                onClick={() => setFeeder(feeder === c ? '' : c)}
              >
                {feeder === c ? '🍽️ ' : ''}{c}
              </button>
            ))}
          </div>
          <AddCaregiver
            onAdd={(n) => {
              if (!caregivers.includes(n)) setCaregivers([...caregivers, n])
              setFeeder(n)
            }}
          />
        </section>
      )}

      <section className="card">
        <h2>Profile</h2>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Birthdate</span>
          <input type="date" value={birthdate} max={todayISO()} onChange={(e) => setBirthdate(e.target.value)} />
        </label>
        {dirty && (
          <button
            className="btn primary"
            disabled={!name.trim() || !birthdate}
            onClick={() => onSave({ name: name.trim(), birthdate })}
          >
            Save changes
          </button>
        )}
      </section>

      <section className="card">
        <h2>📱 Use it like an app</h2>
        <p className="small">
          First Bites installs straight from the browser — no App Store, no fees:
        </p>
        <p className="small">
          <strong>iPhone:</strong> open in Safari → tap the Share button → <em>Add to Home Screen</em>.<br />
          <strong>Android:</strong> open in Chrome → menu (⋮) → <em>Add to Home screen / Install app</em>.
        </p>
        <p className="small muted">
          It gets its own icon, opens full-screen, and works offline.
        </p>
      </section>

      <section className="card">
        <h2>Your data</h2>
        <p className="muted small">
          {synced
            ? 'Synced with your family — plus local backups whenever you want one.'
            : 'Stored in this browser only. Export a backup before switching devices, or import one from another phone to merge logs.'}
        </p>
        <div className="btn-row">
          <button className="btn" onClick={exportData}>⬇️ Export backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>⬆️ Import backup</button>
          {!confirmReset ? (
            <button className="btn danger-outline" onClick={() => setConfirmReset(true)}>
              Reset food log
            </button>
          ) : (
            <button
              className="btn danger"
              onClick={() => {
                onResetLog()
                setConfirmReset(false)
              }}
            >
              Really delete all tries?
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
        {importMsg && <p className="small" style={{ marginTop: 8 }}>{importMsg}</p>}
      </section>

      <section className="card">
        <h2>About First Bites</h2>
        <p className="small">
          A free, open-source baby-led weaning companion. Food guidance is general information
          compiled from public pediatric feeding recommendations — it is not medical advice.
          Always supervise your baby while eating and consult your pediatrician, especially
          before introducing allergens if your baby has severe eczema or an existing allergy.
        </p>
        <p className="small muted">
          Remember the golden rules: no honey before 12 months, no whole nuts before 4 years,
          always quarter grapes lengthwise, and baby should always be seated upright while eating.
        </p>
      </section>
    </div>
  )
}

function AccountCard({ account, onUpdateAccount }) {
  const [mode, setMode] = useState(null) // null | 'email' | 'password'
  const [email, setEmail] = useState('')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function reset(message = '') {
    setMode(null)
    setEmail('')
    setCurrent('')
    setNext('')
    setErr('')
    setMsg(message)
  }

  async function submit(fields, doneMsg) {
    setBusy(true)
    setErr('')
    try {
      await onUpdateAccount(fields)
      reset(doneMsg)
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>🔑 Your account</h2>
      <p className="small">
        Signed in as <strong>{account.user.email}</strong>
      </p>
      <p className="muted small">
        Updates arrive by email — no phone number needed, ever.
      </p>
      {!mode && (
        <div className="btn-row">
          <button className="btn small-btn" onClick={() => { setMode('email'); setMsg('') }}>Change email</button>
          <button className="btn small-btn" onClick={() => { setMode('password'); setMsg('') }}>Change password</button>
        </div>
      )}
      {mode === 'email' && (
        <div>
          <label className="field">
            <span>New email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new@email.com" />
          </label>
          <label className="field">
            <span>Current password</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          {err && <p className="small" style={{ color: 'var(--red)' }}>{err}</p>}
          <div className="btn-row">
            <button className="btn small-btn" onClick={() => reset()}>Cancel</button>
            <button
              className="btn small-btn primary"
              disabled={busy || !email || !current}
              onClick={() => submit({ email, currentPassword: current }, 'Email updated ✓')}
            >
              Save email
            </button>
          </div>
        </div>
      )}
      {mode === 'password' && (
        <div>
          <label className="field">
            <span>Current password</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="at least 6 characters" />
          </label>
          {err && <p className="small" style={{ color: 'var(--red)' }}>{err}</p>}
          <div className="btn-row">
            <button className="btn small-btn" onClick={() => reset()}>Cancel</button>
            <button
              className="btn small-btn primary"
              disabled={busy || !current || next.length < 6}
              onClick={() =>
                submit({ currentPassword: current, newPassword: next }, 'Password updated ✓ — other devices were signed out')
              }
            >
              Save password
            </button>
          </div>
        </div>
      )}
      {msg && <p className="small" style={{ color: 'var(--green)' }}>{msg}</p>}
    </section>
  )
}

function AddCaregiver({ onAdd }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  if (!adding) {
    return (
      <button className="link" onClick={() => setAdding(true)}>+ Add a caregiver</button>
    )
  }
  return (
    <div className="btn-row" style={{ alignItems: 'center' }}>
      <input
        className="inline-input"
        autoFocus
        placeholder="Dad, Mom, Grandma…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="btn small-btn primary"
        disabled={!name.trim()}
        onClick={() => {
          onAdd(name.trim())
          setName('')
          setAdding(false)
        }}
      >
        Add
      </button>
    </div>
  )
}

/* ---------- Family sync UI ---------- */

function FamilySection({
  account, emailEnabled, syncMsg,
  onSignIn, onSignOut, onCreateFamily, onJoinFamily, onRename, onToggleNotify, onTogglePush,
  onRemoveMember, onTransfer, onLeave,
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function run(fn) {
    setBusy(true)
    setErr('')
    try {
      await fn()
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  if (!cloud.cloudEnabled) {
    return (
      <section className="card">
        <h2>👨‍👩‍👧 Family sync</h2>
        <p className="small">
          Right now this device keeps its own log. Family accounts — everyone logging from their
          own phone into one shared checklist — switch on once the family server is connected.
          Coming very soon!
        </p>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="card">
        <h2>👨‍👩‍👧 Family sync</h2>
        <p className="muted small">
          Sign in so everyone in the family sees the same checklist from their own phone.
        </p>
        <AuthForm busy={busy} err={err || syncMsg} onSubmit={(email, pw, mode) => run(() => onSignIn(email, pw, mode))} />
      </section>
    )
  }

  if (!account.family) {
    return (
      <section className="card">
        <h2>👨‍👩‍👧 Family sync</h2>
        <p className="muted small">Signed in as {account.user.email}</p>
        <FamilySetup
          busy={busy}
          err={err || syncMsg}
          onCreate={(display) => run(() => onCreateFamily(display))}
          onJoin={(code, display) => run(() => onJoinFamily(code, display))}
        />
        <button className="link danger small" onClick={() => run(onSignOut)}>Sign out</button>
      </section>
    )
  }

  return (
    <section className="card family-card">
      <h2>👨‍👩‍👧 Family sync — on</h2>
      <p className="small">
        Share this code so Mom, Dad or Grandma can join from their phone
        (Baby tab → Family sync → Join):
      </p>
      <div className="join-code">{account.family.joinCode}</div>
      <div className="member-list">
        {account.members.map((m) => {
          const isMe = m.userId === account.user.id
          return (
            <div key={m.userId} className="member-row">
              <span className="member-name">
                {m.displayName}
                {m.role === 'owner' && <span className="tag owner-tag">owner</span>}
                {isMe && <span className="muted small"> (you)</span>}
              </span>
              {account.myRole === 'owner' && !isMe && (
                <span className="member-actions">
                  <button
                    className="link small"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Make ${m.displayName} the family owner? You'll become a regular member.`))
                        run(() => onTransfer(m.userId))
                    }}
                  >
                    Make owner
                  </button>
                  <button
                    className="link danger small"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Remove ${m.displayName} from the family? Their phone goes back to its own local log.`))
                        run(() => onRemoveMember(m.userId))
                    }}
                  >
                    Remove
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
      {account.myRole !== 'owner' && (
        <button
          className="link danger small"
          disabled={busy}
          onClick={() => {
            if (window.confirm('Leave this family? Your phone goes back to its own local log.'))
              run(onLeave)
          }}
        >
          Leave family
        </button>
      )}
      <RenameSelf current={account.myName} onRename={(n) => run(() => onRename(n))} />
      <div className="notify-block">
        <h3 className="notify-head">Email updates</h3>
        {emailEnabled ? (
          <>
            <p className="muted small">
              Your choice — get an email when someone else logs a new first food, with the food's
              benefits and serving tips for {'' /* baby name lives server-side */}your baby's age.
            </p>
            <label className="check-field">
              <input
                type="checkbox"
                checked={account.notifyEmail}
                onChange={(e) => run(() => onToggleNotify(e.target.checked))}
                disabled={busy}
              />
              <span>📬 Email me when a new food is logged</span>
            </label>
          </>
        ) : (
          <p className="muted small">
            📬 Email updates are almost ready — they'll appear here as a personal on/off choice
            once email sending is connected.
          </p>
        )}
      </div>
      {(err || syncMsg) && <p className="small" style={{ color: 'var(--red)' }}>{err || syncMsg}</p>}
      <button className="link danger small" onClick={() => run(onSignOut)} disabled={busy}>
        Sign out on this device
      </button>
    </section>
  )
}

function AuthForm({ busy, err, onSubmit }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <div>
      <label className="field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="at least 6 characters" />
      </label>
      {err && <p className="small" style={{ color: 'var(--red)' }}>{err}</p>}
      <div className="btn-row">
        <button className="btn primary" disabled={busy || !email || pw.length < 6} onClick={() => onSubmit(email, pw, 'signin')}>
          Sign in
        </button>
        <button className="btn" disabled={busy || !email || pw.length < 6} onClick={() => onSubmit(email, pw, 'signup')}>
          Create account
        </button>
      </div>
    </div>
  )
}

function FamilySetup({ busy, err, onCreate, onJoin }) {
  const [mode, setMode] = useState('create')
  const [display, setDisplay] = useState('')
  const [code, setCode] = useState('')
  return (
    <div>
      <div className="chip-row">
        <Chip active={mode === 'create'} onClick={() => setMode('create')}>Start our family</Chip>
        <Chip active={mode === 'join'} onClick={() => setMode('join')}>Join with a code</Chip>
      </div>
      <label className="field">
        <span>Your name (how the family sees you)</span>
        <input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="Dad, Mom, Grandma…" />
      </label>
      {mode === 'join' && (
        <label className="field">
          <span>Family code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="6-letter code"
            maxLength={6}
          />
        </label>
      )}
      {err && <p className="small" style={{ color: 'var(--red)' }}>{err}</p>}
      <div className="btn-row">
        {mode === 'create' ? (
          <button className="btn primary" disabled={busy || !display.trim()} onClick={() => onCreate(display.trim())}>
            Create family
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={busy || !display.trim() || code.length !== 6}
            onClick={() => onJoin(code, display.trim())}
          >
            Join family
          </button>
        )}
      </div>
    </div>
  )
}

function RenameSelf({ current, onRename }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(current)
  if (!editing) {
    return (
      <p className="small">
        You appear as <strong>{current}</strong>{' '}
        <button className="link small" onClick={() => setEditing(true)}>change</button>
      </p>
    )
  }
  return (
    <div className="btn-row" style={{ alignItems: 'center' }}>
      <input className="inline-input" value={name} onChange={(e) => setName(e.target.value)} />
      <button
        className="btn small-btn primary"
        disabled={!name.trim()}
        onClick={() => {
          onRename(name.trim())
          setEditing(false)
        }}
      >
        Save
      </button>
    </div>
  )
}
