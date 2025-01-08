// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label2) => label2 in fields ? fields[label2] : this[label2]
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
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index2) {
    return this.buffer[index2];
  }
  // @internal
  floatFromSlice(start3, end, isBigEndian) {
    return byteArrayToFloat(this.buffer, start3, end, isBigEndian);
  }
  // @internal
  intFromSlice(start3, end, isBigEndian, isSigned) {
    return byteArrayToInt(this.buffer, start3, end, isBigEndian, isSigned);
  }
  // @internal
  binaryFromSlice(start3, end) {
    return new _BitArray(this.buffer.slice(start3, end));
  }
  // @internal
  sliceAfter(index2) {
    return new _BitArray(this.buffer.slice(index2));
  }
};
var UtfCodepoint = class {
  constructor(value) {
    this.value = value;
  }
};
function byteArrayToInt(byteArray, start3, end, isBigEndian, isSigned) {
  const byteSize = end - start3;
  if (byteSize <= 6) {
    let value = 0;
    if (isBigEndian) {
      for (let i = start3; i < end; i++) {
        value = value * 256 + byteArray[i];
      }
    } else {
      for (let i = end - 1; i >= start3; i--) {
        value = value * 256 + byteArray[i];
      }
    }
    if (isSigned) {
      const highBit = 2 ** (byteSize * 8 - 1);
      if (value >= highBit) {
        value -= highBit * 2;
      }
    }
    return value;
  } else {
    let value = 0n;
    if (isBigEndian) {
      for (let i = start3; i < end; i++) {
        value = (value << 8n) + BigInt(byteArray[i]);
      }
    } else {
      for (let i = end - 1; i >= start3; i--) {
        value = (value << 8n) + BigInt(byteArray[i]);
      }
    }
    if (isSigned) {
      const highBit = 1n << BigInt(byteSize * 8 - 1);
      if (value >= highBit) {
        value -= highBit * 2n;
      }
    }
    return Number(value);
  }
}
function byteArrayToFloat(byteArray, start3, end, isBigEndian) {
  const view2 = new DataView(byteArray.buffer);
  const byteSize = end - start3;
  if (byteSize === 8) {
    return view2.getFloat64(start3, !isBigEndian);
  } else if (byteSize === 4) {
    return view2.getFloat32(start3, !isBigEndian);
  } else {
    const msg = `Sized floats must be 32-bit or 64-bit on JavaScript, got size of ${byteSize * 8} bits`;
    throw new globalThis.Error(msg);
  }
}
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
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error(e);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
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
function max(a, b) {
  let $ = a > b;
  if ($) {
    return a;
  } else {
    return b;
  }
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
var Ascending = class extends CustomType {
};
var Descending = class extends CustomType {
};
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
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map(list, fun) {
  return map_loop(list, fun, toList([]));
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
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list = loop$list;
    let compare4 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list.hasLength(0)) {
      if (direction instanceof Ascending) {
        return prepend(reverse_loop(growing$1, toList([])), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list.head;
      let rest$1 = list.tail;
      let $ = compare4(prev, new$1);
      if ($ instanceof Gt && direction instanceof Descending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Lt && direction instanceof Ascending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Eq && direction instanceof Ascending) {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      } else if ($ instanceof Gt && direction instanceof Ascending) {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(reverse_loop(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Lt && direction instanceof Descending) {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(reverse_loop(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else {
        let acc$1 = (() => {
          if (direction instanceof Ascending) {
            return prepend(reverse_loop(growing$1, toList([])), acc);
          } else {
            return prepend(growing$1, acc);
          }
        })();
        if (rest$1.hasLength(0)) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let direction$1 = (() => {
            let $1 = compare4(new$1, next);
            if ($1 instanceof Lt) {
              return new Ascending();
            } else if ($1 instanceof Eq) {
              return new Ascending();
            } else {
              return new Descending();
            }
          })();
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1.hasLength(0)) {
      let list = list2;
      return reverse_loop(list, acc);
    } else if (list2.hasLength(0)) {
      let list = list1;
      return reverse_loop(list, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first22 = list2.head;
      let rest2 = list2.tail;
      let $ = compare4(first1, first22);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Gt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2.hasLength(0)) {
      return reverse_loop(acc, toList([]));
    } else if (sequences2.hasLength(1)) {
      let sequence = sequences2.head;
      return reverse_loop(
        prepend(reverse_loop(sequence, toList([])), acc),
        toList([])
      );
    } else {
      let ascending1 = sequences2.head;
      let ascending2 = sequences2.tail.head;
      let rest$1 = sequences2.tail.tail;
      let descending = merge_ascendings(
        ascending1,
        ascending2,
        compare4,
        toList([])
      );
      loop$sequences = rest$1;
      loop$compare = compare4;
      loop$acc = prepend(descending, acc);
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1.hasLength(0)) {
      let list = list2;
      return reverse_loop(list, acc);
    } else if (list2.hasLength(0)) {
      let list = list1;
      return reverse_loop(list, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first22 = list2.head;
      let rest2 = list2.tail;
      let $ = compare4(first1, first22);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first22, acc);
      } else if ($ instanceof Gt) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2.hasLength(0)) {
      return reverse_loop(acc, toList([]));
    } else if (sequences2.hasLength(1)) {
      let sequence = sequences2.head;
      return reverse_loop(
        prepend(reverse_loop(sequence, toList([])), acc),
        toList([])
      );
    } else {
      let descending1 = sequences2.head;
      let descending2 = sequences2.tail.head;
      let rest$1 = sequences2.tail.tail;
      let ascending = merge_descendings(
        descending1,
        descending2,
        compare4,
        toList([])
      );
      loop$sequences = rest$1;
      loop$compare = compare4;
      loop$acc = prepend(ascending, acc);
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences2 = loop$sequences;
    let direction = loop$direction;
    let compare4 = loop$compare;
    if (sequences2.hasLength(0)) {
      return toList([]);
    } else if (sequences2.hasLength(1) && direction instanceof Ascending) {
      let sequence = sequences2.head;
      return sequence;
    } else if (sequences2.hasLength(1) && direction instanceof Descending) {
      let sequence = sequences2.head;
      return reverse_loop(sequence, toList([]));
    } else if (direction instanceof Ascending) {
      let sequences$1 = merge_ascending_pairs(sequences2, compare4, toList([]));
      loop$sequences = sequences$1;
      loop$direction = new Descending();
      loop$compare = compare4;
    } else {
      let sequences$1 = merge_descending_pairs(sequences2, compare4, toList([]));
      loop$sequences = sequences$1;
      loop$direction = new Ascending();
      loop$compare = compare4;
    }
  }
}
function sort(list, compare4) {
  if (list.hasLength(0)) {
    return toList([]);
  } else if (list.hasLength(1)) {
    let x3 = list.head;
    return toList([x3]);
  } else {
    let x3 = list.head;
    let y3 = list.tail.head;
    let rest$1 = list.tail.tail;
    let direction = (() => {
      let $ = compare4(x3, y3);
      if ($ instanceof Lt) {
        return new Ascending();
      } else if ($ instanceof Eq) {
        return new Ascending();
      } else {
        return new Descending();
      }
    })();
    let sequences$1 = sequences(
      rest$1,
      compare4,
      toList([x3]),
      direction,
      y3,
      toList([])
    );
    return merge_all(sequences$1, new Ascending(), compare4);
  }
}
function each(loop$list, loop$f) {
  while (true) {
    let list = loop$list;
    let f = loop$f;
    if (list.hasLength(0)) {
      return void 0;
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      f(first$1);
      loop$list = rest$1;
      loop$f = f;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function drop_start(loop$string, loop$num_graphemes) {
  while (true) {
    let string3 = loop$string;
    let num_graphemes = loop$num_graphemes;
    let $ = num_graphemes > 0;
    if (!$) {
      return string3;
    } else {
      let $1 = pop_grapheme(string3);
      if ($1.isOk()) {
        let string$1 = $1[0][1];
        loop$string = string$1;
        loop$num_graphemes = num_graphemes - 1;
      } else {
        return string3;
      }
    }
  }
}
function inspect2(term) {
  let _pipe = inspect(term);
  return identity(_pipe);
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map2(result, fun) {
  if (result.isOk()) {
    let x3 = result[0];
    return new Ok(fun(x3));
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x3 = result[0];
    return new Ok(x3);
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
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

// build/dev/javascript/gleam_stdlib/gleam/dynamic.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
};
function int(data) {
  return decode_int(data);
}
function bool(data) {
  return decode_bool(data);
}
function any(decoders) {
  return (data) => {
    if (decoders.hasLength(0)) {
      return new Error(
        toList([new DecodeError("another type", classify_dynamic(data), toList([]))])
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($.isOk()) {
        let decoded = $[0];
        return new Ok(decoded);
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}
function push_path(error, name) {
  let name$1 = identity(name);
  let decoder = any(
    toList([string, (x3) => {
      return map2(int(x3), to_string);
    }])
  );
  let name$2 = (() => {
    let $ = decoder(name$1);
    if ($.isOk()) {
      let name$22 = $[0];
      return name$22;
    } else {
      let _pipe = toList(["<", classify_dynamic(name$1), ">"]);
      let _pipe$1 = concat(_pipe);
      return identity(_pipe$1);
    }
  })();
  return error.withFields({ path: prepend(name$2, error.path) });
}
function map_errors(result, f) {
  return map_error(
    result,
    (_capture) => {
      return map(_capture, f);
    }
  );
}
function string(data) {
  return decode_string(data);
}
function field(name, inner_type) {
  return (value) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return try$(
      decode_field(value, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => {
            return push_path(_capture, name);
          }
        );
      }
    );
  };
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
function cloneAndSet(arr, at3, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at3] = val;
  return out;
}
function spliceIn(arr, at3, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at3) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at3) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at3) {
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
function float_to_string(float3) {
  const string3 = float3.toString().replace("+", "");
  if (string3.indexOf(".") >= 0) {
    return string3;
  } else {
    const index2 = string3.indexOf("e");
    if (index2 >= 0) {
      return string3.slice(0, index2) + ".0" + string3.slice(index2);
    } else {
      return string3 + ".0";
    }
  }
}
var segmenter = void 0;
function graphemes_iterator(string3) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter();
    return segmenter.segment(string3)[Symbol.iterator]();
  }
}
function pop_grapheme(string3) {
  let first3;
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    first3 = iterator.next().value?.segment;
  } else {
    first3 = string3.match(/./su)?.[0];
  }
  if (first3) {
    return new Ok([first3, string3.slice(first3.length)]);
  } else {
    return new Error(Nil);
  }
}
function concat(xs) {
  let result = "";
  for (const x3 of xs) {
    result = result + x3;
  }
  return result;
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
function print_debug(string3) {
  if (typeof process === "object" && process.stderr?.write) {
    process.stderr.write(string3 + "\n");
  } else if (typeof Deno === "object") {
    Deno.stderr.writeSync(new TextEncoder().encode(string3 + "\n"));
  } else {
    console.log(string3);
  }
}
function floor(float3) {
  return Math.floor(float3);
}
function round2(float3) {
  return Math.round(float3);
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
function classify_dynamic(data) {
  if (typeof data === "string") {
    return "String";
  } else if (typeof data === "boolean") {
    return "Bool";
  } else if (data instanceof Result) {
    return "Result";
  } else if (data instanceof List) {
    return "List";
  } else if (data instanceof BitArray) {
    return "BitArray";
  } else if (data instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data)) {
    return "Int";
  } else if (Array.isArray(data)) {
    return `Tuple of ${data.length} elements`;
  } else if (typeof data === "number") {
    return "Float";
  } else if (data === null) {
    return "Null";
  } else if (data === void 0) {
    return "Nil";
  } else {
    const type = typeof data;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function decoder_error(expected, got) {
  return decoder_error_no_classify(expected, classify_dynamic(got));
}
function decoder_error_no_classify(expected, got) {
  return new Error(
    List.fromArray([new DecodeError(expected, got, List.fromArray([]))])
  );
}
function decode_string(data) {
  return typeof data === "string" ? new Ok(data) : decoder_error("String", data);
}
function decode_int(data) {
  return Number.isInteger(data) ? new Ok(data) : decoder_error("Int", data);
}
function decode_bool(data) {
  return typeof data === "boolean" ? new Ok(data) : decoder_error("Bool", data);
}
function decode_field(value, name) {
  const not_a_map_error = () => decoder_error("Dict", value);
  if (value instanceof Dict || value instanceof WeakMap || value instanceof Map) {
    const entry = map_get(value, name);
    return new Ok(entry.isOk() ? new Some(entry[0]) : new None());
  } else if (value === null) {
    return not_a_map_error();
  } else if (Object.getPrototypeOf(value) == Object.prototype) {
    return try_get_field(value, name, () => new Ok(new None()));
  } else {
    return try_get_field(value, name, not_a_map_error);
  }
}
function try_get_field(value, field2, or_else) {
  try {
    return field2 in value ? new Ok(new Some(value[field2])) : or_else();
  } catch {
    return or_else();
  }
}
function inspect(v) {
  const t = typeof v;
  if (v === true)
    return "True";
  if (v === false)
    return "False";
  if (v === null)
    return "//js(null)";
  if (v === void 0)
    return "Nil";
  if (t === "string")
    return inspectString(v);
  if (t === "bigint" || Number.isInteger(v))
    return v.toString();
  if (t === "number")
    return float_to_string(v);
  if (Array.isArray(v))
    return `#(${v.map(inspect).join(", ")})`;
  if (v instanceof List)
    return inspectList(v);
  if (v instanceof UtfCodepoint)
    return inspectUtfCodepoint(v);
  if (v instanceof BitArray)
    return inspectBitArray(v);
  if (v instanceof CustomType)
    return inspectCustomType(v);
  if (v instanceof Dict)
    return inspectDict(v);
  if (v instanceof Set)
    return `//js(Set(${[...v].map(inspect).join(", ")}))`;
  if (v instanceof RegExp)
    return `//js(${v})`;
  if (v instanceof Date)
    return `//js(Date("${v.toISOString()}"))`;
  if (v instanceof Function) {
    const args = [];
    for (const i of Array(v.length).keys())
      args.push(String.fromCharCode(i + 97));
    return `//fn(${args.join(", ")}) { ... }`;
  }
  return inspectObject(v);
}
function inspectString(str) {
  let new_str = '"';
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    switch (char) {
      case "\n":
        new_str += "\\n";
        break;
      case "\r":
        new_str += "\\r";
        break;
      case "	":
        new_str += "\\t";
        break;
      case "\f":
        new_str += "\\f";
        break;
      case "\\":
        new_str += "\\\\";
        break;
      case '"':
        new_str += '\\"';
        break;
      default:
        if (char < " " || char > "~" && char < "\xA0") {
          new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
        } else {
          new_str += char;
        }
    }
  }
  new_str += '"';
  return new_str;
}
function inspectDict(map4) {
  let body = "dict.from_list([";
  let first3 = true;
  map4.forEach((value, key) => {
    if (!first3)
      body = body + ", ";
    body = body + "#(" + inspect(key) + ", " + inspect(value) + ")";
    first3 = false;
  });
  return body + "])";
}
function inspectObject(v) {
  const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
  const props = [];
  for (const k of Object.keys(v)) {
    props.push(`${inspect(k)}: ${inspect(v[k])}`);
  }
  const body = props.length ? " " + props.join(", ") + " " : "";
  const head = name === "Object" ? "" : name + " ";
  return `//js(${head}{${body}})`;
}
function inspectCustomType(record) {
  const props = Object.keys(record).map((label2) => {
    const value = inspect(record[label2]);
    return isNaN(parseInt(label2)) ? `${label2}: ${value}` : value;
  }).join(", ");
  return props ? `${record.constructor.name}(${props})` : record.constructor.name;
}
function inspectList(list) {
  return `[${list.toArray().map(inspect).join(", ")}]`;
}
function inspectBitArray(bits) {
  return `<<${Array.from(bits.buffer).join(", ")}>>`;
}
function inspectUtfCodepoint(codepoint2) {
  return `//utfcodepoint(${String.fromCodePoint(codepoint2.value)})`;
}

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function compare2(a, b) {
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
function negate(x3) {
  return -1 * x3;
}
function round(x3) {
  let $ = x3 >= 0;
  if ($) {
    return round2(x3);
  } else {
    return 0 - round2(negate(x3));
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
function add2(a, b) {
  return a + b;
}
function multiply(a, b) {
  return a * b;
}
function subtract(a, b) {
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
var Event = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
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
function on(name, handler) {
  return new Event("on" + name, handler);
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
function class$(name) {
  return attribute("class", name);
}
function id(name) {
  return attribute("id", name);
}
function type_(name) {
  return attribute("type", name);
}
function checked(is_checked) {
  return property("checked", is_checked);
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
function text(content) {
  return new Text(content);
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
function morph(prev, next, dispatch) {
  let out;
  let stack = [{ prev, next, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next2, parent } = stack.pop();
    while (next2.subtree !== void 0)
      next2 = next2.subtree();
    if (next2.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next2.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next2.content)
          prev2.textContent = next2.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next2.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next2.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next2,
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
function createElementNode({ prev, next, dispatch, stack }) {
  const namespace = next.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next.tag && prev.namespaceURI === (next.namespace || "http://www.w3.org/1999/xhtml");
  const el = canMorph ? prev : namespace ? document.createElementNS(namespace, next.tag) : document.createElement(next.tag);
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
  if (canMorph && next.tag === "textarea") {
    const innertText = next.children[Symbol.iterator]().next().value?.content;
    if (innertText !== void 0)
      el.value = innertText;
  }
  const delegated = [];
  for (const attr of next.attrs) {
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
  if (next.tag === "slot") {
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
  if (next.key !== void 0 && next.key !== "") {
    el.setAttribute("data-lustre-key", next.key);
  } else if (innerHTML !== null) {
    el.innerHTML = innerHTML;
    return el;
  }
  let prevChild = el.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = children(next).next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next);
    for (const child of children(next)) {
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
    for (const child of children(next)) {
      stack.unshift({ prev: prevChild, next: child, parent: el });
      prevChild = prevChild?.nextSibling;
    }
  }
  while (prevChild) {
    const next2 = prevChild.nextSibling;
    el.removeChild(prevChild);
    prevChild = next2;
  }
  return el;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event2) {
  const target = event2.currentTarget;
  if (!registeredHandlers.has(target)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target);
  if (!handlersForEventTarget.has(event2.type)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event2.type)(event2);
}
function lustreServerEventHandler(event2) {
  const el = event2.currentTarget;
  const tag = el.getAttribute(`data-lustre-on-${event2.type}`);
  const data = JSON.parse(el.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el.getAttribute("data-lustre-include") || "[]");
  switch (event2.type) {
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
        for (let i = 0, o = data2, e = event2; i < path.length; i++) {
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
  static start({ init: init3, update: update4, view: view2 }, selector, flags) {
    if (!is_browser())
      return new Error(new NotABrowser());
    const root = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root)
      return new Error(new ElementNotFound(selector));
    const app = new _LustreClientApplication(root, init3(flags), update4, view2);
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
  constructor(root, [init3, effects], update4, view2) {
    this.root = root;
    this.#model = init3;
    this.#update = update4;
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
        const dispatch = (handler, immediate = false) => (event2) => {
          const result = handler(event2);
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
      const event2 = action[0];
      const data = action[1];
      this.root.dispatchEvent(
        new CustomEvent(event2, {
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
    const dispatch = (handler, immediate = false) => (event2) => {
      const result = handler(event2);
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
      const [next, effect] = this.#update(this.#model, msg);
      effects = effects.concat(effect.all.toArray());
      this.#model = next;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event2, data) => this.root.dispatchEvent(
        new CustomEvent(event2, {
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
  static start({ init: init3, update: update4, view: view2, on_attribute_change }, flags) {
    const app = new _LustreServerApplication(
      init3(flags),
      update4,
      view2,
      on_attribute_change
    );
    return new Ok((action) => app.send(action));
  }
  constructor([model, effects], update4, view2, on_attribute_change) {
    this.#model = model;
    this.#update = update4;
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
      const event2 = new Emit(action[0], action[1]);
      for (const [_, renderer] of this.#renderers) {
        renderer(event2);
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
      const [next, effect] = this.#update(this.#model, msg);
      effects = effects.concat(effect.all.toArray());
      this.#model = next;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event2, data) => this.root.dispatchEvent(
        new CustomEvent(event2, {
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
  constructor(init3, update4, view2, on_attribute_change) {
    super();
    this.init = init3;
    this.update = update4;
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
function application(init3, update4, view2) {
  return new App(init3, update4, view2, new None());
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
function text2(content) {
  return text(content);
}
function div(attrs, children2) {
  return element("div", attrs, children2);
}
function canvas(attrs) {
  return element("canvas", attrs, toList([]));
}
function input(attrs) {
  return element("input", attrs, toList([]));
}
function label(attrs, children2) {
  return element("label", attrs, children2);
}

// build/dev/javascript/lustre/lustre/event.mjs
function on2(name, handler) {
  return on(name, handler);
}
function checked2(event2) {
  let _pipe = event2;
  return field("target", field("checked", bool))(
    _pipe
  );
}
function on_check(msg) {
  return on2(
    "change",
    (event2) => {
      let _pipe = checked2(event2);
      return map2(_pipe, msg);
    }
  );
}

// build/dev/javascript/gleam_stdlib/gleam/io.mjs
function debug(term) {
  let _pipe = term;
  let _pipe$1 = inspect2(_pipe);
  print_debug(_pipe$1);
  return term;
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
function decode_game_key(event2) {
  let key = (() => {
    let $ = event2.key;
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
  })();
  return debug(key);
}
function on_keyboard_event(cb) {
  return add_keyboard_event_listener(
    (event2) => {
      let $ = decode_game_key(event2);
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

// build/dev/javascript/client/lib/coord.mjs
var Coord = class extends CustomType {
  constructor(x3, y3, z) {
    super();
    this.x = x3;
    this.y = y3;
    this.z = z;
  }
};
function at(x3, y3, z) {
  return new Coord(x3, y3, z);
}
function move(from2, by) {
  return new Coord(max(from2.x + by.x, 0), max(from2.y + by.y, 0), by.z);
}
function add_elevation(from2, z) {
  return move(from2, new Coord(0, 0, from2.z + z));
}
function set_elevation(from2, z) {
  return move(from2, new Coord(0, 0, max(z, 0)));
}
function sum(coord) {
  return coord.x + coord.y * 10;
}
function compare3(a, b) {
  return compare(sum(a), sum(b));
}
function equal(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
function from_direction(direction) {
  if (direction instanceof Up) {
    return at(0, -1, 0);
  } else if (direction instanceof Down) {
    return at(0, 1, 0);
  } else if (direction instanceof Left) {
    return at(-1, 0, 0);
  } else {
    return at(1, 0, 0);
  }
}

// build/dev/javascript/client/lib/math.mjs
var Single = class extends CustomType {
};
var Double = class extends CustomType {
};
var Triple = class extends CustomType {
};
function scale(from2, amount) {
  let by = (() => {
    if (amount instanceof Single) {
      return 1;
    } else if (amount instanceof Double) {
      return 2;
    } else if (amount instanceof Triple) {
      return 3;
    } else {
      return 4;
    }
  })();
  return multiply(from2, by);
}

// build/dev/javascript/client/lib/camera.mjs
var Camera = class extends CustomType {
  constructor(focus, width3, height3) {
    super();
    this.focus = focus;
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
function new$3(focus) {
  return new Camera(focus, width2, height2);
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

// build/dev/javascript/gleam_community_maths/maths.mjs
function sin(float3) {
  return Math.sin(float3);
}
function pi() {
  return Math.PI;
}

// build/dev/javascript/gleam_community_maths/gleam_community/maths/elementary.mjs
function sin2(x3) {
  return sin(x3);
}
function pi2() {
  return pi();
}

// build/dev/javascript/client/lib/vector.mjs
var Vector = class extends CustomType {
  constructor(x3, y3) {
    super();
    this.x = x3;
    this.y = y3;
  }
};
function at2(x3, y3) {
  return new Vector(x3, y3);
}
function x(vec) {
  return vec.x;
}
function y(vec) {
  return vec.y;
}
function move2(from2, by) {
  return at2(add2(from2.x, by.x), add2(from2.y, by.y));
}
var half_width = 16;
var half_height = 8;
function from_coord(coords, camera) {
  let dx = coords.x - camera.focus.x;
  let dy = coords.y - camera.focus.y;
  let center_x = divideInt(camera.width, 2);
  let center_y = divideInt(camera.height, 2) - half_height;
  let screen_x = center_x + (dx - dy) * half_width;
  let screen_y = center_y + (dx + dy) * half_height;
  return at2(
    (() => {
      let _pipe = screen_x;
      return identity(_pipe);
    })(),
    (() => {
      let _pipe = screen_y - coords.z * half_height;
      return identity(_pipe);
    })()
  );
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
  constructor(asset, grid, sprites3) {
    super();
    this.asset = asset;
    this.grid = grid;
    this.sprites = sprites3;
  }
};
function x2(sr, grid) {
  return sr.x * grid;
}
function y2(sr, grid) {
  return sr.y * grid;
}
function render(context, sheet, sprite_region, at3, scale2) {
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
    (() => {
      let _pipe = sheet.grid;
      return identity(_pipe);
    })(),
    (() => {
      let _pipe = sheet.grid;
      return identity(_pipe);
    })(),
    (() => {
      let _pipe = x(at3);
      return scale(_pipe, scale2);
    })(),
    (() => {
      let _pipe = y(at3);
      return scale(_pipe, scale2);
    })(),
    (() => {
      let _pipe = sheet.grid;
      let _pipe$1 = identity(_pipe);
      return scale(_pipe$1, scale2);
    })(),
    (() => {
      let _pipe = sheet.grid;
      let _pipe$1 = identity(_pipe);
      return scale(_pipe$1, scale2);
    })()
  );
}

// build/dev/javascript/client/lib/asset/cursor.mjs
var Base = class extends CustomType {
};
var Pointer = class extends CustomType {
};
function get_sprite_key(variant) {
  if (variant instanceof Base) {
    return "Base";
  } else {
    return "Pointer";
  }
}
var sprites = /* @__PURE__ */ toList([
  ["Base", /* @__PURE__ */ new SpriteRegion(0, 0)],
  ["Pointer", /* @__PURE__ */ new SpriteRegion(1, 0)]
]);
function sprite_sheet() {
  return new SpriteSheet(
    load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/cursor.png"
    ),
    32,
    from_list(sprites)
  );
}

// build/dev/javascript/client/lib/constants.mjs
function fixed_dt() {
  return 16.67;
}
function max_update_frames() {
  return 6;
}

// build/dev/javascript/client/lib/cursor.mjs
var Cursor = class extends CustomType {
  constructor(position, sprite_sheet3, animation) {
    super();
    this.position = position;
    this.sprite_sheet = sprite_sheet3;
    this.animation = animation;
  }
};
var CursorAnimation = class extends CustomType {
  constructor(elapsed, cycle, amplitude) {
    super();
    this.elapsed = elapsed;
    this.cycle = cycle;
    this.amplitude = amplitude;
  }
};
function update(cursor) {
  let updated_elapsed = (() => {
    let _pipe = cursor.animation.elapsed;
    let _pipe$1 = add2(_pipe, fixed_dt());
    let _pipe$2 = modulo(_pipe$1, cursor.animation.cycle);
    return unwrap(_pipe$2, 0);
  })();
  return cursor.withFields({
    animation: cursor.animation.withFields({ elapsed: updated_elapsed })
  });
}
function render_base(context, cursor, coords, camera, scale2) {
  let $ = equal(cursor.position, coords);
  if (!$) {
    return void 0;
  } else {
    let region = (() => {
      let _pipe = get_sprite_key(new Base());
      return ((_capture) => {
        return map_get(cursor.sprite_sheet.sprites, _capture);
      })(_pipe);
    })();
    if (region.isOk()) {
      let region$1 = region[0];
      let vector = from_coord(coords, camera);
      render(context, cursor.sprite_sheet, region$1, vector, scale2);
      return void 0;
    } else {
      return void 0;
    }
  }
}
function render_pointer(context, cursor, coords, camera, scale2) {
  let $ = equal(cursor.position, coords);
  if (!$) {
    return void 0;
  } else {
    let region = (() => {
      let _pipe = get_sprite_key(new Pointer());
      return ((_capture) => {
        return map_get(cursor.sprite_sheet.sprites, _capture);
      })(_pipe);
    })();
    if (region.isOk()) {
      let region$1 = region[0];
      let vec = (() => {
        let _pipe = coords;
        let _pipe$1 = add_elevation(_pipe, 3);
        return from_coord(_pipe$1, camera);
      })();
      let y_offset = (() => {
        let _pipe = divide(
          cursor.animation.elapsed,
          cursor.animation.cycle
        );
        let _pipe$1 = unwrap(_pipe, 0);
        let _pipe$2 = multiply(_pipe$1, 2);
        let _pipe$3 = multiply(_pipe$2, pi2());
        let _pipe$4 = sin2(_pipe$3);
        return multiply(_pipe$4, cursor.animation.amplitude);
      })();
      render(
        context,
        cursor.sprite_sheet,
        region$1,
        move2(vec, at2(0, y_offset)),
        scale2
      );
      return void 0;
    } else {
      return void 0;
    }
  }
}
var cursor_animation = /* @__PURE__ */ new CursorAnimation(0, 0.9, 1);
function new$4(position) {
  return new Cursor(position, sprite_sheet(), cursor_animation);
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

// build/dev/javascript/client/lib/asset/demo.mjs
var Base2 = class extends CustomType {
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
function get_sprite_key2(variant) {
  if (variant instanceof Base2) {
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
var sprites2 = /* @__PURE__ */ toList([
  ["Base", /* @__PURE__ */ new SpriteRegion(0, 0)],
  ["Variant1", /* @__PURE__ */ new SpriteRegion(1, 0)],
  ["Variant2", /* @__PURE__ */ new SpriteRegion(2, 0)],
  ["Variant3", /* @__PURE__ */ new SpriteRegion(3, 0)],
  ["Variant4", /* @__PURE__ */ new SpriteRegion(4, 0)],
  ["Variant5", /* @__PURE__ */ new SpriteRegion(5, 0)],
  ["Variant6", /* @__PURE__ */ new SpriteRegion(6, 0)]
]);
function sprite_sheet2() {
  return new SpriteSheet(
    load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/color-test-tiles.png"
    ),
    32,
    from_list(sprites2)
  );
}

// build/dev/javascript/client/lib/tile.mjs
var Tile = class extends CustomType {
  constructor(tileset, passability, elevation) {
    super();
    this.tileset = tileset;
    this.passability = passability;
    this.elevation = elevation;
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
function get_sprite(sprite_sheet3, tileset) {
  let sprite_key = (() => {
    if (tileset instanceof Demo) {
      let variant = tileset[0];
      return new Ok(get_sprite_key2(variant));
    } else {
      return new Error(void 0);
    }
  })();
  let _pipe = sprite_key;
  return try$(
    _pipe,
    (_capture) => {
      return map_get(sprite_sheet3.sprites, _capture);
    }
  );
}
function render2(context, tile, coords, sprite_sheet3, camera, scale2) {
  let sprite_region = get_sprite(sprite_sheet3, tile.tileset);
  if (sprite_region.isOk()) {
    let region = sprite_region[0];
    let vector = from_coord(coords, camera);
    render(context, sprite_sheet3, region, vector, scale2);
    return void 0;
  } else {
    return void 0;
  }
}

// build/dev/javascript/client/lib/map.mjs
var Map3 = class extends CustomType {
  constructor(sprite_sheet3, tiles) {
    super();
    this.sprite_sheet = sprite_sheet3;
    this.tiles = tiles;
  }
};
function each_tile(map4, f) {
  let _pipe = map4.tiles;
  let _pipe$1 = map_to_list(_pipe);
  let _pipe$2 = sort(
    _pipe$1,
    (a, b) => {
      return compare3(first(a), first(b));
    }
  );
  return each(
    _pipe$2,
    (tile_pair) => {
      let coords = first(tile_pair);
      let t = second(tile_pair);
      return f(set_elevation(coords, t.elevation), t);
    }
  );
}

// build/dev/javascript/client/lib/engine.mjs
var GameState = class extends CustomType {
  constructor(accumulator, camera, cursor, event_queue, fps, map4, previous_time, scale2, debug2) {
    super();
    this.accumulator = accumulator;
    this.camera = camera;
    this.cursor = cursor;
    this.event_queue = event_queue;
    this.fps = fps;
    this.map = map4;
    this.previous_time = previous_time;
    this.scale = scale2;
    this.debug = debug2;
  }
};
function new$5(init3, map4) {
  return new GameState(
    0,
    new$3(at(3, 2, 3)),
    new$4(at(3, 2, 3)),
    new_queue(),
    0,
    map4,
    init3,
    new Double(),
    false
  );
}
function calc_frame_time(game_state, current_time) {
  return subtract(current_time, game_state.previous_time);
}
function update_time(game_state, current_time) {
  let time_since_last_frame = calc_frame_time(game_state, current_time);
  let accumulator = add2(game_state.accumulator, time_since_last_frame);
  let fps = (() => {
    let $ = divide(1e3, time_since_last_frame);
    if ($.isOk()) {
      let fps2 = $[0];
      return fps2;
    } else {
      return 60;
    }
  })();
  return game_state.withFields({
    accumulator,
    fps,
    previous_time: current_time
  });
}
function reset_events(game_state) {
  return game_state.withFields({ event_queue: toList([]) });
}
function apply_events(game_state) {
  let _pipe = fold_right(
    game_state.event_queue,
    game_state,
    (acc, event2) => {
      {
        let direction = event2[0];
        let position = (() => {
          let _pipe2 = direction;
          let _pipe$1 = from_direction(_pipe2);
          let _pipe$2 = move(_pipe$1, acc.cursor.position);
          return set_elevation(_pipe$2, 0);
        })();
        let $ = map_get(game_state.map.tiles, position);
        if ($.isOk()) {
          let t = $[0];
          let $1 = t.passability;
          if ($1 instanceof Passable) {
            return game_state.withFields({
              cursor: game_state.cursor.withFields({
                position: set_elevation(position, t.elevation)
              })
            });
          } else {
            return game_state;
          }
        } else {
          return game_state;
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
function update_entities(game_state) {
  let new_cursor = update(game_state.cursor);
  return game_state.withFields({ cursor: new_cursor });
}
function update_loop(loop$game_state, loop$accumulator, loop$loop_count) {
  while (true) {
    let game_state = loop$game_state;
    let accumulator = loop$accumulator;
    let loop_count = loop$loop_count;
    let has_pending_frames = (() => {
      let _pipe = compare2(accumulator, fixed_dt());
      return is_gt_or_eq(_pipe);
    })();
    let $ = has_pending_frames && loop_count <= max_update_frames();
    if ($) {
      let _pipe = game_state;
      let _pipe$1 = apply_events(_pipe);
      let _pipe$2 = update_entities(_pipe$1);
      loop$game_state = _pipe$2;
      loop$accumulator = subtract(accumulator, fixed_dt());
      loop$loop_count = loop_count + 1;
    } else {
      return game_state.withFields({ accumulator });
    }
  }
}
function update2(game_state, current_time) {
  let updated = update_time(game_state, current_time);
  return update_loop(updated, updated.accumulator, 0);
}
function toggle_debug(game_state) {
  return game_state.withFields({ debug: !game_state.debug });
}

// build/dev/javascript/client/lib/map/demo_one.mjs
function new_tile(variant, elevation) {
  return new Tile(
    new Demo(variant),
    new Passable(),
    elevation
  );
}
function new$6() {
  let tiles = from_list(
    toList([
      [at(0, 0, 0), new_tile(new Variant2(), 1)],
      [at(1, 0, 0), new_tile(new Variant4(), 0)],
      [at(2, 0, 0), new_tile(new Variant6(), 1)],
      [at(3, 0, 0), new_tile(new Variant3(), 2)],
      [at(4, 0, 0), new_tile(new Base2(), 1)],
      [at(5, 0, 0), new_tile(new Variant5(), 0)],
      [at(6, 0, 0), new_tile(new Variant1(), 1)],
      [at(7, 0, 0), new_tile(new Base2(), 2)],
      [at(8, 0, 0), new_tile(new Variant2(), 2)],
      [at(9, 0, 0), new_tile(new Base2(), 3)],
      [at(10, 0, 0), new_tile(new Variant4(), 3)],
      [at(11, 0, 0), new_tile(new Variant6(), 1)],
      [at(12, 0, 0), new_tile(new Base2(), 0)],
      [at(0, 1, 0), new_tile(new Variant5(), 1)],
      [at(1, 1, 0), new_tile(new Base2(), 2)],
      [at(2, 1, 0), new_tile(new Variant4(), 0)],
      [at(3, 1, 0), new_tile(new Variant2(), 1)],
      [at(4, 1, 0), new_tile(new Variant6(), 1)],
      [at(5, 1, 0), new_tile(new Base2(), 1)],
      [at(6, 1, 0), new_tile(new Variant3(), 0)],
      [at(7, 1, 0), new_tile(new Variant5(), 2)],
      [at(8, 1, 0), new_tile(new Variant1(), 0)],
      [at(9, 1, 0), new_tile(new Base2(), 1)],
      [at(10, 1, 0), new_tile(new Variant4(), 2)],
      [at(11, 1, 0), new_tile(new Variant6(), 1)],
      [at(12, 1, 0), new_tile(new Variant2(), 1)],
      [at(0, 2, 0), new_tile(new Variant3(), 2)],
      [at(1, 2, 0), new_tile(new Variant5(), 3)],
      [at(2, 2, 0), new_tile(new Base2(), 2)],
      [at(3, 2, 0), new_tile(new Variant1(), 3)],
      [at(4, 2, 0), new_tile(new Variant6(), 1)],
      [at(5, 2, 0), new_tile(new Variant4(), 0)],
      [at(6, 2, 0), new_tile(new Variant2(), 0)],
      [at(7, 2, 0), new_tile(new Base2(), 0)],
      [at(8, 2, 0), new_tile(new Variant5(), 0)],
      [at(9, 2, 0), new_tile(new Variant3(), 0)],
      [at(10, 2, 0), new_tile(new Base2(), 0)],
      [at(11, 2, 0), new_tile(new Variant4(), 0)],
      [at(12, 2, 0), new_tile(new Variant1(), 0)],
      [at(0, 3, 0), new_tile(new Variant6(), 1)],
      [at(1, 3, 0), new_tile(new Base2(), 2)],
      [at(2, 3, 0), new_tile(new Variant5(), 1)],
      [at(3, 3, 0), new_tile(new Variant4(), 0)],
      [at(4, 3, 0), new_tile(new Variant1(), 0)],
      [at(5, 3, 0), new_tile(new Variant3(), 1)],
      [at(6, 3, 0), new_tile(new Base2(), 0)],
      [at(7, 3, 0), new_tile(new Variant2(), 0)],
      [at(8, 3, 0), new_tile(new Variant5(), 0)],
      [at(9, 3, 0), new_tile(new Base2(), 0)],
      [at(10, 3, 0), new_tile(new Variant6(), 0)],
      [at(11, 3, 0), new_tile(new Variant1(), 0)],
      [at(12, 3, 0), new_tile(new Base2(), 0)],
      [at(0, 4, 0), new_tile(new Variant2(), 1)],
      [at(1, 4, 0), new_tile(new Variant4(), 0)],
      [at(2, 4, 0), new_tile(new Base2(), 0)],
      [at(3, 4, 0), new_tile(new Variant6(), 0)],
      [at(4, 4, 0), new_tile(new Variant1(), 0)],
      [at(5, 4, 0), new_tile(new Variant5(), 1)],
      [at(6, 4, 0), new_tile(new Variant3(), 0)],
      [at(7, 4, 0), new_tile(new Base2(), 0)],
      [at(8, 4, 0), new_tile(new Variant4(), 0)],
      [at(9, 4, 0), new_tile(new Variant2(), 0)],
      [at(10, 4, 0), new_tile(new Variant5(), 1)],
      [at(11, 4, 0), new_tile(new Base2(), 0)],
      [at(12, 4, 0), new_tile(new Variant3(), 1)],
      [at(0, 5, 0), new_tile(new Base2(), 0)],
      [at(1, 5, 0), new_tile(new Variant1(), 0)],
      [at(2, 5, 0), new_tile(new Variant4(), 1)],
      [at(3, 5, 0), new_tile(new Base2(), 0)],
      [at(4, 5, 0), new_tile(new Variant3(), 2)],
      [at(5, 5, 0), new_tile(new Variant5(), 1)],
      [at(6, 5, 0), new_tile(new Base2(), 0)],
      [at(7, 5, 0), new_tile(new Variant6(), 1)],
      [at(8, 5, 0), new_tile(new Variant2(), 0)],
      [at(9, 5, 0), new_tile(new Base2(), 0)],
      [at(10, 5, 0), new_tile(new Variant1(), 0)],
      [at(11, 5, 0), new_tile(new Variant5(), 0)],
      [at(12, 5, 0), new_tile(new Variant4(), 0)],
      [at(0, 6, 0), new_tile(new Variant4(), 1)],
      [at(1, 6, 0), new_tile(new Variant2(), 2)],
      [at(2, 6, 0), new_tile(new Base2(), 1)],
      [at(3, 6, 0), new_tile(new Variant5(), 0)],
      [at(4, 6, 0), new_tile(new Variant6(), 0)],
      [at(5, 6, 0), new_tile(new Base2(), 0)],
      [at(6, 6, 0), new_tile(new Variant1(), 0)],
      [at(7, 6, 0), new_tile(new Variant3(), 0)],
      [at(8, 6, 0), new_tile(new Base2(), 0)],
      [at(9, 6, 0), new_tile(new Variant4(), 0)],
      [at(10, 6, 0), new_tile(new Variant5(), 0)],
      [at(11, 6, 0), new_tile(new Variant6(), 0)],
      [at(12, 6, 0), new_tile(new Base2(), 0)],
      [at(0, 7, 0), new_tile(new Base2(), 3)],
      [at(1, 7, 0), new_tile(new Variant1(), 2)],
      [at(2, 7, 0), new_tile(new Variant6(), 1)],
      [at(3, 7, 0), new_tile(new Variant3(), 0)],
      [at(4, 7, 0), new_tile(new Variant5(), 1)],
      [at(5, 7, 0), new_tile(new Base2(), 2)],
      [at(6, 7, 0), new_tile(new Variant2(), 1)],
      [at(7, 7, 0), new_tile(new Variant4(), 0)],
      [at(8, 7, 0), new_tile(new Variant5(), 0)],
      [at(9, 7, 0), new_tile(new Variant6(), 0)],
      [at(10, 7, 0), new_tile(new Variant3(), 0)],
      [at(11, 7, 0), new_tile(new Base2(), 0)],
      [at(12, 7, 0), new_tile(new Variant1(), 0)],
      [at(0, 8, 0), new_tile(new Variant2(), 2)],
      [at(1, 8, 0), new_tile(new Variant4(), 1)],
      [at(2, 8, 0), new_tile(new Base2(), 0)],
      [at(3, 8, 0), new_tile(new Variant5(), 0)],
      [at(4, 8, 0), new_tile(new Variant6(), 0)],
      [at(5, 8, 0), new_tile(new Variant3(), 0)],
      [at(6, 8, 0), new_tile(new Base2(), 0)],
      [at(7, 8, 0), new_tile(new Variant2(), 0)],
      [at(8, 8, 0), new_tile(new Variant4(), 0)],
      [at(9, 8, 0), new_tile(new Variant5(), 0)],
      [at(10, 8, 0), new_tile(new Base2(), 0)],
      [at(11, 8, 0), new_tile(new Variant6(), 0)],
      [at(12, 8, 0), new_tile(new Variant1(), 0)],
      [at(0, 9, 0), new_tile(new Variant5(), 1)],
      [at(1, 9, 0), new_tile(new Base2(), 0)],
      [at(2, 9, 0), new_tile(new Variant4(), 1)],
      [at(3, 9, 0), new_tile(new Variant3(), 0)],
      [at(4, 9, 0), new_tile(new Variant2(), 0)],
      [at(5, 9, 0), new_tile(new Variant6(), 0)],
      [at(6, 9, 0), new_tile(new Base2(), 0)],
      [at(7, 9, 0), new_tile(new Variant5(), 0)],
      [at(8, 9, 0), new_tile(new Variant1(), 0)],
      [at(9, 9, 0), new_tile(new Variant4(), 0)],
      [at(10, 9, 0), new_tile(new Base2(), 0)],
      [at(11, 9, 0), new_tile(new Variant6(), 0)],
      [at(12, 9, 0), new_tile(new Variant3(), 1)],
      [at(0, 10, 0), new_tile(new Base2(), 0)],
      [at(1, 10, 0), new_tile(new Variant6(), 0)],
      [at(2, 10, 0), new_tile(new Variant5(), 0)],
      [at(3, 10, 0), new_tile(new Variant4(), 0)],
      [at(4, 10, 0), new_tile(new Variant1(), 0)],
      [at(5, 10, 0), new_tile(new Variant3(), 0)],
      [at(6, 10, 0), new_tile(new Variant5(), 0)],
      [at(7, 10, 0), new_tile(new Variant2(), 0)],
      [at(8, 10, 0), new_tile(new Base2(), 0)],
      [at(9, 10, 0), new_tile(new Variant6(), 0)],
      [at(10, 10, 0), new_tile(new Variant1(), 0)],
      [at(11, 10, 0), new_tile(new Base2(), 1)],
      [at(12, 10, 0), new_tile(new Variant4(), 2)],
      [at(0, 11, 0), new_tile(new Variant3(), 0)],
      [at(1, 11, 0), new_tile(new Base2(), 0)],
      [at(2, 11, 0), new_tile(new Variant6(), 0)],
      [at(3, 11, 0), new_tile(new Variant5(), 0)],
      [at(4, 11, 0), new_tile(new Variant2(), 0)],
      [at(5, 11, 0), new_tile(new Variant4(), 0)],
      [at(6, 11, 0), new_tile(new Variant1(), 0)],
      [at(7, 11, 0), new_tile(new Base2(), 1)],
      [at(8, 11, 0), new_tile(new Variant6(), 1)],
      [at(9, 11, 0), new_tile(new Variant3(), 2)],
      [at(10, 11, 0), new_tile(new Variant5(), 3)],
      [at(11, 11, 0), new_tile(new Variant2(), 4)],
      [at(12, 11, 0), new_tile(new Base2(), 3)]
    ])
  );
  return new Map3(sprite_sheet2(), tiles);
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
var AppSetNoCanvas = class extends CustomType {
};
var ToggleDebug = class extends CustomType {
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
function init2(_) {
  return [new Idle(), schedule_next_frame()];
}
function get_canvas_dimensions(model) {
  if (model instanceof Ready) {
    let game_state = model.game_state;
    return [
      (() => {
        let _pipe = scale(
          (() => {
            let _pipe2 = game_state.camera.width;
            return identity(_pipe2);
          })(),
          game_state.scale
        );
        return round(_pipe);
      })(),
      (() => {
        let _pipe = scale(
          (() => {
            let _pipe2 = game_state.camera.height;
            return identity(_pipe2);
          })(),
          game_state.scale
        );
        return round(_pipe);
      })()
    ];
  } else {
    return [640, 360];
  }
}
function get_show_debug(model) {
  if (model instanceof Ready) {
    let game_state = model.game_state;
    let $ = game_state.debug;
    if ($) {
      return [true, "block"];
    } else {
      return [false, "none"];
    }
  } else {
    return [false, "none"];
  }
}
function render3(game_state) {
  return from(
    (_) => {
      let $ = with_context();
      if ($.isOk() && $[0] instanceof RenderContext) {
        let context = $[0][1];
        return request_animation_frame(
          (_2) => {
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
                render2(
                  context,
                  tile,
                  coords,
                  game_state.map.sprite_sheet,
                  game_state.camera,
                  game_state.scale
                );
                render_base(
                  context,
                  game_state.cursor,
                  coords,
                  game_state.camera,
                  game_state.scale
                );
                return render_pointer(
                  context,
                  game_state.cursor,
                  coords,
                  game_state.camera,
                  game_state.scale
                );
              }
            );
          }
        );
      } else {
        throw makeError(
          "panic",
          "client",
          255,
          "",
          "`panic` expression evaluated.",
          {}
        );
      }
    }
  );
}
function update_and_schedule(game_state) {
  return [
    new Ready(game_state),
    batch(toList([render3(game_state), schedule_next_frame()]))
  ];
}
function update3(model, msg) {
  if (msg instanceof AppSetNoCanvas) {
    return [new NoCanvas(), none()];
  } else if (msg instanceof Tick) {
    let current_time = msg[0];
    if (model instanceof Ready) {
      let game_state = model.game_state;
      let _pipe = game_state;
      let _pipe$1 = update2(_pipe, current_time);
      return update_and_schedule(_pipe$1);
    } else if (model instanceof Idle) {
      return [
        new Ready(new$5(current_time, new$6())),
        batch(toList([setup_listeners(), schedule_next_frame()]))
      ];
    } else {
      throw makeError(
        "panic",
        "client",
        69,
        "update",
        "`panic` expression evaluated.",
        {}
      );
    }
  } else if (msg instanceof PlayerQueueEvent) {
    let event2 = msg[0];
    if (model instanceof Ready) {
      let game_state = model.game_state;
      return [
        new Ready(
          game_state.withFields({
            event_queue: prepend(event2, game_state.event_queue)
          })
        ),
        none()
      ];
    } else {
      throw makeError(
        "panic",
        "client",
        83,
        "update",
        "`panic` expression evaluated.",
        {}
      );
    }
  } else {
    if (model instanceof Ready) {
      let game_state = model.game_state;
      return [new Ready(toggle_debug(game_state)), none()];
    } else {
      return [model, none()];
    }
  }
}
function view(model) {
  let $ = get_canvas_dimensions(model);
  let canvas_width = $[0];
  let canvas_height = $[1];
  let width_px = (() => {
    let _pipe = canvas_width;
    return to_string(_pipe);
  })() + "px";
  let height_px = (() => {
    let _pipe = canvas_height;
    return to_string(_pipe);
  })() + "px";
  let half_width_px = (() => {
    let _pipe = divideInt(canvas_width, 2);
    return to_string(_pipe);
  })() + "px";
  let half_height_px = (() => {
    let _pipe = divideInt(canvas_height, 2);
    return to_string(_pipe);
  })() + "px";
  let $1 = get_show_debug(model);
  let is_debug = $1[0];
  let debug_display = $1[1];
  return div(
    toList([
      class$("flex flex-col gap-2"),
      style(toList([["width", width_px], ["height", height_px]]))
    ]),
    toList([
      div(
        toList([
          class$("relative border border-gray-900"),
          style(toList([["width", width_px], ["height", height_px]]))
        ]),
        toList([
          canvas(
            toList([
              id(render_target_id),
              width(canvas_width),
              height(canvas_height),
              style(toList([["image-rendering", "pixelated"]]))
            ])
          ),
          div(
            toList([
              class$("absolute left-0 bg-red-400/15 inset-y-0"),
              style(
                toList([["display", debug_display], ["width", half_width_px]])
              )
            ]),
            toList([])
          ),
          div(
            toList([
              class$(
                "absolute left-0 bg-blue-400/15 top-0 inset-x-0"
              ),
              style(
                toList([["display", debug_display], ["height", half_height_px]])
              )
            ]),
            toList([])
          )
        ])
      ),
      div(
        toList([class$("flex self-start gap-2")]),
        toList([
          label(
            toList([
              class$("font-mono text-sm flex items-center gap-1")
            ]),
            toList([
              input(
                toList([
                  class$("text-indigo-500"),
                  type_("checkbox"),
                  checked(is_debug),
                  on_check((_) => {
                    return new ToggleDebug();
                  })
                ])
              ),
              text2("Debug")
            ])
          )
        ])
      )
    ])
  );
}
function main() {
  let app = application(init2, update3, view);
  let $ = start2(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "let_assert",
      "client",
      29,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
