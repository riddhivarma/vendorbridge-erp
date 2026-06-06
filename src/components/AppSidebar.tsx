'use client'

import { useAppStore, type ViewName } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CheckCircle2,
  ShoppingCart,
  Wallet,
  BarChart3,
  Activity,
  Building2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navItems: { id: ViewName; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'rfqs', label: "RFQ's", icon: FileText },
  { id: 'quotations', label: 'Quotations', icon: Receipt },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'invoices', label: 'Invoices', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export default function AppSidebar() {
  const { currentView, setView, currentUser, logout, sidebarOpen, toggleSidebar } = useAppStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 w-64 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">VendorBridge</h1>
            <p className="text-[11px] text-zinc-500">Procurement ERP</p>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id)
                    if (window.innerWidth < 768) toggleSidebar()
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive && 'text-emerald-400')} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-zinc-800" />

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-zinc-500 capitalize truncate">
                {currentUser?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
