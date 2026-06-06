import { create } from 'zustand'

export type ViewName = 
  | 'dashboard' 
  | 'vendors' 
  | 'rfqs' 
  | 'quotations' 
  | 'approvals' 
  | 'purchase-orders' 
  | 'invoices' 
  | 'reports' 
  | 'activity'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  country: string | null
  role: string
  additionalInfo: string | null
  avatar: string | null
}

interface AppState {
  currentUser: CurrentUser | null
  currentView: ViewName
  selectedRfqId: string | null
  selectedVendorId: string | null
  selectedQuotationId: string | null
  selectedApprovalId: string | null
  selectedPurchaseOrderId: string | null
  sidebarOpen: boolean

  setUser: (user: CurrentUser | null) => void
  logout: () => void
  setView: (view: ViewName) => void
  setSelectedRfqId: (id: string | null) => void
  setSelectedVendorId: (id: string | null) => void
  setSelectedQuotationId: (id: string | null) => void
  setSelectedApprovalId: (id: string | null) => void
  setSelectedPurchaseOrderId: (id: string | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentView: 'dashboard',
  selectedRfqId: null,
  selectedVendorId: null,
  selectedQuotationId: null,
  selectedApprovalId: null,
  selectedPurchaseOrderId: null,
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,

  setUser: (user) => set({ currentUser: user }),
  logout: () => set({ 
    currentUser: null, 
    currentView: 'dashboard',
    selectedRfqId: null,
    selectedVendorId: null,
    selectedQuotationId: null,
    selectedApprovalId: null,
    selectedPurchaseOrderId: null,
  }),
  setView: (view) => set({ currentView: view }),
  setSelectedRfqId: (id) => set({ selectedRfqId: id }),
  setSelectedVendorId: (id) => set({ selectedVendorId: id }),
  setSelectedQuotationId: (id) => set({ selectedQuotationId: id }),
  setSelectedApprovalId: (id) => set({ selectedApprovalId: id }),
  setSelectedPurchaseOrderId: (id) => set({ selectedPurchaseOrderId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
