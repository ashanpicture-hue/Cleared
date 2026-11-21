const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('./auth');

const DATA_DIR = path.join(__dirname, 'data');
const SHIPMENTS_FILE = path.join(DATA_DIR, 'shipments.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function readShipments() {
  const data = fs.readFileSync(SHIPMENTS_FILE, 'utf8');
  return JSON.parse(data);
}
function writeShipments(data) {
  fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(data, null, 2));
}

// Specific routes first (before parameterized /:id)

// Create new shipment
router.post('/', authenticate, upload.array('documents', 10), (req, res) => {
  try {
    const { reference, buyer, lcTerms, forwardText } = req.body;
    const users = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
    const user = users.users.find(u => u.id === req.user.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.plan === 'free' && user.freeOrdersUsed >= user.freeOrdersLimit) {
      return res.status(403).json({ error: 'Free order limit reached. Upgrade to Desk plan.' });
    }

    const data = readShipments();
    const id = 'shp_' + Date.now().toString(36);
    const ref = reference || 'KHI-' + Math.floor(1000 + Math.random() * 9000);

    const shipment = {
      id,
      reference: ref,
      userId: user.id,
      userPhone: user.phone,
      buyer: buyer || '',
      lcTerms: lcTerms || '',
      status: 'queued',
      documents: (req.files || []).map(f => ({
        name: f.originalname,
        type: f.mimetype,
        size: f.size,
        uploaded: true,
        path: f.path
      })),
      forwardText: forwardText || '',
      extractedFields: {},
      findings: [],
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerId: null,
      fee: user.plan === 'free' ? 0 : 3000,
      paid: false
    };

    data.shipments.push(shipment);
    writeShipments(data);

    if (user.plan === 'free') {
      user.freeOrdersUsed += 1;
      const uFile = path.join(DATA_DIR, 'users.json');
      fs.writeFileSync(uFile, JSON.stringify(users, null, 2));
    }

    return res.status(201).json({
      success: true,
      shipment: {
        id: shipment.id,
        reference: shipment.reference,
        status: shipment.status,
        createdAt: shipment.createdAt,
        fee: shipment.fee
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's shipments
router.get('/mine', authenticate, (req, res) => {
  try {
    const data = readShipments();
    const shipments = data.shipments
      .filter(s => s.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ shipments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviewer queue (specific route before /:id)
router.get('/reviewer/queue', authenticate, authorize('reviewer', 'admin'), (req, res) => {
  try {
    const data = readShipments();
    const queue = data.shipments
      .filter(s => s.status === 'queued' || s.status === 'under_review')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return res.json({ shipments: queue });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: all orders (specific route before /:id)
router.get('/admin/all', authenticate, authorize('admin'), (req, res) => {
  try {
    const data = readShipments();
    const shipments = data.shipments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ shipments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: all users (specific route before /:id)
router.get('/admin/users', authenticate, authorize('admin'), (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
    return res.json({ users: users.users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single shipment (parameterized route - must come after specific routes)
router.get('/:id', authenticate, (req, res) => {
  try {
    const data = readShipments();
    const shipment = data.shipments.find(s => s.id === req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    if (req.user.role === 'customer' && shipment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ shipment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviewer sign-off
router.post('/:id/review', authenticate, authorize('reviewer', 'admin'), (req, res) => {
  try {
    const { decisions } = req.body;
    const data = readShipments();
    const idx = data.shipments.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });

    const shipment = data.shipments[idx];
    shipment.status = 'completed';
    shipment.reviewedAt = new Date().toISOString();
    shipment.reviewerId = req.user.userId;

    if (decisions) {
      shipment.findings = shipment.findings.map(f => {
        const d = decisions.find(x => x.field === f.field);
        return d ? { ...f, reviewerDecision: d.decision, correctedValue: d.correctedValue } : f;
      });
    }

    writeShipments(data);
    return res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
