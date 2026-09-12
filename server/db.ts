import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initialCentres } from './data/allIndiaCentres.js';
import {
  User,
  Centre,
  Booking,
  ProcurementRecord,
  Ticket,
  Announcement,
  WalletTransaction,
  Product,
  NotificationItem,
  BankDetails,
  PlatformStats
} from '../src/types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_paradox_salt_2026').digest('hex');
}

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  centres: Centre[];
  bookings: Booking[];
  procurementRecords: ProcurementRecord[];
  tickets: Ticket[];
  announcements: Announcement[];
  walletBalances: Record<string, { credits: number; earned: number; used: number }>;
  walletTransactions: WalletTransaction[];
  products: Product[];
  notifications: NotificationItem[];
  bankDetails: Record<string, BankDetails>;
}

// Initial default seed state
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'USR-FARMER-01',
      name: 'Ramesh Kumar Patel',
      phone: '9876543210',
      email: 'farmer@example.com',
      role: 'FARMER',
      farmerId: 'FMR-2026-7789',
      village: 'Kachhwa',
      district: 'Karnal',
      state: 'Haryana',
      preferredCentreId: 'HR-KAR-01',
      verified: true,
      active: true,
      farmerCategory: 'Small & Marginal Farmer (SMF)',
      passwordHash: hashPassword('Farmer@123'),
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'USR-STAFF-01',
      name: 'Surender Singh',
      phone: '9812345678',
      email: 'staff@example.com',
      role: 'STAFF',
      staffId: 'STF-HR-042',
      assignedCentreId: 'HR-KAR-01', // Karnal Central Agri Procurement Mandi
      allowedCentreIds: ['HR-KAR-01'],
      district: 'Karnal',
      state: 'Haryana',
      verified: true,
      active: true,
      passwordHash: hashPassword('Staff@123'),
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'USR-ADMIN-01',
      name: 'National Portal Administrator',
      phone: '9899001122',
      email: 'admin@example.com',
      role: 'ADMIN',
      verified: true,
      active: true,
      passwordHash: hashPassword('Admin@123'),
      createdAt: '2026-01-01T09:00:00Z',
    },
  ],
  centres: initialCentres,
  bookings: [
    {
      id: 'BK-1001',
      bookingToken: 'PX-001',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      state: 'Haryana',
      district: 'Karnal',
      farmerId: 'USR-FARMER-01',
      farmerName: 'Ramesh Kumar Patel',
      farmerPhone: '9876543210',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Morning (08:30 AM - 11:30 AM)',
      cropType: 'Wheat',
      estimatedWeightQuintal: 45,
      vehicleNumber: 'HR-05-AB-4421',
      status: 'CONFIRMED',
      queuePosition: 3,
      servingToken: 'PX-001',
      estimatedWaitMinutes: 25,
      notes: 'Grain moisture standard tested below 12%.',
      createdAt: '2026-09-10T10:30:00Z',
      updatedAt: '2026-09-12T08:00:00Z',
    },
    {
      id: 'BK-1002',
      bookingToken: 'PX-002',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      state: 'Haryana',
      district: 'Karnal',
      farmerId: 'USR-FARMER-01',
      farmerName: 'Ramesh Kumar Patel',
      farmerPhone: '9876543210',
      date: '2026-08-20',
      timeSlot: 'Morning (08:30 AM - 11:30 AM)',
      cropType: 'Mustard',
      estimatedWeightQuintal: 30,
      vehicleNumber: 'HR-05-AB-4421',
      status: 'COMPLETED',
      queuePosition: 0,
      createdAt: '2026-08-18T11:00:00Z',
      updatedAt: '2026-08-20T14:30:00Z',
    },
    {
      id: 'BK-1003',
      bookingToken: 'PX-003',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      state: 'Haryana',
      district: 'Karnal',
      farmerId: 'USR-FARMER-02',
      farmerName: 'Baldev Singh Gill',
      farmerPhone: '9844556677',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Morning (08:30 AM - 11:30 AM)',
      cropType: 'Wheat',
      estimatedWeightQuintal: 60,
      vehicleNumber: 'HR-05-C-1902',
      status: 'IN_PROGRESS',
      queuePosition: 1,
      servingToken: 'PX-003',
      estimatedWaitMinutes: 5,
      createdAt: '2026-09-11T09:00:00Z',
      updatedAt: '2026-09-12T08:30:00Z',
    },
    {
      id: 'BK-1004',
      bookingToken: 'PX-004',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      state: 'Haryana',
      district: 'Karnal',
      farmerId: 'USR-FARMER-03',
      farmerName: 'Kuldeep Yadav',
      farmerPhone: '9811223344',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Afternoon (11:30 AM - 02:30 PM)',
      cropType: 'Paddy (Basmati)',
      estimatedWeightQuintal: 35,
      vehicleNumber: 'HR-05-E-8831',
      status: 'WAITING',
      queuePosition: 5,
      servingToken: 'PX-003',
      estimatedWaitMinutes: 45,
      createdAt: '2026-09-11T14:00:00Z',
      updatedAt: '2026-09-12T08:00:00Z',
    },
  ],
  procurementRecords: [
    {
      id: 'PRC-901',
      bookingId: 'BK-1002',
      bookingToken: 'PX-002',
      farmerName: 'Ramesh Kumar Patel',
      farmerPhone: '9876543210',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      staffId: 'STF-HR-042',
      cropType: 'Mustard',
      weightKg: 3000,
      grade: 'Grade A (FAQ)',
      ratePerQuintal: 5650,
      totalAmount: 169500,
      paymentStatus: 'PAID',
      date: '2026-08-20',
      notes: 'Oil content verified > 41%. Direct Benefit Transfer credited.',
      createdAt: '2026-08-20T14:30:00Z',
    },
    {
      id: 'PRC-902',
      bookingId: 'BK-1000',
      bookingToken: 'PX-005',
      farmerName: 'Jagdish Chandra',
      farmerPhone: '9877001122',
      centreId: 'HR-KAR-01',
      centreName: 'Karnal Central Agri Procurement Mandi',
      staffId: 'STF-HR-042',
      cropType: 'Wheat',
      weightKg: 4200,
      grade: 'Grade A (FAQ)',
      ratePerQuintal: 2275,
      totalAmount: 95550,
      paymentStatus: 'PAID',
      date: '2026-09-11',
      notes: 'Grain tested clean, no foreign seeds.',
      createdAt: '2026-09-11T16:15:00Z',
    },
  ],
  tickets: [
    {
      id: 'TKT-01',
      ticketId: 'TKT-2026-1049',
      userId: 'USR-FARMER-01',
      userName: 'Ramesh Kumar Patel',
      userPhone: '9876543210',
      category: 'Slot Booking Issue',
      subject: 'Unable to select evening time slot for Karnal Mandi',
      description: 'The evening slot was showing full capacity even though portal indicated 140 open slots.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      escalationLevel: 'Level 1 — Help Desk',
      assignedTo: 'Help Desk Officer - Rajesh Verma',
      source: 'CITIZEN_PORTAL',
      messages: [
        {
          id: 'MSG-01',
          senderId: 'USR-FARMER-01',
          senderName: 'Ramesh Kumar Patel',
          senderRole: 'FARMER',
          message: 'Please resolve this so I can book evening slot.',
          createdAt: '2026-09-08T10:00:00Z',
        },
        {
          id: 'MSG-02',
          senderId: 'USR-STAFF-01',
          senderName: 'Help Desk Team',
          senderRole: 'STAFF',
          message: 'Slot buffer has been refreshed on the central server. The evening slot is now open and available.',
          createdAt: '2026-09-08T11:30:00Z',
        },
      ],
      createdAt: '2026-09-08T10:00:00Z',
      updatedAt: '2026-09-08T11:30:00Z',
    },
    {
      id: 'TKT-02',
      ticketId: 'TKT-2026-1180',
      userId: 'USR-FARMER-01',
      userName: 'Ramesh Kumar Patel',
      userPhone: '9876543210',
      category: 'Weighment & Grading Discrepancy',
      subject: 'Inquiry regarding Grade A moisture standard for upcoming wheat',
      description: 'Kindly confirm permissible moisture percentage for Grade A wheat procurement at Karnal yard.',
      priority: 'LOW',
      status: 'OPEN',
      escalationLevel: 'Level 2 — Centre Staff',
      assignedTo: 'Surender Singh (Staff)',
      source: 'CITIZEN_PORTAL',
      messages: [
        {
          id: 'MSG-03',
          senderId: 'USR-FARMER-01',
          senderName: 'Ramesh Kumar Patel',
          senderRole: 'FARMER',
          message: 'Kindly confirm permissible moisture level.',
          createdAt: '2026-09-11T12:00:00Z',
        },
      ],
      createdAt: '2026-09-11T12:00:00Z',
      updatedAt: '2026-09-11T12:00:00Z',
    },
  ],
  announcements: [
    {
      id: 'ANN-01',
      title: 'Online procurement slot booking is available for the upcoming procurement cycle.',
      titleHi: 'आगामी खरीद चक्र के लिए ऑनलाइन खरीद स्लॉट बुकिंग की सुविधा शुरू हो गई है।',
      description: 'All registered farmers can reserve digital queue tokens for wheat, paddy, and mustard intake across state mandis.',
      descriptionHi: 'सभी पंजीकृत किसान राज्य की मंडियों में गेहूँ, धान एवं सरसों की आवक हेतु डिजिटल कतार टोकन आरक्षित कर सकते हैं।',
      category: 'Important Notice',
      priority: 'HIGH',
      publishedDate: '2026-09-10',
      active: true,
    },
    {
      id: 'ANN-02',
      title: 'Direct Benefit Transfer (DBT) payment guarantee within 48-72 hours of procurement.',
      titleHi: 'खरीद के 48 से 72 घंटों के भीतर प्रत्यक्ष लाभ अंतरण (DBT) भुगतान की गारंटी।',
      description: 'Ensure your Aadhaar-seeded bank account is updated in Account Settings to prevent disbursement delay.',
      descriptionHi: 'भुगतान में किसी भी देरी से बचने के लिए सुनिश्चित करें कि आपका आधार लिंक बैंक खाता पोर्टल में अपडेट है।',
      category: 'Advisory',
      priority: 'NORMAL',
      publishedDate: '2026-09-08',
      active: true,
    },
    {
      id: 'ANN-03',
      title: 'Strict Quality Guidelines (FAQ) for Kharif Crop Weighment & Moisture Limits.',
      titleHi: 'खरीफ फसल तौल एवं नमी सीमा हेतु सख्त गुणवत्ता दिशा-निर्देश (एफएक्यू)।',
      description: 'Moisture content should be maintained below 12% for cereal grains to receive Grade-A MSP rate.',
      descriptionHi: 'ग्रेड-ए एमएसपी दर प्राप्त करने के लिए खाद्यान्नों में नमी का स्तर 12% से नीचे बनाए रखा जाना चाहिए।',
      category: 'Circular',
      priority: 'NORMAL',
      publishedDate: '2026-09-05',
      active: true,
    },
  ],
  walletBalances: {
    'USR-FARMER-01': {
      credits: 450,
      earned: 600,
      used: 150,
    },
  },
  walletTransactions: [
    {
      id: 'TXN-01',
      userId: 'USR-FARMER-01',
      date: '2026-08-20',
      type: 'CREDIT',
      description: 'Slot punctuality incentive for Mustard procurement token PX-002',
      descriptionHi: 'सरसों खरीद टोकन PX-002 पर समयबद्ध उपस्थिति प्रोत्साहन',
      amount: 200,
      status: 'COMPLETED',
    },
    {
      id: 'TXN-02',
      userId: 'USR-FARMER-01',
      date: '2026-08-25',
      type: 'DEBIT',
      description: 'Redeemed Bio-Fertilizer Azotobacter Culture Pack (2kg)',
      descriptionHi: 'बायो-फर्टिलाइजर एजोटोबैक्टर कल्चर पैक (2 किग्रा) भुनाया गया',
      amount: 150,
      status: 'COMPLETED',
    },
    {
      id: 'TXN-03',
      userId: 'USR-FARMER-01',
      date: '2026-09-01',
      type: 'CREDIT',
      description: 'Soil Health testing sample incentive credit',
      descriptionHi: 'मृदा स्वास्थ्य परीक्षण नमूना प्रोत्साहन क्रेडिट',
      amount: 400,
      status: 'COMPLETED',
    },
  ],
  products: [
    {
      id: 'PROD-01',
      name: 'Certified Wheat Seed Variety DBW-303 (40 Kg Bag)',
      nameHi: 'प्रमाणित गेहूँ बीज किस्म डीबीडब्ल्यू-303 (40 किग्रा बैग)',
      category: 'Certified Seeds',
      categoryHi: 'प्रमाणित बीज',
      description: 'High-yielding, rust-resistant certified wheat seed variety developed by ICAR-IIWBR.',
      descriptionHi: 'आईसीएआर-आईआईडब्ल्यूबीआर द्वारा विकसित उच्च उपज वाली, रतुआ प्रतिरोधी किस्म।',
      creditCost: 180,
      cashEquivalent: 1450,
      availability: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'PROD-02',
      name: 'Organic Bio-NPK Consortium (Liquid 1 Litre)',
      nameHi: 'जैविक बायो-एनपीके कंसोर्टियम (तरल 1 लीटर)',
      category: 'Bio-Fertilizer',
      categoryHi: 'जैव उर्वरक',
      description: 'Nitrogen fixing, phosphate solubilizing & potassium mobilizing bacterial culture.',
      descriptionHi: 'नाइट्रोजन स्थिरीकरण, फॉस्फेट घुलनशीलता एवं पोटाश सक्रियक सूक्ष्म जीवाणु संवर्धन।',
      creditCost: 120,
      cashEquivalent: 450,
      availability: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'PROD-03',
      name: 'Digital Soil Moisture & pH Testing Meter',
      nameHi: 'डिजिटल मृदा नमी एवं पीएच परीक्षण मीटर',
      category: 'Farm Equipment',
      categoryHi: 'कृषि उपकरण',
      description: 'Direct soil probe testing moisture, soil pH, and sunlight intensity in field.',
      descriptionHi: 'खेत में तुरंत नमी, मिट्टी का पीएच एवं सूर्य का प्रकाश मापने वाला उपकरण।',
      creditCost: 250,
      cashEquivalent: 1200,
      availability: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'PROD-04',
      name: '16-Litre Battery Operated Knapsack Sprayer',
      nameHi: '16-लीटर बैटरी चालित नैपसैक स्प्रेयर पंप',
      category: 'Farm Machinery',
      categoryHi: 'कृषि मशीनरी',
      description: 'Heavy duty rechargeable battery sprayer with multiple brass spray nozzles.',
      descriptionHi: 'एकाधिक पीतल नोजल के साथ मजबूत रिचार्जेबल बैटरी वाला कीटनाशक स्प्रेयर।',
      creditCost: 400,
      cashEquivalent: 2800,
      availability: 'LOW_STOCK',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&auto=format&fit=crop&q=60',
    },
  ],
  notifications: [
    {
      id: 'NOTIF-01',
      userId: 'USR-FARMER-01',
      title: 'Slot Confirmed: Token PX-001',
      titleHi: 'स्लॉट पुष्ट: टोकन PX-001',
      message: 'Your procurement slot at Karnal Mandi is confirmed. Check queue status before arrival.',
      messageHi: 'करनाल मंडी में आपका खरीद स्लॉट पुष्ट हो चुका है। मंडी आने से पूर्व कतार स्थिति अवश्य देखें।',
      date: '2026-09-10T10:30:00Z',
      read: false,
      link: '/track',
    },
    {
      id: 'NOTIF-02',
      userId: 'USR-FARMER-01',
      title: 'Grievance Resolved: TKT-2026-1049',
      titleHi: 'शिकायत का समाधान: TKT-2026-1049',
      message: 'Your ticket regarding slot booking at Karnal has been marked resolved by Help Desk.',
      messageHi: 'करनाल में स्लॉट बुकिंग संबंधी आपकी शिकायत का हेल्प डेस्क द्वारा समाधान कर दिया गया है।',
      date: '2026-09-08T11:30:00Z',
      read: true,
      link: '/farmer/tickets',
    },
  ],
  bankDetails: {
    'USR-FARMER-01': {
      accountNumber: '••••••••4892',
      accountHolderName: 'Ramesh Kumar Patel',
      ifscCode: 'PUNB0123400',
      bankName: 'Punjab National Bank',
      branchName: 'Karnal Main Agricultural Branch',
      verified: true,
    },
  },
};

// In-memory active database
let db: DatabaseSchema = initialData;

// Ensure DATA directory and load or initialize db.json
export function initDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      // Ensure all root fields exist
      db = {
        users: loaded.users || initialData.users,
        // Keep existing local changes, but always merge in any newer centre records from the bundled directory.
        // This prevents an older data/db.json from making the farmer/staff centre dropdown appear empty or incomplete.
        centres: Array.from(new Map([
          ...initialData.centres.map((centre) => [centre.id, centre] as const),
          ...(Array.isArray(loaded.centres) ? loaded.centres : []).map((centre: Centre) => [centre.id, centre] as const),
        ]).values()) as Centre[],
        bookings: loaded.bookings || initialData.bookings,
        procurementRecords: loaded.procurementRecords || initialData.procurementRecords,
        tickets: loaded.tickets || initialData.tickets,
        announcements: loaded.announcements || initialData.announcements,
        walletBalances: loaded.walletBalances || initialData.walletBalances,
        walletTransactions: loaded.walletTransactions || initialData.walletTransactions,
        products: loaded.products || initialData.products,
        notifications: loaded.notifications || initialData.notifications,
        bankDetails: loaded.bankDetails || initialData.bankDetails,
      };
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      db = initialData;
    }
  } catch (error) {
    console.error('Error initializing DB:', error);
    db = initialData;
  }
}

// Persist DB state to disk
export function saveDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB:', error);
  }
}

// Get the in-memory database
export function getDB(): DatabaseSchema {
  return db;
}

// Calculate live platform statistics
export function getPlatformStats(): PlatformStats {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = db.bookings.filter((b) => b.date === today);

  const todayProcurement = db.procurementRecords.filter((p) => p.date === today);
  const todayQuintals = todayProcurement.reduce((sum, p) => sum + (p.weightKg / 100), 0);
  const todayAmount = todayProcurement.reduce((sum, p) => sum + p.totalAmount, 0);

  const totalSlots = db.centres.reduce((sum, c) => sum + c.availableSlots, 0);

  return {
    totalCentres: db.centres.length,
    openCentres: db.centres.filter((c) => c.status === 'OPEN').length,
    totalBookings: db.bookings.length,
    todayBookings: todayBookings.length,
    pendingBookings: todayBookings.filter((b) => b.status === 'WAITING' || b.status === 'CONFIRMED').length,
    inProgressBookings: todayBookings.filter((b) => b.status === 'IN_PROGRESS').length,
    completedBookings: todayBookings.filter((b) => b.status === 'COMPLETED').length,
    cancelledBookings: todayBookings.filter((b) => b.status === 'CANCELLED').length,
    availableSlots: totalSlots,
    totalFarmers: db.users.filter((u) => u.role === 'FARMER').length,
    totalStaff: db.users.filter((u) => u.role === 'STAFF').length,
    openTickets: db.tickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'ESCALATED').length,
    todayProcurementQuintal: Math.round(todayQuintals),
    todayProcurementAmount: todayAmount,
  };
}
