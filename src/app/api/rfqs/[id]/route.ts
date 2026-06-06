import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rfq = await db.rFQ.findUnique({
      where: { id },
      include: {
        createdBy: true,
        lineItems: true,
        vendors: { include: { vendor: true } },
        quotations: { include: { vendor: true, items: true } },
        approval: { include: { approvalSteps: { include: { approver: true } } } },
        purchaseOrder: { include: { items: true, vendor: true } },
      },
    })
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 })
    }
    return NextResponse.json({ rfq })
  } catch (error) {
    console.error('RFQ GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch RFQ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.lineItems) {
      await db.lineItem.deleteMany({ where: { rfqId: id } })
    }
    if (body.vendorIds) {
      await db.rFQVendor.deleteMany({ where: { rfqId: id } })
    }

    const rfq = await db.rFQ.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        status: body.status,
        ...(body.lineItems ? {
          lineItems: {
            create: body.lineItems.map((item: { itemName: string; quantity: number; unit: string }) => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unit: item.unit || 'NOS',
            })),
          },
        } : {}),
        ...(body.vendorIds ? {
          vendors: {
            create: body.vendorIds.map((vendorId: string) => ({ vendorId })),
          },
        } : {}),
      },
      include: {
        lineItems: true,
        vendors: { include: { vendor: true } },
      },
    })

    return NextResponse.json({ rfq })
  } catch (error) {
    console.error('RFQ PUT error:', error)
    return NextResponse.json({ error: 'Failed to update RFQ' }, { status: 500 })
  }
}
