import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (category && category !== 'all') where.category = category

    const logs = await db.activityLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Activity Logs GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const log = await db.activityLog.create({
      data: {
        action: body.action,
        description: body.description,
        category: body.category,
        entityId: body.entityId,
        entityType: body.entityType,
        userId: body.userId,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Activity Log POST error:', error)
    return NextResponse.json({ error: 'Failed to create activity log' }, { status: 500 })
  }
}
