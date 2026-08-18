import { useMemo, useState } from 'react'
import { FOODS, CATEGORIES, ALLERGENS, AGE_BANDS, bandForAgeMonths } from './data/foods.js'
import { useLocalStorage } from './lib/storage.js'
import { ageInMonths, formatAge, formatDate, todayISO } from './lib/age.js'

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

export default function App() {
  const [profile, setProfile] = useLocalStorage('fb.profile', null)
  const [log, setLog] = useLocalStorage('fb.log', {}) // { foodId: [{date, rating, reaction, notes}] }
  const [notes, setNotes] = useLocalStorage('fb.notes', {}) // { foodId: 'quick note' }
  const [tab, setTab] = useState('home')
  const [openFoodId, setOpenFoodId] = useState(null)

  const months = ageInMonths(profile?.birthdate)
  const band = bandForAgeMonths(months)

  function addTry(foodId, entry) {
    setLog((prev) => ({ ...prev, [foodId]: [...(prev[foodId] || []), entry] }))
  }
  function removeTry(foodId, index) {
    setLog((prev) => {
      const next = (prev[foodId] || []).filter((_, i) => i !== index)
      const copy = { ...prev }
      if (next.length === 0) delete copy[foodId]
      else copy[foodId] = next
      return copy
    })
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
    }
  }
  function setNote(foodId, text) {
    setNotes((prev) => {
      const copy = { ...prev }
      if (text.trim()) copy[foodId] = text
      else delete copy[foodId]
      return copy
    })
  }

  if (!profile) {
    return <Onboarding onDone={setProfile} />
  }

  const openFood = openFoodId ? FOODS.find((f) => f.id === openFoodId) : null

  return (
    <div className="app">
      <main className="main">
        {openFood ? (
          <FoodDetail
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
            onGoFoods={() => setTab('foods')}
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
        ) : tab === 'foods' ? (
          <FoodBrowser log={log} months={months} onOpenFood={setOpenFoodId} />
        ) : tab === 'journal' ? (
          <Journal log={log} onOpenFood={setOpenFoodId} />
        ) : (
          <Profile profile={profile} months={months} log={log} notes={notes} onSave={setProfile} onResetLog={() => setLog({})} />
        )}
      </main>

      {!openFood && (
        <nav className="tabbar">
          <TabButton id="home" icon="🏠" label="Home" tab={tab} setTab={setTab} />
          <TabButton id="first100" icon="✅" label="First 100" tab={tab} setTab={setTab} />
          <TabButton id="foods" icon="🍎" label="Foods" tab={tab} setTab={setTab} />
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

function Onboarding({ onDone }) {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-logo">🥣</div>
        <h1>First Bites</h1>
        <p className="muted">
          The first 100 foods, free forever: how to serve each one safely by age, a checklist to
          tick off every new taste, and space for your notes. Everything stays on your device — no
          account, no subscription, ever.
        </p>
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
        <p className="fineprint">
          General information only, not medical advice. Always supervise eating, and talk to your
          pediatrician about starting solids and introducing allergens — especially if your baby
          has eczema or an existing food allergy.
        </p>
      </div>
    </div>
  )
}

/* ---------- First 100 checklist ---------- */

function First100({ log, notes, onOpenFood, onCheck, onUncheck, onSetNote }) {
  const [editingNote, setEditingNote] = useState(null) // foodId being edited
  const triedCount = FOODS.filter((f) => log[f.id]).length
  const pct = Math.round((triedCount / FOODS.length) * 100)
  const milestone = MILESTONES.find(([n]) => triedCount >= n)

  return (
    <div className="page">
      <header>
        <h1>The First 100 Foods</h1>
        <p className="muted small">
          Tick off every new food your baby tries. Tap a food's name for how to serve it safely.
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

      {CATEGORIES.map((cat) => {
        const foods = FOODS.filter((f) => f.category === cat.id)
        const done = foods.filter((f) => log[f.id]).length
        return (
          <section key={cat.id} className="check-group">
            <div className="check-group-head">
              <h2>{cat.emoji} {cat.label}</h2>
              <span className={`group-count ${done === foods.length ? 'complete' : ''}`}>
                {done === foods.length ? '★ ' : ''}{done}/{foods.length}
              </span>
            </div>
            {foods.map((f) => {
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

function Home({ profile, months, log, onOpenFood, onGoFoods, onGoChecklist }) {
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
    // Prioritize: allergens not yet introduced, then iron-rich, then everything else
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
          <button className="link" onClick={onGoFoods}>See all foods →</button>
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

/* ---------- Food browser ---------- */

function FoodBrowser({ log, months, onOpenFood }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filter, setFilter] = useState('all') // all | untried | tried | allergen | iron

  const foods = useMemo(() => {
    return FOODS.filter((f) => {
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false
      if (category !== 'all' && f.category !== category) return false
      if (filter === 'untried' && log[f.id]) return false
      if (filter === 'tried' && !log[f.id]) return false
      if (filter === 'allergen' && !f.allergen) return false
      if (filter === 'iron' && !f.ironRich) return false
      return true
    })
  }, [query, category, filter, log])

  return (
    <div className="page">
      <header>
        <h1>Foods</h1>
        <input
          className="search"
          placeholder="Search foods…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

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

      <div className="food-grid">
        {foods.map((f) => (
          <FoodCard key={f.id} food={f} tried={!!log[f.id]} onOpen={() => onOpenFood(f.id)} />
        ))}
        {foods.length === 0 && <p className="muted">No foods match. Try clearing filters.</p>}
      </div>
    </div>
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
            <div key={idx} className="card try-entry">
              <div className="try-head">
                <span>{rating ? `${rating.emoji} ${rating.label}` : '✓ Tried'}</span>
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
          <button key={i} className="card journal-entry" onClick={() => onOpenFood(e.food.id)}>
            <span className="journal-emoji">{e.food.emoji}</span>
            <span className="journal-body">
              <span className="journal-title">
                {e.food.name} {rating ? rating.emoji : '✓'}
                {e.reaction && ' ⚠️'}
              </span>
              {e.notes && <span className="muted small">{e.notes}</span>}
            </span>
            <span className="muted small">{formatDate(e.date)}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Profile ---------- */

function Profile({ profile, months, log, notes, onSave, onResetLog }) {
  const [name, setName] = useState(profile.name)
  const [birthdate, setBirthdate] = useState(profile.birthdate)
  const [confirmReset, setConfirmReset] = useState(false)

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

  return (
    <div className="page">
      <header>
        <h1>👶 {profile.name}</h1>
        <p className="muted">{months != null ? `${formatAge(months)} old` : ''}</p>
      </header>

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
          Everything lives in this browser only. Export a backup before switching devices.
        </p>
        <div className="btn-row">
          <button className="btn" onClick={exportData}>⬇️ Export backup</button>
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
