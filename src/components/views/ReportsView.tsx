'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download, TrendingUp, Users, ShoppingCart, BarChart3 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface VendorPerformance {
  id: string; companyName: string; category: string; rating: number;
  totalQuotations: number; totalPOs: number; totalRevenue: number;
}

interface ProcurementTrend {
  month: string; total: number; count: number;
}

export default function ReportsView() {
  const [data, setData] = useState<{
    vendorPerformance: VendorPerformance[]
    procurementTrends: ProcurementTrend[]
    categorySpending: { category: string; total: number }[]
    rfqStats: { status: string; count: number }[]
    approvalStats: { status: string; count: number }[]
    totalSpend: number
    avgPOValue: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reports')
      const reportData = await res.json()
      setData(reportData)
    } catch {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => '₹' + (amount / 100000).toFixed(1) + 'L'

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const tooltipStyle = { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-64 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-zinc-900 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-zinc-400 text-sm">Procurement insights and performance metrics</p>
        </div>
        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => toast.success('Report exported!')}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Total Spend</p>
                <p className="text-xl font-bold text-white">₹{(data?.totalSpend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Avg PO Value</p>
                <p className="text-xl font-bold text-white">₹{(data?.avgPOValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Active Vendors</p>
                <p className="text-xl font-bold text-white">{data?.vendorPerformance?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Procurement Trends */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Monthly Procurement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.procurementTrends?.length || 0) > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.procurementTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => ['₹' + value.toLocaleString('en-IN'), 'Spend']} />
                    <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-500">No trend data available</div>
            )}
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.categorySpending?.length || 0) > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.categorySpending || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="category" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} formatter={(value: number) => ['₹' + value.toLocaleString('en-IN'), 'Spend']} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {(data?.categorySpending || []).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-500">No category data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data?.vendorPerformance?.length || 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Vendor</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
                    <th className="text-center py-3 px-4 text-zinc-400 font-medium">Rating</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Quotations</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">POs</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.vendorPerformance || []).map((vp) => (
                    <tr key={vp.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{vp.companyName}</td>
                      <td className="py-3 px-4 text-zinc-300">{vp.category}</td>
                      <td className="py-3 px-4 text-center text-yellow-400">{'★'.repeat(Math.round(vp.rating))}</td>
                      <td className="py-3 px-4 text-white text-right">{vp.totalQuotations}</td>
                      <td className="py-3 px-4 text-white text-right">{vp.totalPOs}</td>
                      <td className="py-3 px-4 text-emerald-400 text-right font-medium">₹{vp.totalRevenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">No vendor performance data yet</div>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">RFQ Status</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.rfqStats?.length || 0) > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.rfqStats || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(data?.rfqStats || []).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500">No RFQ data</div>
            )}
            <div className="flex gap-4 justify-center">
              {(data?.rfqStats || []).map((stat, i) => (
                <div key={stat.status} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-zinc-400 capitalize">{stat.status}</span>
                  <span className="text-white">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.approvalStats?.length || 0) > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.approvalStats || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(data?.approvalStats || []).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500">No approval data</div>
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              {(data?.approvalStats || []).map((stat, i) => (
                <div key={stat.status} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-zinc-400 capitalize">{stat.status.replace(/_/g, ' ')}</span>
                  <span className="text-white">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
