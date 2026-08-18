export function ageInMonths(birthdateISO) {
  if (!birthdateISO) return null
  const birth = new Date(birthdateISO + 'T00:00:00')
  if (isNaN(birth)) return null
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  return Math.max(0, months)
}

export function formatAge(months) {
  if (months == null) return ''
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem === 0 ? `${years} years` : `${years}y ${rem}m`
}

export function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
