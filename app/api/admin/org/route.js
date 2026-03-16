import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows } = await sql`
    SELECT op.id, op.committee, op.role, op.member_id, op.sort_order,
           m.name, m.name_ko
    FROM org_positions op
    LEFT JOIN members m ON op.member_id = m.id
    ORDER BY op.committee, op.sort_order, op.role
  `
  return Response.json({ positions: rows })
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { positions } = await request.json()

  // Replace all positions: delete existing, insert new
  await sql`DELETE FROM org_positions`

  for (const pos of positions) {
    if (pos.member_id) {
      await sql`
        INSERT INTO org_positions (committee, role, member_id, sort_order)
        VALUES (${pos.committee}, ${pos.role}, ${parseInt(pos.member_id)}, ${pos.sort_order || 0})
      `
    }
  }

  return Response.json({ success: true })
}
