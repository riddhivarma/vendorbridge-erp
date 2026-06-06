import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentStatus = searchParams.get('paymentStatus')

    const where: Record<string, unknown> = {}
    if (paymentStatus) where.paymentStatus = paymentStatus

    const purchaseOrders = await db.purchaseOrder.findMany({
      where,
      include: {
        vendor: true,
        rfq: true,
        items: true,
        approval: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ purchaseOrders })
  } catch (error) {
    console.error('Purchase Orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const poCount = await db.purchaseOrder.count()
    const poNumber = body.poNumber || `PO-${String(poCount + 1).padStart(4, '0')}`

    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        poNumber,
        rfqId: body.rfqId,
        vendorId: body.vendorId,
        approvalId: body.approvalId,
        billTo: body.billTo,
        billToGstin: body.billToGstin,
        billToAddress: body.billToAddress,
        vendorAddress: body.vendorAddress,
        vendorGstin: body.vendorGstin,
        subtotal: body.subtotal || 0,
        cgstPercentage: body.cgstPercentage ?? 9,
        cgstAmount: body.cgstAmount || 0,
        sgstPercentage: body.sgstPercentage ?? 9,
        sgstAmount: body.sgstAmount || 0,
        grandTotal: body.grandTotal || 0,
        poDate: body.poDate ? new Date(body.poDate) : new Date(),
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paymentStatus: body.paymentStatus || 'pending',
        items: {
          create: (body.items || []).map((item: { itemName: string; quantity: number; unitPrice: number; total: number }) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true, vendor: true },
    })

    return NextResponse.json({ purchaseOrder })
  } catch (error) {
    console.error('Purchase Order POST error:', error)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
}
