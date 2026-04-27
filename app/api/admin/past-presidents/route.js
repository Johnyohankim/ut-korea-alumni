import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows } = await sql`
    SELECT pp.id, pp.member_id, pp.term_start, pp.term_end, pp.sort_order,
           m.name, m.name_ko
    FROM past_presidents pp
    LEFT JOIN members m ON pp.member_id = m.id
    ORDER BY pp.sort_order, pp.term_start
  `
  return Response.json({ pastPresidents: rows })
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pastPresidents } = await request.json()

  await sql`DELETE FROM past_presidents`

  let sortOrder = 0
  for (const pp of pastPresidents) {
    if (!pp.member_id) continue
    const start = parseInt(pp.term_start)
    const end = parseInt(pp.term_end)
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue
    await sql`
      INSERT INTO past_presidents (member_id, term_start, term_end, sort_order)
      VALUES (${parseInt(pp.member_id)}, ${start}, ${end}, ${sortOrder++})
    `
  }

  return Response.json({ success: true })
}
