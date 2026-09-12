import express from 'express';
import path from 'path';
import net from 'net';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import { createServer as createViteServer } from 'vite';
import {
  initDB,
  getDB,
  saveDB,
  hashPassword,
  getPlatformStats,
} from './server/db.js';
import {
  User,
  Booking,
  ProcurementRecord,
  Ticket,
  Announcement,
  Centre,
} from './src/types/index.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);

async function getAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port <= startPort + 10; port += 1) {
    const available = await new Promise<boolean>((resolve) => {
      const tester = net.createServer();
      tester.once('error', () => resolve(false));
      tester.once('listening', () => tester.close(() => resolve(true)));
      tester.listen(port, '0.0.0.0');
    });
    if (available) return port;
  }
  throw new Error(`No free port found between ${startPort} and ${startPort + 10}`);
}

// Initialize Database
initDB();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Signed session token helper. This keeps role and user identity server-controlled.
// No role is ever trusted from the frontend.
const AUTH_SECRET = process.env.JWT_SECRET || 'PARADOX-DEMO-AUTH-SECRET-CHANGE-IN-PRODUCTION';
const TOKEN_TTL_SECONDS = 8 * 60 * 60;

function base64Url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signSessionToken(user: User): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }));
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function getCurrentUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const [header, payload, signature] = parts;
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest('base64')
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (!safeEqual(signature, expected)) return null;

    const claims = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!claims.sub || !claims.role || !claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;

    const db = getDB();
    const user = db.users.find((u) => u.id === claims.sub);
    if (!user || user.role !== claims.role || user.active === false) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
}

// ==========================================
// 1. HEALTH & STATS API
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  const stats = getPlatformStats();
  res.json(stats);
});

// ==========================================
// 2. AUTHENTICATION API
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password || !role || !['FARMER', 'STAFF', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Role, phone/email and password are required' });
  }

  const db = getDB();
  const normalizedIdentifier = String(identifier).trim().toLowerCase();
  const user = db.users.find(
    (u) => (u.email?.toLowerCase() === normalizedIdentifier || u.phone === String(identifier).trim()) &&
      u.passwordHash === hashPassword(password)
  );

  if (!user || user.active === false) {
    return res.status(401).json({ error: user?.active === false ? 'This staff account is inactive. Please contact the administrator.' : 'Invalid phone/email or password' });
  }

  if (user.role !== role) {
    return res.status(403).json({ error: `These credentials belong to the ${user.role.toLowerCase()} account. Please select the correct login role.` });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({
    token: signSessionToken(safeUser),
    user: safeUser,
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, phone, email, village, state, district, password } = req.body;

  if (!name || !phone || !state || !district || !password) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }
  if (!/^\d{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'Mobile number must contain exactly 10 digits' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const db = getDB();
  const existing = db.users.find((u) => u.phone === phone || (email && u.email === email));
  if (existing) {
    return res.status(409).json({ error: 'An account with this phone or email already exists' });
  }

  const newFarmerId = `FMR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const defaultCentre = db.centres.find((c) => c.state.toLowerCase() === String(state).toLowerCase() && c.district.toLowerCase() === String(district).toLowerCase());
  const newUser = {
    id: `USR-${Date.now()}`,
    name,
    phone,
    email: email || undefined,
    role: 'FARMER' as const,
    farmerId: newFarmerId,
    village: village || 'Gram Panchayat',
    district,
    state,
    preferredCentreId: defaultCentre?.id,
    verified: true,
    farmerCategory: 'Small & Marginal Farmer (SMF)',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  // Initial demo wallet balance
  db.walletBalances[newUser.id] = { credits: 200, earned: 200, used: 0 };
  saveDB();

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    token: signSessionToken(safeUser),
    user: safeUser,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(user);
});

app.put('/api/auth/profile', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, village, district, state, phone, email, preferredCentreId } = req.body;
  const db = getDB();
  const target = db.users.find((u) => u.id === user.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (phone && !/^\d{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'Mobile number must contain exactly 10 digits' });
  }
  if (phone && db.users.some((u) => u.id !== target.id && u.phone === String(phone).trim())) {
    return res.status(409).json({ error: 'This mobile number is already registered to another account' });
  }

  if (name) target.name = String(name).trim();
  if (village !== undefined) target.village = String(village).trim();
  if (district) target.district = String(district).trim();
  if (state) target.state = String(state).trim();
  if (phone) target.phone = String(phone).trim();
  if (email) target.email = String(email).trim();

  if (target.role === 'FARMER') {
    if (preferredCentreId) {
      const preferredCentre = db.centres.find((c) => c.id === preferredCentreId);
      if (!preferredCentre) return res.status(404).json({ error: 'Selected procurement centre not found' });
      if (target.state && target.district &&
          (preferredCentre.state.toLowerCase() !== target.state.toLowerCase() ||
           preferredCentre.district.toLowerCase() !== target.district.toLowerCase())) {
        return res.status(400).json({ error: 'The selected centre must belong to your selected state and district' });
      }
      target.preferredCentreId = preferredCentre.id;
    } else if (preferredCentreId === '') {
      target.preferredCentreId = undefined;
    } else if (state && district) {
      const matching = db.centres.find((c) => c.state.toLowerCase() === String(state).toLowerCase() && c.district.toLowerCase() === String(district).toLowerCase());
      target.preferredCentreId = matching?.id;
    }
  }

  saveDB();
  const { passwordHash, ...safeUser } = target;
  res.json(safeUser);
});

app.post('/api/auth/change-password', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new passwords are required' });
  }

  const db = getDB();
  const target = db.users.find((u) => u.id === user.id);
  if (!target || target.passwordHash !== hashPassword(oldPassword)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  target.passwordHash = hashPassword(newPassword);
  saveDB();
  res.json({ success: true, message: 'Password changed successfully' });
});

// ==========================================
// 3. CENTRES DIRECTORY API (All India)
// ==========================================
app.get('/api/centres', (req, res) => {
  const { state, district, search, status } = req.query;
  const db = getDB();
  let results = [...db.centres];

  if (state && typeof state === 'string' && state !== 'ALL') {
    results = results.filter((c) => c.state.toLowerCase() === state.toLowerCase());
  }

  if (district && typeof district === 'string' && district !== 'ALL') {
    results = results.filter((c) => c.district.toLowerCase() === district.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    results = results.filter((c) => c.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.pinCode.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) =>
    a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }) ||
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  res.json(results);
});

app.get('/api/centres/states-and-districts', (req, res) => {
  const db = getDB();
  const map: Record<string, string[]> = {};

  for (const c of db.centres) {
    if (!map[c.state]) {
      map[c.state] = [];
    }
    if (!map[c.state].includes(c.district)) {
      map[c.state].push(c.district);
    }
  }

  // Sort states alphabetically
  const sorted: { state: string; districts: string[] }[] = Object.keys(map)
    .sort()
    .map((s) => ({
      state: s,
      districts: map[s].sort(),
    }));

  res.json(sorted);
});

app.get('/api/centres/:id', (req, res) => {
  const db = getDB();
  const centre = db.centres.find((c) => c.id === req.params.id);
  if (!centre) return res.status(404).json({ error: 'Centre not found' });
  res.json(centre);
});

// ==========================================
// 4. BOOKINGS & QUEUE API
// ==========================================
app.get('/api/bookings', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  const requestedDate = typeof req.query.date === 'string' ? req.query.date : '';
  const requestedCentreId = typeof req.query.centreId === 'string' ? req.query.centreId : '';
  let userBookings: Booking[] = [];

  if (user.role === 'ADMIN') {
    // Central admin controls operations/staff; this endpoint is retained for backend reporting only.
    userBookings = [...db.bookings];
  } else if (user.role === 'STAFF') {
    userBookings = db.bookings.filter((b) => b.centreId === user.assignedCentreId);
    if (requestedCentreId) userBookings = userBookings.filter((b) => b.centreId === requestedCentreId);
    if (requestedDate) userBookings = userBookings.filter((b) => b.date === requestedDate);
  } else {
    userBookings = db.bookings.filter((b) => b.farmerId === user.id);
  }

  res.json([...userBookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.post('/api/bookings', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'FARMER') return res.status(403).json({ error: 'Only farmers can create procurement bookings' });

  const {
    centreId,
    date,
    timeSlot,
    cropType,
    estimatedWeightQuintal,
    vehicleNumber,
    notes,
  } = req.body;

  if (!centreId || !date || !timeSlot || !cropType || !estimatedWeightQuintal) {
    return res.status(400).json({ error: 'All booking fields are required' });
  }

  const db = getDB();
  const centre = db.centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: 'Procurement centre not found' });

  // A farmer can book only a centre in the farmer's saved state and district.
  if (user.state && user.district &&
      (centre.state.toLowerCase() !== user.state.toLowerCase() ||
       centre.district.toLowerCase() !== user.district.toLowerCase())) {
    return res.status(403).json({
      error: `Please select a procurement centre in your location: ${user.district}, ${user.state}. You can change your location in Account Settings.`,
    });
  }

  if (centre.availableSlots <= 0 || centre.status === 'FULL' || centre.status === 'CLOSED') {
    return res.status(409).json({ error: 'No available slots at this centre' });
  }

  // Generate official booking token in PX-001, PX-002 format
  const existingTokens = db.bookings
    .map((b) => {
      const match = b.bookingToken.match(/^PX-(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const nextNum = existingTokens.length > 0 ? Math.max(...existingTokens) + 1 : db.bookings.length + 1;
  const token = `PX-${String(nextNum).padStart(3, '0')}`;

  // Calculate queue position for this centre & date
  const centreDayBookings = db.bookings.filter(
    (b) => b.centreId === centreId && b.date === date && b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
  );
  const queuePos = centreDayBookings.length + 1;

  const newBooking: Booking = {
    id: `BK-${Date.now()}`,
    bookingToken: token,
    centreId: centre.id,
    centreName: centre.name,
    state: centre.state,
    district: centre.district,
    farmerId: user.id,
    farmerName: user.name,
    farmerPhone: user.phone,
    date,
    timeSlot,
    cropType,
    estimatedWeightQuintal: Number(estimatedWeightQuintal),
    vehicleNumber: vehicleNumber || undefined,
    status: 'CONFIRMED',
    queuePosition: queuePos,
    servingToken: centreDayBookings[0]?.bookingToken || token,
    estimatedWaitMinutes: Math.max(10, queuePos * 12),
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);

  // Update centre availability and queue
  centre.availableSlots = Math.max(0, centre.availableSlots - 1);
  centre.currentQueue += 1;

  // Add notification for farmer
  db.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    userId: user.id,
    title: `Slot Confirmed: Token ${token}`,
    titleHi: `स्लॉट पुष्ट: टोकन ${token}`,
    message: `Your booking at ${centre.name} for ${date} is confirmed. Queue position: ${queuePos}.`,
    messageHi: `${centre.name} में ${date} के लिए आपकी बुकिंग पुष्ट है। कतार स्थान: ${queuePos}।`,
    date: new Date().toISOString(),
    read: false,
    link: '/track',
  });

  saveDB();
  res.status(201).json(newBooking);
});

// Public Track Booking endpoint by token
app.get('/api/bookings/track/:token', (req, res) => {
  const token = req.params.token.trim().toUpperCase();
  const db = getDB();
  const booking = db.bookings.find((b) => b.bookingToken.toUpperCase() === token);

  if (!booking) {
    return res.status(404).json({ error: 'No booking found with this token' });
  }

  // Recalculate dynamic queue stats
  const activeAhead = db.bookings.filter(
    (b) =>
      b.centreId === booking.centreId &&
      b.date === booking.date &&
      (b.status === 'CONFIRMED' || b.status === 'WAITING' || b.status === 'IN_PROGRESS') &&
      b.createdAt < booking.createdAt
  );

  const currentlyServing = db.bookings.find(
    (b) => b.centreId === booking.centreId && b.date === booking.date && b.status === 'IN_PROGRESS'
  );

  res.json({
    ...booking,
    peopleAhead: activeAhead.length,
    servingToken: currentlyServing ? currentlyServing.bookingToken : (activeAhead[0]?.bookingToken || booking.bookingToken),
    estimatedWaitMinutes: Math.max(5, activeAhead.length * 15),
  });
});

app.put('/api/bookings/:id/status', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Unauthorized to change booking status' });
  }

  const { status } = req.body;
  const allowedStatuses = ['CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid booking status' });

  const db = getDB();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Staff can only update their currently assigned centre.
  if (user.role === 'STAFF' && (!user.assignedCentreId || booking.centreId !== user.assignedCentreId)) {
    return res.status(403).json({ error: 'You are not assigned to this procurement centre' });
  }

  // Keep the queue workflow predictable: confirmed/waiting -> in progress -> completed.
  const validTransition =
    status === booking.status ||
    (booking.status === 'CONFIRMED' && ['WAITING', 'IN_PROGRESS', 'CANCELLED'].includes(status)) ||
    (booking.status === 'WAITING' && ['IN_PROGRESS', 'CANCELLED'].includes(status)) ||
    (booking.status === 'IN_PROGRESS' && ['COMPLETED', 'CANCELLED'].includes(status)) ||
    (booking.status === 'COMPLETED' && status === 'COMPLETED');
  if (!validTransition) return res.status(409).json({ error: `Cannot move token from ${booking.status} to ${status}` });

  const previousStatus = booking.status;
  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  // If completed/cancelled, update centre queue and release the reserved slot once.
  const centre = db.centres.find((c) => c.id === booking.centreId);
  if (centre && (status === 'COMPLETED' || status === 'CANCELLED')) {
    const wasActive = previousStatus !== 'COMPLETED' && previousStatus !== 'CANCELLED';
    if (wasActive) {
      centre.currentQueue = Math.max(0, centre.currentQueue - 1);
      centre.availableSlots = Math.min(centre.capacityPerDay, centre.availableSlots + 1);
    }
  }

  saveDB();
  res.json(booking);
});

// ==========================================
// 5. STAFF CENTRE ACCESS API
// ==========================================
app.get('/api/staff/centres', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'STAFF') return res.status(403).json({ error: 'Staff access required' });

  const db = getDB();
  const centres = [...db.centres].sort((a, b) =>
    a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }) ||
    a.district.localeCompare(b.district, undefined, { sensitivity: 'base' }) ||
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  res.json({ assignedCentreId: user.assignedCentreId || null, centres });
});

app.put('/api/staff/centre', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'STAFF') return res.status(403).json({ error: 'Staff access required' });

  const { centreId } = req.body;
  if (!centreId) return res.status(400).json({ error: 'Centre is required' });

  const db = getDB();
  const target = db.users.find((u) => u.id === user.id && u.role === 'STAFF');
  if (!target) return res.status(404).json({ error: 'Staff account not found' });
  if (target.active === false) return res.status(403).json({ error: 'This staff account is inactive.' });

  const centre = db.centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: 'Procurement centre not found' });

  target.assignedCentreId = centre.id;
  target.allowedCentreIds = [centre.id];
  target.state = centre.state;
  target.district = centre.district;
  saveDB();

  const { passwordHash, ...safeUser } = target;
  res.json(safeUser);
});

// ==========================================
// 6. PROCUREMENT RECORDS API (Staff)
// ==========================================
app.get('/api/procurement', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  if (user.role === 'STAFF' && user.assignedCentreId) {
    return res.json(db.procurementRecords.filter((p) => p.centreId === user.assignedCentreId).reverse());
  }

  res.json(db.procurementRecords.reverse());
});

app.post('/api/procurement', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'STAFF') {
    return res.status(403).json({ error: 'Only staff can record procurement' });
  }

  const {
    bookingId,
    bookingToken,
    farmerName,
    farmerPhone,
    cropType,
    weightKg,
    grade,
    ratePerQuintal,
    notes,
    offlineSynced,
  } = req.body;

  if (!bookingToken || !farmerName || !cropType || !weightKg || !ratePerQuintal) {
    return res.status(400).json({ error: 'Missing required procurement record details' });
  }

  const db = getDB();
  const centre = db.centres.find((c) => c.id === user.assignedCentreId);
  const totalAmount = Math.round((Number(weightKg) / 100) * Number(ratePerQuintal));

  const record: ProcurementRecord = {
    id: `PRC-${Date.now()}`,
    bookingId: bookingId || undefined,
    bookingToken,
    farmerName,
    farmerPhone: farmerPhone || '',
    centreId: user.assignedCentreId || 'UNKNOWN',
    centreName: centre ? centre.name : 'Procurement Centre',
    staffId: user.staffId || user.id,
    cropType,
    weightKg: Number(weightKg),
    grade: grade || 'Grade A (FAQ)',
    ratePerQuintal: Number(ratePerQuintal),
    totalAmount,
    paymentStatus: 'PAID',
    date: new Date().toISOString().split('T')[0],
    notes: notes || undefined,
    offlineSynced: !!offlineSynced,
    createdAt: new Date().toISOString(),
  };

  db.procurementRecords.unshift(record);

  // If connected to a booking, mark it COMPLETED
  if (bookingId) {
    const booking = db.bookings.find((b) => b.id === bookingId || b.bookingToken === bookingToken);
    if (booking && booking.status !== 'COMPLETED') {
      booking.status = 'COMPLETED';
      booking.updatedAt = new Date().toISOString();
      if (centre) centre.currentQueue = Math.max(0, centre.currentQueue - 1);
    }
  }

  saveDB();
  res.status(201).json(record);
});

// ==========================================
// 6. GRIEVANCE / TICKETS API
// ==========================================
app.get('/api/tickets', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return res.json(db.tickets.reverse());
  }

  res.json(db.tickets.filter((t) => t.userId === user.id).reverse());
});

app.post('/api/tickets', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { category, subject, description, priority, farmerName, farmerPhone, source } = req.body;
  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required' });
  }

  const db = getDB();
  const ticketRef = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTicket: Ticket = {
    id: `TKT-${Date.now()}`,
    ticketId: ticketRef,
    userId: user.id,
    userName: farmerName || user.name,
    userPhone: farmerPhone || user.phone,
    category,
    subject,
    description,
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    escalationLevel: 'Level 1 — Help Desk',
    assignedTo: 'Central Help Desk',
    source: source || (user.role === 'STAFF' ? 'STAFF_CREATED' : 'CITIZEN_PORTAL'),
    messages: [
      {
        id: `MSG-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: description,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tickets.unshift(newTicket);
  saveDB();
  res.status(201).json(newTicket);
});

app.post('/api/tickets/:id/message', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message content is required' });

  const db = getDB();
  const ticket = db.tickets.find((t) => t.id === req.params.id || t.ticketId === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const msg = {
    id: `MSG-${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    message,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(msg);
  ticket.updatedAt = new Date().toISOString();
  saveDB();
  res.json(ticket);
});

app.put('/api/tickets/:id/status', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { status, escalationLevel, assignedTo } = req.body;
  const db = getDB();
  const ticket = db.tickets.find((t) => t.id === req.params.id || t.ticketId === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (status) ticket.status = status;
  if (escalationLevel) ticket.escalationLevel = escalationLevel;
  if (assignedTo) ticket.assignedTo = assignedTo;
  ticket.updatedAt = new Date().toISOString();

  saveDB();
  res.json(ticket);
});

// ==========================================
// 7. WALLET & AGRI-PRODUCTS CATALOG
// ==========================================
app.get('/api/wallet', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  const balance = db.walletBalances[user.id] || { credits: 200, earned: 200, used: 0 };
  const txns = db.walletTransactions.filter((t) => t.userId === user.id);

  res.json({
    balance,
    transactions: txns.reverse(),
    bankDetails: db.bankDetails[user.id] || null,
  });
});

app.get('/api/products', (req, res) => {
  const db = getDB();
  res.json(db.products);
});

app.post('/api/wallet/redeem', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { productId } = req.body;
  const db = getDB();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const balance = db.walletBalances[user.id] || { credits: 0, earned: 0, used: 0 };
  if (balance.credits < product.creditCost) {
    return res.status(400).json({ error: 'Insufficient credits in your demo wallet' });
  }

  balance.credits -= product.creditCost;
  balance.used += product.creditCost;
  db.walletBalances[user.id] = balance;

  db.walletTransactions.push({
    id: `TXN-${Date.now()}`,
    userId: user.id,
    date: new Date().toISOString().split('T')[0],
    type: 'DEBIT',
    description: `Redeemed ${product.name}`,
    descriptionHi: `${product.nameHi} भुनाया गया`,
    amount: product.creditCost,
    status: 'COMPLETED',
  });

  saveDB();
  res.json({ success: true, balance, product });
});

// Bank Details Update
app.put('/api/wallet/bank-details', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { accountNumber, accountHolderName, ifscCode, bankName, branchName } = req.body;
  const db = getDB();
  db.bankDetails[user.id] = {
    accountNumber: accountNumber || '••••••••4892',
    accountHolderName: accountHolderName || user.name,
    ifscCode: ifscCode || 'PUNB0123400',
    bankName: bankName || 'National Farmer Bank',
    branchName: branchName || 'Main District Branch',
    verified: true,
  };

  saveDB();
  res.json({ success: true, bankDetails: db.bankDetails[user.id] });
});

// ==========================================
// 8. ANNOUNCEMENTS API
// ==========================================
app.get('/api/announcements', (req, res) => {
  const db = getDB();
  res.json(db.announcements.filter((a) => a.active));
});

app.post('/api/announcements', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

  const { title, titleHi, description, descriptionHi, category, priority } = req.body;
  const db = getDB();
  const item: Announcement = {
    id: `ANN-${Date.now()}`,
    title,
    titleHi: titleHi || title,
    description,
    descriptionHi: descriptionHi || description,
    category: category || 'Important Notice',
    priority: priority || 'NORMAL',
    publishedDate: new Date().toISOString().split('T')[0],
    active: true,
  };

  db.announcements.unshift(item);
  saveDB();
  res.status(201).json(item);
});

// ==========================================
// 9. NOTIFICATIONS API
// ==========================================
app.get('/api/notifications', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.json([]);
  const db = getDB();
  res.json(db.notifications.filter((n) => n.userId === user.id));
});

app.put('/api/notifications/:id/read', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  saveDB();
  res.json({ success: true });
});

// ==========================================
// 10. ADMIN MANAGEMENT API
// ==========================================
app.get('/api/admin/users', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const db = getDB();
  const safeUsers = db.users.map(({ passwordHash, ...u }) => ({ ...u, active: u.active !== false }));
  res.json(safeUsers);
});

app.post('/api/admin/staff', (req, res) => {
  const admin = getCurrentUser(req);
  if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const { name, phone, email, password, centreId } = req.body;
  if (!name || !phone || !password || !centreId) {
    return res.status(400).json({ error: 'Name, mobile number, password and procurement centre are required' });
  }
  if (!/^\d{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'Mobile number must contain exactly 10 digits' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const db = getDB();
  if (db.users.some((u) => u.phone === String(phone).trim())) {
    return res.status(409).json({ error: 'This mobile number is already registered' });
  }
  if (email && db.users.some((u) => u.email?.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(409).json({ error: 'This email is already registered' });
  }

  const centre = db.centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: 'Procurement centre not found' });

  const staffCount = db.users.filter((u) => u.role === 'STAFF').length + 1;
  const newStaff: User & { passwordHash: string } = {
    id: `USR-STAFF-${Date.now()}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    role: 'STAFF',
    staffId: `STF-${centre.stateCode || 'IN'}-${String(staffCount).padStart(3, '0')}`,
    assignedCentreId: centre.id,
    allowedCentreIds: [centre.id],
    district: centre.district,
    state: centre.state,
    verified: true,
    active: true,
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newStaff);
  saveDB();
  const { passwordHash, ...safeStaff } = newStaff;
  res.status(201).json(safeStaff);
});

app.put('/api/admin/staff/:id/assignment', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const { centreId } = req.body;
  if (!centreId) return res.status(400).json({ error: 'Centre is required' });
  const db = getDB();
  const staff = db.users.find((u) => u.id === req.params.id && u.role === 'STAFF');
  if (!staff) return res.status(404).json({ error: 'Staff account not found' });
  const centre = db.centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: 'Procurement centre not found' });
  staff.assignedCentreId = centre.id;
  staff.allowedCentreIds = [centre.id];
  staff.state = centre.state;
  staff.district = centre.district;
  saveDB();
  const { passwordHash, ...safeStaff } = staff;
  res.json({ ...safeStaff, active: staff.active !== false });
});

app.put('/api/admin/staff/:id/status', (req, res) => {
  const admin = getCurrentUser(req);
  if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const db = getDB();
  const staff = db.users.find((u) => u.id === req.params.id && u.role === 'STAFF');
  if (!staff) return res.status(404).json({ error: 'Staff account not found' });
  const active = Boolean(req.body.active);
  staff.active = active;
  if (!active) {
    staff.assignedCentreId = undefined;
    staff.allowedCentreIds = [];
    staff.state = undefined;
    staff.district = undefined;
  }
  saveDB();
  const { passwordHash, ...safeStaff } = staff;
  res.json({ ...safeStaff, active });
});

app.delete('/api/admin/staff/:id', (req, res) => {
  const admin = getCurrentUser(req);
  if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const db = getDB();
  const index = db.users.findIndex((u) => u.id === req.params.id && u.role === 'STAFF');
  if (index === -1) return res.status(404).json({ error: 'Staff account not found' });
  db.users.splice(index, 1);
  saveDB();
  res.json({ success: true });
});

app.post('/api/admin/centres', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const { name, state, district, pinCode, address, capacityPerDay, phone, email, cropsHandled } = req.body;
  if (!name || !state || !district || !pinCode) {
    return res.status(400).json({ error: 'Name, state, district and PIN code are required' });
  }

  const db = getDB();
  const newCentre: Centre = {
    id: `CTR-${Date.now()}`,
    name: String(name).trim(),
    state: String(state).trim(),
    stateCode: String(state).trim().substring(0, 2).toUpperCase(),
    district: String(district).trim(),
    districtCode: `${String(state).trim().substring(0, 2).toUpperCase()}-${String(district).trim().substring(0, 3).toUpperCase()}`,
    address: address || `${district}, ${state}`,
    pinCode: String(pinCode).trim(),
    latitude: 20.5937,
    longitude: 78.9629,
    phone: phone || '1800-180-1551',
    email: email || 'centre@agriprocure.gov.demo',
    operatingHours: '08:00 - 18:00',
    workingDays: 'Monday to Saturday',
    capacityPerDay: Number(capacityPerDay) || 400,
    availableSlots: Number(capacityPerDay) || 400,
    currentQueue: 0,
    status: 'OPEN',
    cropsHandled: Array.isArray(cropsHandled) ? cropsHandled : ['Wheat', 'Paddy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.centres.push(newCentre);
  saveDB();
  res.status(201).json(newCentre);
});

app.put('/api/admin/centres/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const db = getDB();
  const centre = db.centres.find((c) => c.id === req.params.id);
  if (!centre) return res.status(404).json({ error: 'Centre not found' });

  const { name, status, capacityPerDay, availableSlots, phone, operatingHours } = req.body;
  if (name) centre.name = String(name).trim();
  if (status) centre.status = status;
  if (capacityPerDay !== undefined) centre.capacityPerDay = Math.max(0, Number(capacityPerDay));
  if (availableSlots !== undefined) centre.availableSlots = Math.max(0, Math.min(centre.capacityPerDay, Number(availableSlots)));
  if (phone) centre.phone = String(phone).trim();
  if (operatingHours) centre.operatingHours = String(operatingHours).trim();
  centre.updatedAt = new Date().toISOString();

  saveDB();
  res.json(centre);
});

// Admin Reports
app.get('/api/admin/reports', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const db = getDB();
  // State-wise breakdown
  const stateMap: Record<string, { centres: number; bookings: number; procurementAmt: number }> = {};
  for (const c of db.centres) {
    if (!stateMap[c.state]) {
      stateMap[c.state] = { centres: 0, bookings: 0, procurementAmt: 0 };
    }
    stateMap[c.state].centres += 1;
  }

  for (const b of db.bookings) {
    if (stateMap[b.state]) {
      stateMap[b.state].bookings += 1;
    }
  }

  for (const p of db.procurementRecords) {
    const c = db.centres.find((ctr) => ctr.id === p.centreId);
    if (c && stateMap[c.state]) {
      stateMap[c.state].procurementAmt += p.totalAmount;
    }
  }

  res.json({
    stateBreakdown: Object.keys(stateMap).map((state) => ({
      state,
      centres: stateMap[state].centres,
      bookings: stateMap[state].bookings,
      procurementAmt: stateMap[state].procurementAmt,
    })),
    recentProcurement: db.procurementRecords.slice(0, 15),
  });
});

// ==========================================
// 11. STAFF OFFLINE SYNC API
// ==========================================
app.post('/api/offline/sync', (req, res) => {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'STAFF') {
    return res.status(403).json({ error: 'Staff access required for offline sync' });
  }

  const { records = [], statusUpdates = [] } = req.body;
  if ((!Array.isArray(records) || records.length === 0) && (!Array.isArray(statusUpdates) || statusUpdates.length === 0)) {
    return res.json({ syncedCount: 0, statusSyncedCount: 0, message: 'No records to sync' });
  }

  const db = getDB();
  let syncedCount = 0;
  let statusSyncedCount = 0;

  for (const item of records) {
    // Avoid duplicate records by bookingToken
    const exists = db.procurementRecords.some((p) => p.bookingToken === item.bookingToken);
    if (!exists) {
      const assignedCentreId = user.assignedCentreId;
      if (!assignedCentreId) continue;
      const centre = db.centres.find((c) => c.id === assignedCentreId);
      if (!centre) continue;

      const totalAmount = Math.round((Number(item.weightKg) / 100) * Number(item.ratePerQuintal));
      db.procurementRecords.unshift({
        id: `PRC-${Date.now()}-${syncedCount}`,
        bookingId: item.bookingId,
        bookingToken: item.bookingToken,
        farmerName: item.farmerName,
        farmerPhone: item.farmerPhone || '',
        centreId: assignedCentreId,
        centreName: centre.name,
        staffId: user.staffId || user.id,
        cropType: item.cropType,
        weightKg: Number(item.weightKg),
        grade: item.grade || 'Grade A (FAQ)',
        ratePerQuintal: Number(item.ratePerQuintal),
        totalAmount,
        paymentStatus: 'PAID',
        date: item.date || new Date().toISOString().split('T')[0],
        notes: item.notes ? `${item.notes} [Synced from Offline]` : '[Synced from Offline]',
        offlineSynced: true,
        createdAt: new Date().toISOString(),
      });

      const booking = db.bookings.find((b) => b.id === item.bookingId || b.bookingToken === item.bookingToken);
      if (booking && booking.status !== 'COMPLETED') {
        booking.status = 'COMPLETED';
        booking.updatedAt = new Date().toISOString();
        centre.currentQueue = Math.max(0, centre.currentQueue - 1);
      }

      syncedCount++;
    }
  }

  // Apply booking status changes that were made while offline. Staff may only
  // change bookings belonging to their currently authorised centre.
  if (Array.isArray(statusUpdates)) {
    for (const item of statusUpdates) {
      if (!item?.bookingId || !item?.status) continue;
      const booking = db.bookings.find((b) => b.id === item.bookingId);
      if (!booking || booking.centreId !== user.assignedCentreId) continue;
      if (!['CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(item.status)) continue;
      const previous = booking.status;
      booking.status = item.status;
      booking.updatedAt = new Date().toISOString();
      if (previous !== 'COMPLETED' && previous !== 'CANCELLED' && (item.status === 'COMPLETED' || item.status === 'CANCELLED')) {
        const centre = db.centres.find((c) => c.id === booking.centreId);
        if (centre) {
          centre.currentQueue = Math.max(0, centre.currentQueue - 1);
          centre.availableSlots = Math.min(centre.capacityPerDay, centre.availableSlots + 1);
        }
      }
      statusSyncedCount++;
    }
  }

  saveDB();
  res.json({ success: true, syncedCount, statusSyncedCount, totalProcessed: Array.isArray(records) ? records.length : 0 });
});

// ==========================================
// 12. KISAN SAHAYAK STATIC HELP API
// ==========================================
app.post('/api/assistant', (req, res) => {
  const { message, language } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  const isHindi = language === 'hi';
  const q = String(message).toLowerCase();
  let reply = isHindi
    ? 'कृपया खरीद स्लॉट, बुकिंग ट्रैकिंग, आवश्यक दस्तावेज, केंद्र, प्रोफ़ाइल या सहायता के बारे में अपना प्रश्न चुनें।'
    : 'Please choose a question about slot booking, tracking, required documents, centres, profile or support.';

  if (q.includes('book') || q.includes('slot') || q.includes('बुक') || q.includes('स्लॉट')) {
    reply = isHindi
      ? 'खरीद स्लॉट बुक करने के लिए: केन्द्र एवं बुकिंग खोलें → अपना राज्य और जिला देखें → केंद्र चुनें → फसल, मात्रा, तारीख और समय चुनें → Confirm & Generate Token दबाएं।'
      : 'To book a procurement slot: open Centres & Booking → check your State and District → choose a centre → select crop, quantity, date and time → press Confirm & Generate Token.';
  } else if (q.includes('track') || q.includes('token') || q.includes('टोकन') || q.includes('ट्रैक')) {
    reply = isHindi
      ? 'Track Booking में अपना PX टोकन डालें। वहां आपको वर्तमान स्थिति, आपसे आगे के किसान और अनुमानित प्रतीक्षा समय दिखेगा।'
      : 'Open Track Booking and enter your PX token. You can see the current status, farmers ahead of you and estimated waiting time.';
  } else if (q.includes('document') || q.includes('दस्तावेज') || q.includes('कागजात')) {
    reply = isHindi
      ? 'केंद्र पर अपना किसान पंजीकरण/पहचान, आधार/मान्य ID, बैंक विवरण और मोबाइल पर उपलब्ध बुकिंग टोकन साथ रखें। स्थानीय नियमों के अनुसार अतिरिक्त दस्तावेज मांगे जा सकते हैं।'
      : 'Carry your farmer registration/identity, Aadhaar or valid ID, bank details and your booking token. Additional documents may be required under local rules.';
  } else if (q.includes('centre') || q.includes('nearest') || q.includes('मंडी') || q.includes('केंद्र')) {
    reply = isHindi
      ? 'Centres & Booking में State → District चुनें। Farmer profile में अपनी नई location save करने के बाद उसी State और District के उपलब्ध केंद्र दिखेंगे।'
      : 'In Centres & Booking, select State → District. After saving a new location in the Farmer Profile, centres for that State and District will appear.';
  } else if (q.includes('profile') || q.includes('account') || q.includes('प्रोफ़ाइल')) {
    reply = isHindi
      ? 'Farmer Desk → My Profile में नाम, मोबाइल, गांव, State, District और Preferred Procurement Centre बदलें और Save Changes दबाएं।'
      : 'Go to Farmer Desk → My Profile to change name, mobile, village, State, District and Preferred Procurement Centre, then press Save Changes.';
  } else if (q.includes('support') || q.includes('complaint') || q.includes('शिकायत') || q.includes('सहायता')) {
    reply = isHindi
      ? 'Support पेज से ऑनलाइन शिकायत दर्ज करें। जरूरी होने पर किसान कॉल सेंटर 1800-180-1551 पर संपर्क करें।'
      : 'Use the Support page to raise an online grievance. You can also contact the Kisan Call Centre at 1800-180-1551.';
  } else if (q.includes('queue') || q.includes('कतार')) {
    reply = isHindi
      ? 'कतार स्थिति केंद्र के सक्रिय टोकनों से निकाली जाती है। Staff Waiting → Called/Processing → Completed क्रम में टोकन अपडेट करता है।'
      : 'Queue position is calculated from active tokens at the centre. Staff move each token through Waiting → Called/Processing → Completed.';
  } else if (q.includes('closed') || q.includes('बंद')) {
    reply = isHindi
      ? 'यदि केंद्र बंद या full दिख रहा है, दूसरे उपलब्ध केंद्र/समय की जांच करें या Support से संपर्क करें।'
      : 'If a centre is closed or full, check another available centre/time or contact Support.';
  }

  res.json({ reply, isAi: false });
});

// ==========================================
// 13. PROJECT ZIP DOWNLOAD ENDPOINT
// ==========================================
// Prompt requirement: "provide me zip file of the complete project at last also"
app.get(['/api/download-zip', '/PARADOX-AgriProcure-Complete-Project.zip', '/project.zip'], (req, res) => {
  const archive = typeof archiver === 'function'
    ? archiver('zip', { zlib: { level: 9 } })
    : new (archiver.ZipArchive || archiver.Archiver)({ zlib: { level: 9 } });

  res.attachment('PARADOX-AgriProcure-Complete-Project.zip');
  res.setHeader('Content-Type', 'application/zip');

  archive.pipe(res);

  // Files and directories to include
  const projectRoot = process.cwd();

  // Whitelist items
  const itemsToInclude = [
    'src',
    'public',
    'server',
    'index.html',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'metadata.json',
    '.env.example',
    '.gitignore',
    'server.ts',
    'README.md',
  ];

  for (const item of itemsToInclude) {
    const fullPath = path.join(projectRoot, item);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        archive.directory(fullPath, item, (entryData: any) => {
          if (entryData && entryData.name && (entryData.name.endsWith('.zip') || entryData.name.includes('.DS_Store') || entryData.name.includes('node_modules'))) {
            return false;
          }
          return entryData;
        });
      } else {
        if (!item.endsWith('.zip')) {
          archive.file(fullPath, { name: item });
        }
      }
    }
  }

  archive.finalize();
});

// ==========================================
// 14. VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function start() {
  const PORT = await getAvailablePort(DEFAULT_PORT);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PARADOX AgriProcure running at http://localhost:${PORT}`);
    if (PORT !== DEFAULT_PORT) {
      console.log(`Port ${DEFAULT_PORT} was busy, so the app automatically moved to port ${PORT}.`);
    }
  });
}

start();
