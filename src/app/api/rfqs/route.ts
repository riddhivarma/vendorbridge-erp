import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status

    const rfqs = await db.rFQ.findMany({
      where,
      include: {
        createdBy: true,
        lineItems: true,
        vendors: { include: { vendor: true } },
        quotations: { include: { vendor: true, items: true } },
        approval: { include: { approvalSteps: { include: { approver: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ rfqs })
  } catch (error) {
    console.error('RFQs GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rfq = await db.rFQ.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status || 'draft',
        createdById: body.createdById,
        lineItems: {
          create: (body.lineItems || []).map((item: { itemName: string; quantity: number; unit: string }) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit || 'NOS',
          })),
        },
        vendors: {
          create: (body.vendorIds || []).map((vendorId: string) => ({ vendorId })),
        },
      },
      include: {
        lineItems: true,
        vendors: { include: { vendor: true } },
      },
    })

    await db.activityLog.create({
      data: {
        action: body.status === 'published' ? 'rfq_published' : 'rfq_created',
        description: `RFQ "${body.title}" ${body.status === 'published' ? 'published' : 'saved as draft'}`,
        category: 'rfq',
        entityId: rfq.id,
        entityType: 'RFQ',
        userId: body.createdById,
      },
    })

    return NextResponse.json({ rfq })
  } catch (error) {
    console.error('RFQs POST error:', error)
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 })
  }
}
