/**
 * Minimal in-memory Firestore double.
 *
 * Implements only the surface our Cloud Functions actually use: doc/collection
 * refs, get/set/add/update/delete, where (==, in, >=), orderBy, limit, count,
 * getAll, batch, runTransaction and recursiveDelete. It exists so the callable
 * handlers can be integration-tested in environments where the real emulator
 * (which needs JDK 21) is unavailable.
 *
 * This is a test harness, never shipped to production.
 */

class Timestamp {
  constructor(ms) { this.ms = ms; }
  toMillis() { return this.ms; }
  toDate() { return new Date(this.ms); }
  valueOf() { return this.ms; }
}

const SERVER_TIMESTAMP = Symbol('serverTimestamp');

const FieldValue = {
  serverTimestamp: () => SERVER_TIMESTAMP,
};

const clone = (v) => {
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof Timestamp) return v;
  if (Array.isArray(v)) return v.map(clone);
  const out = {};
  for (const [k, val] of Object.entries(v)) out[k] = clone(val);
  return out;
};

const resolveWrites = (data) => {
  if (data === SERVER_TIMESTAMP) return new Timestamp(Date.now());
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Timestamp) return data;
  if (Array.isArray(data)) return data.map(resolveWrites);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    out[k] = resolveWrites(v);
  }
  return out;
};

/** Apply an update() payload, honouring dotted field paths. */
const applyUpdate = (target, patch) => {
  for (const [key, value] of Object.entries(patch)) {
    const resolved = resolveWrites(value);
    if (!key.includes('.')) { target[key] = resolved; continue; }
    const parts = key.split('.');
    let node = target;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof node[parts[i]] !== 'object' || node[parts[i]] === null) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = resolved;
  }
};

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

class Snapshot {
  constructor(id, ref, data) { this.id = id; this.ref = ref; this._data = data; }
  get exists() { return this._data !== undefined; }
  data() { return this._data === undefined ? undefined : clone(this._data); }
  get(field) { return getPath(this._data, field); }
}

class QuerySnapshot {
  constructor(docs) { this.docs = docs; }
  get size() { return this.docs.length; }
  get empty() { return this.docs.length === 0; }
  forEach(fn) { this.docs.forEach(fn); }
}

class Query {
  constructor(store, path, filters = [], order = null, lim = null) {
    this.store = store; this.path = path; this.filters = filters;
    this.order = order; this.lim = lim;
  }
  where(field, op, value) {
    return new Query(this.store, this.path, [...this.filters, { field, op, value }], this.order, this.lim);
  }
  orderBy(field, dir = 'asc') {
    return new Query(this.store, this.path, this.filters, { field, dir }, this.lim);
  }
  limit(n) { return new Query(this.store, this.path, this.filters, this.order, n); }

  _rows() {
    const bucket = this.store.data.get(this.path) || new Map();
    let rows = [...bucket.entries()].map(([id, data]) => ({ id, data }));
    for (const f of this.filters) {
      rows = rows.filter(({ data }) => {
        const v = getPath(data, f.field);
        switch (f.op) {
          case '==': return v === f.value;
          case '!=': return v !== f.value;
          case 'in': return Array.isArray(f.value) && f.value.includes(v);
          case '>=': return v != null && Number(v) >= Number(f.value);
          case '<=': return v != null && Number(v) <= Number(f.value);
          case '>': return v != null && Number(v) > Number(f.value);
          case '<': return v != null && Number(v) < Number(f.value);
          default: throw new Error(`fakeFirestore: unsupported operator ${f.op}`);
        }
      });
    }
    if (this.order) {
      const { field, dir } = this.order;
      rows.sort((a, b) => {
        const av = Number(getPath(a.data, field) ?? 0);
        const bv = Number(getPath(b.data, field) ?? 0);
        return dir === 'desc' ? bv - av : av - bv;
      });
    }
    if (this.lim != null) rows = rows.slice(0, this.lim);
    return rows;
  }

  async get() {
    return new QuerySnapshot(this._rows().map(({ id, data }) =>
      new Snapshot(id, new DocRef(this.store, this.path, id), clone(data))));
  }

  count() {
    const rows = this._rows();
    return { get: async () => ({ data: () => ({ count: rows.length }) }) };
  }
}

class CollectionRef extends Query {
  doc(id) { return new DocRef(this.store, this.path, id || this.store.newId()); }
  async add(data) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

class DocRef {
  constructor(store, collectionPath, id) {
    this.store = store; this.collectionPath = collectionPath; this.id = id;
    this.path = `${collectionPath}/${id}`;
  }
  collection(name) { return new CollectionRef(this.store, `${this.path}/${name}`); }
  async get() {
    const bucket = this.store.data.get(this.collectionPath);
    const data = bucket ? bucket.get(this.id) : undefined;
    return new Snapshot(this.id, this, data === undefined ? undefined : clone(data));
  }
  async set(data, options = {}) {
    if (!this.store.data.has(this.collectionPath)) this.store.data.set(this.collectionPath, new Map());
    const bucket = this.store.data.get(this.collectionPath);
    const resolved = resolveWrites(data);
    bucket.set(this.id, options.merge && bucket.has(this.id)
      ? { ...bucket.get(this.id), ...resolved }
      : resolved);
    return this;
  }
  async update(patch) {
    const bucket = this.store.data.get(this.collectionPath);
    if (!bucket || !bucket.has(this.id)) throw new Error(`No document to update: ${this.path}`);
    const next = clone(bucket.get(this.id));
    applyUpdate(next, patch);
    bucket.set(this.id, next);
    return this;
  }
  async delete() {
    const bucket = this.store.data.get(this.collectionPath);
    if (bucket) bucket.delete(this.id);
  }
}

class Firestore {
  constructor() { this.data = new Map(); this.counter = 0; }
  newId() { return `id_${(++this.counter).toString().padStart(6, '0')}_${Math.random().toString(36).slice(2, 8)}`; }
  settings() {}
  collection(path) { return new CollectionRef(this, path); }
  doc(path) {
    const parts = path.split('/');
    return new DocRef(this, parts.slice(0, -1).join('/'), parts[parts.length - 1]);
  }
  async getAll(...refs) { return Promise.all(refs.map((r) => r.get())); }
  batch() {
    const ops = [];
    return {
      set: (ref, data, opts) => ops.push(() => ref.set(data, opts)),
      update: (ref, data) => ops.push(() => ref.update(data)),
      delete: (ref) => ops.push(() => ref.delete()),
      commit: async () => { for (const op of ops) await op(); },
    };
  }
  async runTransaction(fn) {
    // Sequential execution is sufficient for single-threaded tests.
    return fn({
      get: (ref) => ref.get(),
      set: (ref, data, opts) => ref.set(data, opts),
      update: (ref, data) => ref.update(data),
      delete: (ref) => ref.delete(),
    });
  }
  async recursiveDelete(ref) {
    const prefix = ref.path;
    for (const key of [...this.data.keys()]) {
      if (key === prefix || key.startsWith(prefix + '/')) this.data.delete(key);
    }
    const bucket = this.data.get(ref.collectionPath);
    if (bucket) bucket.delete(ref.id);
  }
  /** Test helper: how many docs live under a collection path. */
  countAt(path) { return (this.data.get(path) || new Map()).size; }
}

module.exports = { Firestore, FieldValue, Timestamp, SERVER_TIMESTAMP };
