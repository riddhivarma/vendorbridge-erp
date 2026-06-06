import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { gstNumber: { contains: search } },
        { category: { contains: search } },
      ]
    }

    const vendors = await db.vendor.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ vendors })
  } catch (error) {
    console.error('Vendors GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const vendor = await db.vendor.create({
      data: {
        companyName: body.companyName,
        category: body.category,
        gstNumber: body.gstNumber,
        contactNumber: body.contactNumber,
        email: body.email,
        address: body.address,
        status: body.status || 'pending',
        rating: body.rating || 0,
        userId: body.userId,
      },
    })

    await db.activityLog.create({
      data: {
        action: 'vendor_added',
        description: `Vendor "${body.companyName}" added to the system`,
        category: 'vendor',
        entityId: vendor.id,
        entityType: 'Vendor',
        userId: body.userId,
      },
    })

    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('Vendors POST error:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}
