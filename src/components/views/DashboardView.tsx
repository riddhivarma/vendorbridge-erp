'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { FileText, CheckCircle2, ShoppingCart, AlertTriangle, Plus, Eye, Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DashboardStats {
  activeRfqs: number
  pendingApprovals: number
  posThisMonth: number
  overdueInvoices: number
  totalPOAmount: number
}

interface RecentPO {
  id: string
  poNumber: string
  vendor: { companyName: string }
  grandTotal: number
  paymentStatus: string
}

export default function DashboardView() {
  const { currentUser, setView } = useAppStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPOs, setRecentPOs] = useState<RecentPO[]>([])
  const [spendingData, setSpendingData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data.stats)
      setRecentPOs(data.recentPOs || [])
      
      const catData = (data.spendingByCategory || []).map((s: { category: string; count: number }) => ({
        name: s.category,
        value: s.count,
      }))
      if (catData.length === 0) {
        setSpendingData([
          { name: 'IT', value: 40 },
          { name: 'Construction', value: 25 },
          { name: 'Logistics', value: 20 },
          { name: 'Furniture', value: 15 },
        ])
      } else {
        setSpendingData(catData)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-96 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {currentUser?.firstName} {currentUser?.lastName}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          <span className="text-emerald-400 capitalize">{currentUser?.role?.replace('_', ' ')}</span>
          {' · '}
          Today&apos;s Overview — {today}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active RFQs</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.activeRfqs || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:border-yellow-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Pending Approvals</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.pendingApprovals || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">PO&apos;s This Month</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.posThisMonth || 0}</p>
                <p className="text-xs text-zinc-500 mt-1">{formatCurrency(stats?.totalPOAmount || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:border-red-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Overdue Invoices</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.overdueInvoices || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent POs + Spending Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPOs.length === 0 ? (
              <p className="text-zinc-500 text-sm py-8 text-center">No purchase orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-2 text-zinc-400 font-medium">PO#</th>
                      <th className="text-left py-2 text-zinc-400 font-medium">Vendor</th>
                      <th className="text-right py-2 text-zinc-400 font-medium">Amount</th>
                      <th className="text-right py-2 text-zinc-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPOs.map((po) => (
                      <tr key={po.id} className="border-b border-zinc-800/50">
                        <td className="py-3 text-emerald-400 font-mono">{po.poNumber}</td>
                        <td className="py-3 text-white">{po.vendor?.companyName || 'N/A'}</td>
                        <td className="py-3 text-white text-right">{formatCurrency(po.grandTotal)}</td>
                        <td className="py-3 text-right">
                          <Badge variant={po.paymentStatus === 'paid' ? 'default' : po.paymentStatus === 'overdue' ? 'destructive' : 'secondary'} className={
                            po.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' :
                            po.paymentStatus === 'overdue' ? 'bg-red-500/15 text-red-400 hover:bg-red-500/20' :
                            'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/20'
                          }>
                            {po.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Trends Pie Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {spendingData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {spendingData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-zinc-400">{item.name}</span>
                  <span className="text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setView('rfqs')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New RFQ
        </Button>
        <Button onClick={() => setView('vendors')} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Users className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
        <Button onClick={() => setView('invoices')} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Eye className="h-4 w-4 mr-2" />
          View Invoices
        </Button>
      </div>
    </div>
  )
}
