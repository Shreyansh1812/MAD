import offlineBundleService from './offlineBundleService';

const REGISTRY_KEY = 'quickmenu_offline_registry_v1';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
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

class OfflineMenuRegistry {
  getRegistry() {
    return safeParse(localStorage.getItem(REGISTRY_KEY), { vendors: {} });
  }

  saveRegistry(registry) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }

  upsertMenuSnapshot(vendorId, payload) {
    if (!vendorId) {
      throw new Error('vendorId is required');
    }

    const registry = this.getRegistry();
    const current = registry.vendors[vendorId] || {
      vendorId,
      channelId: payload.channelId || `menu-${vendorId}`,
      currentVersion: 0,
      updatedAt: null,
      history: [],
      latest: null,
    };

    const version = Number(payload.version || Date.now());
    const menuItems = Array.isArray(payload.menuItems) ? payload.menuItems : [];
    const stallData = payload.stallData || { stallName: '', waitTime: 0 };
    const snapshotHash = hashString(stableJsonStringify({ menuItems, stallData }));

    const next = {
      ...current,
      channelId: payload.channelId || current.channelId,
      currentVersion: Math.max(version, current.currentVersion || 0),
      updatedAt: payload.updatedAt || new Date().toISOString(),
      latest: {
        version,
        updatedAt: payload.updatedAt || new Date().toISOString(),
        menuItems,
        stallData,
        source: payload.source || 'local',
        hash: snapshotHash,
      },
      history: [
        {
          version,
          updatedAt: payload.updatedAt || new Date().toISOString(),
          source: payload.source || 'local',
          hash: snapshotHash,
        },
        ...(current.history || []),
      ].slice(0, 20),
    };

    registry.vendors[vendorId] = next;
    this.saveRegistry(registry);

    return next;
  }

  resolveLatestMenu(vendorId) {
    const registry = this.getRegistry();
    return registry.vendors[vendorId]?.latest || null;
  }

  getVendorRecord(vendorId) {
    const registry = this.getRegistry();
    return registry.vendors[vendorId] || null;
  }

  listVendorIds() {
    return Object.keys(this.getRegistry().vendors || {});
  }

  createBundleForVendor(vendorId) {
    const record = this.getVendorRecord(vendorId);
    if (!record?.latest) {
      throw new Error('No offline menu snapshot available for this vendor');
    }

    return offlineBundleService.createBundle({
      vendorId,
      channelId: record.channelId,
      version: record.latest.version,
      stallData: record.latest.stallData,
      menuItems: record.latest.menuItems,
    });
  }

  async exportEncodedBundle(vendorId, preferCompression = true) {
    const bundle = this.createBundleForVendor(vendorId);
    const encoded = await offlineBundleService.encodeBundle(bundle, preferCompression);
    return {
      bundle,
      encoded,
    };
  }

  async importEncodedBundle(encodedBundle) {
    const bundle = await offlineBundleService.decodeBundle(encodedBundle);
    const menuData = offlineBundleService.inflateBundleToMenuData(bundle);

    const upserted = this.upsertMenuSnapshot(menuData.vendorId, {
      channelId: menuData.channelId,
      version: menuData.version,
      updatedAt: menuData.updatedAt,
      stallData: menuData.stallData,
      menuItems: menuData.menuItems,
      source: 'bundle-import',
    });

    return {
      vendorId: menuData.vendorId,
      version: menuData.version,
      record: upserted,
    };
  }
}

export default new OfflineMenuRegistry();
