import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rfqId = searchParams.get('rfqId')
    const vendorId = searchParams.get('vendorId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (rfqId) where.rfqId = rfqId
    if (vendorId) where.vendorId = vendorId
    if (status) where.status = status

    const quotations = await db.quotation.findMany({
      where,
      include: {
        vendor: true,
        rfq: { include: { lineItems: true } },
        items: true,
        approval: { include: { approvalSteps: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ quotations })
  } catch (error) {
    console.error('Quotations GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const quotation = await db.quotation.create({
      data: {
        rfqId: body.rfqId,
        vendorId: body.vendorId,
        status: body.status || 'draft',
        subtotal: body.subtotal || 0,
        gstPercentage: body.gstPercentage ?? 18,
        gstAmount: body.gstAmount || 0,
        grandTotal: body.grandTotal || 0,
        deliveryDays: body.deliveryDays || 0,
        paymentTerms: body.paymentTerms || '30 days',
        notes: body.notes,
        items: {
          create: (body.items || []).map((item: { itemName: string; quantity: number; unitPrice: number; total: number; deliveryDays: number }) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            deliveryDays: item.deliveryDays,
          })),
        },
      },
      include: { items: true, vendor: true },
    })

    await db.activityLog.create({
      data: {
        action: body.status === 'submitted' ? 'quotation_submitted' : 'quotation_saved',
        description: `Quotation ${body.status === 'submitted' ? 'submitted' : 'saved as draft'} for RFQ`,
        category: 'rfq',
        entityId: quotation.id,
        entityType: 'Quotation',
        userId: body.userId,
      },
    })

    return NextResponse.json({ quotation })
  } catch (error) {
    console.error('Quotations POST error:', error)
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 })
  }
}
