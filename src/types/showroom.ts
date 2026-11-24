export type Language = 'en' | 'zh';

export type UserRole = 'admin' | 'sales' | 'warehouse' | 'customer';

export type StaffRole = 'admin' | 'sales' | 'warehouse';

export type ProductCategory = 'Living' | 'Dining' | 'Bedroom' | 'Office' | 'Outdoor';

export type PaymentMethod = 'Bank Transfer' | 'E-Wallet' | 'Card' | 'Cash at Showroom';

export type CRMStage =
  | 'Inquiry'
  | 'Consultation'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type DeliveryStatus =
  | 'Scheduled'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Assembled';

export type ReservationStatus = 'Active' | 'Settled' | 'Cancelled';

export interface ShowroomUnit {
  id: string;
  code: string;
  codeZh: string;
  nameEn: string;
  nameZh: string;
  shortNameEn: string;
  shortNameZh: string;
  address: string;
  addressZh: string;
  manager: string;
  managerZh: string;
  phone: string;
  sqm: number;
  active: boolean;
}

export interface ProductColorOption {
  nameEn: string;
  nameZh: string;
  hex: string;
}

export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameZh: string;
  pinyin: string;
  category: ProductCategory;
  price: number;
  dimensions: string;
  materialEn: string;
  materialZh: string;
  materialGroup: string;
  descriptionEn: string;
  descriptionZh: string;
  colors: ProductColorOption[];
  unitStock: Record<string, number>;
  warehouseStock: number;
  reorderLevel: number;
  silhouette: string;
  soldCount: number;
  featured?: boolean;
}

export interface ClientNote {
  id: string;
  date: string;
  author: string;
  authorZh?: string;
  text: string;
  textZh?: string;
}

export interface ClientReminder {
  id: string;
  dueDate: string;
  title: string;
  titleZh?: string;
  done: boolean;
}

export interface Client {
  id: string;
  name: string; // EN primary alias
  nameEn: string;
  nameZh: string;
  pinyin: string;
  type: 'Retail' | 'Developer';
  company?: string;
  companyZh?: string;
  email: string;
  phone: string;
  location: string;
  locationZh: string;
  stage: CRMStage;
  estimatedValue: number;
  unitInterestCount?: number;
  targetDate?: string;
  assignedStaff: string;
  assignedStaffZh: string;
  notes: ClientNote[];
  reminders: ClientReminder[];
  createdAt: string;
}

export interface Reservation {
  id: string;
  code: string;
  productId: string;
  colorNameEn: string;
  colorNameZh?: string;
  unitId: string;
  quantity: number;
  customerName: string;
  customerNameEn: string;
  customerNameZh: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerAddressZh?: string;
  totalAmount: number;
  downpaymentPercent: number;
  downpaymentAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  fulfillment: 'Pickup' | 'Delivery';
  preferredDate: string;
  status: ReservationStatus;
  createdAt: string;
  clientId?: string;
}

export interface SaleLineItem {
  productId: string;
  productNameEn: string;
  productNameZh: string;
  sku: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  colorNameEn: string;
  colorNameZh?: string;
}

export interface SaleTransaction {
  id: string;
  receiptNo: string;
  date: string;
  timestamp: string;
  clientId?: string;
  customerName: string;
  customerNameEn: string;
  customerNameZh: string;
  customerEmail?: string;
  items: SaleLineItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  convertedFromReservationId?: string;
  staffName: string;
  staffNameZh: string;
}

export interface StockLogEntry {
  id: string;
  timestamp: string;
  type: 'Transfer' | 'Stock-In' | 'Stock-Out' | 'Sale' | 'Reservation';
  productId: string;
  sku: string;
  productNameEn: string;
  productNameZh: string;
  fromLocation: string;
  fromLocationZh: string;
  toLocation: string;
  toLocationZh: string;
  quantity: number;
  performedBy: string;
  performedByZh: string;
  note: string;
  noteZh: string;
}

export interface ProposalPackageItem {
  productId: string;
  qtyPerUnit: number;
  unitPrice: number;
}

export interface ProposalPackage {
  id: string;
  roomType: string;
  roomTypeZh?: string;
  unitCount: number;
  items: ProposalPackageItem[];
}

export interface Proposal {
  id: string;
  code: string;
  title: string;
  titleZh?: string;
  clientId: string;
  clientName: string;
  clientNameZh: string;
  companyName: string;
  companyNameZh: string;
  projectLocation: string;
  projectLocationZh?: string;
  packages: ProposalPackage[];
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Revised';
  createdAt: string;
  notes: string;
  notesZh?: string;
}

export interface DeliveryJob {
  id: string;
  code: string;
  date: string;
  timeSlot: string;
  jobType: 'Retail Delivery' | 'Developer Staging';
  customerOrProject: string;
  customerOrProjectZh: string;
  address: string;
  addressZh: string;
  unitId: string;
  itemsSummary: string;
  itemsSummaryZh: string;
  truck: string;
  truckZh: string;
  crew: string;
  crewZh: string;
  status: DeliveryStatus;
  linkedReservationId?: string;
  linkedProposalId?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: PaymentMethod;
  nameZh: string;
  accountInfo: string;
  accountInfoZh: string;
  enabled: boolean;
}

export interface StaffAccount {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  pinyin: string;
  email: string;
  role: StaffRole;
  assignedUnitId: string;
  active: boolean;
}

export interface CategorySetting {
  id: ProductCategory;
  nameEn: string;
  nameZh: string;
  active: boolean;
}

export type StaffPage =
  | 'dashboard'
  | 'inventory'
  | 'pos'
  | 'crm'
  | 'proposals'
  | 'deliveries'
  | 'settings';
