// Profile completion calculator — shared between profile page and directory
// Each field is worth equal weight. "anySocial" counts as filled if any one social link exists.

const PROFILE_FIELDS = [
  { key: 'profilePhoto', check: (m) => !!(m.profile_image_url || m.profileImageUrl) },
  { key: 'nameKo', check: (m) => !!(m.name_ko || m.nameKo) },
  { key: 'graduationYear', check: (m) => !!(m.graduation_year || m.graduationYear) },
  { key: 'major', check: (m) => !!m.major },
  { key: 'location', check: (m) => !!m.location },
  { key: 'company', check: (m) => !!m.company },
  { key: 'title', check: (m) => !!m.title },
  { key: 'phone', check: (m) => !!m.phone },
  { key: 'bio', check: (m) => !!m.bio },
  { key: 'anySocial', check: (m) => !!(m.linkedin || m.instagram || m.tiktok || m.youtube) },
  { key: 'interests', check: (m) => !!m.interests },
]

export function getProfileCompletion(member) {
  const filled = PROFILE_FIELDS.filter(f => f.check(member)).length
  return Math.round((filled / PROFILE_FIELDS.length) * 100)
}

export function getMissingFields(member) {
  return PROFILE_FIELDS.filter(f => !f.check(member)).map(f => f.key)
}
