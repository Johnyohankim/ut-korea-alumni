import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50)
}

export async function GET() {
  if (!await requireAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows: teams } = await sql`
    SELECT id, key, name_en, name_ko, description_en, description_ko,
           leader_label_en, leader_label_ko, sort_order
    FROM teams
    ORDER BY sort_order, id
  `

  const { rows: positions } = await sql`
    SELECT op.id, op.committee, op.role, op.member_id, op.sort_order,
           m.name, m.name_ko
    FROM org_positions op
    LEFT JOIN members m ON op.member_id = m.id
    ORDER BY op.sort_order, op.role
  `

  const teamsWithMembers = teams.map(t => ({
    ...t,
    leader_member_id: positions.find(p => p.committee === t.key && p.role === 'leader')?.member_id || null,
    member_ids: positions.filter(p => p.committee === t.key && p.role === 'member').map(p => p.member_id),
  }))

  return Response.json({ teams: teamsWithMembers })
}

export async function POST(request) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const name_en = String(body.name_en || '').trim()
  if (!name_en) return Response.json({ error: 'name_en required' }, { status: 400 })

  let key = slugify(body.key || name_en)
  if (!key) return Response.json({ error: 'Invalid key' }, { status: 400 })

  // Ensure key uniqueness — append numeric suffix if needed
  const { rows: existing } = await sql`SELECT key FROM teams WHERE key LIKE ${key + '%'}`
  if (existing.some(r => r.key === key)) {
    let i = 2
    while (existing.some(r => r.key === `${key}_${i}`)) i++
    key = `${key}_${i}`
  }

  const { rows: maxOrder } = await sql`SELECT COALESCE(MAX(sort_order), -1) AS m FROM teams`
  const sortOrder = (maxOrder[0]?.m ?? -1) + 1

  const { rows } = await sql`
    INSERT INTO teams (key, name_en, name_ko, description_en, description_ko, leader_label_en, leader_label_ko, sort_order)
    VALUES (
      ${key},
      ${name_en},
      ${body.name_ko || null},
      ${body.description_en || null},
      ${body.description_ko || null},
      ${body.leader_label_en || 'Leader'},
      ${body.leader_label_ko || null},
      ${sortOrder}
    )
    RETURNING id, key
  `
  return Response.json({ team: rows[0] })
}

export async function PUT(request) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const id = parseInt(body.id)
  if (!Number.isFinite(id)) return Response.json({ error: 'id required' }, { status: 400 })

  // Update team metadata
  await sql`
    UPDATE teams SET
      name_en = ${body.name_en || ''},
      name_ko = ${body.name_ko || null},
      description_en = ${body.description_en || null},
      description_ko = ${body.description_ko || null},
      leader_label_en = ${body.leader_label_en || 'Leader'},
      leader_label_ko = ${body.leader_label_ko || null},
      sort_order = ${parseInt(body.sort_order) || 0}
    WHERE id = ${id}
  `

  // Update assignments — replace all positions for this team's key
  const { rows: teamRows } = await sql`SELECT key FROM teams WHERE id = ${id}`
  const key = teamRows[0]?.key
  if (key) {
    await sql`DELETE FROM org_positions WHERE committee = ${key}`
    let sortOrder = 0
    if (body.leader_member_id) {
      await sql`
        INSERT INTO org_positions (committee, role, member_id, sort_order)
        VALUES (${key}, 'leader', ${parseInt(body.leader_member_id)}, ${sortOrder++})
      `
    }
    if (Array.isArray(body.member_ids)) {
      for (const mid of body.member_ids) {
        const parsed = parseInt(mid)
        if (!Number.isFinite(parsed)) continue
        await sql`
          INSERT INTO org_positions (committee, role, member_id, sort_order)
          VALUES (${key}, 'member', ${parsed}, ${sortOrder++})
        `
      }
    }
  }

  return Response.json({ success: true })
}

export async function DELETE(request) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = parseInt(url.searchParams.get('id'))
  if (!Number.isFinite(id)) return Response.json({ error: 'id required' }, { status: 400 })

  const { rows } = await sql`SELECT key FROM teams WHERE id = ${id}`
  const key = rows[0]?.key
  if (key) {
    await sql`DELETE FROM org_positions WHERE committee = ${key}`
  }
  await sql`DELETE FROM teams WHERE id = ${id}`

  return Response.json({ success: true })
}
