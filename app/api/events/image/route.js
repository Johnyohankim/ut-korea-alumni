import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const blob = await put(`events/${Date.now()}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error('Event image upload error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
