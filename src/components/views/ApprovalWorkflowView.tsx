'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react'

interface ApprovalStep {
  id: string; stepNumber: number; stepName: string; status: string; comments: string | null; actedAt: string | null;
  approver: { firstName: string; lastName: string; role: string } | null;
}

interface Approval {
  id: string; rfqId: string; quotationId: string; status: string; currentStep: number; comments: string | null;
  rfq: { id: string; title: string };
  quotation: { id: string; vendorId: string; grandTotal: number; deliveryDays: number; paymentTerms: string; vendor: { id: string; companyName: string; rating: number } };
  approvalSteps: ApprovalStep[];
  purchaseOrder: { id: string; poNumber: string } | null;
}

export default function ApprovalWorkflowView() {
  const { currentUser, selectedApprovalId, setView } = useAppStore()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(selectedApprovalId)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/approvals')
      const data = await res.json()
      setApprovals(data.approvals || [])
      if (selectedApprovalId && data.approvals?.some((a: { id: string }) => a.id === selectedApprovalId)) {
        setSelectedId(selectedApprovalId)
      } else if (data.approvals?.length > 0) {
        setSelectedId(data.approvals[0].id)
      }
    } catch {
      toast.error('Failed to fetch approvals')
    } finally {
      setLoading(false)
    }
  }

  const currentApproval = approvals.find((a) => a.id === selectedId)

  const handleApprove = async () => {
    if (!currentApproval) return
    try {
      const res = await fetch(`/api/approvals/${currentApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', comments: comment, approverId: currentUser?.id }),
      })
      if (res.ok) {
        toast.success('Approved successfully')
        setComment('')
        fetchApprovals()
      } else {
        toast.error('Failed to approve')
      }
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!currentApproval) return
    try {
      const res = await fetch(`/api/approvals/${currentApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', comments: comment, approverId: currentUser?.id }),
      })
      if (res.ok) {
        toast.error('Rejected')
        setComment('')
        fetchApprovals()
      } else {
        toast.error('Failed to reject')
      }
    } catch {
      toast.error('Failed to reject')
    }
  }

  const formatCurrency = (amount: number) => '₹' + amount.toLocaleString('en-IN')

  const stepIcons: Record<string, React.ElementType> = {
    approved: CheckCircle2,
    pending: Clock,
    rejected: XCircle,
  }

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading approvals...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setView('quotations')} className="text-zinc-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Workflow</h1>
          <p className="text-zinc-400 text-sm">Review and approve procurement requests</p>
        </div>
      </div>

      {/* Approval Selector */}
      <div className="flex gap-2 flex-wrap">
        {approvals.map((a) => (
          <Button
            key={a.id}
            variant={selectedId === a.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedId(a.id)}
            className={selectedId === a.id ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' : 'border-zinc-700 text-zinc-300'}
          >
            {a.rfq?.title?.substring(0, 30)}... — {a.quotation?.vendor?.companyName}
          </Button>
        ))}
      </div>

      {approvals.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8 text-center text-zinc-500">
            No approval workflows yet. Select a vendor from the Quotation Comparison page.
          </CardContent>
        </Card>
      )}

      {currentApproval && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Steps */}
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">
                RFQ: {currentApproval.rfq?.title} — Vendor: {currentApproval.quotation?.vendor?.companyName} — {formatCurrency(currentApproval.quotation?.grandTotal || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Progress Bar */}
              <div className="flex items-center gap-1">
                {currentApproval.approvalSteps?.map((step, i) => {
                  const Icon = stepIcons[step.status] || Clock
                  const isCurrentStep = step.stepNumber === currentApproval.currentStep
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center flex-1 ${
                        step.status === 'approved' ? 'text-emerald-400' :
                        step.status === 'rejected' ? 'text-red-400' :
                        isCurrentStep ? 'text-yellow-400' : 'text-zinc-500'
                      }`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                          step.status === 'approved' ? 'border-emerald-500 bg-emerald-500/15' :
                          step.status === 'rejected' ? 'border-red-500 bg-red-500/15' :
                          isCurrentStep ? 'border-yellow-500 bg-yellow-500/15' : 'border-zinc-700 bg-zinc-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-1.5 text-center font-medium">
                          {step.stepNumber}. {step.stepName}
                        </span>
                        {step.approver && (
                          <span className="text-[10px] text-zinc-500">
                            {step.approver.firstName} {step.approver.lastName}
                          </span>
                        )}
                      </div>
                      {i < (currentApproval.approvalSteps?.length || 0) - 1 && (
                        <ChevronRight className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step Details */}
              <div className="space-y-3">
                {currentApproval.approvalSteps?.map((step) => (
                  <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                    step.status === 'approved' ? 'bg-emerald-500/5 border border-emerald-500/20' :
                    step.status === 'rejected' ? 'bg-red-500/5 border border-red-500/20' :
                    'bg-zinc-800/50 border border-zinc-700'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      step.status === 'approved' ? 'bg-emerald-500 text-white' :
                      step.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{step.stepName}</span>
                        <Badge className={
                          step.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                          step.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                          'bg-yellow-500/15 text-yellow-400'
                        }>
                          {step.status}
                        </Badge>
                      </div>
                      {step.approver && (
                        <p className="text-zinc-400 text-xs mt-1">
                          Approver: {step.approver.firstName} {step.approver.lastName} ({step.approver.role.replace('_', ' ')})
                        </p>
                      )}
                      {step.comments && <p className="text-zinc-400 text-xs mt-1 italic">&quot;{step.comments}&quot;</p>}
                      {step.actedAt && <p className="text-zinc-600 text-[10px] mt-1">{new Date(step.actedAt).toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Area */}
              {currentApproval.status !== 'rejected' && currentApproval.status !== 'po_generated' && (
                <div className="space-y-3 border-t border-zinc-800 pt-4">
                  <Label className="text-zinc-300">Add your comments or conditions...</Label>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" rows={2} placeholder="Enter comments..." />
                  <div className="flex gap-3">
                    <Button onClick={handleApprove} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button onClick={handleReject} variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              )}

              {currentApproval.status === 'po_generated' && currentApproval.purchaseOrder && (
                <div className="border-t border-zinc-800 pt-4">
                  <Button onClick={() => setView('purchase-orders')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    View Purchase Order — {currentApproval.purchaseOrder.poNumber}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotation Summary */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-zinc-500 text-xs">Vendor</span>
                  <p className="text-white text-sm">{currentApproval.quotation?.vendor?.companyName}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Total Amount</span>
                  <p className="text-emerald-400 text-lg font-bold">{formatCurrency(currentApproval.quotation?.grandTotal || 0)}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Delivery</span>
                  <p className="text-white text-sm">{currentApproval.quotation?.deliveryDays} days</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Vendor Rating</span>
                  <p className="text-yellow-400 text-sm">{'★'.repeat(Math.round(currentApproval.quotation?.vendor?.rating || 0))}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Payment Terms</span>
                  <p className="text-white text-sm">{currentApproval.quotation?.paymentTerms}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Approval Status</span>
                  <Badge className={
                    currentApproval.status === 'po_generated' ? 'bg-emerald-500/15 text-emerald-400' :
                    currentApproval.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }>
                    {currentApproval.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
