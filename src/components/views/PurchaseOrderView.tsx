'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Download, Printer, Send, CheckCircle2, FileText } from 'lucide-react'

interface PurchaseOrder {
  id: string; poNumber: string; rfqId: string; vendorId: string;
  billTo: string | null; billToGstin: string | null; billToAddress: string | null;
  vendorAddress: string | null; vendorGstin: string | null;
  subtotal: number; cgstPercentage: number; cgstAmount: number; sgstPercentage: number; sgstAmount: number;
  grandTotal: number; poDate: string; invoiceDate: string | null; dueDate: string | null;
  paymentStatus: string;
  vendor: { id: string; companyName: string; email: string | null; contactNumber: string | null; address: string | null; gstNumber: string | null };
  items: { id: string; itemName: string; quantity: number; unitPrice: number; total: number }[];
  rfq: { id: string; title: string };
}

export default function PurchaseOrderView() {
  const { currentUser, setView } = useAppStore()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPOs()
  }, [])

  const fetchPOs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/purchase-orders')
      const data = await res.json()
      setPurchaseOrders(data.purchaseOrders || [])
    } catch {
      toast.error('Failed to fetch purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (po: PurchaseOrder) => {
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid', userId: currentUser?.id }),
      })
      if (res.ok) {
        toast.success('Payment marked as completed')
        fetchPOs()
        if (selectedPO?.id === po.id) {
          setSelectedPO({ ...po, paymentStatus: 'paid' })
        }
      } else {
        toast.error('Failed to update payment status')
      }
    } catch {
      toast.error('Failed to update payment status')
    }
  }

  const formatCurrency = (amount: number) => '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('en-IN') : '—'

  const paymentStatusColors: Record<string, string> = {
    paid: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    overdue: 'bg-red-500/15 text-red-400',
  }

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading purchase orders...</div>

  // Detail View
  if (selectedPO) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Purchase Order — {selectedPO.poNumber}</h1>
            <p className="text-zinc-400 text-sm">RFQ: {selectedPO.rfq?.title}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Send className="h-4 w-4 mr-2" /> Send Invoice
            </Button>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 space-y-6">
            {/* Bill To / Vendor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-emerald-400 font-semibold text-sm">BILL TO</h3>
                <p className="text-white font-medium">{selectedPO.billTo || 'VendorBridge Technologies Pvt. Ltd.'}</p>
                <p className="text-zinc-400 text-sm">{selectedPO.billToAddress}</p>
                <p className="text-zinc-400 text-sm">GSTIN: {selectedPO.billToGstin}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-emerald-400 font-semibold text-sm">VENDOR</h3>
                <p className="text-white font-medium">{selectedPO.vendor?.companyName}</p>
                <p className="text-zinc-400 text-sm">{selectedPO.vendorAddress || selectedPO.vendor?.address}</p>
                <p className="text-zinc-400 text-sm">GSTIN: {selectedPO.vendorGstin || selectedPO.vendor?.gstNumber}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
              <div>
                <span className="text-zinc-500 text-xs">PO Date</span>
                <p className="text-white text-sm">{formatDate(selectedPO.poDate)}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs">Invoice Date</span>
                <p className="text-white text-sm">{formatDate(selectedPO.invoiceDate)}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs">Due Date</span>
                <p className="text-white text-sm">{formatDate(selectedPO.dueDate)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-zinc-800 pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 text-zinc-400">Item</th>
                    <th className="text-right py-2 text-zinc-400">Qty</th>
                    <th className="text-right py-2 text-zinc-400">Unit Price</th>
                    <th className="text-right py-2 text-zinc-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items?.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50">
                      <td className="py-3 text-white">{item.itemName}</td>
                      <td className="py-3 text-white text-right">{item.quantity}</td>
                      <td className="py-3 text-zinc-300 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-white text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white">{formatCurrency(selectedPO.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">CGST ({selectedPO.cgstPercentage}%)</span>
                <span className="text-white">{formatCurrency(selectedPO.cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">SGST ({selectedPO.sgstPercentage}%)</span>
                <span className="text-white">{formatCurrency(selectedPO.sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-zinc-700 pt-2">
                <span className="text-white">Grand Total</span>
                <span className="text-emerald-400">{formatCurrency(selectedPO.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-zinc-400 text-sm">Payment Status:</span>
                <Badge className={paymentStatusColors[selectedPO.paymentStatus] || 'bg-zinc-700 text-zinc-300'}>
                  {selectedPO.paymentStatus}
                </Badge>
              </div>
              {selectedPO.paymentStatus !== 'paid' && (
                <Button onClick={() => handleMarkPaid(selectedPO)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Paid
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => setSelectedPO(null)} className="border-zinc-700 text-zinc-300">
          ← Back to all orders
        </Button>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
        <p className="text-zinc-400 text-sm">View and manage purchase orders and delivery tracking</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {purchaseOrders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No purchase orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">PO#</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Vendor</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">PO Date</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-emerald-400 font-mono">{po.poNumber}</td>
                      <td className="py-3 px-4 text-white">{po.vendor?.companyName}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCurrency(po.grandTotal)}</td>
                      <td className="py-3 px-4 text-zinc-300">{formatDate(po.poDate)}</td>
                      <td className="py-3 px-4 text-zinc-300">{formatDate(po.dueDate)}</td>
                      <td className="py-3 px-4">
                        <Badge className={paymentStatusColors[po.paymentStatus] || 'bg-zinc-700 text-zinc-300'}>
                          {po.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300" onClick={() => setSelectedPO(po)}>
                          <FileText className="h-4 w-4 mr-1" /> View
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
    </div>
  )
}
