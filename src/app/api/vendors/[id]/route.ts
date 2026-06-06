import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vendor = await db.vendor.findUnique({
      where: { id },
      include: { user: true, quotations: true, purchaseOrders: true },
    })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('Vendor GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const vendor = await db.vendor.update({
      where: { id },
      data: {
        companyName: body.companyName,
        category: body.category,
        gstNumber: body.gstNumber,
        contactNumber: body.contactNumber,
        email: body.email,
        address: body.address,
        status: body.status,
        rating: body.rating,
      },
    })
    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('Vendor PUT error:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.vendor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vendor DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
