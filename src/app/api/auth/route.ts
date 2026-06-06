import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'login') {
      const { email, password } = body
      const user = await db.user.findUnique({ where: { email } })
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })
    }

    if (action === 'register') {
      const { email, password, firstName, lastName, phone, country, role, additionalInfo } = body
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }
      const user = await db.user.create({
        data: { email, password, firstName, lastName, phone, country, role, additionalInfo },
      })
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
