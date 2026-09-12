export type UserRole = 'FARMER' | 'STAFF' | 'ADMIN';

export type CentreStatus = 'OPEN' | 'CLOSED' | 'FULL' | 'TEMPORARILY_UNAVAILABLE';

export type BookingStatus = 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  farmerId?: string;
  village?: string;
  district?: string;
  state?: string;
  preferredCentreId?: string;
  assignedCentreId?: string;
  allowedCentreIds?: string[];
  staffId?: string;
  verified?: boolean;
  active?: boolean;
  farmerCategory?: string; // e.g. 'Small & Marginal Farmer (SMF)'
  createdAt: string;
}

export interface Centre {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  district: string;
  districtCode: string;
  address: string;
  village?: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operatingHours: string;
  workingDays: string;
  capacityPerDay: number;
  availableSlots: number;
  currentQueue: number;
  status: CentreStatus;
  cropsHandled: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingToken: string; // e.g. PX-001, PX-002
  centreId: string;
  centreName: string;
  state: string;
  district: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 11:00 AM"
  cropType: string;
  estimatedWeightQuintal: number;
  vehicleNumber?: string;
  status: BookingStatus;
  queuePosition: number;
  servingToken?: string;
  estimatedWaitMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementRecord {
  id: string;
  bookingId?: string;
  bookingToken: string;
  farmerName: string;
  farmerPhone: string;
  centreId: string;
  centreName: string;
  staffId: string;
  cropType: string;
  weightKg: number;
  grade: 'Grade A (FAQ)' | 'Grade B' | 'Standard';
  ratePerQuintal: number;
  totalAmount: number;
  paymentStatus: 'PAID' | 'PROCESSING' | 'PENDING';
  date: string;
  notes?: string;
  offlineSynced?: boolean;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketId: string; // e.g. TKT-2026-1049
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  escalationLevel: 'Level 1 — Help Desk' | 'Level 2 — Centre Staff' | 'Level 3 — Administrator';
  assignedTo?: string;
  source?: 'CITIZEN_PORTAL' | 'STAFF_CREATED' | 'OFFLINE_HELP_DESK';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: 'Important Notice' | 'Circular' | 'Advisory' | 'Public Notice' | 'Tender';
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  publishedDate: string;
  expiryDate?: string;
  active: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  descriptionHi?: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  description: string;
  descriptionHi: string;
  creditCost: number;
  cashEquivalent: number;
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  image: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface BankDetails {
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  verified: boolean;
}

export interface PlatformStats {
  totalCentres: number;
  openCentres: number;
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  availableSlots: number;
  totalFarmers: number;
  totalStaff: number;
  openTickets: number;
  todayProcurementQuintal: number;
  todayProcurementAmount: number;
}
