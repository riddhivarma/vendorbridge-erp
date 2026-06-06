import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfq: { include: { lineItems: true, vendors: { include: { vendor: true } } } },
        items: true,
        approval: { include: { approvalSteps: { include: { approver: true } } } },
      },
    })
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }
    return NextResponse.json({ quotation })
  } catch (error) {
    console.error('Quotation GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.items) {
      await db.quotationItem.deleteMany({ where: { quotationId: id } })
    }

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        status: body.status,
        subtotal: body.subtotal,
        gstPercentage: body.gstPercentage,
        gstAmount: body.gstAmount,
        grandTotal: body.grandTotal,
        deliveryDays: body.deliveryDays,
        paymentTerms: body.paymentTerms,
        notes: body.notes,
        ...(body.items ? {
          items: {
            create: body.items.map((item: { itemName: string; quantity: number; unitPrice: number; total: number; deliveryDays: number }) => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              deliveryDays: item.deliveryDays,
            })),
          },
        } : {}),
      },
      include: { items: true, vendor: true },
    })

    if (body.status === 'selected') {
      await db.activityLog.create({
        data: {
          action: 'quotation_selected',
          description: `Quotation selected for approval`,
          category: 'approval',
          entityId: id,
          entityType: 'Quotation',
          userId: body.userId,
        },
      })
    }

    return NextResponse.json({ quotation })
  } catch (error) {
    console.error('Quotation PUT error:', error)
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 })
  }
}
