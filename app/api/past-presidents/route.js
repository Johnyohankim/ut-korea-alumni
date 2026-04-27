import { sql } from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT pp.id, pp.member_id, pp.term_start, pp.term_end, pp.sort_order,
             m.name, m.name_ko, m.profile_image_url, m.graduation_year, m.major, m.company, m.title
      FROM past_presidents pp
      LEFT JOIN members m ON pp.member_id = m.id
      ORDER BY pp.sort_order, pp.term_start
    `
    return Response.json({ pastPresidents: rows })
  } catch (error) {
    console.error('Past presidents error:', error)
    return Response.json({ pastPresidents: [] })
  }
}
