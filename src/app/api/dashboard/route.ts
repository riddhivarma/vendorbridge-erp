import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeRfqs = await db.rFQ.count({ where: { status: { in: ['published', 'draft'] } } })
    const pendingApprovals = await db.approval.count({ where: { status: { in: ['pending', 'l1_approved'] } } })
    const posThisMonth = await db.purchaseOrder.count({ where: { createdAt: { gte: startOfMonth } } })
    const overdueInvoices = await db.purchaseOrder.count({ where: { paymentStatus: 'overdue' } })
    const recentPOs = await db.purchaseOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vendor: true },
    })
    const totalPOAmount = await db.purchaseOrder.aggregate({
      _sum: { grandTotal: true },
      where: { createdAt: { gte: startOfMonth } },
    })

    // Get vendor and RFQ counts manually
    const allVendors = await db.vendor.findMany({ select: { status: true, category: true } })
    const allRfqs = await db.rFQ.findMany({ select: { status: true } })
    const allPOs = await db.purchaseOrder.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear() - 1, 0, 1) } },
      select: { grandTotal: true, createdAt: true, vendor: { select: { category: true } } },
    })

    // Compute vendor status counts
    const vendorStatusCounts: Record<string, number> = {}
    allVendors.forEach((v) => { vendorStatusCounts[v.status] = (vendorStatusCounts[v.status] || 0) + 1 })

    // Compute RFQ status counts
    const rfqStatusCounts: Record<string, number> = {}
    allRfqs.forEach((r) => { rfqStatusCounts[r.status] = (rfqStatusCounts[r.status] || 0) + 1 })

    // Spending by category
    const categorySpend: Record<string, number> = {}
    allPOs.forEach((po) => {
      const cat = po.vendor?.category || 'Other'
      categorySpend[cat] = (categorySpend[cat] || 0) + po.grandTotal
    })
    const spendingByCategory = Object.entries(categorySpend).map(([category, total]) => ({ category, total }))

    // Monthly spending trends
    const monthlySpending: Record<string, number> = {}
    allPOs.forEach((po) => {
      const key = `${po.createdAt.getFullYear()}-${String(po.createdAt.getMonth() + 1).padStart(2, '0')}`
      monthlySpending[key] = (monthlySpending[key] || 0) + po.grandTotal
    })
    const spendingTrends = Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({ month, total }))

    return NextResponse.json({
      stats: {
        activeRfqs,
        pendingApprovals,
        posThisMonth,
        overdueInvoices,
        totalPOAmount: totalPOAmount._sum.grandTotal || 0,
      },
      recentPOs,
      vendorStatusCounts: Object.entries(vendorStatusCounts).map(([status, count]) => ({ status, count })),
      rfqStatusCounts: Object.entries(rfqStatusCounts).map(([status, count]) => ({ status, count })),
      spendingByCategory,
      spendingTrends,
    })
  } catch (error) {
    console.error('Dashboard GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
