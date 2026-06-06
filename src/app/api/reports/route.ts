import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const now = new Date()

    // Vendor performance
    const vendors = await db.vendor.findMany({
      include: {
        quotations: { include: { items: true } },
        purchaseOrders: true,
      },
    })

    const vendorPerformance = vendors.map((v) => ({
      id: v.id,
      companyName: v.companyName,
      category: v.category,
      rating: v.rating,
      totalQuotations: v.quotations.length,
      totalPOs: v.purchaseOrders.length,
      totalRevenue: v.purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0),
    }))

    // Monthly procurement trends
    const pos = await db.purchaseOrder.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear() - 1, 0, 1) } },
      select: { grandTotal: true, createdAt: true, vendor: { select: { category: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const monthlyTrends: Record<string, { total: number; count: number }> = {}
    pos.forEach((po) => {
      const key = `${po.createdAt.getFullYear()}-${String(po.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyTrends[key]) monthlyTrends[key] = { total: 0, count: 0 }
      monthlyTrends[key].total += po.grandTotal
      monthlyTrends[key].count += 1
    })

    const procurementTrends = Object.entries(monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))

    // Spending by category
    const spendingByCategory: Record<string, number> = {}
    pos.forEach((po) => {
      const cat = po.vendor?.category || 'Other'
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + po.grandTotal
    })

    const categorySpending = Object.entries(spendingByCategory).map(([category, total]) => ({ category, total }))

    // RFQ statistics (manual count instead of groupBy)
    const allRfqs = await db.rFQ.findMany({ select: { status: true } })
    const rfqCounts: Record<string, number> = {}
    allRfqs.forEach((r) => { rfqCounts[r.status] = (rfqCounts[r.status] || 0) + 1 })
    const rfqStats = Object.entries(rfqCounts).map(([status, count]) => ({ status, count }))

    // Approval statistics (manual count)
    const allApprovals = await db.approval.findMany({ select: { status: true } })
    const approvalCounts: Record<string, number> = {}
    allApprovals.forEach((a) => { approvalCounts[a.status] = (approvalCounts[a.status] || 0) + 1 })
    const approvalStats = Object.entries(approvalCounts).map(([status, count]) => ({ status, count }))

    return NextResponse.json({
      vendorPerformance,
      procurementTrends,
      categorySpending,
      rfqStats,
      approvalStats,
      totalSpend: pos.reduce((sum, po) => sum + po.grandTotal, 0),
      avgPOValue: pos.length ? pos.reduce((sum, po) => sum + po.grandTotal, 0) / pos.length : 0,
    })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 })
  }
}
