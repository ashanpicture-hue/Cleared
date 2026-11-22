const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cfg = require('../lib/config');
const app = express();
app.set('trust proxy', 1); // Vercel sits in front, so rate limits see the real client address
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ['https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], frameAncestors: ["'none'"], upgradeInsecureRequests: cfg.prod ? [] : null } } }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Try again in a few minutes.' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many sign-in attempts. Try again later.' } }));
// Cookies are SameSite=Lax; this also refuses cross-site writes that carry an Origin header.
app.use('/api', (req, res, next) => {
  const o = req.headers.origin;
  if (req.method !== 'GET' && o && new URL(o).host !== req.headers.host) return res.status(403).json({ error: 'Cross-site request blocked.' });
  next();
});
app.use('/api/auth', require('../routes/auth'));
app.use('/api/shipments', require('../routes/shipments'));
app.use('/api/admin', require('../routes/admin'));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Each file must be under 4 MB.' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong on our side.' });
});
if (require.main === module) {
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.listen(process.env.PORT || 3000, () => console.log('Cleared on http://localhost:' + (process.env.PORT || 3000)));
}
module.exports = app;
