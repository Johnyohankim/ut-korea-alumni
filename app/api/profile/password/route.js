import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return Response.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  const { rows } = await sql`
    SELECT password_hash FROM members WHERE id = ${session.user.id}
  `

  if (!rows.length) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const passwordMatch = await bcrypt.compare(currentPassword, rows[0].password_hash)
  if (!passwordMatch) {
    return Response.json({ error: 'Current password is incorrect' }, { status: 403 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  await sql`
    UPDATE members SET password_hash = ${newHash} WHERE id = ${session.user.id}
  `

  return Response.json({ success: true })
}
