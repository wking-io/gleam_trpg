// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  // @internal
  countLength() {
    let length2 = 0;
    for (let _ of this)
      length2++;
    return length2;
  }
};
function prepend(element2, tail) {
  return new NonEmpty(element2, tail);
}
function toList(elements2, tail) {
  return List.fromArray(elements2, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x3, y3) {
  let values = [x3, y3];
  while (values.length) {
    let a = values.pop();
    let b = values.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys2, get] = getters(a);
    for (let k of keys2(a)) {
      values.push(get(a, k), get(b, k));
    }
  }
  return true;
}
function getters(object3) {
  if (object3 instanceof Map) {
    return [(x3) => x3.keys(), (x3, y3) => x3.get(y3)];
  } else {
    let extra = object3 instanceof globalThis.Error ? ["message"] : [];
    return [(x3) => [...extra, ...Object.keys(x3)], (x3, y3) => x3[y3]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}
function divideInt(a, b) {
  return Math.trunc(divideFloat(a, b));
}
function divideFloat(a, b) {
  if (b === 0) {
    return 0;
  } else {
    return a / b;
  }
}
function makeError(variant, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.module = module;
  error.line = line;
  error.function = fn;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
var Lt = class extends CustomType {
};
var Eq = class extends CustomType {
};
var Gt = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var None = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function min(a, b) {
  let $ = a < b;
  if ($) {
    return a;
  } else {
    return b;
  }
}
function max(a, b) {
  let $ = a > b;
  if ($) {
    return a;
  } else {
    return b;
  }
}
function clamp(x3, min_bound, max_bound) {
  let _pipe = x3;
  let _pipe$1 = min(_pipe, max_bound);
  return max(_pipe$1, min_bound);
}
function add(a, b) {
  return a + b;
}
function multiply(a, b) {
  return a * b;
}
function subtract(a, b) {
  return a - b;
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function insert(dict, key, value) {
  return map_insert(key, value, dict);
}
function from_list_loop(loop$list, loop$initial) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let x3 = list.head;
      let rest = list.tail;
      loop$list = rest;
      loop$initial = insert(initial, x3[0], x3[1]);
    }
  }
}
function from_list(list) {
  return from_list_loop(list, new_map());
}
function reverse_and_concat(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest = remaining.tail;
      loop$remaining = rest;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function do_keys_loop(loop$list, loop$acc) {
  while (true) {
    let list = loop$list;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse_and_concat(acc, toList([]));
    } else {
      let first3 = list.head;
      let rest = list.tail;
      loop$list = rest;
      loop$acc = prepend(first3[0], acc);
    }
  }
}
function keys(dict) {
  let list_of_pairs = map_to_list(dict);
  return do_keys_loop(list_of_pairs, toList([]));
}

// build/dev/javascript/gleam_stdlib/gleam/pair.mjs
function first(pair) {
  let a = pair[0];
  return a;
}
function second(pair) {
  let a = pair[1];
  return a;
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function reverse_loop(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(list) {
  return reverse_loop(list, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first3 = loop$first;
    let second2 = loop$second;
    if (first3.hasLength(0)) {
      return second2;
    } else {
      let item = first3.head;
      let rest$1 = first3.tail;
      loop$first = rest$1;
      loop$second = prepend(item, second2);
    }
  }
}
function append(first3, second2) {
  return append_loop(reverse(first3), second2);
}
function fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let x3 = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, x3);
      loop$fun = fun;
    }
  }
}
function fold_right(list, initial, fun) {
  if (list.hasLength(0)) {
    return initial;
  } else {
    let x3 = list.head;
    let rest$1 = list.tail;
    return fun(fold_right(rest$1, initial, fun), x3);
  }
}
function index_fold_loop(loop$over, loop$acc, loop$with, loop$index) {
  while (true) {
    let over = loop$over;
    let acc = loop$acc;
    let with$ = loop$with;
    let index2 = loop$index;
    if (over.hasLength(0)) {
      return acc;
    } else {
      let first$1 = over.head;
      let rest$1 = over.tail;
      loop$over = rest$1;
      loop$acc = with$(acc, first$1, index2);
      loop$with = with$;
      loop$index = index2 + 1;
    }
  }
}
function index_fold(list, initial, fun) {
  return index_fold_loop(list, initial, fun, 0);
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function drop_start(loop$string, loop$num_graphemes) {
  while (true) {
    let string2 = loop$string;
    let num_graphemes = loop$num_graphemes;
    let $ = num_graphemes > 0;
    if (!$) {
      return string2;
    } else {
      let $1 = pop_grapheme(string2);
      if ($1.isOk()) {
        let string$1 = $1[0][1];
        loop$string = string$1;
        loop$num_graphemes = num_graphemes - 1;
      } else {
        return string2;
      }
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function try$(result, fun) {
  if (result.isOk()) {
    let x3 = result[0];
    return fun(x3);
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function unwrap(result, default$) {
  if (result.isOk()) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x3) {
  x3 -= x3 >> 1 & 1431655765;
  x3 = (x3 & 858993459) + (x3 >> 2 & 858993459);
  x3 = x3 + (x3 >> 4) & 252645135;
  x3 += x3 >> 8;
  x3 += x3 >> 16;
  return x3 & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at2, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at2] = val;
  return out;
}
function spliceIn(arr, at2, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at2) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at2) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at2) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root, shift, hash, key, val, addedLeaf) {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size + 1,
      array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: ARRAY_NODE,
        size: root.size,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root;
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function assocIndex(root, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root.bitmap, bit);
  if ((root.bitmap & bit) !== 0) {
    const node = root.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root, shift, hash, key, val, addedLeaf) {
  if (hash === root.hash) {
    const idx = collisionIndexOf(root, key);
    if (idx !== -1) {
      const entry = root.array[idx];
      if (entry.v === val) {
        return root;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root.hash, shift),
      array: [root]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root, key) {
  const size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root, key);
  }
}
function findArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return void 0;
  }
  return root.array[idx];
}
function without(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root, key);
  }
}
function withoutArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return root;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
  }
  if (n === void 0) {
    if (root.size <= MIN_ARRAY_NODE) {
      const arr = root.array;
      const out = new Array(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root.size - 1,
      array: cloneAndSet(root.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function withoutIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return root;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  return root;
}
function withoutCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return root;
  }
  if (root.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root.hash,
    array: spliceOut(root.array, idx)
  };
}
function forEach(root, fn) {
  if (root === void 0) {
    return;
  }
  const items = root.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root, size) {
    this.root = root;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    try {
      this.forEach((v, k) => {
        if (!isEqual(o.get(k, !v), v)) {
          throw unequalDictSymbol;
        }
      });
      return true;
    } catch (e) {
      if (e === unequalDictSymbol) {
        return false;
      }
      throw e;
    }
  }
};
var unequalDictSymbol = Symbol();

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x3) {
  return x3;
}
function to_string(term) {
  return term.toString();
}
var segmenter = void 0;
function graphemes_iterator(string2) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter();
    return segmenter.segment(string2)[Symbol.iterator]();
  }
}
function pop_grapheme(string2) {
  let first3;
  const iterator = graphemes_iterator(string2);
  if (iterator) {
    first3 = iterator.next().value?.segment;
  } else {
    first3 = string2.match(/./su)?.[0];
  }
  if (first3) {
    return new Ok([first3, string2.slice(first3.length)]);
  } else {
    return new Error(Nil);
  }
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join("");
var trim_start_regex = new RegExp(`^[${unicode_whitespaces}]*`);
var trim_end_regex = new RegExp(`[${unicode_whitespaces}]*$`);
function floor(float2) {
  return Math.floor(float2);
}
function new_map() {
  return Dict.new();
}
function map_to_list(map4) {
  return List.fromArray(map4.entries());
}
function map_get(map4, key) {
  const value = map4.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}
function map_insert(key, value, map4) {
  return map4.set(key, value);
}

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function compare(a, b) {
  let $ = a === b;
  if ($) {
    return new Eq();
  } else {
    let $1 = a < b;
    if ($1) {
      return new Lt();
    } else {
      return new Gt();
    }
  }
}
function modulo(dividend, divisor) {
  if (divisor === 0) {
    return new Error(void 0);
  } else {
    return new Ok(dividend - floor(divideFloat(dividend, divisor)) * divisor);
  }
}
function divide(a, b) {
  if (b === 0) {
    return new Error(void 0);
  } else {
    let b$1 = b;
    return new Ok(divideFloat(a, b$1));
  }
}
function add3(a, b) {
  return a + b;
}
function multiply2(a, b) {
  return a * b;
}
function subtract2(a, b) {
  return a - b;
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(all) {
    super();
    this.all = all;
  }
};
function custom(run) {
  return new Effect(
    toList([
      (actions) => {
        return run(actions.dispatch, actions.emit, actions.select, actions.root);
      }
    ])
  );
}
function from(effect) {
  return custom((dispatch, _, _1, _2) => {
    return effect(dispatch);
  });
}
function none() {
  return new Effect(toList([]));
}
function batch(effects) {
  return new Effect(
    fold(
      effects,
      toList([]),
      (b, _use1) => {
        let a = _use1.all;
        return append(b, a);
      }
    )
  );
}

// build/dev/javascript/lustre/lustre/internals/vdom.mjs
var Text = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Element = class extends CustomType {
  constructor(key, namespace, tag, attrs, children2, self_closing, void$) {
    super();
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attrs = attrs;
    this.children = children2;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Map2 = class extends CustomType {
  constructor(subtree) {
    super();
    this.subtree = subtree;
  }
};
var Attribute = class extends CustomType {
  constructor(x0, x1, as_property) {
    super();
    this[0] = x0;
    this[1] = x1;
    this.as_property = as_property;
  }
};
function attribute_to_event_handler(attribute2) {
  if (attribute2 instanceof Attribute) {
    return new Error(void 0);
  } else {
    let name = attribute2[0];
    let handler = attribute2[1];
    let name$1 = drop_start(name, 2);
    return new Ok([name$1, handler]);
  }
}
function do_element_list_handlers(elements2, handlers2, key) {
  return index_fold(
    elements2,
    handlers2,
    (handlers3, element2, index2) => {
      let key$1 = key + "-" + to_string(index2);
      return do_handlers(element2, handlers3, key$1);
    }
  );
}
function do_handlers(loop$element, loop$handlers, loop$key) {
  while (true) {
    let element2 = loop$element;
    let handlers2 = loop$handlers;
    let key = loop$key;
    if (element2 instanceof Text) {
      return handlers2;
    } else if (element2 instanceof Map2) {
      let subtree = element2.subtree;
      loop$element = subtree();
      loop$handlers = handlers2;
      loop$key = key;
    } else {
      let attrs = element2.attrs;
      let children2 = element2.children;
      let handlers$1 = fold(
        attrs,
        handlers2,
        (handlers3, attr) => {
          let $ = attribute_to_event_handler(attr);
          if ($.isOk()) {
            let name = $[0][0];
            let handler = $[0][1];
            return insert(handlers3, key + "-" + name, handler);
          } else {
            return handlers3;
          }
        }
      );
      return do_element_list_handlers(children2, handlers$1, key);
    }
  }
}
function handlers(element2) {
  return do_handlers(element2, new_map(), "0");
}

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute(name, value) {
  return new Attribute(name, identity(value), false);
}
function property(name, value) {
  return new Attribute(name, identity(value), true);
}
function style(properties) {
  return attribute(
    "style",
    fold(
      properties,
      "",
      (styles, _use1) => {
        let name$1 = _use1[0];
        let value$1 = _use1[1];
        return styles + name$1 + ":" + value$1 + ";";
      }
    )
  );
}
function id(name) {
  return attribute("id", name);
}
function height(val) {
  return property("height", val);
}
function width(val) {
  return property("width", val);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element(tag, attrs, children2) {
  if (tag === "area") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "base") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "br") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "col") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "embed") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "hr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "img") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "input") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "link") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "meta") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "param") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "source") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "track") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "wbr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else {
    return new Element("", "", tag, attrs, children2, false, false);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/set.mjs
var Set2 = class extends CustomType {
  constructor(dict) {
    super();
    this.dict = dict;
  }
};
function new$2() {
  return new Set2(new_map());
}

// build/dev/javascript/lustre/lustre/internals/patch.mjs
var Diff = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Emit = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Init = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
function is_empty_element_diff(diff2) {
  return isEqual(diff2.created, new_map()) && isEqual(
    diff2.removed,
    new$2()
  ) && isEqual(diff2.updated, new_map());
}

// build/dev/javascript/lustre/lustre/internals/runtime.mjs
var Attrs = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Batch = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Debug = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Dispatch = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Emit2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Event2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Shutdown = class extends CustomType {
};
var Subscribe = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Unsubscribe = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var ForceModel = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};

// build/dev/javascript/lustre/vdom.ffi.mjs
if (globalThis.customElements && !globalThis.customElements.get("lustre-fragment")) {
  globalThis.customElements.define(
    "lustre-fragment",
    class LustreFragment extends HTMLElement {
      constructor() {
        super();
      }
    }
  );
}
function morph(prev, next2, dispatch) {
  let out;
  let stack = [{ prev, next: next2, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next3, parent } = stack.pop();
    while (next3.subtree !== void 0)
      next3 = next3.subtree();
    if (next3.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next3.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next3.content)
          prev2.textContent = next3.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next3.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next3.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next3,
        dispatch,
        stack
      });
      if (!prev2) {
        parent.appendChild(created);
      } else if (prev2 !== created) {
        parent.replaceChild(created, prev2);
      }
      out ??= created;
    }
  }
  return out;
}
function createElementNode({ prev, next: next2, dispatch, stack }) {
  const namespace = next2.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next2.tag && prev.namespaceURI === (next2.namespace || "http://www.w3.org/1999/xhtml");
  const el = canMorph ? prev : namespace ? document.createElementNS(namespace, next2.tag) : document.createElement(next2.tag);
  let handlersForEl;
  if (!registeredHandlers.has(el)) {
    const emptyHandlers = /* @__PURE__ */ new Map();
    registeredHandlers.set(el, emptyHandlers);
    handlersForEl = emptyHandlers;
  } else {
    handlersForEl = registeredHandlers.get(el);
  }
  const prevHandlers = canMorph ? new Set(handlersForEl.keys()) : null;
  const prevAttributes = canMorph ? new Set(Array.from(prev.attributes, (a) => a.name)) : null;
  let className = null;
  let style2 = null;
  let innerHTML = null;
  if (canMorph && next2.tag === "textarea") {
    const innertText = next2.children[Symbol.iterator]().next().value?.content;
    if (innertText !== void 0)
      el.value = innertText;
  }
  const delegated = [];
  for (const attr of next2.attrs) {
    const name = attr[0];
    const value = attr[1];
    if (attr.as_property) {
      if (el[name] !== value)
        el[name] = value;
      if (canMorph)
        prevAttributes.delete(name);
    } else if (name.startsWith("on")) {
      const eventName = name.slice(2);
      const callback = dispatch(value, eventName === "input");
      if (!handlersForEl.has(eventName)) {
        el.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      if (canMorph)
        prevHandlers.delete(eventName);
    } else if (name.startsWith("data-lustre-on-")) {
      const eventName = name.slice(15);
      const callback = dispatch(lustreServerEventHandler);
      if (!handlersForEl.has(eventName)) {
        el.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      el.setAttribute(name, value);
      if (canMorph) {
        prevHandlers.delete(eventName);
        prevAttributes.delete(name);
      }
    } else if (name.startsWith("delegate:data-") || name.startsWith("delegate:aria-")) {
      el.setAttribute(name, value);
      delegated.push([name.slice(10), value]);
    } else if (name === "class") {
      className = className === null ? value : className + " " + value;
    } else if (name === "style") {
      style2 = style2 === null ? value : style2 + value;
    } else if (name === "dangerous-unescaped-html") {
      innerHTML = value;
    } else {
      if (el.getAttribute(name) !== value)
        el.setAttribute(name, value);
      if (name === "value" || name === "selected")
        el[name] = value;
      if (canMorph)
        prevAttributes.delete(name);
    }
  }
  if (className !== null) {
    el.setAttribute("class", className);
    if (canMorph)
      prevAttributes.delete("class");
  }
  if (style2 !== null) {
    el.setAttribute("style", style2);
    if (canMorph)
      prevAttributes.delete("style");
  }
  if (canMorph) {
    for (const attr of prevAttributes) {
      el.removeAttribute(attr);
    }
    for (const eventName of prevHandlers) {
      handlersForEl.delete(eventName);
      el.removeEventListener(eventName, lustreGenericEventHandler);
    }
  }
  if (next2.tag === "slot") {
    window.queueMicrotask(() => {
      for (const child of el.assignedElements()) {
        for (const [name, value] of delegated) {
          if (!child.hasAttribute(name)) {
            child.setAttribute(name, value);
          }
        }
      }
    });
  }
  if (next2.key !== void 0 && next2.key !== "") {
    el.setAttribute("data-lustre-key", next2.key);
  } else if (innerHTML !== null) {
    el.innerHTML = innerHTML;
    return el;
  }
  let prevChild = el.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = children(next2).next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next2);
    for (const child of children(next2)) {
      prevChild = diffKeyedChild(
        prevChild,
        child,
        el,
        stack,
        incomingKeyedChildren,
        keyedChildren,
        seenKeys
      );
    }
  } else {
    for (const child of children(next2)) {
      stack.unshift({ prev: prevChild, next: child, parent: el });
      prevChild = prevChild?.nextSibling;
    }
  }
  while (prevChild) {
    const next3 = prevChild.nextSibling;
    el.removeChild(prevChild);
    prevChild = next3;
  }
  return el;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event) {
  const target = event.currentTarget;
  if (!registeredHandlers.has(target)) {
    target.removeEventListener(event.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target);
  if (!handlersForEventTarget.has(event.type)) {
    target.removeEventListener(event.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event.type)(event);
}
function lustreServerEventHandler(event) {
  const el = event.currentTarget;
  const tag = el.getAttribute(`data-lustre-on-${event.type}`);
  const data = JSON.parse(el.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el.getAttribute("data-lustre-include") || "[]");
  switch (event.type) {
    case "input":
    case "change":
      include.push("target.value");
      break;
  }
  return {
    tag,
    data: include.reduce(
      (data2, property2) => {
        const path = property2.split(".");
        for (let i = 0, o = data2, e = event; i < path.length; i++) {
          if (i === path.length - 1) {
            o[path[i]] = e[path[i]];
          } else {
            o[path[i]] ??= {};
            e = e[path[i]];
            o = o[path[i]];
          }
        }
        return data2;
      },
      { data }
    )
  };
}
function getKeyedChildren(el) {
  const keyedChildren = /* @__PURE__ */ new Map();
  if (el) {
    for (const child of children(el)) {
      const key = child?.key || child?.getAttribute?.("data-lustre-key");
      if (key)
        keyedChildren.set(key, child);
    }
  }
  return keyedChildren;
}
function diffKeyedChild(prevChild, child, el, stack, incomingKeyedChildren, keyedChildren, seenKeys) {
  while (prevChild && !incomingKeyedChildren.has(prevChild.getAttribute("data-lustre-key"))) {
    const nextChild = prevChild.nextSibling;
    el.removeChild(prevChild);
    prevChild = nextChild;
  }
  if (keyedChildren.size === 0) {
    stack.unshift({ prev: prevChild, next: child, parent: el });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  if (seenKeys.has(child.key)) {
    console.warn(`Duplicate key found in Lustre vnode: ${child.key}`);
    stack.unshift({ prev: null, next: child, parent: el });
    return prevChild;
  }
  seenKeys.add(child.key);
  const keyedChild = keyedChildren.get(child.key);
  if (!keyedChild && !prevChild) {
    stack.unshift({ prev: null, next: child, parent: el });
    return prevChild;
  }
  if (!keyedChild && prevChild !== null) {
    const placeholder = document.createTextNode("");
    el.insertBefore(placeholder, prevChild);
    stack.unshift({ prev: placeholder, next: child, parent: el });
    return prevChild;
  }
  if (!keyedChild || keyedChild === prevChild) {
    stack.unshift({ prev: prevChild, next: child, parent: el });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  el.insertBefore(keyedChild, prevChild);
  stack.unshift({ prev: keyedChild, next: child, parent: el });
  return prevChild;
}
function* children(element2) {
  for (const child of element2.children) {
    yield* forceChild(child);
  }
}
function* forceChild(element2) {
  if (element2.subtree !== void 0) {
    yield* forceChild(element2.subtree());
  } else {
    yield element2;
  }
}

// build/dev/javascript/lustre/lustre.ffi.mjs
var LustreClientApplication = class _LustreClientApplication {
  /**
   * @template Flags
   *
   * @param {object} app
   * @param {(flags: Flags) => [Model, Lustre.Effect<Msg>]} app.init
   * @param {(msg: Msg, model: Model) => [Model, Lustre.Effect<Msg>]} app.update
   * @param {(model: Model) => Lustre.Element<Msg>} app.view
   * @param {string | HTMLElement} selector
   * @param {Flags} flags
   *
   * @returns {Gleam.Ok<(action: Lustre.Action<Lustre.Client, Msg>>) => void>}
   */
  static start({ init: init3, update: update2, view: view2 }, selector, flags) {
    if (!is_browser())
      return new Error(new NotABrowser());
    const root = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root)
      return new Error(new ElementNotFound(selector));
    const app = new _LustreClientApplication(root, init3(flags), update2, view2);
    return new Ok((action) => app.send(action));
  }
  /**
   * @param {Element} root
   * @param {[Model, Lustre.Effect<Msg>]} init
   * @param {(model: Model, msg: Msg) => [Model, Lustre.Effect<Msg>]} update
   * @param {(model: Model) => Lustre.Element<Msg>} view
   *
   * @returns {LustreClientApplication}
   */
  constructor(root, [init3, effects], update2, view2) {
    this.root = root;
    this.#model = init3;
    this.#update = update2;
    this.#view = view2;
    this.#tickScheduled = window.requestAnimationFrame(
      () => this.#tick(effects.all.toArray(), true)
    );
  }
  /** @type {Element} */
  root;
  /**
   * @param {Lustre.Action<Lustre.Client, Msg>} action
   *
   * @returns {void}
   */
  send(action) {
    if (action instanceof Debug) {
      if (action[0] instanceof ForceModel) {
        this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
        this.#queue = [];
        this.#model = action[0][0];
        const vdom = this.#view(this.#model);
        const dispatch = (handler, immediate = false) => (event) => {
          const result = handler(event);
          if (result instanceof Ok) {
            this.send(new Dispatch(result[0], immediate));
          }
        };
        const prev = this.root.firstChild ?? this.root.appendChild(document.createTextNode(""));
        morph(prev, vdom, dispatch);
      }
    } else if (action instanceof Dispatch) {
      const msg = action[0];
      const immediate = action[1] ?? false;
      this.#queue.push(msg);
      if (immediate) {
        this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
        this.#tick();
      } else if (!this.#tickScheduled) {
        this.#tickScheduled = window.requestAnimationFrame(() => this.#tick());
      }
    } else if (action instanceof Emit2) {
      const event = action[0];
      const data = action[1];
      this.root.dispatchEvent(
        new CustomEvent(event, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
    } else if (action instanceof Shutdown) {
      this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
      this.#model = null;
      this.#update = null;
      this.#view = null;
      this.#queue = null;
      while (this.root.firstChild) {
        this.root.firstChild.remove();
      }
    }
  }
  /** @type {Model} */
  #model;
  /** @type {(model: Model, msg: Msg) => [Model, Lustre.Effect<Msg>]} */
  #update;
  /** @type {(model: Model) => Lustre.Element<Msg>} */
  #view;
  /** @type {Array<Msg>} */
  #queue = [];
  /** @type {number | undefined} */
  #tickScheduled;
  /**
   * @param {Lustre.Effect<Msg>[]} effects
   */
  #tick(effects = []) {
    this.#tickScheduled = void 0;
    this.#flush(effects);
    const vdom = this.#view(this.#model);
    const dispatch = (handler, immediate = false) => (event) => {
      const result = handler(event);
      if (result instanceof Ok) {
        this.send(new Dispatch(result[0], immediate));
      }
    };
    const prev = this.root.firstChild ?? this.root.appendChild(document.createTextNode(""));
    morph(prev, vdom, dispatch);
  }
  #flush(effects = []) {
    while (this.#queue.length > 0) {
      const msg = this.#queue.shift();
      const [next2, effect] = this.#update(this.#model, msg);
      effects = effects.concat(effect.all.toArray());
      this.#model = next2;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event, data) => this.root.dispatchEvent(
        new CustomEvent(event, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
      const select = () => {
      };
      const root = this.root;
      effect({ dispatch, emit: emit2, select, root });
    }
    if (this.#queue.length > 0) {
      this.#flush(effects);
    }
  }
};
var start = LustreClientApplication.start;
var LustreServerApplication = class _LustreServerApplication {
  static start({ init: init3, update: update2, view: view2, on_attribute_change }, flags) {
    const app = new _LustreServerApplication(
      init3(flags),
      update2,
      view2,
      on_attribute_change
    );
    return new Ok((action) => app.send(action));
  }
  constructor([model, effects], update2, view2, on_attribute_change) {
    this.#model = model;
    this.#update = update2;
    this.#view = view2;
    this.#html = view2(model);
    this.#onAttributeChange = on_attribute_change;
    this.#renderers = /* @__PURE__ */ new Map();
    this.#handlers = handlers(this.#html);
    this.#tick(effects.all.toArray());
  }
  send(action) {
    if (action instanceof Attrs) {
      for (const attr of action[0]) {
        const decoder = this.#onAttributeChange.get(attr[0]);
        if (!decoder)
          continue;
        const msg = decoder(attr[1]);
        if (msg instanceof Error)
          continue;
        this.#queue.push(msg);
      }
      this.#tick();
    } else if (action instanceof Batch) {
      this.#queue = this.#queue.concat(action[0].toArray());
      this.#tick(action[1].all.toArray());
    } else if (action instanceof Debug) {
    } else if (action instanceof Dispatch) {
      this.#queue.push(action[0]);
      this.#tick();
    } else if (action instanceof Emit2) {
      const event = new Emit(action[0], action[1]);
      for (const [_, renderer] of this.#renderers) {
        renderer(event);
      }
    } else if (action instanceof Event2) {
      const handler = this.#handlers.get(action[0]);
      if (!handler)
        return;
      const msg = handler(action[1]);
      if (msg instanceof Error)
        return;
      this.#queue.push(msg[0]);
      this.#tick();
    } else if (action instanceof Subscribe) {
      const attrs = keys(this.#onAttributeChange);
      const patch = new Init(attrs, this.#html);
      this.#renderers = this.#renderers.set(action[0], action[1]);
      action[1](patch);
    } else if (action instanceof Unsubscribe) {
      this.#renderers = this.#renderers.delete(action[0]);
    }
  }
  #model;
  #update;
  #queue;
  #view;
  #html;
  #renderers;
  #handlers;
  #onAttributeChange;
  #tick(effects = []) {
    this.#flush(effects);
    const vdom = this.#view(this.#model);
    const diff2 = elements(this.#html, vdom);
    if (!is_empty_element_diff(diff2)) {
      const patch = new Diff(diff2);
      for (const [_, renderer] of this.#renderers) {
        renderer(patch);
      }
    }
    this.#html = vdom;
    this.#handlers = diff2.handlers;
  }
  #flush(effects = []) {
    while (this.#queue.length > 0) {
      const msg = this.#queue.shift();
      const [next2, effect] = this.#update(this.#model, msg);
      effects = effects.concat(effect.all.toArray());
      this.#model = next2;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event, data) => this.root.dispatchEvent(
        new CustomEvent(event, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
      const select = () => {
      };
      const root = null;
      effect({ dispatch, emit: emit2, select, root });
    }
    if (this.#queue.length > 0) {
      this.#flush(effects);
    }
  }
};
var start_server_application = LustreServerApplication.start;
var is_browser = () => globalThis.window && window.document;

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init3, update2, view2, on_attribute_change) {
    super();
    this.init = init3;
    this.update = update2;
    this.view = view2;
    this.on_attribute_change = on_attribute_change;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init3, update2, view2) {
  return new App(init3, update2, view2, new None());
}
function start2(app, selector, flags) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, flags);
    }
  );
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function div(attrs, children2) {
  return element("div", attrs, children2);
}
function canvas(attrs) {
  return element("canvas", attrs, toList([]));
}

// build/dev/javascript/client/lib/math.mjs
var Double = class extends CustomType {
};
var Triple = class extends CustomType {
};
function scale(from2, amount) {
  let by = (() => {
    if (amount instanceof Double) {
      return 2;
    } else if (amount instanceof Triple) {
      return 3;
    } else {
      return 4;
    }
  })();
  return multiply2(from2, by);
}

// build/dev/javascript/client/lib/camera.mjs
var Camera = class extends CustomType {
  constructor(x3, y3, width3, height3) {
    super();
    this.x = x3;
    this.y = y3;
    this.width = width3;
    this.height = height3;
  }
};
function get_viewport(camera, scale2) {
  return [
    scale(
      (() => {
        let _pipe = camera.width;
        return identity(_pipe);
      })(),
      scale2
    ),
    scale(
      (() => {
        let _pipe = camera.height;
        return identity(_pipe);
      })(),
      scale2
    )
  ];
}
var width2 = 320;
var height2 = 180;
function new$3() {
  return new Camera(divideInt(width2, 2), divideInt(height2, 2), width2, height2);
}

// build/dev/javascript/client/client_lib_canvas_ffi.mjs
function get_canvas_by_id(id2) {
  const canvas2 = document.getElementById(id2);
  if (!canvas2) {
    return new Error(`Canvas with ID ${id2} not found`);
  }
  return new Ok(canvas2);
}
function get_context_2d(canvas2) {
  const context = canvas2.getContext("2d");
  if (!context) {
    return new Error("Failed to get 2D context");
  }
  context.imageSmoothingEnabled = false;
  return new Ok(context);
}
function clear_rect(context, x3, y3, width3, height3) {
  context.clearRect(x3, y3, width3, height3);
  return context;
}
function draw_image_cropped(context, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
  context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  return context;
}

// build/dev/javascript/client/client_lib_asset_ffi.mjs
var __asset_cache = {};
function load_image(src) {
  const cached_image = __asset_cache[src];
  if (cached_image)
    return cached_image;
  const image = new Image();
  image.src = src;
  __asset_cache[src] = image;
  return image;
}

// build/dev/javascript/client/client_lib_engine_ffi.mjs
function request_animation_frame(cb) {
  window.requestAnimationFrame(cb);
}
function with_keyboard_data(cb) {
  return function listener(e) {
    return cb({
      key: e.key,
      alt_key: e.altKey,
      ctrl_key: e.ctrlKey,
      meta_key: e.metaKey,
      repeat: e.repeat,
      shift_key: e.shiftKey
    });
  };
}
function add_keyboard_event_listener(cb) {
  return window.addEventListener("keydown", with_keyboard_data(cb));
}

// build/dev/javascript/client/lib/input.mjs
var UpKey = class extends CustomType {
};
var DownKey = class extends CustomType {
};
var LeftKey = class extends CustomType {
};
var RightKey = class extends CustomType {
};
function decode_game_key(event) {
  let $ = event.key;
  if ($ === "ArrowUp") {
    return new Ok(new UpKey());
  } else if ($ === "w") {
    return new Ok(new UpKey());
  } else if ($ === "ArrowDown") {
    return new Ok(new DownKey());
  } else if ($ === "s") {
    return new Ok(new DownKey());
  } else if ($ === "ArrowLeft") {
    return new Ok(new LeftKey());
  } else if ($ === "a") {
    return new Ok(new LeftKey());
  } else if ($ === "ArrowRight") {
    return new Ok(new RightKey());
  } else if ($ === "d") {
    return new Ok(new RightKey());
  } else {
    return new Error("Unsupported key");
  }
}
function on_keyboard_event(cb) {
  return add_keyboard_event_listener(
    (event) => {
      let $ = decode_game_key(event);
      if ($.isOk()) {
        let game_key = $[0];
        return cb(game_key);
      } else {
        return void 0;
      }
    }
  );
}

// build/dev/javascript/client/lib/direction.mjs
var Up = class extends CustomType {
};
var Down = class extends CustomType {
};
var Right = class extends CustomType {
};
var Left = class extends CustomType {
};
function from_game_key(game_key) {
  if (game_key instanceof UpKey) {
    return new Up();
  } else if (game_key instanceof DownKey) {
    return new Down();
  } else if (game_key instanceof LeftKey) {
    return new Left();
  } else {
    return new Right();
  }
}

// build/dev/javascript/client/lib/vector.mjs
var Vector = class extends CustomType {
  constructor(x3, y3) {
    super();
    this.x = x3;
    this.y = y3;
  }
};
function new$4() {
  return new Vector(0, 0);
}
function at(x3, y3) {
  return new Vector(x3, y3);
}
function x(vec) {
  return vec.x;
}
function y(vec) {
  return vec.y;
}
function move(from2, by) {
  return at(add3(from2.x, by.x), add3(from2.y, by.y));
}
function from_direction(direction) {
  if (direction instanceof Up) {
    return at(0, -1);
  } else if (direction instanceof Down) {
    return at(0, 1);
  } else if (direction instanceof Left) {
    return at(-1, 0);
  } else {
    return at(1, 0);
  }
}

// build/dev/javascript/client/lib/coord.mjs
var Coord = class extends CustomType {
  constructor(x3, y3, z, width3, height3) {
    super();
    this.x = x3;
    this.y = y3;
    this.z = z;
    this.width = width3;
    this.height = height3;
  }
};
function new$5(width3, height3) {
  return new Coord(0, 0, 0, width3, height3);
}
function move2(from2, x3, y3, z) {
  return new Coord(
    clamp(from2.x + x3, 0, from2.width),
    clamp(from2.y + y3, 0, from2.height),
    z,
    from2.width,
    from2.height
  );
}
function elevate(from2, z) {
  return move2(from2, 0, 0, z);
}
function is_bounded_x(coord) {
  return coord.x < coord.width - 1;
}
function is_bounded_y(coord) {
  return coord.y < coord.height - 1;
}
function next(coord) {
  let $ = is_bounded_x(coord);
  let $1 = is_bounded_y(coord);
  if ($) {
    return coord.withFields({ x: coord.x + 1 });
  } else if ($1) {
    return coord.withFields({ x: 0, y: coord.y + 1 });
  } else {
    return coord;
  }
}
var half_width = 16;
var tile_height = 16;
var half_height = 8;
function adjust_by_z(y3, coord) {
  return y3 - multiply(coord.z, half_height);
}
function to_vector(coord) {
  let screen_x = subtract(160, half_width) + subtract(
    coord.x,
    coord.y
  ) * half_width;
  let screen_y = tile_height + add(coord.x, coord.y) * half_height;
  return at(
    (() => {
      let _pipe = screen_x;
      return identity(_pipe);
    })(),
    (() => {
      let _pipe = screen_y;
      let _pipe$1 = adjust_by_z(_pipe, coord);
      return identity(_pipe$1);
    })()
  );
}

// build/dev/javascript/client/lib/cursor.mjs
var CursorIdle = class extends CustomType {
  constructor(elapsed, cycle, amplitude) {
    super();
    this.elapsed = elapsed;
    this.cycle = cycle;
    this.amplitude = amplitude;
  }
};
var CursorMoving = class extends CustomType {
  constructor(start3, target, elapsed, duration) {
    super();
    this.start = start3;
    this.target = target;
    this.elapsed = elapsed;
    this.duration = duration;
  }
};
var cursor_idle_info = /* @__PURE__ */ new CursorIdle(0, 0.75, 1);
function new_idle_cursor() {
  return cursor_idle_info;
}

// build/dev/javascript/client/lib/event.mjs
var MoveCursor = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function new_queue() {
  return toList([]);
}

// build/dev/javascript/client/lib/sprite.mjs
var SpriteRegion = class extends CustomType {
  constructor(x3, y3) {
    super();
    this.x = x3;
    this.y = y3;
  }
};
var SpriteSheet = class extends CustomType {
  constructor(asset, grid, sprites2) {
    super();
    this.asset = asset;
    this.grid = grid;
    this.sprites = sprites2;
  }
};
function x2(sr, grid) {
  return sr.x * grid;
}
function y2(sr, grid) {
  return sr.y * grid;
}
function render(context, sheet, sprite_region, at2, scale2) {
  return draw_image_cropped(
    context,
    sheet.asset,
    (() => {
      let _pipe = x2(sprite_region, sheet.grid);
      return identity(_pipe);
    })(),
    (() => {
      let _pipe = y2(sprite_region, sheet.grid);
      return identity(_pipe);
    })(),
    32,
    32,
    (() => {
      let _pipe = x(at2);
      return scale(_pipe, scale2);
    })(),
    (() => {
      let _pipe = y(at2);
      return scale(_pipe, scale2);
    })(),
    (() => {
      let _pipe = 32;
      return scale(_pipe, scale2);
    })(),
    (() => {
      let _pipe = 32;
      return scale(_pipe, scale2);
    })()
  );
}

// build/dev/javascript/client/lib/asset/demo.mjs
var Base = class extends CustomType {
};
var Variant1 = class extends CustomType {
};
var Variant2 = class extends CustomType {
};
var Variant3 = class extends CustomType {
};
var Variant4 = class extends CustomType {
};
var Variant5 = class extends CustomType {
};
var Variant6 = class extends CustomType {
};
function get_sprite_key(variant) {
  if (variant instanceof Base) {
    return "Base";
  } else if (variant instanceof Variant1) {
    return "Variant1";
  } else if (variant instanceof Variant2) {
    return "Variant2";
  } else if (variant instanceof Variant3) {
    return "Variant3";
  } else if (variant instanceof Variant4) {
    return "Variant4";
  } else if (variant instanceof Variant5) {
    return "Variant5";
  } else {
    return "Variant6";
  }
}
var sprites = /* @__PURE__ */ toList([
  ["Base", /* @__PURE__ */ new SpriteRegion(0, 0)],
  ["Variant1", /* @__PURE__ */ new SpriteRegion(1, 0)],
  ["Variant2", /* @__PURE__ */ new SpriteRegion(2, 0)],
  ["Variant3", /* @__PURE__ */ new SpriteRegion(3, 0)],
  ["Variant4", /* @__PURE__ */ new SpriteRegion(4, 0)],
  ["Variant5", /* @__PURE__ */ new SpriteRegion(5, 0)],
  ["Variant6", /* @__PURE__ */ new SpriteRegion(6, 0)]
]);
function sprite_sheet() {
  return new SpriteSheet(
    load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/test-tiles.png"
    ),
    32,
    from_list(sprites)
  );
}

// build/dev/javascript/client/lib/tile.mjs
var Tile = class extends CustomType {
  constructor(elevation, terrain, passability) {
    super();
    this.elevation = elevation;
    this.terrain = terrain;
    this.passability = passability;
  }
};
var Demo = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Passable = class extends CustomType {
};
function get_sprite(sprite_sheet2, terrain) {
  let sprite_key = (() => {
    if (terrain instanceof Demo) {
      let variant = terrain[0];
      return new Ok(get_sprite_key(variant));
    } else {
      return new Error(void 0);
    }
  })();
  let _pipe = sprite_key;
  return try$(
    _pipe,
    (_capture) => {
      return map_get(sprite_sheet2.sprites, _capture);
    }
  );
}

// build/dev/javascript/client/lib/map.mjs
var Map3 = class extends CustomType {
  constructor(width3, height3, sprite_sheet2, tiles) {
    super();
    this.width = width3;
    this.height = height3;
    this.sprite_sheet = sprite_sheet2;
    this.tiles = tiles;
  }
};
function each_tile_loop(loop$tiles, loop$coords, loop$f) {
  while (true) {
    let tiles = loop$tiles;
    let coords = loop$coords;
    let f = loop$f;
    if (tiles.hasLength(0)) {
      return void 0;
    } else {
      let tile = tiles.head;
      let rest = tiles.tail;
      f(elevate(coords, tile.elevation), tile);
      loop$tiles = rest;
      loop$coords = next(coords);
      loop$f = f;
    }
  }
}
function each_tile(map4, f) {
  return each_tile_loop(map4.tiles, new$5(map4.width, map4.height), f);
}

// build/dev/javascript/client/lib/engine.mjs
var GameState = class extends CustomType {
  constructor(accumulator, camera, cursor, cursor_animation, event_queue, fps, map4, previous_time, scale2) {
    super();
    this.accumulator = accumulator;
    this.camera = camera;
    this.cursor = cursor;
    this.cursor_animation = cursor_animation;
    this.event_queue = event_queue;
    this.fps = fps;
    this.map = map4;
    this.previous_time = previous_time;
    this.scale = scale2;
  }
};
function new$6(init3, map4) {
  return new GameState(
    0,
    new$3(),
    new$4(),
    new_idle_cursor(),
    new_queue(),
    0,
    map4,
    init3,
    new Double()
  );
}

// build/dev/javascript/client/lib/frames.mjs
var dt_s = 0.01667;
function to_duration(count) {
  return multiply2(dt_s, count);
}

// build/dev/javascript/client/lib/map/demo_one.mjs
function new_tile(variant, elevation) {
  return new Tile(
    elevation,
    new Demo(variant),
    new Passable()
  );
}
function new$7() {
  return new Map3(
    8,
    8,
    sprite_sheet(),
    toList([
      new_tile(new Base(), 0),
      new_tile(new Variant1(), 0),
      new_tile(new Variant6(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant4(), 0),
      new_tile(new Variant5(), 0),
      new_tile(new Variant2(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant3(), 0),
      new_tile(new Variant4(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant5(), 0),
      new_tile(new Variant1(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant6(), 0),
      new_tile(new Variant2(), 0),
      new_tile(new Variant2(), 0),
      new_tile(new Base(), 0),
      new_tile(new Base(), 1),
      new_tile(new Variant1(), 1),
      new_tile(new Variant1(), 1),
      new_tile(new Base(), 1),
      new_tile(new Variant3(), 0),
      new_tile(new Base(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant4(), 0),
      new_tile(new Base(), 1),
      new_tile(new Variant1(), 2),
      new_tile(new Variant3(), 2),
      new_tile(new Base(), 1),
      new_tile(new Base(), 0),
      new_tile(new Variant2(), 0),
      new_tile(new Variant3(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant4(), 1),
      new_tile(new Base(), 2),
      new_tile(new Variant5(), 2),
      new_tile(new Base(), 1),
      new_tile(new Base(), 0),
      new_tile(new Variant1(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant1(), 0),
      new_tile(new Base(), 1),
      new_tile(new Variant3(), 1),
      new_tile(new Base(), 1),
      new_tile(new Variant2(), 1),
      new_tile(new Variant5(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant4(), 0),
      new_tile(new Variant2(), 0),
      new_tile(new Base(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant5(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant6(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant6(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant1(), 0),
      new_tile(new Variant4(), 0),
      new_tile(new Base(), 0),
      new_tile(new Base(), 0),
      new_tile(new Base(), 0),
      new_tile(new Variant2(), 0)
    ])
  );
}

// build/dev/javascript/client/lib/render.mjs
var RenderContext = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var render_target_id = "ds_render_target";
function with_context() {
  let canvas_result = get_canvas_by_id(render_target_id);
  let context_result = try$(canvas_result, get_context_2d);
  if (canvas_result.isOk() && context_result.isOk()) {
    let can = canvas_result[0];
    let con = context_result[0];
    return new Ok(new RenderContext(can, con));
  } else {
    return new Error("Failed to find context.");
  }
}

// build/dev/javascript/client/client.mjs
var Idle = class extends CustomType {
};
var NoCanvas = class extends CustomType {
};
var Ready = class extends CustomType {
  constructor(game_state) {
    super();
    this.game_state = game_state;
  }
};
var AppInitEngine = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var AppSetNoCanvas = class extends CustomType {
};
var Tick = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var PlayerQueueEvent = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function setup_listeners() {
  return from(
    (dispatch) => {
      return on_keyboard_event(
        (game_key) => {
          let direction = from_game_key(game_key);
          return dispatch(
            new PlayerQueueEvent(new MoveCursor(direction))
          );
        }
      );
    }
  );
}
function run_logic_update(game_state, dt_seconds) {
  let new_cursor_animation = (() => {
    let $ = game_state.cursor_animation;
    if ($ instanceof CursorIdle) {
      let elapsed = $.elapsed;
      let cycle = $.cycle;
      let amplitude = $.amplitude;
      let looped_elapsed = (() => {
        let _pipe = elapsed;
        let _pipe$1 = add3(_pipe, dt_seconds);
        let _pipe$2 = modulo(_pipe$1, cycle);
        return unwrap(_pipe$2, 0);
      })();
      return new CursorIdle(looped_elapsed, cycle, amplitude);
    } else {
      let start3 = $.start;
      let target = $.target;
      let elapsed = $.elapsed;
      let duration = $.duration;
      let new_elapsed = add3(elapsed, dt_seconds);
      let $1 = compare(new_elapsed, duration);
      if ($1 instanceof Lt) {
        return new CursorMoving(start3, target, new_elapsed, duration);
      } else {
        return new_idle_cursor();
      }
    }
  })();
  return game_state.withFields({ cursor_animation: new_cursor_animation });
}
function reset_events(game_state) {
  return game_state.withFields({ event_queue: toList([]) });
}
function apply_events(game_state, events) {
  let _pipe = fold_right(
    events,
    game_state,
    (acc, event) => {
      {
        let direction = event[0];
        let $ = game_state.cursor_animation;
        if ($ instanceof CursorIdle) {
          let new_cursor = (() => {
            let _pipe2 = direction;
            let _pipe$1 = from_direction(_pipe2);
            return move(_pipe$1, acc.cursor);
          })();
          return game_state.withFields({
            cursor: new_cursor,
            cursor_animation: new CursorMoving(
              game_state.cursor,
              new_cursor,
              0,
              to_duration(6)
            )
          });
        } else {
          return acc;
        }
      }
    }
  );
  return reset_events(_pipe);
}
function is_gt_or_eq(order) {
  if (order instanceof Lt) {
    return false;
  } else {
    return true;
  }
}
function init_canvas() {
  return from(
    (dispatch) => {
      return request_animation_frame(
        (timestamp) => {
          return dispatch(new AppInitEngine(timestamp));
        }
      );
    }
  );
}
function init2(_) {
  return [new Idle(), init_canvas()];
}
function schedule_next_frame() {
  return from(
    (dispatch) => {
      return request_animation_frame(
        (timestamp) => {
          return dispatch(new Tick(timestamp));
        }
      );
    }
  );
}
function render2(game_state) {
  return from(
    (_) => {
      return request_animation_frame(
        (_2) => {
          let $ = with_context();
          if ($.isOk() && $[0] instanceof RenderContext) {
            let context = $[0][1];
            let viewport = get_viewport(
              game_state.camera,
              game_state.scale
            );
            clear_rect(
              context,
              0,
              0,
              first(viewport),
              second(viewport)
            );
            let _pipe = game_state.map;
            return each_tile(
              _pipe,
              (coords, tile) => {
                let sprite_region = (() => {
                  let _pipe$1 = game_state.map.sprite_sheet;
                  return get_sprite(_pipe$1, tile.terrain);
                })();
                if (sprite_region.isOk()) {
                  let region = sprite_region[0];
                  return render(
                    context,
                    game_state.map.sprite_sheet,
                    region,
                    to_vector(coords),
                    game_state.scale
                  );
                } else {
                  return context;
                }
              }
            );
          } else {
            throw makeError(
              "panic",
              "client",
              296,
              "",
              "`panic` expression evaluated.",
              {}
            );
          }
        }
      );
    }
  );
}
function update_and_schedule(game_state) {
  return [
    new Ready(game_state),
    batch(toList([render2(game_state), schedule_next_frame()]))
  ];
}
function view(model) {
  return div(
    toList([]),
    toList([
      canvas(
        toList([
          id(render_target_id),
          width(640),
          height(360),
          style(
            toList([
              ["image-rendering", "pixelated"],
              ["border", "1px solid black"]
            ])
          )
        ])
      )
    ])
  );
}
var fixed_dt = 16.67;
function engine_update_loop(loop$game_state, loop$acc) {
  while (true) {
    let game_state = loop$game_state;
    let acc = loop$acc;
    let $ = (() => {
      let _pipe = compare(acc, fixed_dt);
      return is_gt_or_eq(_pipe);
    })();
    if ($) {
      let dt_seconds = (() => {
        let _pipe2 = divide(fixed_dt, 1e3);
        return unwrap(_pipe2, 0);
      })();
      let _pipe = game_state;
      let _pipe$1 = apply_events(_pipe, game_state.event_queue);
      let _pipe$2 = run_logic_update(_pipe$1, dt_seconds);
      loop$game_state = _pipe$2;
      loop$acc = subtract2(acc, fixed_dt);
    } else {
      return game_state.withFields({ accumulator: 0 });
    }
  }
}
function engine_update(game_state, current_time) {
  let frame_time = subtract2(current_time, game_state.previous_time);
  let accumulator = add3(game_state.accumulator, frame_time);
  let fps = (() => {
    let $ = divide(1e3, frame_time);
    if ($.isOk()) {
      let fps2 = $[0];
      return fps2;
    } else {
      return 0;
    }
  })();
  let updated_state = game_state.withFields({
    previous_time: current_time,
    accumulator,
    fps
  });
  return engine_update_loop(updated_state, accumulator);
}
function update(model, msg) {
  if (msg instanceof AppInitEngine) {
    let previous_time = msg[0];
    return [
      new Ready(new$6(previous_time, new$7())),
      batch(toList([setup_listeners(), schedule_next_frame()]))
    ];
  } else if (msg instanceof AppSetNoCanvas) {
    return [new NoCanvas(), none()];
  } else if (msg instanceof Tick) {
    let current_time = msg[0];
    if (model instanceof Ready) {
      let game_state = model.game_state;
      let _pipe = engine_update(game_state, current_time);
      return update_and_schedule(_pipe);
    } else {
      throw makeError(
        "panic",
        "client",
        75,
        "update",
        "`panic` expression evaluated.",
        {}
      );
    }
  } else {
    let event = msg[0];
    if (model instanceof Ready) {
      let game_state = model.game_state;
      return [
        new Ready(
          game_state.withFields({
            event_queue: prepend(event, game_state.event_queue)
          })
        ),
        none()
      ];
    } else {
      throw makeError(
        "panic",
        "client",
        89,
        "update",
        "`panic` expression evaluated.",
        {}
      );
    }
  }
}
function main() {
  let app = application(init2, update, view);
  let $ = start2(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "let_assert",
      "client",
      33,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
