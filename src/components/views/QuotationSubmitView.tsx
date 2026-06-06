'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Send, Save, ArrowLeft } from 'lucide-react'

interface LineItem { itemName: string; quantity: number; unit: string }

export default function QuotationSubmitView() {
  const { currentUser, selectedRfqId, setView } = useAppStore()
  const [rfq, setRfq] = useState<{ id: string; title: string; description: string | null; deadline: string | null; lineItems: LineItem[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<{ itemName: string; quantity: number; unitPrice: number; total: number; deliveryDays: number }[]>([])
  const [gstPercentage, setGstPercentage] = useState(18)
  const [paymentTerms, setPaymentTerms] = useState('30 days')
  const [notes, setNotes] = useState('')
  const [deliveryDays, setDeliveryDays] = useState(0)

  useEffect(() => {
    if (selectedRfqId) fetchRFQ()
  }, [selectedRfqId])

  const fetchRFQ = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/rfqs/${selectedRfqId}`)
      const data = await res.json()
      setRfq(data.rfq)
      if (data.rfq?.lineItems) {
        setItems(data.rfq.lineItems.map((li: LineItem) => ({
          itemName: li.itemName, quantity: li.quantity, unitPrice: 0, total: 0, deliveryDays: 0,
        })))
      }
    } catch {
      toast.error('Failed to fetch RFQ')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (index: number, field: string, value: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'unitPrice' || field === 'quantity') {
      updated[index].total = updated[index].unitPrice * updated[index].quantity
    }
    setItems(updated)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const gstAmount = subtotal * (gstPercentage / 100)
  const grandTotal = subtotal + gstAmount

  const handleSubmit = async (status: string) => {
    try {
      // Find vendor for current user
      const vendorRes = await fetch('/api/vendors')
      const vendorData = await vendorRes.json()
      const myVendor = vendorData.vendors?.find((v: { userId: string | null }) => v.userId === currentUser?.id)
      
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selectedRfqId,
          vendorId: myVendor?.id || vendorData.vendors?.[0]?.id,
          status,
          subtotal,
          gstPercentage,
          gstAmount,
          grandTotal,
          deliveryDays,
          paymentTerms,
          notes,
          items,
          userId: currentUser?.id,
        }),
      })
      if (res.ok) {
        toast.success(status === 'submitted' ? 'Quotation submitted!' : 'Draft saved!')
        setView('quotations')
      } else {
        toast.error('Failed to submit quotation')
      }
    } catch {
      toast.error('Failed to submit quotation')
    }
  }

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading RFQ details...</div>
  if (!rfq) return <div className="p-8 text-center text-zinc-500">RFQ not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setView('rfqs')} className="text-zinc-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">RFQ: {rfq.title}</h1>
          <p className="text-zinc-400 text-sm">Deadline: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN') : 'Not set'}</p>
        </div>
      </div>

      {/* RFQ Summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">RFQ Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300 text-sm mb-3">{rfq.description}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400">Item</th>
                <th className="text-right py-2 text-zinc-400">Qty</th>
                <th className="text-left py-2 text-zinc-400">Unit</th>
              </tr>
            </thead>
            <tbody>
              {rfq.lineItems.map((li, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-2 text-white">{li.itemName}</td>
                  <td className="py-2 text-white text-right">{li.quantity}</td>
                  <td className="py-2 text-zinc-400">{li.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Quotation Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Submit Quotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 text-zinc-400">Item</th>
                  <th className="text-right py-2 text-zinc-400">Qty</th>
                  <th className="text-right py-2 text-zinc-400">Unit Price (₹)</th>
                  <th className="text-right py-2 text-zinc-400">Total (₹)</th>
                  <th className="text-right py-2 text-zinc-400">Delivery (days)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-2 text-white">{item.itemName}</td>
                    <td className="py-2 text-white text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
                      <Input type="number" value={item.unitPrice || ''} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-zinc-800 border-zinc-700 text-white w-28 ml-auto text-right" />
                    </td>
                    <td className="py-2 text-emerald-400 text-right font-medium">₹{item.total.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <Input type="number" value={item.deliveryDays || ''} onChange={(e) => updateItem(i, 'deliveryDays', parseInt(e.target.value) || 0)} className="bg-zinc-800 border-zinc-700 text-white w-20 ml-auto text-right" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">GST %</Label>
              <Input type="number" value={gstPercentage} onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)} className="bg-zinc-800 border-zinc-700 text-white w-24" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Overall Delivery (days)</Label>
              <Input type="number" value={deliveryDays || ''} onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)} className="bg-zinc-800 border-zinc-700 text-white w-24" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Payment Terms</Label>
              <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">GST ({gstPercentage}%)</span>
              <span className="text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-zinc-700 pt-2">
              <span className="text-white">Grand Total</span>
              <span className="text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" rows={2} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => handleSubmit('draft')} className="border-zinc-700 text-zinc-300">
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            <Button onClick={() => handleSubmit('submitted')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Send className="h-4 w-4 mr-2" /> Submit Quotation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
