import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const approvals = await db.approval.findMany({
      where,
      include: {
        rfq: true,
        quotation: { include: { vendor: true, items: true } },
        approvedBy: true,
        approvalSteps: { include: { approver: true }, orderBy: { stepNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Approvals GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const approval = await db.approval.create({
      data: {
        rfqId: body.rfqId,
        quotationId: body.quotationId,
        status: 'pending',
        currentStep: 1,
        comments: body.comments,
        approvalSteps: {
          create: [
            { stepNumber: 1, stepName: 'Submitted', status: 'approved', actedAt: new Date() },
            { stepNumber: 2, stepName: 'L1 Review', status: 'pending', approverId: body.l1ApproverId },
            { stepNumber: 3, stepName: 'L2 Approval', status: 'pending', approverId: body.l2ApproverId },
            { stepNumber: 4, stepName: 'Generate PO', status: 'pending' },
          ],
        },
      },
      include: {
        approvalSteps: { orderBy: { stepNumber: 'asc' } },
        quotation: { include: { vendor: true } },
      },
    })

    await db.activityLog.create({
      data: {
        action: 'approval_initiated',
        description: `Approval workflow initiated for quotation from ${approval.quotation?.vendor?.companyName || 'vendor'}`,
        category: 'approval',
        entityId: approval.id,
        entityType: 'Approval',
        userId: body.userId,
      },
    })

    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Approvals POST error:', error)
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 })
  }
}
