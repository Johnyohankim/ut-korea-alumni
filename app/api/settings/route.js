import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { rows } = await sql`SELECT key, value FROM site_settings`
    const settings = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    return Response.json({ settings }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch {
    return Response.json({ settings: {} })
  }
}
