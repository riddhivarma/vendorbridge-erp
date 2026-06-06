'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { ArrowLeft, Check } from 'lucide-react'

interface RFQ {
  id: string; title: string; description: string | null; deadline: string | null;
  lineItems: { itemName: string; quantity: number; unit: string }[]
}

interface Quotation {
  id: string; rfqId: string; vendorId: string; status: string;
  subtotal: number; gstPercentage: number; gstAmount: number; grandTotal: number;
  deliveryDays: number; paymentTerms: string; notes: string | null;
  vendor: { id: string; companyName: string; rating: number };
  items: { itemName: string; quantity: number; unitPrice: number; total: number; deliveryDays: number | null }[];
}

export default function QuotationComparisonView() {
  const { currentUser, selectedRfqId, setView, setSelectedApprovalId } = useAppStore()
  const [rfqs, setRfqs] = useState<(RFQ & { quotations: Quotation[] })[]>([])
  const [selectedRfq, setSelectedRfq] = useState<string | null>(selectedRfqId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rfqs')
      const data = await res.json()
      const rfqsData = (data.rfqs || []).filter((r: { quotations: Quotation[] }) => r.quotations?.length > 0)
      setRfqs(rfqsData)
      if (selectedRfqId && rfqsData.some((r: { id: string }) => r.id === selectedRfqId)) {
        setSelectedRfq(selectedRfqId)
      } else if (rfqsData.length > 0) {
        setSelectedRfq(rfqsData[0].id)
      }
    } catch {
      toast.error('Failed to fetch RFQs')
    } finally {
      setLoading(false)
    }
  }

  const currentRfq = rfqs.find((r) => r.id === selectedRfq)
  const quotations = currentRfq?.quotations || []
  const lowestPrice = Math.min(...quotations.map((q) => q.grandTotal))

  const handleSelectQuotation = async (quotation: Quotation) => {
    try {
      // First update quotation status to selected
      const updateRes = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'selected', userId: currentUser?.id }),
      })

      // Then create approval workflow
      const approvalRes = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: quotation.rfqId,
          quotationId: quotation.id,
          l1ApproverId: currentUser?.id,
          l2ApproverId: currentUser?.id,
          userId: currentUser?.id,
        }),
      })

      if (approvalRes.ok) {
        const data = await approvalRes.json()
        setSelectedApprovalId(data.approval.id)
        toast.success('Vendor selected! Approval workflow initiated.')
        setView('approvals')
      } else {
        toast.error('Failed to initiate approval')
      }
    } catch {
      toast.error('Failed to select quotation')
    }
  }

  const formatCurrency = (amount: number) => '₹' + amount.toLocaleString('en-IN')

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading quotations...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setView('rfqs')} className="text-zinc-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Comparison</h1>
          <p className="text-zinc-400 text-sm">
            {currentRfq ? `RFQ: ${currentRfq.title} — ${quotations.length} quotations received` : 'Select an RFQ to compare quotations'}
          </p>
        </div>
      </div>

      {/* RFQ Selector */}
      <div className="flex gap-2 flex-wrap">
        {rfqs.map((rfq) => (
          <Button
            key={rfq.id}
            variant={selectedRfq === rfq.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRfq(rfq.id)}
            className={selectedRfq === rfq.id ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' : 'border-zinc-700 text-zinc-300'}
          >
            {rfq.title}
            <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-300">{rfq.quotations?.length || 0}</Badge>
          </Button>
        ))}
      </div>

      {rfqs.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8 text-center text-zinc-500">
            No RFQs with quotations yet. Publish RFQs and wait for vendor responses.
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {quotations.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Vendor Comparison</CardTitle>
            <p className="text-xs text-zinc-500">Green = lowest price. Selecting a vendor initiates the approval workflow.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Criteria</th>
                  {quotations.map((q) => (
                    <th key={q.id} className={`text-center py-3 px-3 font-medium min-w-[180px] ${q.grandTotal === lowestPrice ? 'text-emerald-400' : 'text-white'}`}>
                      {q.vendor?.companyName}
                      {q.grandTotal === lowestPrice && <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px]">LOWEST</Badge>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-zinc-400">Price (Total)</td>
                  {quotations.map((q) => (
                    <td key={q.id} className={`py-3 px-3 text-center font-medium ${q.grandTotal === lowestPrice ? 'text-emerald-400 bg-emerald-500/5' : 'text-white'}`}>
                      {formatCurrency(q.grandTotal)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-zinc-400">GST %</td>
                  {quotations.map((q) => (
                    <td key={q.id} className="py-3 px-3 text-center text-white">{q.gstPercentage}%</td>
                  ))}
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-zinc-400">Delivery (days)</td>
                  {quotations.map((q) => (
                    <td key={q.id} className="py-3 px-3 text-center text-white">{q.deliveryDays}</td>
                  ))}
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-zinc-400">Vendor Rating</td>
                  {quotations.map((q) => (
                    <td key={q.id} className="py-3 px-3 text-center text-yellow-400">
                      {'★'.repeat(Math.round(q.vendor?.rating || 0))}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-zinc-400">Payment Terms</td>
                  {quotations.map((q) => (
                    <td key={q.id} className="py-3 px-3 text-center text-white">{q.paymentTerms}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 text-zinc-400">Action</td>
                  {quotations.map((q) => (
                    <td key={q.id} className="py-3 px-3 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleSelectQuotation(q)}
                        className={q.grandTotal === lowestPrice ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {q.grandTotal === lowestPrice ? 'Select & Approve' : 'Select'}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Item-level comparison */}
      {quotations.length > 0 && currentRfq && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Item-level Comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {currentRfq.lineItems?.map((li, liIndex) => (
              <div key={liIndex} className="mb-4">
                <h4 className="text-white font-medium mb-2">{li.itemName} (Qty: {li.quantity} {li.unit})</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-2 text-zinc-400">Vendor</th>
                      <th className="text-right py-2 text-zinc-400">Unit Price</th>
                      <th className="text-right py-2 text-zinc-400">Total</th>
                      <th className="text-right py-2 text-zinc-400">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q) => {
                      const item = q.items?.find((qi) => qi.itemName === li.itemName)
                      return (
                        <tr key={q.id} className="border-b border-zinc-800/50">
                          <td className="py-2 text-white">{q.vendor?.companyName}</td>
                          <td className="py-2 text-white text-right">{item ? formatCurrency(item.unitPrice) : '—'}</td>
                          <td className="py-2 text-white text-right">{item ? formatCurrency(item.total) : '—'}</td>
                          <td className="py-2 text-zinc-300 text-right">{item?.deliveryDays || '—'} days</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
