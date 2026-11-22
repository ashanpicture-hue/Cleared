const cfg = require('./config');
const { HttpError } = require('./http');
// Returns the code only outside production so local development works without an SMS provider.
async function sendOtp(phone, code) {
  const t = cfg.twilio;
  if (t.sid && t.token && t.from) {
    const body = new URLSearchParams({ From: t.from, To: phone, Body: `Your Cleared code is ${code}. It expires in 10 minutes.` });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${t.sid}/Messages.json`, {
      method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${t.sid}:${t.token}`).toString('base64') }, body });
    if (!r.ok) throw new HttpError(502, 'Could not send the code. Try again in a minute.');
    return null;
  }
  if (cfg.prod) throw new HttpError(503, 'Code delivery is not configured.');
  console.log(`[dev OTP] ${phone}: ${code}`);
  return code;
}
module.exports = { sendOtp };
