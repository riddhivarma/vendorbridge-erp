'use client'

import AppSidebar from '@/components/AppSidebar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import DashboardView from '@/components/views/DashboardView'
import VendorsView from '@/components/views/VendorsView'
import RfqsView from '@/components/views/RfqsView'
import QuotationSubmitView from '@/components/views/QuotationSubmitView'
import QuotationComparisonView from '@/components/views/QuotationComparisonView'
import ApprovalWorkflowView from '@/components/views/ApprovalWorkflowView'
import PurchaseOrderView from '@/components/views/PurchaseOrderView'
import InvoicesView from '@/components/views/InvoicesView'
import ActivityLogsView from '@/components/views/ActivityLogsView'
import ReportsView from '@/components/views/ReportsView'

export default function AppShell() {
  const { currentView, sidebarOpen } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />
      case 'vendors': return <VendorsView />
      case 'rfqs': return <RfqsView />
      case 'quotations': return <QuotationComparisonView />
      case 'approvals': return <ApprovalWorkflowView />
      case 'purchase-orders': return <PurchaseOrderView />
      case 'invoices': return <InvoicesView />
      case 'reports': return <ReportsView />
      case 'activity': return <ActivityLogsView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AppSidebar />
      <main
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-0'
        )}
      >
        <div className="p-4 md:p-6 pt-14 md:pt-6">
          {renderView()}
        </div>
      </main>
    </div>
  )
}

// Export for use in QuotationSubmitView
export { QuotationSubmitView }
