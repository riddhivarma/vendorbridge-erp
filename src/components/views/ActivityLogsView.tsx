'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Clock, FileText, User, ShoppingCart, Receipt, AlertTriangle } from 'lucide-react'

interface ActivityLog {
  id: string; action: string; description: string; category: string;
  entityId: string | null; entityType: string | null; createdAt: string;
  user: { firstName: string; lastName: string; role: string } | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  rfq: FileText,
  approval: CheckCircle2,
  invoice: Receipt,
  vendor: User,
  general: AlertTriangle,
}

const actionIcons: Record<string, React.ElementType> = {
  quotation_selected: CheckCircle2,
  approval_pending: Clock,
  approval_initiated: Clock,
  rfq_published: FileText,
  vendor_added: User,
  po_generated: ShoppingCart,
  invoice_paid: CheckCircle2,
  approval_rejected: AlertTriangle,
}

const categoryFilters = ['all', 'rfq', 'approval', 'invoice', 'vendor']

export default function ActivityLogsView() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [filterCategory])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/activity-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch {
      toast.error('Failed to fetch activity logs')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getIcon = (log: ActivityLog) => {
    const Icon = actionIcons[log.action] || categoryIcons[log.category] || FileText
    return Icon
  }

  const getIconColor = (action: string) => {
    if (action.includes('approved') || action.includes('paid') || action.includes('selected') || action.includes('generated')) return 'text-emerald-400 bg-emerald-500/15'
    if (action.includes('pending') || action.includes('initiated')) return 'text-yellow-400 bg-yellow-500/15'
    if (action.includes('rejected')) return 'text-red-400 bg-red-500/15'
    return 'text-blue-400 bg-blue-500/15'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity & Logs</h1>
        <p className="text-zinc-400 text-sm">Procurement audit trail</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {categoryFilters.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' : 'text-zinc-400 hover:text-white'}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No activity logs found</div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {logs.map((log, i) => {
                const Icon = getIcon(log)
                const iconColor = getIconColor(log.action)
                return (
                  <div key={log.id} className={`flex items-start gap-4 p-4 hover:bg-zinc-800/30 transition-colors ${i < logs.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{log.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-zinc-500 text-xs">{formatTime(log.createdAt)}</span>
                        {log.user && (
                          <span className="text-zinc-500 text-xs">by {log.user.firstName} {log.user.lastName}</span>
                        )}
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 py-0">
                          {log.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="text-[10px] bg-zinc-800 text-zinc-400">{log.entityType || ''}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-zinc-500 text-xs">
          🔒 Audit logs are immutable — write-once, no edit or delete. All procurement actions are permanently recorded for compliance.
        </p>
      </div>
    </div>
  )
}
