// Cleared — API client & auth state
// Works with the Vercel serverless backend at /api/

const API_BASE = ''; // same-origin Vercel functions

let authToken = null;
let currentUser = null;

// Load persisted auth on startup
(function initAuth() {
  const t = localStorage.getItem('cleared_token');
  const u = localStorage.getItem('cleared_user');
  if (t && u) {
    authToken = t;
    currentUser = JSON.parse(u);
  }
})();

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers.Authorization = 'Bearer ' + authToken;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers
  });

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function setAuth(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('cleared_token', token);
  localStorage.setItem('cleared_user', JSON.stringify(user));
  dispatchAuthChange();
}

function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('cleared_token');
  localStorage.removeItem('cleared_user');
  dispatchAuthChange();
}

let authListeners = [];
function dispatchAuthChange() {
  authListeners.forEach(fn => fn(currentUser));
}
function onAuthChange(fn) {
  authListeners.push(fn);
  return () => { authListeners = authListeners.filter(f => f !== fn); }
}

// Auth API
const authAPI = {
  async signup(phone, name, role) {
    const data = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ phone, name, role })
    });
    return data;
  },
  async login(phone) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    return data;
  },
  async verifyOTP(phone, code) {
    const data = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
    if (data.token && data.user) setAuth(data.token, data.user);
    return data;
  },
  async resendOTP(phone) {
    return request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },
  async me() {
    const data = await request('/api/auth/me');
    if (data.user) {
      currentUser = data.user;
      localStorage.setItem('cleared_user', JSON.stringify(data.user));
    }
    return data;
  },
  async logout() {
    clearAuth();
  }
};

// Shipment API
const shipmentAPI = {
  async create({ reference, buyer, lcTerms, forwardText, files }) {
    const formData = new FormData();
    if (reference) formData.append('reference', reference);
    if (buyer) formData.append('buyer', buyer);
    if (lcTerms) formData.append('lcTerms', lcTerms);
    if (forwardText) formData.append('forwardText', forwardText);
    (files || []).forEach(f => formData.append('documents', f));

    const headers = {};
    if (authToken) headers.Authorization = 'Bearer ' + authToken;

    const res = await fetch(API_BASE + '/api/shipments/', {
      method: 'POST',
      headers,
      body: formData
    });
    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  },
  async mine() {
    return request('/api/shipments/mine');
  },
  async get(id) {
    return request('/api/shipments/' + id);
  },
  async reviewerQueue() {
    return request('/api/shipments/reviewer/queue');
  },
  async review(id, decisions) {
    return request('/api/shipments/' + id + '/review', {
      method: 'POST',
      body: JSON.stringify({ decisions })
    });
  },
  async adminAll() {
    return request('/api/shipments/admin/all');
  },
  async adminUsers() {
    return request('/api/shipments/admin/users');
  }
};

// Expose globally
window.ClearedAPI = {
  request,
  authAPI,
  shipmentAPI,
  setAuth,
  clearAuth,
  getToken: () => authToken,
  getUser: () => currentUser,
  onAuthChange
};
