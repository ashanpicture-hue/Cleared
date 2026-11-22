const prod = process.env.NODE_ENV === 'production';
function need(key, devDefault) {
  const v = process.env[key];
  if (v) return v;
  if (prod) throw new Error('Missing required environment variable ' + key);
  return devDefault;
}
module.exports = {
  prod,
  jwtSecret: need('JWT_SECRET', 'dev-only-secret-do-not-use'),
  databaseUrl: need('DATABASE_URL', 'postgres://localhost:5432/cleared'),
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.EXTRACT_MODEL || 'claude-sonnet-5-5',
  freeOrders: Number(process.env.FREE_ORDERS || 10),
  perShipmentFee: Number(process.env.PER_SHIPMENT_FEE_PKR || 3000),
  deskMonthlyShipments: Number(process.env.DESK_MONTHLY_SHIPMENTS || 20),
  reviewRatePkrPerMin: Number(process.env.REVIEW_RATE_PKR_PER_MIN || 20),
  tokenCostPkrPerM: { in: Number(process.env.COST_IN_PKR_PER_MTOK || 840), out: Number(process.env.COST_OUT_PKR_PER_MTOK || 4200) },
  twilio: { sid: process.env.TWILIO_SID, token: process.env.TWILIO_TOKEN, from: process.env.TWILIO_FROM },
};
