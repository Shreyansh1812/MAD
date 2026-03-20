const BUNDLE_PREFIX = 'qmb1';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64FromBytes = (bytes) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const bytesFromBase64 = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

const compactItems = (items = []) => {
  return items.map((item) => ({
    i: item.id || '',
    n: item.name || '',
    p: Number(item.price || 0),
    d: item.description || '',
    c: item.category || 'Other',
    v: item.isVeg !== false ? 1 : 0,
    a: item.isAvailable !== false ? 1 : 0,
  }));
};

const expandItems = (items = []) => {
  return items.map((item, index) => ({
    id: item.i || `bundle-${index}`,
    name: item.n || '',
    price: Number(item.p || 0),
    description: item.d || '',
    category: item.c || 'Other',
    isVeg: item.v !== 0,
    isAvailable: item.a !== 0,
  }));
};

const streamToUint8Array = async (stream) => {
  const response = new Response(stream);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

const gzipBytes = async (bytes) => {
  if (typeof CompressionStream === 'undefined') {
    return { compressed: false, bytes };
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  const compressed = await streamToUint8Array(stream);

  if (compressed.length >= bytes.length) {
    return { compressed: false, bytes };
  }

  return { compressed: true, bytes: compressed };
};

const ungzipBytes = async (bytes, compressed) => {
  if (!compressed) {
    return bytes;
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser does not support compressed bundle import');
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return streamToUint8Array(stream);
};

class OfflineBundleService {
  createBundle({ vendorId, channelId, version, stallData, menuItems }) {
    if (!vendorId) {
      throw new Error('vendorId is required');
    }

    const bundle = {
      v: 1,
      t: 'QMENU_BUNDLE',
      vendorId,
      channelId: channelId || `menu-${vendorId}`,
      version: Number(version || Date.now()),
      updatedAt: new Date().toISOString(),
      stall: {
        name: stallData?.stallName || '',
        wait: Number(stallData?.waitTime || 0),
      },
      items: compactItems(menuItems || []),
    };

    const checksum = hashString(stableJsonStringify(bundle));
    return {
      ...bundle,
      hash: checksum,
    };
  }

  verifyBundle(bundle) {
    if (!bundle || bundle.t !== 'QMENU_BUNDLE') {
      return { valid: false, reason: 'Invalid bundle marker' };
    }

    const { hash, ...withoutHash } = bundle;
    const expected = hashString(stableJsonStringify(withoutHash));

    if (hash !== expected) {
      return { valid: false, reason: 'Bundle checksum mismatch' };
    }

    return { valid: true, reason: null };
  }

  async encodeBundle(bundle, preferCompression = true) {
    const json = stableJsonStringify(bundle);
    const bytes = textEncoder.encode(json);

    const { compressed, bytes: output } = preferCompression
      ? await gzipBytes(bytes)
      : { compressed: false, bytes };

    const payload = base64FromBytes(output);
    return `${BUNDLE_PREFIX}:${compressed ? 'gz' : 'plain'}:${payload}`;
  }

  async decodeBundle(encoded) {
    const parts = String(encoded || '').split(':');
    if (parts.length < 3 || parts[0] !== BUNDLE_PREFIX) {
      throw new Error('Invalid offline bundle format');
    }

    const compression = parts[1];
    const payload = parts.slice(2).join(':');

    const bytes = bytesFromBase64(payload);
    const decompressed = await ungzipBytes(bytes, compression === 'gz');
    const json = textDecoder.decode(decompressed);
    const parsed = JSON.parse(json);

    const verification = this.verifyBundle(parsed);
    if (!verification.valid) {
      throw new Error(verification.reason);
    }

    return parsed;
  }

  inflateBundleToMenuData(bundle) {
    return {
      vendorId: bundle.vendorId,
      channelId: bundle.channelId,
      version: bundle.version,
      updatedAt: bundle.updatedAt,
      stallData: {
        stallName: bundle.stall?.name || '',
        waitTime: Number(bundle.stall?.wait || 0),
      },
      menuItems: expandItems(bundle.items || []),
    };
  }

  downloadBundle(encodedBundle, vendorId, version) {
    const blob = new Blob([encodedBundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `quickmenu-${vendorId}-v${version}.qmb`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}

export default new OfflineBundleService();
