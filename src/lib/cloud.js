// Family-sync client for the First Bites server (server/ in this repo,
// deployed on Railway). Without VITE_API_URL the app runs fully on-device.
// Default: the family's Railway server. VITE_API_URL overrides for local dev/testing.
const API = (import.meta.env.VITE_API_URL || 'https://first-100-production-552d.up.railway.app').replace(/\/$/, '')

export const cloudEnabled = Boolean(API)

const TOKEN_KEY = 'fb.token'
export const getToken = () => window.localStorage.getItem(TOKEN_KEY)
const setToken = (t) => (t ? window.localStorage.setItem(TOKEN_KEY, t) : window.localStorage.removeItem(TOKEN_KEY))

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    // non-JSON error body
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

export async function getConfig() {
  return call('GET', '/api/config')
}

export async function signUp(email, password) {
  const { token } = await call('POST', '/api/signup', { email, password })
  setToken(token)
}

export async function signIn(email, password) {
  const { token } = await call('POST', '/api/signin', { email, password })
  setToken(token)
}

export async function signOut() {
  try {
    await call('POST', '/api/signout')
  } catch {
    // token already invalid — fine
  }
  setToken(null)
}

// Returns { user, family, members, myName, notifyEmail } — family null when not joined.
// Returns null when there is no valid session.
export async function getMe() {
  if (!getToken()) return null
  try {
    return await call('GET', '/api/me')
  } catch (e) {
    if (String(e.message).includes('Not signed in')) {
      setToken(null)
      return null
    }
    throw e
  }
}

export const createFamily = (babyName, birthdate, displayName) =>
  call('POST', '/api/family', { babyName, birthdate, displayName })

export const joinFamily = (code, displayName) => call('POST', '/api/family/join', { code, displayName })

export const updateMe = (fields) => call('PUT', '/api/me', fields)

export const removeMember = (userId) => call('POST', '/api/members/remove', { userId })

export const transferOwnership = (userId) => call('POST', '/api/family/transfer', { userId })

export const leaveFamily = () => call('POST', '/api/members/leave')

export const updateBaby = (name, birthdate) => call('PUT', '/api/baby', { name, birthdate })

export const fetchState = () => call('GET', '/api/state')

export const pushTry = (foodId, entry) =>
  call('PUT', '/api/tries', {
    id: entry.id,
    foodId,
    date: entry.date,
    rating: entry.rating,
    reaction: entry.reaction,
    notes: entry.notes || '',
    by: entry.by || '',
  })

export const deleteTryById = (id) => call('DELETE', `/api/tries/${id}`)

export const deleteTriesForFood = (foodId) => call('DELETE', `/api/tries/food/${foodId}`)

export const pushNote = (foodId, body) => call('PUT', `/api/notes/${encodeURIComponent(foodId)}`, { body })

// ---- push notifications ----

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

// Ask permission, subscribe this device, and register it with the family server.
export async function enablePush() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted')
    throw new Error('Notifications are blocked for this site — allow them in your browser settings first')
  const reg = await navigator.serviceWorker.ready
  const { publicKey } = await call('GET', '/api/push/key')
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }
  await call('POST', '/api/push/subscribe', { subscription: sub.toJSON() })
  return updateMe({ notifyPush: true })
}

export async function disablePush() {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await call('POST', '/api/push/unsubscribe', { endpoint: sub.endpoint })
      await sub.unsubscribe()
    }
  } catch {
    // device-side cleanup best-effort; the preference below is what stops sends
  }
  return updateMe({ notifyPush: false })
}
