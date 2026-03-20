import QRCode from 'qrcode';

const QR_IDENTITY_KEY = 'quickmenu_qr_identity_v1';
const APP_QR_VERSION = 1;
const DEFAULT_PRODUCTION_URL = 'https://mad-eosin.vercel.app';

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  return value.replace(/\/$/, '');
};

const getConfiguredBaseUrl = () => {
  const configured = normalizeBaseUrl(import.meta.env.VITE_PUBLIC_MENU_BASE_URL);
  if (configured) {
    return configured;
  }

  const browserOrigin = typeof window !== 'undefined' ? normalizeBaseUrl(window.location.origin) : null;
  if (browserOrigin) {
    return browserOrigin;
  }

  return DEFAULT_PRODUCTION_URL;
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const base64UrlEncode = (input) => {
  const base64 = btoa(input);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const base64UrlDecode = (input) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
};

const stableJsonStringify = (value) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableJsonStringify).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`);
  return `{${pairs.join(',')}}`;
};

const hashString = (input) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
};

const getAllIdentityData = () => {
  return safeParse(localStorage.getItem(QR_IDENTITY_KEY), {});
};

const saveAllIdentityData = (data) => {
  localStorage.setItem(QR_IDENTITY_KEY, JSON.stringify(data));
};

const buildCompactSnapshot = (menuItems = [], stallData = {}, maxItems = 5) => {
  return {
    s: (stallData?.stallName || '').slice(0, 40),
    w: Number(stallData?.waitTime || 0),
    i: menuItems.slice(0, maxItems).map((item) => ({
      n: (item?.name || '').slice(0, 40),
      p: Number(item?.price || 0),
      c: item?.category || 'Other',
      v: item?.isVeg !== false,
      a: item?.isAvailable !== false,
    })),
  };
};

class PersistentQRService {
  getVendorIdentity(vendorId) {
    if (!vendorId) {
      return null;
    }

    const allData = getAllIdentityData();
    return allData[vendorId] || null;
  }

  resetVendorIdentity(vendorId) {
    if (!vendorId) {
      return;
    }

    const allData = getAllIdentityData();
    if (allData[vendorId]) {
      delete allData[vendorId];
      saveAllIdentityData(allData);
    }
  }

  getOrCreateVendorIdentity(vendorId, options = {}) {
    if (!vendorId) {
      throw new Error('Vendor ID is required to create persistent QR identity');
    }

    const allData = getAllIdentityData();
    const existing = allData[vendorId];

    if (existing) {
      return existing;
    }

    const createdAt = Date.now();
    const channelId = options.channelId || `menu-${vendorId}`;

    const identity = {
      vendorId,
      channelId,
      createdAt,
      qrVersion: APP_QR_VERSION,
      includeSnapshot: Boolean(options.includeSnapshot),
      snapshot: options.includeSnapshot
        ? buildCompactSnapshot(options.menuItems, options.stallData)
        : null,
    };

    allData[vendorId] = identity;
    saveAllIdentityData(allData);

    return identity;
  }

  buildPayload(identity) {
    const payload = {
      v: APP_QR_VERSION,
      vid: identity.vendorId,
      c: identity.channelId,
      t: identity.createdAt,
      f: identity.includeSnapshot ? 1 : 0,
      s: identity.includeSnapshot ? identity.snapshot : undefined,
      k: 'QMENU',
    };

    const withoutHash = { ...payload };
    const checksum = hashString(stableJsonStringify(withoutHash));

    return {
      ...withoutHash,
      h: checksum,
    };
  }

  encodePayload(payload) {
    return base64UrlEncode(stableJsonStringify(payload));
  }

  decodePayload(token) {
    const decoded = base64UrlDecode(token);
    return JSON.parse(decoded);
  }

  validatePayload(payload) {
    if (!payload || payload.k !== 'QMENU') {
      return { valid: false, reason: 'Invalid QR payload marker' };
    }

    const { h, ...withoutHash } = payload;
    const expectedHash = hashString(stableJsonStringify(withoutHash));
    if (h !== expectedHash) {
      return { valid: false, reason: 'QR payload checksum mismatch' };
    }

    if (!payload.vid || !payload.c) {
      return { valid: false, reason: 'Missing vendor identity fields' };
    }

    return { valid: true, reason: null };
  }

  buildPublicViewUrl(token, baseUrl = getConfiguredBaseUrl()) {
    return `${baseUrl}/view?q=${token}`;
  }

  async generatePersistentQR(vendorId, options = {}) {
    const identity = this.getOrCreateVendorIdentity(vendorId, options);
    const payload = this.buildPayload(identity);
    const token = this.encodePayload(payload);
    const url = this.buildPublicViewUrl(token, options.baseUrl || getConfiguredBaseUrl());

    const image = await QRCode.toDataURL(url, {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      margin: 2,
      width: options.width || 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      identity,
      payload,
      token,
      url,
      image,
    };
  }
}

export default new PersistentQRService();
