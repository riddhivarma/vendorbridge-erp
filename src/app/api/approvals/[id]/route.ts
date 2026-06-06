import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const approval = await db.approval.findUnique({
      where: { id },
      include: {
        rfq: { include: { lineItems: true } },
        quotation: { include: { vendor: true, items: true } },
        approvedBy: true,
        approvalSteps: { include: { approver: true }, orderBy: { stepNumber: 'asc' } },
        purchaseOrder: { include: { items: true, vendor: true } },
      },
    })
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }
    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Approval GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch approval' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const approval = await db.approval.findUnique({
      where: { id },
      include: { approvalSteps: { orderBy: { stepNumber: 'asc' } }, quotation: { include: { vendor: true } } },
    })
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    if (body.action === 'approve') {
      const currentStep = approval.approvalSteps.find((s) => s.status === 'pending')
      if (currentStep) {
        await db.approvalStep.update({
          where: { id: currentStep.id },
          data: { status: 'approved', comments: body.comments, actedAt: new Date(), approverId: body.approverId },
        })
      }

      const nextPendingStep = approval.approvalSteps.find(
        (s) => s.status === 'pending' && s.stepNumber > (currentStep?.stepNumber || 0)
      )

      if (!nextPendingStep) {
        // All steps approved - generate PO
        const rfq = await db.rFQ.findUnique({ where: { id: approval.rfqId }, include: { lineItems: true } })
        const quotation = await db.quotation.findUnique({ where: { id: approval.quotationId }, include: { items: true, vendor: true } })
        
        const poCount = await db.purchaseOrder.count()
        const poNumber = `PO-${String(poCount + 1).padStart(4, '0')}`

        const po = await db.purchaseOrder.create({
          data: {
            poNumber,
            rfqId: approval.rfqId,
            vendorId: approval.quotationId ? (quotation?.vendorId || '') : '',
            approvalId: id,
            billTo: 'VendorBridge Technologies Pvt. Ltd.',
            billToGstin: '27AABCV1234F1Z5',
            billToAddress: '123 Tech Park, Andheri East, Mumbai, Maharashtra 400069',
            vendorAddress: quotation?.vendor?.address,
            vendorGstin: quotation?.vendor?.gstNumber,
            subtotal: quotation?.subtotal || 0,
            cgstPercentage: 9,
            cgstAmount: (quotation?.gstAmount || 0) / 2,
            sgstPercentage: 9,
            sgstAmount: (quotation?.gstAmount || 0) / 2,
            grandTotal: quotation?.grandTotal || 0,
            poDate: new Date(),
            paymentStatus: 'pending',
            items: {
              create: (quotation?.items || []).map((item) => ({
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              })),
            },
          },
        })

        await db.approval.update({
          where: { id },
          data: { status: 'po_generated', currentStep: 4, approvedById: body.approverId, approvedAt: new Date() },
        })

        await db.activityLog.create({
          data: {
            action: 'po_generated',
            description: `PO ${poNumber} generated after full approval`,
            category: 'approval',
            entityId: po.id,
            entityType: 'PurchaseOrder',
            userId: body.approverId,
          },
        })

        return NextResponse.json({ approval: await db.approval.findUnique({ where: { id }, include: { approvalSteps: { include: { approver: true }, orderBy: { stepNumber: 'asc' } }, quotation: { include: { vendor: true } }, purchaseOrder: true } }) })
      } else {
        const newStep = currentStep ? currentStep.stepNumber + 1 : approval.currentStep + 1
        await db.approval.update({
          where: { id },
          data: { currentStep: newStep, status: `l${newStep - 1}_approved` },
        })
      }
    }

    if (body.action === 'reject') {
      const currentStep = approval.approvalSteps.find((s) => s.status === 'pending')
      if (currentStep) {
        await db.approvalStep.update({
          where: { id: currentStep.id },
          data: { status: 'rejected', comments: body.comments, actedAt: new Date(), approverId: body.approverId },
        })
      }
      await db.approval.update({
        where: { id },
        data: { status: 'rejected', approvedById: body.approverId, approvedAt: new Date() },
      })

      await db.activityLog.create({
        data: {
          action: 'approval_rejected',
          description: `Approval rejected at step ${approval.currentStep}`,
          category: 'approval',
          entityId: id,
          entityType: 'Approval',
          userId: body.approverId,
        },
      })
    }

    const updatedApproval = await db.approval.findUnique({
      where: { id },
      include: {
        approvalSteps: { include: { approver: true }, orderBy: { stepNumber: 'asc' } },
        quotation: { include: { vendor: true } },
        purchaseOrder: true,
      },
    })

    return NextResponse.json({ approval: updatedApproval })
  } catch (error) {
    console.error('Approval PUT error:', error)
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 })
  }
}
