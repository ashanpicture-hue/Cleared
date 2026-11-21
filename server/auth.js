const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'cleared-dev-secret-change-in-production';
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory OTP store (production: use Redis + Twilio/Msg91)
const otpStore = new Map(); // phone => { code, expiresAt, attempts }

// Helper: read users
function readUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper: write users
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Normalize Pakistani phone
function normalizePhone(phone) {
  let p = phone.replace(/\s/g, '');
  if (p.startsWith('0092')) p = '+92' + p.slice(4);
  else if (p.startsWith('92')) p = '+92' + p.slice(2);
  else if (p.startsWith('0')) p = '+92' + p.slice(1);
  else if (!p.startsWith('+92')) p = '+92' + p;
  return p;
}

// Signup / send OTP
router.post('/signup', (req, res) => {
  try {
    const { phone, name, role } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name are required' });
    }

    const normalized = normalizePhone(phone);
    const users = readUsers();
    const existing = users.users.find(u => u.phone === normalized);

    if (existing) {
      return res.status(409).json({ error: 'Account already exists. Please log in.' });
    }

    const code = generateOTP();
    otpStore.set(normalized, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
      attempts: 0,
      pendingUser: { name, role: role || 'customer', phone: normalized }
    });

    // In production: send via Twilio/Msg91 WhatsApp/SMS
    console.log(`[OTP] ${normalized}: ${code}`);

    return res.json({
      success: true,
      message: 'OTP sent to your phone',
      phone: normalized,
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login / send OTP
router.post('/login', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalized = normalizePhone(phone);
    const users = readUsers();
    const existing = users.users.find(u => u.phone === normalized);

    if (!existing) {
      return res.status(404).json({ error: 'No account found with this phone number' });
    }

    if (!existing.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const code = generateOTP();
    otpStore.set(normalized, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      pendingUser: null
    });

    console.log(`[OTP] ${normalized}: ${code}`);

    return res.json({
      success: true,
      message: 'OTP sent to your phone',
      phone: normalized,
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and OTP code are required' });
    }

    const normalized = normalizePhone(phone);
    const record = otpStore.get(normalized);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this number' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalized);
      return res.status(410).json({ error: 'OTP has expired. Please request a new one.' });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(normalized);
      return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    let user;
    const users = readUsers();

    if (record.pendingUser) {
      // Signup flow - create user
      user = {
        id: 'usr_' + Date.now().toString(36),
        phone: normalized,
        name: record.pendingUser.name,
        role: record.pendingUser.role,
        plan: 'free',
        freeOrdersUsed: 0,
        freeOrdersLimit: 3,
        seats: 1,
        createdAt: new Date().toISOString(),
        isActive: true,
        isVerified: true
      };
      users.users.push(user);
      writeUsers(users);
    } else {
      // Login flow - find existing
      user = users.users.find(u => u.phone === normalized);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    otpStore.delete(normalized);

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        freeOrdersUsed: user.freeOrdersUsed,
        freeOrdersLimit: user.freeOrdersLimit,
        seats: user.seats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalized = normalizePhone(phone);
    const record = otpStore.get(normalized);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this number' });
    }

    const code = generateOTP();
    record.code = code;
    record.expiresAt = Date.now() + 10 * 60 * 1000;
    record.attempts = 0;

    console.log(`[OTP-RESEND] ${normalized}: ${code}`);

    return res.json({
      success: true,
      message: 'New OTP sent',
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role middleware
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Get current user
router.get('/me', authenticate, (req, res) => {
  try {
    const users = readUsers();
    const user = users.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        freeOrdersUsed: user.freeOrdersUsed,
        freeOrdersLimit: user.freeOrdersLimit,
        seats: user.seats,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, authenticate, authorize, JWT_SECRET };
