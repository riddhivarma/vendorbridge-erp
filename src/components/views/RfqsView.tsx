'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Plus, FileText, Trash2, Send, Save, Upload } from 'lucide-react'

interface Vendor { id: string; companyName: string }
interface LineItem { itemName: string; quantity: number; unit: string }
interface RFQ {
  id: string; title: string; description: string | null; category: string | null;
  deadline: string | null; status: string; createdAt: string;
  lineItems: LineItem[]; vendors: { vendor: Vendor }[];
  quotations: { id: string; vendorId: string; vendor: Vendor; status: string; grandTotal: number }[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-500/15 text-zinc-400',
  published: 'bg-emerald-500/15 text-emerald-400',
  closed: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

export default function RfqsView() {
  const { currentUser, setView, setSelectedRfqId } = useAppStore()
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    title: '', description: '', category: '', deadline: '',
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([{ itemName: '', quantity: 1, unit: 'NOS' }])
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([])

  useEffect(() => {
    fetchRfqs()
    fetchVendors()
  }, [])

  const fetchRfqs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rfqs')
      const data = await res.json()
      setRfqs(data.rfqs || [])
    } catch {
      toast.error('Failed to fetch RFQs')
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors?status=active')
      const data = await res.json()
      setVendors((data.vendors || []).map((v: Vendor) => ({ id: v.id, companyName: v.companyName })))
    } catch { /* ignore */ }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { itemName: '', quantity: 1, unit: 'NOS' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const toggleVendor = (vendorId: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    )
  }

  const handleCreateRFQ = async (status: string) => {
    if (!form.title || !form.category) {
      toast.error('Please fill in title and category')
      return
    }
    try {
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status,
          createdById: currentUser?.id,
          lineItems: lineItems.filter(li => li.itemName),
          vendorIds: selectedVendorIds,
        }),
      })
      if (res.ok) {
        toast.success(status === 'published' ? 'RFQ published successfully' : 'RFQ saved as draft')
        setCreateOpen(false)
        resetForm()
        fetchRfqs()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create RFQ')
      }
    } catch {
      toast.error('Failed to create RFQ')
    }
  }

  const resetForm = () => {
    setForm({ title: '', description: '', category: '', deadline: '' })
    setLineItems([{ itemName: '', quantity: 1, unit: 'NOS' }])
    setSelectedVendorIds([])
    setStep(1)
  }

  const handleViewQuotations = (rfq: RFQ) => {
    setSelectedRfqId(rfq.id)
    setView('quotations')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">RFQs — Request for Quotation</h1>
          <p className="text-zinc-400 text-sm">Create and manage procurement requests</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New RFQ
        </Button>
      </div>

      {/* Create RFQ Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create RFQ — New Request for Quotation</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Items' : 'Vendors'}
                </span>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-zinc-700'}`} />}
              </button>
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Enter RFQ title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Deadline</Label>
                  <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={3} placeholder="Describe the procurement requirements..." />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-emerald-500 hover:bg-emerald-600 text-white">Next →</Button>
              </div>
            </div>
          )}

          {/* Step 2: Line Items */}
          {step === 2 && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Line Items</Label>
                <Button variant="ghost" size="sm" onClick={addLineItem} className="text-emerald-400 hover:text-emerald-300">
                  <Plus className="h-4 w-4 mr-1" /> Add Line Item
                </Button>
              </div>
              <div className="space-y-2">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {i === 0 && <span className="text-xs text-zinc-500">Item Name</span>}
                      <Input value={item.itemName} onChange={(e) => updateLineItem(i, 'itemName', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Item name" />
                    </div>
                    <div className="w-20">
                      {i === 0 && <span className="text-xs text-zinc-500">Qty</span>}
                      <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value) || 0)} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="w-20">
                      {i === 0 && <span className="text-xs text-zinc-500">Unit</span>}
                      <Select value={item.unit} onValueChange={(v) => updateLineItem(i, 'unit', v)}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="NOS">NOS</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="MTR">MTR</SelectItem>
                          <SelectItem value="SET">SET</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="BAG">BAG</SelectItem>
                          <SelectItem value="CM">CM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {lineItems.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeLineItem(i)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Attachments placeholder */}
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Drag & drop files or click to upload</p>
                <p className="text-zinc-600 text-xs mt-1">PDF, DOC, XLS up to 10MB</p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="border-zinc-700 text-zinc-300">← Back</Button>
                <Button onClick={() => setStep(3)} className="bg-emerald-500 hover:bg-emerald-600 text-white">Next →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Vendors */}
          {step === 3 && (
            <div className="space-y-4 mt-4">
              <Label className="text-zinc-300">Assign Vendors</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {vendors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleVendor(v.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedVendorIds.includes(v.id) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border ${selectedVendorIds.includes(v.id) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                      {selectedVendorIds.includes(v.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-white text-sm">{v.companyName}</span>
                  </button>
                ))}
              </div>
              {vendors.length === 0 && <p className="text-zinc-500 text-sm">No active vendors available. Add vendors first.</p>}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="border-zinc-700 text-zinc-300">← Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCreateRFQ('draft')} className="border-zinc-700 text-zinc-300">
                    <Save className="h-4 w-4 mr-2" /> Save as Draft
                  </Button>
                  <Button onClick={() => handleCreateRFQ('published')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Send className="h-4 w-4 mr-2" /> Send to Vendors
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RFQ List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">All RFQs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No RFQs found. Create your first RFQ!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Title</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Deadline</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Items</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Quotations</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{rfq.title}</p>
                        <p className="text-zinc-500 text-xs">{rfq.description?.substring(0, 60)}...</p>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{rfq.category || '—'}</td>
                      <td className="py-3 px-4 text-zinc-300">
                        {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{rfq.lineItems?.length || 0}</td>
                      <td className="py-3 px-4 text-emerald-400">{rfq.quotations?.length || 0}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[rfq.status] || 'bg-zinc-700 text-zinc-300'}>{rfq.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {rfq.quotations?.length > 0 ? (
                          <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300" onClick={() => handleViewQuotations(rfq)}>
                            Compare Quotes
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-zinc-400">
                            <FileText className="h-4 w-4 mr-1" /> View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
