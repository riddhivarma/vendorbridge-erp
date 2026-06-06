import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfq: { include: { lineItems: true } },
        items: true,
        approval: { include: { approvalSteps: { include: { approver: true } } } },
      },
    })
    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    return NextResponse.json({ purchaseOrder })
  } catch (error) {
    console.error('Purchase Order GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const purchaseOrder = await db.purchaseOrder.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    })

    if (body.paymentStatus === 'paid') {
      await db.activityLog.create({
        data: {
          action: 'invoice_paid',
          description: `Payment completed for PO ${purchaseOrder.poNumber}`,
          category: 'invoice',
          entityId: id,
          entityType: 'PurchaseOrder',
          userId: body.userId,
        },
      })
    }

    return NextResponse.json({ purchaseOrder })
  } catch (error) {
    console.error('Purchase Order PUT error:', error)
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 })
  }
}
