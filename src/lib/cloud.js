// Optional family-sync layer backed by Supabase (free tier).
// Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the app runs fully
// on-device and none of this is used.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudEnabled = Boolean(url && key)
export const supabase = cloudEnabled ? createClient(url, key) : null

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

// Returns { family, members, myName } or null when the user has no family yet.
export async function getMyFamily(userId) {
  const { data: memberships, error } = await supabase
    .from('family_members')
    .select('family_id, display_name')
    .eq('user_id', userId)
  if (error) throw error
  if (!memberships?.length) return null
  const { family_id, display_name } = memberships[0]
  const [{ data: family, error: e1 }, { data: members, error: e2 }] = await Promise.all([
    supabase.from('families').select('*').eq('id', family_id).single(),
    supabase.from('family_members').select('display_name, user_id').eq('family_id', family_id),
  ])
  if (e1) throw e1
  if (e2) throw e2
  return { family, members: members || [], myName: display_name }
}

export async function createFamily(babyName, birthdate, displayName) {
  const { data, error } = await supabase.rpc('create_family', {
    p_baby_name: babyName,
    p_birthdate: birthdate,
    p_display_name: displayName,
  })
  if (error) throw error
  return data
}

export async function joinFamily(code, displayName) {
  const { data, error } = await supabase.rpc('join_family', {
    p_code: code,
    p_display_name: displayName,
  })
  if (error) throw error
  return data
}

// Pull all shared state. Returns { log, notes } in the app's local shape.
export async function fetchState(familyId) {
  const [{ data: tries, error: e1 }, { data: noteRows, error: e2 }] = await Promise.all([
    supabase.from('tries').select('*').eq('family_id', familyId),
    supabase.from('food_notes').select('food_id, body').eq('family_id', familyId),
  ])
  if (e1) throw e1
  if (e2) throw e2
  const log = {}
  for (const t of tries || []) {
    ;(log[t.food_id] ||= []).push({
      id: t.id,
      date: t.tried_on,
      rating: t.rating,
      reaction: t.reaction,
      notes: t.notes,
      by: t.fed_by,
    })
  }
  for (const arr of Object.values(log)) arr.sort((a, b) => (a.date < b.date ? -1 : 1))
  const notes = {}
  for (const n of noteRows || []) if (n.body) notes[n.food_id] = n.body
  return { log, notes }
}

export async function pushTry(familyId, foodId, entry) {
  const { error } = await supabase.from('tries').upsert({
    id: entry.id,
    family_id: familyId,
    food_id: foodId,
    tried_on: entry.date,
    rating: entry.rating,
    reaction: entry.reaction,
    notes: entry.notes || '',
    fed_by: entry.by || '',
  })
  if (error) throw error
}

export async function deleteTryById(id) {
  const { error } = await supabase.from('tries').delete().eq('id', id)
  if (error) throw error
}

export async function deleteTriesForFood(familyId, foodId) {
  const { error } = await supabase.from('tries').delete().eq('family_id', familyId).eq('food_id', foodId)
  if (error) throw error
}

export async function pushNote(familyId, foodId, body) {
  if (body) {
    const { error } = await supabase
      .from('food_notes')
      .upsert({ family_id: familyId, food_id: foodId, body, updated_at: new Date().toISOString() })
    if (error) throw error
  } else {
    const { error } = await supabase.from('food_notes').delete().eq('family_id', familyId).eq('food_id', foodId)
    if (error) throw error
  }
}

export async function updateBaby(familyId, babyName, birthdate) {
  const { error } = await supabase
    .from('families')
    .update({ baby_name: babyName, birthdate })
    .eq('id', familyId)
  if (error) throw error
}

export async function updateMyName(familyId, userId, displayName) {
  const { error } = await supabase
    .from('family_members')
    .update({ display_name: displayName })
    .eq('family_id', familyId)
    .eq('user_id', userId)
  if (error) throw error
}
