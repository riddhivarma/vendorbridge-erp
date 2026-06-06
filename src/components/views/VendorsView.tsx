'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Plus, Search, Eye } from 'lucide-react'

interface Vendor {
  id: string
  companyName: string
  category: string
  gstNumber: string | null
  contactNumber: string | null
  email: string | null
  address: string | null
  status: string
  rating: number
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-yellow-500/15 text-yellow-400',
  blocked: 'bg-red-500/15 text-red-400',
}

export default function VendorsView() {
  const { currentUser } = useAppStore()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null)
  const [form, setForm] = useState({
    companyName: '', category: '', gstNumber: '', contactNumber: '', email: '', address: '', status: 'pending',
  })

  useEffect(() => {
    fetchVendors()
  }, [filterStatus])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (search) params.set('search', search)
      const res = await fetch(`/api/vendors?${params}`)
      const data = await res.json()
      setVendors(data.vendors || [])
    } catch {
      toast.error('Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchVendors()
  }

  const handleAddVendor = async () => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: currentUser?.id }),
      })
      if (res.ok) {
        toast.success('Vendor added successfully')
        setDialogOpen(false)
        setForm({ companyName: '', category: '', gstNumber: '', contactNumber: '', email: '', address: '', status: 'pending' })
        fetchVendors()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add vendor')
      }
    } catch {
      toast.error('Failed to add vendor')
    }
  }

  const statusCounts = {
    all: vendors.length,
    active: vendors.filter((v) => v.status === 'active').length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    blocked: vendors.filter((v) => v.status === 'blocked').length,
  }

  // Recalculate counts from full list
  const [allVendors, setAllVendors] = useState<Vendor[]>([])
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/vendors')
        const data = await res.json()
        setAllVendors(data.vendors || [])
      } catch { /* ignore */ }
    }
    fetchAll()
  }, [dialogOpen])

  const counts = {
    all: allVendors.length,
    active: allVendors.filter((v) => v.status === 'active').length,
    pending: allVendors.filter((v) => v.status === 'pending').length,
    blocked: allVendors.filter((v) => v.status === 'blocked').length,
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-zinc-400 text-sm">Manage supplier profiles and registrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Company Name *</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">GST Number</Label>
                  <Input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="27AABCV1234F1Z5" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Contact Number</Label>
                  <Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Address</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddVendor} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!form.companyName || !form.category}>
                Add Vendor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, reg number, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          Search
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'pending', 'blocked'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' : 'text-zinc-400 hover:text-white'}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full">{counts[status]}</span>
          </Button>
        ))}
      </div>

      {/* Vendors Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No vendors found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Vendor Name</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">GST No.</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Contact No.</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{vendor.companyName}</td>
                      <td className="py-3 px-4 text-zinc-300">{vendor.category}</td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-xs">{vendor.gstNumber || '—'}</td>
                      <td className="py-3 px-4 text-zinc-300">{vendor.contactNumber || '—'}</td>
                      <td className="py-3 px-4 text-yellow-400 text-xs">{renderStars(vendor.rating)}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[vendor.status] || 'bg-zinc-700 text-zinc-300'}>
                          {vendor.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => setViewVendor(vendor)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Vendor Dialog */}
      <Dialog open={!!viewVendor} onOpenChange={() => setViewVendor(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{viewVendor?.companyName}</DialogTitle>
          </DialogHeader>
          {viewVendor && (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-zinc-500 text-xs">Category</span><p className="text-white text-sm">{viewVendor.category}</p></div>
                <div><span className="text-zinc-500 text-xs">Status</span><p><Badge className={statusColors[viewVendor.status]}>{viewVendor.status}</Badge></p></div>
                <div><span className="text-zinc-500 text-xs">GST Number</span><p className="text-white text-sm font-mono">{viewVendor.gstNumber || '—'}</p></div>
                <div><span className="text-zinc-500 text-xs">Contact</span><p className="text-white text-sm">{viewVendor.contactNumber || '—'}</p></div>
                <div><span className="text-zinc-500 text-xs">Email</span><p className="text-white text-sm">{viewVendor.email || '—'}</p></div>
                <div><span className="text-zinc-500 text-xs">Rating</span><p className="text-yellow-400 text-sm">{renderStars(viewVendor.rating)}</p></div>
              </div>
              <div><span className="text-zinc-500 text-xs">Address</span><p className="text-white text-sm">{viewVendor.address || '—'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
