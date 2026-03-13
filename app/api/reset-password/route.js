import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return Response.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const { rows } = await sql`
      SELECT id, password_reset_token_expires FROM members
      WHERE password_reset_token = ${token}
    `

    if (rows.length === 0) {
      return Response.json({ error: 'INVALID_TOKEN' }, { status: 400 })
    }

    const member = rows[0]

    if (new Date(member.password_reset_token_expires) < new Date()) {
      return Response.json({ error: 'EXPIRED_TOKEN' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await sql`
      UPDATE members
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_token_expires = NULL
      WHERE id = ${member.id}
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
