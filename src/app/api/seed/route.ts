import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear existing data
    await db.purchaseOrderItem.deleteMany()
    await db.purchaseOrder.deleteMany()
    await db.approvalStep.deleteMany()
    await db.approval.deleteMany()
    await db.quotationItem.deleteMany()
    await db.quotation.deleteMany()
    await db.rFQVendor.deleteMany()
    await db.lineItem.deleteMany()
    await db.rFQ.deleteMany()
    await db.vendor.deleteMany()
    await db.activityLog.deleteMany()
    await db.user.deleteMany()

    // Create Users
    const admin = await db.user.create({
      data: { email: 'admin@vendorbridge.com', password: 'password123', firstName: 'Arjun', lastName: 'Mehta', phone: '+91-9876543210', country: 'India', role: 'admin' },
    })
    const officer = await db.user.create({
      data: { email: 'officer@vendorbridge.com', password: 'password123', firstName: 'Priya', lastName: 'Sharma', phone: '+91-9876543211', country: 'India', role: 'procurement_officer' },
    })
    const manager = await db.user.create({
      data: { email: 'manager@vendorbridge.com', password: 'password123', firstName: 'Vikram', lastName: 'Reddy', phone: '+91-9876543212', country: 'India', role: 'manager' },
    })
    const vendorUser = await db.user.create({
      data: { email: 'vendor@vendorbridge.com', password: 'password123', firstName: 'Rajesh', lastName: 'Kumar', phone: '+91-9876543213', country: 'India', role: 'vendor' },
    })

    // Create Vendors
    const v1 = await db.vendor.create({
      data: { companyName: 'Tata Consultancy Services', category: 'IT', gstNumber: '27AABCT1332L1Z5', contactNumber: '+91-22-67789999', email: 'sales@tcs.com', address: 'Tata House, Raveline Street, Fort, Mumbai, Maharashtra 400001', status: 'active', rating: 4.5, userId: vendorUser.id },
    })
    const v2 = await db.vendor.create({
      data: { companyName: 'Infosys Limited', category: 'IT', gstNumber: '29AABCI1234L1Z5', contactNumber: '+91-80-28520261', email: 'procurement@infosys.com', address: '44, Electronics City, Hosur Road, Bengaluru, Karnataka 560100', status: 'active', rating: 4.3 },
    })
    const v3 = await db.vendor.create({
      data: { companyName: 'Larsen & Toubro', category: 'Construction', gstNumber: '27AABCL5321L1Z5', contactNumber: '+91-22-67654321', email: 'info@lnt.com', address: 'L&T House, N.M. Joshi Marg, Mahalaxmi, Mumbai, Maharashtra 400011', status: 'active', rating: 4.7 },
    })
    const v4 = await db.vendor.create({
      data: { companyName: 'BlueDart Express', category: 'Logistics', gstNumber: '27AABCB5678L1Z5', contactNumber: '+91-22-67658000', email: 'corporate@bluedart.com', address: 'Blue Dart House, Indira Gandhi International Airport, New Delhi 110037', status: 'active', rating: 3.9 },
    })
    const v5 = await db.vendor.create({
      data: { companyName: 'Godrej Interio', category: 'Furniture', gstNumber: '27AABCG9876L1Z5', contactNumber: '+91-22-67651111', email: 'sales@godrejinterio.com', address: 'Godrej One, Pirojshanagar, Vikhroli East, Mumbai, Maharashtra 400079', status: 'pending', rating: 4.1 },
    })
    const v6 = await db.vendor.create({
      data: { companyName: 'Wipro Enterprises', category: 'IT', gstNumber: '29AABCW4321L1Z5', contactNumber: '+91-80-28390000', email: 'vendors@wipro.com', address: 'Doddakannelli, Sarjapur Road, Bengaluru, Karnataka 560035', status: 'active', rating: 4.0 },
    })
    const v7 = await db.vendor.create({
      data: { companyName: 'Delhivery Pvt Ltd', category: 'Logistics', gstNumber: '06AABCD8765L1Z5', contactNumber: '+91-124-6715000', email: 'enterprise@delhivery.com', address: '3rd Floor, Plot 7, Sector 44, Gurugram, Haryana 122003', status: 'blocked', rating: 3.2 },
    })
    const v8 = await db.vendor.create({
      data: { companyName: 'Havells India', category: 'Electrical', gstNumber: '06AABCH5432L1Z5', contactNumber: '+91-129-4267000', email: 'orders@havells.com', address: 'Havells House, 18, Kalkaji, New Delhi 110019', status: 'pending', rating: 3.8 },
    })

    // Create RFQs
    const rfq1 = await db.rFQ.create({
      data: {
        title: 'Enterprise Laptops Procurement Q1',
        description: 'Procurement of high-performance laptops for engineering team. Minimum 16GB RAM, 512GB SSD, Intel i7 or equivalent.',
        category: 'IT',
        deadline: new Date('2026-07-15'),
        status: 'published',
        createdById: officer.id,
        lineItems: {
          create: [
            { itemName: 'Dell Latitude 5540', quantity: 50, unit: 'NOS' },
            { itemName: 'HP EliteBook 840', quantity: 30, unit: 'NOS' },
            { itemName: 'Lenovo ThinkPad T14', quantity: 20, unit: 'NOS' },
          ],
        },
        vendors: { create: [{ vendorId: v1.id }, { vendorId: v2.id }, { vendorId: v6.id }] },
      },
      include: { lineItems: true, vendors: true },
    })

    const rfq2 = await db.rFQ.create({
      data: {
        title: 'Office Furniture - Mumbai HQ',
        description: 'Modular office furniture for new Mumbai headquarters expansion. Ergonomic chairs, standing desks, and conference tables.',
        category: 'Furniture',
        deadline: new Date('2026-06-30'),
        status: 'published',
        createdById: officer.id,
        lineItems: {
          create: [
            { itemName: 'Ergonomic Office Chair', quantity: 100, unit: 'NOS' },
            { itemName: 'Standing Desk (6x3 ft)', quantity: 50, unit: 'NOS' },
            { itemName: 'Conference Table (12 seater)', quantity: 5, unit: 'NOS' },
          ],
        },
        vendors: { create: [{ vendorId: v5.id }, { vendorId: v3.id }] },
      },
      include: { lineItems: true, vendors: true },
    })

    const rfq3 = await db.rFQ.create({
      data: {
        title: 'Logistics & Courier Services - Pan India',
        description: 'Annual contract for pan-India courier and logistics services. Daily pickup, express delivery, and tracking capabilities required.',
        category: 'Logistics',
        deadline: new Date('2026-08-01'),
        status: 'published',
        createdById: officer.id,
        lineItems: {
          create: [
            { itemName: 'Express Delivery (Metro)', quantity: 5000, unit: 'NOS' },
            { itemName: 'Standard Delivery (Non-Metro)', quantity: 10000, unit: 'NOS' },
            { itemName: 'Heavy Parcel (>10kg)', quantity: 1000, unit: 'NOS' },
          ],
        },
        vendors: { create: [{ vendorId: v4.id }, { vendorId: v7.id }] },
      },
      include: { lineItems: true, vendors: true },
    })

    const rfq4 = await db.rFQ.create({
      data: {
        title: 'Server Room Electrical Setup',
        description: 'Electrical installation and UPS systems for new data center in Hyderabad.',
        category: 'Electrical',
        deadline: new Date('2026-09-15'),
        status: 'draft',
        createdById: officer.id,
        lineItems: {
          create: [
            { itemName: 'UPS System (100kVA)', quantity: 3, unit: 'NOS' },
            { itemName: 'Power Distribution Unit', quantity: 10, unit: 'NOS' },
            { itemName: 'Cable Tray & Trunking', quantity: 500, unit: 'MTR' },
          ],
        },
        vendors: { create: [{ vendorId: v8.id }] },
      },
      include: { lineItems: true, vendors: true },
    })

    const rfq5 = await db.rFQ.create({
      data: {
        title: 'Building Construction - Pune Campus',
        description: 'Construction of new office building at Hinjewadi IT Park, Pune. Phase 1 including foundation and structural work.',
        category: 'Construction',
        deadline: new Date('2026-12-31'),
        status: 'closed',
        createdById: officer.id,
        lineItems: {
          create: [
            { itemName: 'Structural Steel', quantity: 500, unit: 'MT' },
            { itemName: 'Cement (OPC 53 Grade)', quantity: 10000, unit: 'BAG' },
            { itemName: 'Ready Mix Concrete', quantity: 5000, unit: 'CM' },
          ],
        },
        vendors: { create: [{ vendorId: v3.id }] },
      },
      include: { lineItems: true, vendors: true },
    })

    // Create Quotations for RFQ1
    const q1 = await db.quotation.create({
      data: {
        rfqId: rfq1.id, vendorId: v1.id, status: 'submitted',
        subtotal: 8900000, gstPercentage: 18, gstAmount: 1602000, grandTotal: 10502000,
        deliveryDays: 21, paymentTerms: 'Net 45',
        items: {
          create: [
            { itemName: 'Dell Latitude 5540', quantity: 50, unitPrice: 75000, total: 3750000, deliveryDays: 21 },
            { itemName: 'HP EliteBook 840', quantity: 30, unitPrice: 82000, total: 2460000, deliveryDays: 21 },
            { itemName: 'Lenovo ThinkPad T14', quantity: 20, unitPrice: 134500, total: 2690000, deliveryDays: 14 },
          ],
        },
      },
    })

    const q2 = await db.quotation.create({
      data: {
        rfqId: rfq1.id, vendorId: v2.id, status: 'submitted',
        subtotal: 8500000, gstPercentage: 18, gstAmount: 1530000, grandTotal: 10030000,
        deliveryDays: 18, paymentTerms: 'Net 30',
        items: {
          create: [
            { itemName: 'Dell Latitude 5540', quantity: 50, unitPrice: 72000, total: 3600000, deliveryDays: 18 },
            { itemName: 'HP EliteBook 840', quantity: 30, unitPrice: 80000, total: 2400000, deliveryDays: 18 },
            { itemName: 'Lenovo ThinkPad T14', quantity: 20, unitPrice: 125000, total: 2500000, deliveryDays: 12 },
          ],
        },
      },
    })

    const q3 = await db.quotation.create({
      data: {
        rfqId: rfq1.id, vendorId: v6.id, status: 'submitted',
        subtotal: 9200000, gstPercentage: 18, gstAmount: 1656000, grandTotal: 10856000,
        deliveryDays: 25, paymentTerms: 'Net 60',
        items: {
          create: [
            { itemName: 'Dell Latitude 5540', quantity: 50, unitPrice: 78000, total: 3900000, deliveryDays: 25 },
            { itemName: 'HP EliteBook 840', quantity: 30, unitPrice: 85000, total: 2550000, deliveryDays: 25 },
            { itemName: 'Lenovo ThinkPad T14', quantity: 20, unitPrice: 137500, total: 2750000, deliveryDays: 20 },
          ],
        },
      },
    })

    // Quotations for RFQ2
    const q4 = await db.quotation.create({
      data: {
        rfqId: rfq2.id, vendorId: v5.id, status: 'submitted',
        subtotal: 6800000, gstPercentage: 18, gstAmount: 1224000, grandTotal: 8024000,
        deliveryDays: 30, paymentTerms: 'Net 30',
        items: {
          create: [
            { itemName: 'Ergonomic Office Chair', quantity: 100, unitPrice: 18000, total: 1800000, deliveryDays: 30 },
            { itemName: 'Standing Desk (6x3 ft)', quantity: 50, unitPrice: 45000, total: 2250000, deliveryDays: 30 },
            { itemName: 'Conference Table (12 seater)', quantity: 5, unitPrice: 550000, total: 2750000, deliveryDays: 45 },
          ],
        },
      },
    })

    const q5 = await db.quotation.create({
      data: {
        rfqId: rfq2.id, vendorId: v3.id, status: 'submitted',
        subtotal: 7200000, gstPercentage: 18, gstAmount: 1296000, grandTotal: 8496000,
        deliveryDays: 35, paymentTerms: 'Net 45',
        items: {
          create: [
            { itemName: 'Ergonomic Office Chair', quantity: 100, unitPrice: 20000, total: 2000000, deliveryDays: 35 },
            { itemName: 'Standing Desk (6x3 ft)', quantity: 50, unitPrice: 48000, total: 2400000, deliveryDays: 35 },
            { itemName: 'Conference Table (12 seater)', quantity: 5, unitPrice: 560000, total: 2800000, deliveryDays: 40 },
          ],
        },
      },
    })

    // Quotation for RFQ3
    const q6 = await db.quotation.create({
      data: {
        rfqId: rfq3.id, vendorId: v4.id, status: 'submitted',
        subtotal: 3500000, gstPercentage: 18, gstAmount: 630000, grandTotal: 4130000,
        deliveryDays: 7, paymentTerms: 'Net 15',
        items: {
          create: [
            { itemName: 'Express Delivery (Metro)', quantity: 5000, unitPrice: 250, total: 1250000, deliveryDays: 2 },
            { itemName: 'Standard Delivery (Non-Metro)', quantity: 10000, unitPrice: 150, total: 1500000, deliveryDays: 5 },
            { itemName: 'Heavy Parcel (>10kg)', quantity: 1000, unitPrice: 750, total: 750000, deliveryDays: 7 },
          ],
        },
      },
    })

    // Create Approval for RFQ1 - selected Infosys (lowest price)
    const approval1 = await db.approval.create({
      data: {
        rfqId: rfq1.id,
        quotationId: q2.id,
        status: 'l1_approved',
        currentStep: 2,
        approvalSteps: {
          create: [
            { stepNumber: 1, stepName: 'Submitted', status: 'approved', actedAt: new Date() },
            { stepNumber: 2, stepName: 'L1 Review', status: 'approved', approverId: officer.id, actedAt: new Date() },
            { stepNumber: 3, stepName: 'L2 Approval', status: 'pending', approverId: manager.id },
            { stepNumber: 4, stepName: 'Generate PO', status: 'pending' },
          ],
        },
      },
    })

    // Create Approval for RFQ2 - selected Godrej (lowest price)
    const approval2 = await db.approval.create({
      data: {
        rfqId: rfq2.id,
        quotationId: q4.id,
        status: 'po_generated',
        currentStep: 4,
        approvalSteps: {
          create: [
            { stepNumber: 1, stepName: 'Submitted', status: 'approved', actedAt: new Date('2026-05-01') },
            { stepNumber: 2, stepName: 'L1 Review', status: 'approved', approverId: officer.id, actedAt: new Date('2026-05-03') },
            { stepNumber: 3, stepName: 'L2 Approval', status: 'approved', approverId: manager.id, actedAt: new Date('2026-05-05') },
            { stepNumber: 4, stepName: 'Generate PO', status: 'approved', actedAt: new Date('2026-05-06') },
          ],
        },
      },
    })

    // Create Purchase Orders
    const po1 = await db.purchaseOrder.create({
      data: {
        poNumber: 'PO-0001',
        rfqId: rfq2.id,
        vendorId: v5.id,
        approvalId: approval2.id,
        billTo: 'VendorBridge Technologies Pvt. Ltd.',
        billToGstin: '27AABCV1234F1Z5',
        billToAddress: '123 Tech Park, Andheri East, Mumbai, Maharashtra 400069',
        vendorAddress: 'Godrej One, Pirojshanagar, Vikhroli East, Mumbai, Maharashtra 400079',
        vendorGstin: '27AABCG9876L1Z5',
        subtotal: 6800000,
        cgstPercentage: 9, cgstAmount: 612000,
        sgstPercentage: 9, sgstAmount: 612000,
        grandTotal: 8024000,
        poDate: new Date('2026-05-06'),
        invoiceDate: new Date('2026-05-10'),
        dueDate: new Date('2026-06-10'),
        paymentStatus: 'paid',
        items: {
          create: [
            { itemName: 'Ergonomic Office Chair', quantity: 100, unitPrice: 18000, total: 1800000 },
            { itemName: 'Standing Desk (6x3 ft)', quantity: 50, unitPrice: 45000, total: 2250000 },
            { itemName: 'Conference Table (12 seater)', quantity: 5, unitPrice: 550000, total: 2750000 },
          ],
        },
      },
    })

    const po2 = await db.purchaseOrder.create({
      data: {
        poNumber: 'PO-0002',
        rfqId: rfq3.id,
        vendorId: v4.id,
        billTo: 'VendorBridge Technologies Pvt. Ltd.',
        billToGstin: '27AABCV1234F1Z5',
        billToAddress: '123 Tech Park, Andheri East, Mumbai, Maharashtra 400069',
        vendorAddress: 'Blue Dart House, Indira Gandhi International Airport, New Delhi 110037',
        vendorGstin: '27AABCB5678L1Z5',
        subtotal: 3500000,
        cgstPercentage: 9, cgstAmount: 315000,
        sgstPercentage: 9, sgstAmount: 315000,
        grandTotal: 4130000,
        poDate: new Date('2026-05-20'),
        invoiceDate: new Date('2026-05-22'),
        dueDate: new Date('2026-06-22'),
        paymentStatus: 'pending',
        items: {
          create: [
            { itemName: 'Express Delivery (Metro)', quantity: 5000, unitPrice: 250, total: 1250000 },
            { itemName: 'Standard Delivery (Non-Metro)', quantity: 10000, unitPrice: 150, total: 1500000 },
            { itemName: 'Heavy Parcel (>10kg)', quantity: 1000, unitPrice: 750, total: 750000 },
          ],
        },
      },
    })

    const po3 = await db.purchaseOrder.create({
      data: {
        poNumber: 'PO-0003',
        rfqId: rfq5.id,
        vendorId: v3.id,
        billTo: 'VendorBridge Technologies Pvt. Ltd.',
        billToGstin: '27AABCV1234F1Z5',
        billToAddress: '123 Tech Park, Andheri East, Mumbai, Maharashtra 400069',
        vendorAddress: 'L&T House, N.M. Joshi Marg, Mahalaxmi, Mumbai, Maharashtra 400011',
        vendorGstin: '27AABCL5321L1Z5',
        subtotal: 12500000,
        cgstPercentage: 9, cgstAmount: 1125000,
        sgstPercentage: 9, sgstAmount: 1125000,
        grandTotal: 14750000,
        poDate: new Date('2026-04-01'),
        invoiceDate: new Date('2026-04-05'),
        dueDate: new Date('2026-05-05'),
        paymentStatus: 'overdue',
        items: {
          create: [
            { itemName: 'Structural Steel', quantity: 500, unitPrice: 12000, total: 6000000 },
            { itemName: 'Cement (OPC 53 Grade)', quantity: 10000, unitPrice: 350, total: 3500000 },
            { itemName: 'Ready Mix Concrete', quantity: 5000, unitPrice: 600, total: 3000000 },
          ],
        },
      },
    })

    // Activity Logs
    await db.activityLog.createMany({
      data: [
        { action: 'vendor_added', description: 'Vendor "Tata Consultancy Services" added to the system', category: 'vendor', entityId: v1.id, entityType: 'Vendor', userId: admin.id, createdAt: new Date('2026-04-01T10:00:00Z') },
        { action: 'vendor_added', description: 'Vendor "Infosys Limited" added to the system', category: 'vendor', entityId: v2.id, entityType: 'Vendor', userId: admin.id, createdAt: new Date('2026-04-01T10:05:00Z') },
        { action: 'rfq_created', description: 'RFQ "Enterprise Laptops Procurement Q1" saved as draft', category: 'rfq', entityId: rfq1.id, entityType: 'RFQ', userId: officer.id, createdAt: new Date('2026-04-15T09:00:00Z') },
        { action: 'rfq_published', description: 'RFQ "Enterprise Laptops Procurement Q1" published', category: 'rfq', entityId: rfq1.id, entityType: 'RFQ', userId: officer.id, createdAt: new Date('2026-04-16T08:30:00Z') },
        { action: 'quotation_submitted', description: 'TCS submitted quotation for Enterprise Laptops RFQ', category: 'rfq', entityId: q1.id, entityType: 'Quotation', userId: vendorUser.id, createdAt: new Date('2026-04-20T14:00:00Z') },
        { action: 'quotation_submitted', description: 'Infosys submitted quotation for Enterprise Laptops RFQ', category: 'rfq', entityId: q2.id, entityType: 'Quotation', userId: vendorUser.id, createdAt: new Date('2026-04-21T11:00:00Z') },
        { action: 'rfq_published', description: 'RFQ "Office Furniture - Mumbai HQ" published', category: 'rfq', entityId: rfq2.id, entityType: 'RFQ', userId: officer.id, createdAt: new Date('2026-04-25T10:00:00Z') },
        { action: 'quotation_selected', description: 'Infosys quotation selected for Enterprise Laptops RFQ', category: 'approval', entityId: q2.id, entityType: 'Quotation', userId: officer.id, createdAt: new Date('2026-05-01T09:00:00Z') },
        { action: 'approval_initiated', description: 'Approval workflow initiated for Infosys quotation', category: 'approval', entityId: approval1.id, entityType: 'Approval', userId: officer.id, createdAt: new Date('2026-05-01T09:05:00Z') },
        { action: 'quotation_submitted', description: 'Godrej Interio submitted quotation for Office Furniture RFQ', category: 'rfq', entityId: q4.id, entityType: 'Quotation', userId: vendorUser.id, createdAt: new Date('2026-05-02T16:00:00Z') },
        { action: 'po_generated', description: `PO PO-0001 generated after full approval`, category: 'approval', entityId: po1.id, entityType: 'PurchaseOrder', userId: manager.id, createdAt: new Date('2026-05-06T11:00:00Z') },
        { action: 'rfq_published', description: 'RFQ "Logistics & Courier Services - Pan India" published', category: 'rfq', entityId: rfq3.id, entityType: 'RFQ', userId: officer.id, createdAt: new Date('2026-05-10T08:00:00Z') },
        { action: 'invoice_paid', description: 'Payment completed for PO PO-0001', category: 'invoice', entityId: po1.id, entityType: 'PurchaseOrder', userId: admin.id, createdAt: new Date('2026-05-15T14:00:00Z') },
        { action: 'vendor_added', description: 'Vendor "Havells India" added to the system', category: 'vendor', entityId: v8.id, entityType: 'Vendor', userId: admin.id, createdAt: new Date('2026-05-20T09:30:00Z') },
        { action: 'rfq_created', description: 'RFQ "Server Room Electrical Setup" saved as draft', category: 'rfq', entityId: rfq4.id, entityType: 'RFQ', userId: officer.id, createdAt: new Date('2026-05-25T10:00:00Z') },
      ],
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      counts: {
        users: 4,
        vendors: 8,
        rfqs: 5,
        quotations: 6,
        approvals: 2,
        purchaseOrders: 3,
        activityLogs: 15,
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}
