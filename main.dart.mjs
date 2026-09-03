// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.clientX,
      AE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AF: x0 => x0.touches,
      AG: x0 => x0.next(),
      AH: x0 => x0.maxWidth,
      AI: x0 => x0.document,
      AJ: x0 => x0.body,
      AK: x0 => x0.clearMarks(),
      AL: x0 => x0.nextSibling,
      AM: x0 => x0.children,
      B: s => printToConsole(s),
      BB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      BE: x0 => x0.matches,
      BF: x0 => x0.pressure,
      BG: x0 => x0.current(),
      BH: x0 => x0.minHeight,
      BI: x0 => new WeakRef(x0),
      BJ: x0 => x0.headers,
      BK: x0 => x0.clearMeasures(),
      BL: (x0,x1) => x0.debug(x1),
      BM: (x0,x1) => { x0.id = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Uint16Array(x0),
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: x0 => x0.getBoundingClientRect(),
      CE: (x0,x1) => x0.matchMedia(x1),
      CF: x0 => x0.tiltY,
      CG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      CH: x0 => x0.minWidth,
      CI: x0 => x0.deref(),
      CJ: x0 => x0.signal,
      CK: (x0,x1) => x0.parse(x1),
      CL: x0 => x0.hostElement,
      CM: x0 => x0.click(),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      DE: x0 => x0.matches,
      DF: x0 => x0.tiltX,
      DG: x0 => x0.v8BreakIterator,
      DH: (x0,x1) => x0.removeProperty(x1),
      DI: () => globalThis.WeakRef,
      DJ: x0 => x0.abort(),
      DK: (x0,x1,x2) => x0.mark(x1,x2),
      DL: x0 => x0.location,
      DM: (x0,x1) => x0.removeChild(x1),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      EC: (x0,x1) => x0.item(x1),
      ED: s => new Date(s * 1000).getTimezoneOffset() * 60,
      EE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      EF: x0 => x0.pointerType,
      EG: () => globalThis.Intl,
      EH: (x0,x1) => x0.add(x1),
      EI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      EJ: x0 => x0.naturalHeight,
      EK: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      EL: (x0,x1) => x0.getModifierState(x1),
      EM: x0 => x0.firstChild,
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: Date.now,
      FE: f => f.dartFunction,
      FF: x0 => x0.pointerId,
      FG: (x0,x1) => x0.segment(x1),
      FH: x0 => x0.data,
      FI: (a, s, e) => a.slice(s, e),
      FJ: x0 => x0.naturalWidth,
      FK: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      FL: x0 => x0.metaKey,
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: (handle) => clearTimeout(handle),
      GE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GF: x0 => x0.getCoalescedEvents(),
      GG: x0 => x0.index,
      GH: (x0,x1) => { x0.scrollTop = x1 },
      GI: (x0,x1) => x0.getRandomValues(x1),
      GJ: (x0,x1) => x0.createElement(x1),
      GK: () => globalThis.JSON,
      GL: x0 => x0.altKey,
      GM: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: (x0,x1) => x0.closest(x1),
      HE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      HF: (x0,x1) => x0.getModifierState(x1),
      HG: x0 => x0.next(),
      HH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      HI: () => globalThis.crypto,
      HJ: (x0,x1) => { x0.pointerEvents = x1 },
      HK: x0 => x0.clearMarks,
      HL: x0 => x0.ctrlKey,
      HM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: x0 => x0.bottom,
      IE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      IF: s => s.trimLeft(),
      IG: x0 => x0.value,
      IH: (x0,x1) => { x0.value = x1 },
      II: l => new DataView(new ArrayBuffer(l)),
      IJ: (x0,x1) => { x0.height = x1 },
      IK: x0 => x0.clearMeasures,
      IL: x0 => x0.isComposing,
      IM: (x0,x1) => x0.item(x1),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: x0 => x0.top,
      JE: (o, i) => o[i],
      JF: (x0,x1) => x0[x1],
      JG: x0 => x0.done,
      JH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      JI: (x0,x1) => x0.revokeObjectURL(x1),
      JJ: (x0,x1) => { x0.width = x1 },
      JK: x0 => x0.mark,
      JL: x0 => x0.code,
      JM: x0 => globalThis.URL.createObjectURL(x0),
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: x0 => x0.right,
      KE: o => o.length,
      KF: x0 => x0.index,
      KG: (o, m, a) => o[m].apply(o, a),
      KH: (x0,x1) => { x0.value = x1 },
      KI: (x0,x1) => { x0.src = x1 },
      KJ: x0 => x0.style,
      KK: x0 => x0.measure,
      KL: x0 => x0.repeat,
      KM: x0 => ({type: x0}),
      L: o => o === undefined,
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: x0 => x0.left,
      LE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      LF: (x0,x1) => x0.exec(x1),
      LG: x0 => x0.iterator,
      LH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      LI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      LJ: (x0,x1) => { x0.src = x1 },
      LK: () => globalThis.performance,
      LL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LM: (x0,x1) => new Blob(x0,x1),
      M: o => String(o),
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: x0 => x0.clientY,
      ME: x0 => x0.language,
      MF: s => s.toUpperCase(),
      MG: () => globalThis.Symbol,
      MH: x0 => x0.value,
      MI: x0 => x0.naturalHeight,
      MJ: () => globalThis.document,
      MK: () => new FileReader(),
      ML: x0 => x0.userAgent,
      MM: x0 => x0.size,
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: x0 => x0.clientX,
      NE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      NF: x0 => x0.length,
      NG: (x0,x1) => new Intl.Segmenter(x0,x1),
      NH: x0 => x0.selectionDirection,
      NI: x0 => x0.naturalWidth,
      NJ: x0 => x0.src,
      NK: (x0,x1) => x0.readAsArrayBuffer(x1),
      NL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      NM: x0 => x0.name,
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: x0 => x0.changedTouches,
      OE: () => globalThis.window.FinalizationRegistry,
      OF: x0 => x0.pop(),
      OG: x0 => x0.Segmenter,
      OH: x0 => x0.selectionStart,
      OI: x0 => x0.decode(),
      OJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      OK: x0 => x0.result,
      OL: (x0,x1) => x0.canShare(x1),
      OM: x0 => x0.type,
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: x0 => x0.offsetY,
      PE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PF: x0 => x0.flags,
      PG: x0 => x0.buffer,
      PH: x0 => x0.selectionEnd,
      PI: (x0,x1) => { x0.decoding = x1 },
      PJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      PK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PL: (x0,x1) => x0.share(x1),
      PM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: x0 => x0.offsetX,
      QE: x0 => new window.FinalizationRegistry(x0),
      QF: (a, s) => a.join(s),
      QG: x0 => x0.wasmMemory,
      QH: x0 => x0.value,
      QI: (x0,x1) => { x0.crossOrigin = x1 },
      QJ: x0 => x0.decode(),
      QK: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      QL: x0 => x0.message,
      QM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: x0 => x0.type,
      RE: (x0,x1) => x0.unregister(x1),
      RF: (x0,x1) => x0.error(x1),
      RG: () => globalThis.window._flutter_skwasmInstance,
      RH: x0 => x0.selectionDirection,
      RI: (x0,x1) => x0.createObjectURL(x1),
      RJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      RK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      RL: x0 => ({url: x0}),
      RM: x0 => x0.length,
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: x0 => x0.maxTouchPoints,
      SE: (x0,x1) => x0.contains(x1),
      SF: () => globalThis.console,
      SG: () => new TextDecoder(),
      SH: x0 => x0.selectionStart,
      SI: x0 => x0.URL,
      SJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SL: x0 => x0.load(),
      SM: x0 => x0.files,
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: x0 => x0.platform,
      TE: (s) => +s,
      TF: s => s.trimRight(),
      TG: (a, i) => a.splice(i, 1),
      TH: x0 => x0.selectionEnd,
      TI: x0 => new Blob(x0),
      TJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      TK: () => new XMLHttpRequest(),
      TL: (x0,x1) => x0.removeAttribute(x1),
      TM: x0 => x0.target,
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (string, token) => string.split(token),
      UD: x0 => x0.body,
      UE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      UF: x0 => x0.blur(),
      UG: a => a.pop(),
      UH: x0 => x0.keyCode,
      UI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      UJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      UL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UM: (x0,x1) => { x0.display = x1 },
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: o => o instanceof Array,
      VD: () => globalThis.document,
      VE: s => s.trim(),
      VF: x0 => x0.button,
      VG: (map, o, v) => map.set(o, v),
      VH: (x0,x1) => x0.scrollIntoView(x1),
      VI: x0 => new window.ImageDecoder(x0),
      VJ: x0 => x0.send(),
      VK: x0 => x0.send(),
      VL: (x0,x1,x2) => x0.addEventListener(x1,x2),
      VM: x0 => x0.style,
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (a, i) => a[i],
      WD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      WE: x0 => x0.classList,
      WF: x0 => x0.innerHeight,
      WG: (map, o) => map.get(o),
      WH: x0 => x0.multiViewEnabled,
      WI: x0 => x0.name,
      WJ: x0 => x0.status,
      WK: x0 => x0.type,
      WL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WM: (x0,x1) => { x0.accept = x1 },
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: a => a.length,
      XD: x0 => x0.hasFocus(),
      XE: x0 => x0.preventDefault(),
      XF: x0 => x0.innerWidth,
      XG: () => new WeakMap(),
      XH: (x0,x1) => x0.replaceWith(x1),
      XI: x0 => x0.repetitionCount,
      XJ: x0 => x0.response,
      XK: x0 => x0.response,
      XL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XM: (x0,x1) => { x0.multiple = x1 },
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: (x0,x1) => x0.test(x1),
      YD: x0 => x0.relatedTarget,
      YE: x0 => x0.parent,
      YF: x0 => x0.height,
      YG: x0 => x0.debugSkipFontRetryDelay,
      YH: (x0,x1) => { x0.type = x1 },
      YI: x0 => x0.frameCount,
      YJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      YK: (x0,x1) => { x0.responseType = x1 },
      YL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YM: (x0,x1) => { x0.draggable = x1 },
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: x0 => x0.userAgent,
      ZD: x0 => x0.shiftKey,
      ZE: x0 => x0.timeStamp,
      ZF: x0 => x0.width,
      ZG: x0 => x0.status,
      ZH: (x0,x1) => { x0.className = x1 },
      ZI: x0 => x0.selectedTrack,
      ZJ: (x0,x1) => { x0.responseType = x1 },
      ZK: x0 => x0.vendor,
      ZL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZM: (x0,x1) => { x0.type = x1 },
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.navigator,
      aD: (decoder, codeUnits) => decoder.decode(codeUnits),
      aE: (x0,x1) => x0.hasAttribute(x1),
      aF: x0 => x0.clientHeight,
      aG: (x0,x1,x2) => x0.set(x1,x2),
      aH: (x0,x1) => { x0.tabIndex = x1 },
      aI: x0 => x0.completed,
      aJ: () => new XMLHttpRequest(),
      aK: x0 => x0.navigator,
      aL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aM: x0 => globalThis.URL.revokeObjectURL(x0),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: Function.prototype.call.bind(String.prototype.toLowerCase),
      bD: () => new TextDecoder("utf-8", {fatal: true}),
      bE: x0 => x0.buttons,
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.arrayBuffer(),
      bH: (x0,x1) => { x0.name = x1 },
      bI: x0 => x0.ready,
      bJ: x0 => x0.input,
      bK: x0 => new Blob(x0),
      bL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bM: (x0,x1) => { x0.download = x1 },
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: Object.is,
      cD: () => new TextDecoder("utf-8", {fatal: false}),
      cE: x0 => x0.ctrlKey,
      cF: (x0,x1) => { x0.content = x1 },
      cG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      cH: (x0,x1) => { x0.placeholder = x1 },
      cI: x0 => x0.tracks,
      cJ: (o, p) => p in o,
      cK: x0 => globalThis.fetch(x0),
      cL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cM: (x0,x1) => { x0.target = x1 },
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.vendor,
      dD: (a, i, v) => a[i] = v,
      dE: x0 => x0.y,
      dF: (x0,x1) => { x0.name = x1 },
      dG: (x0,x1) => x0.fetch(x1),
      dH: (x0,x1) => { x0.autocomplete = x1 },
      dI: x0 => x0.close(),
      dJ: x0 => x0.groups,
      dK: x0 => x0.arrayBuffer(),
      dL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dM: (x0,x1) => { x0.href = x1 },
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (x0,x1) => x0.createTextNode(x1),
      eD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      eE: x0 => x0.x,
      eF: x0 => x0.head,
      eG: x0 => x0.fontFallbackBaseUrl,
      eH: (x0,x1) => { x0.name = x1 },
      eI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      eJ: () => globalThis.window.navigator.userAgent,
      eK: (x0,x1,x2) => x0.insertBefore(x1,x2),
      eL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eM: x0 => x0.href,
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: (x0,x1) => { x0.id = x1 },
      fD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      fE: x0 => x0.scrollTop,
      fF: (x0,x1) => x0.removeChild(x1),
      fG: (handle) => clearInterval(handle),
      fH: (x0,x1) => { x0.placeholder = x1 },
      fI: (x0,x1) => x0.decode(x1),
      fJ: (x0,x1,x2) => x0.setItem(x1,x2),
      fK: x0 => x0.id,
      fL: (x0,x1) => { x0.playbackRate = x1 },
      fM: x0 => x0.location,
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (x0,x1) => { x0.nonce = x1 },
      gD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      gE: x0 => x0.offsetTop,
      gF: x0 => x0.firstChild,
      gG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      gH: (x0,x1) => { x0.action = x1 },
      gI: x0 => x0.displayHeight,
      gJ: x0 => x0.localStorage,
      gK: x0 => x0.offsetHeight,
      gL: x0 => x0.currentTime,
      gM: x0 => x0.length,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: x0 => x0.nonce,
      hD: x0 => x0.visibilityState,
      hE: x0 => x0.scrollLeft,
      hF: x0 => x0.viewConstraints,
      hG: () => Date.now(),
      hH: (x0,x1) => { x0.method = x1 },
      hI: x0 => x0.displayWidth,
      hJ: () => globalThis.window,
      hK: x0 => x0.offsetWidth,
      hL: x0 => x0.message,
      hM: x0 => x0.getReader(),
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: () => globalThis.window.flutterConfiguration,
      iD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      iE: x0 => x0.offsetLeft,
      iF: x0 => x0.hostElement,
      iG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      iH: (x0,x1) => { x0.noValidate = x1 },
      iI: x0 => x0.duration,
      iJ: (x0,x1) => x0.getItem(x1),
      iK: x0 => x0.stopPropagation(),
      iL: x0 => x0.code,
      iM: x0 => x0.value,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: (x0,x1) => x0.attachShadow(x1),
      jD: x0 => x0.disconnect(),
      jE: x0 => x0.offsetParent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jH: (x0,x1) => x0.removeAttribute(x1),
      jI: x0 => x0.image,
      jJ: (x0,x1) => x0.key(x1),
      jK: x0 => x0.disabled,
      jL: x0 => x0.error,
      jM: x0 => x0.done,
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: (x0,x1) => x0.createElement(x1),
      kD: x0 => new Intl.Locale(x0),
      kE: (o, p, r) => o.replace(p, () => r),
      kF: x0 => ({runApp: x0}),
      kG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      kH: x0 => x0.isConnected,
      kI: () => globalThis.window.ImageDecoder,
      kJ: x0 => x0.length,
      kK: (x0,x1) => { x0.min = x1 },
      kL: (x0,x1) => { x0.currentTime = x1 },
      kM: x0 => x0.read(),
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      lC: x0 => x0.scale,
      lD: x0 => x0.region,
      lE: (x0,x1) => { x0.lastIndex = x1 },
      lF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      lG: x0 => x0.history,
      lH: x0 => x0.click(),
      lI: () => new AbortController(),
      lJ: (x0,x1) => x0._malloc(x1),
      lK: (x0,x1) => { x0.max = x1 },
      lL: x0 => x0.duration,
      lM: x0 => x0.body,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: x0 => x0.visualViewport,
      mD: x0 => x0.script,
      mE: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      mF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mG: x0 => x0.search,
      mH: (x0,x1) => x0.getElementsByClassName(x1),
      mI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      mJ: (x0,x1) => x0._free(x1),
      mK: (x0,x1) => { x0.disabled = x1 },
      mL: (x0,x1) => { x0.preload = x1 },
      mM: (x0,x1) => new OffscreenCanvas(x0,x1),
      n: (x0,x1) => x0.prepend(x1),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.devicePixelRatio,
      nD: x0 => x0.language,
      nE: o => o instanceof RegExp,
      nF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      nG: x0 => x0.location,
      nH: (x0,x1) => x0.dispatchEvent(x1),
      nI: (x0,x1) => globalThis.fetch(x0,x1),
      nJ: (x0,x1,x2,x3,x4,x5) => x0._et_mseed_decode(x1,x2,x3,x4,x5),
      nK: (x0,x1) => { x0.scrollLeft = x1 },
      nL: (x0,x1) => { x0.src = x1 },
      nM: x0 => x0.assetBase,
      o: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: x0 => x0.height,
      oD: x0 => x0.languages,
      oE: x0 => x0.dotAll,
      oF: () => typeof dartUseDateNowForTicks !== "undefined",
      oG: x0 => x0.pathname,
      oH: (x0,x1) => x0.createEvent(x1),
      oI: (x0,x1) => x0.get(x1),
      oJ: (x0,x1) => x0.UTF8ToString(x1),
      oK: (x0,x1) => { x0.spellcheck = x1 },
      oL: x0 => x0.src,
      oM: x0 => x0.loader,
      p: b => !!b,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: x0 => x0.width,
      pD: (x0,x1) => x0.observe(x1),
      pE: x0 => x0.unicode,
      pF: () => Date.now(),
      pG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      pH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      pI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      pJ: (x0,x1) => x0._et_mseed_trace_count(x1),
      pK: (x0,x1) => { x0.disabled = x1 },
      pL: x0 => x0.play(),
      pM: () => globalThis._flutter,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: x0 => x0.screen,
      qD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      qE: x0 => x0.ignoreCase,
      qF: () => 1000 * performance.now(),
      qG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      qH: x0 => x0.readText(),
      qI: (x0,x1) => x0.forEach(x1),
      qJ: (x0,x1) => x0._et_mseed_free(x1),
      qK: (x0,x1) => x0.transferFromImageBitmap(x1),
      qL: (x0,x1) => x0.end(x1),
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: (string, times) => string.repeat(times),
      rD: x0 => new ResizeObserver(x0),
      rE: x0 => x0.multiline,
      rF: (x0,x1) => x0.requestAnimationFrame(x1),
      rG: o => Object.keys(o),
      rH: x0 => x0.clipboard,
      rI: x0 => x0.name,
      rJ: (x0,x1,x2) => x0._et_mseed_trace_source_identifier(x1,x2),
      rK: (x0,x1) => x0.getContext(x1),
      rL: x0 => x0.length,
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      sD: (x0,x1) => x0.getPropertyValue(x1),
      sE: (o, p, r) => o.replaceAll(p, () => r),
      sF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sG: x0 => x0.state,
      sH: (x0,x1) => x0.writeText(x1),
      sI: x0 => x0.statusText,
      sJ: (x0,x1,x2) => x0._et_mseed_trace_samples(x1,x2),
      sK: (x0,x1) => { x0.height = x1 },
      sL: x0 => x0.buffered,
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: x0 => x0.tabIndex,
      tD: x0 => globalThis.parseFloat(x0),
      tE: x0 => x0.deltaMode,
      tF: x0 => x0.now(),
      tG: x0 => x0.hash,
      tH: x0 => x0.unlock(),
      tI: x0 => x0.url,
      tJ: (x0,x1,x2) => x0._et_mseed_trace_sample_count(x1,x2),
      tK: (x0,x1) => { x0.width = x1 },
      tL: x0 => x0.pause(),
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.contains(x1),
      uD: (x0,x1) => x0.getComputedStyle(x1),
      uE: x0 => x0.deltaY,
      uF: x0 => x0.performance,
      uG: x0 => x0.state,
      uH: (x0,x1) => x0.lock(x1),
      uI: x0 => x0.status,
      uJ: (x0,x1,x2) => x0._et_mseed_trace_sample_rate(x1,x2),
      uK: x0 => x0.height,
      uL: (x0,x1) => x0.setSinkId(x1),
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.activeElement,
      vD: x0 => x0.documentElement,
      vE: x0 => x0.deltaX,
      vF: x0 => new Uint8Array(x0),
      vG: (x0,x1) => x0.go(x1),
      vH: x0 => x0.orientation,
      vI: x0 => x0.getReader(),
      vJ: (x0,x1,x2) => x0._et_mseed_trace_start_time_microseconds(x1,x2),
      vK: x0 => x0.width,
      vL: (x0,x1) => { x0.volume = x1 },
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.parentNode,
      wD: x0 => x0.computedStyleMap(),
      wE: x0 => x0.wheelDeltaY,
      wF: (x0,x1,x2) => x0.slice(x1,x2),
      wG: x0 => x0.parentElement,
      wH: (x0,x1) => x0.querySelector(x1),
      wI: x0 => x0.read(),
      wJ: x0 => x0.HEAPF64,
      wK: x0 => x0.rasterEndMilliseconds,
      wL: (x0,x1) => x0.createElement(x1),
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.tagName,
      xD: (x0,x1) => x0.get(x1),
      xE: x0 => x0.wheelDeltaX,
      xF: (x0,x1) => x0.decode(x1),
      xG: (x0,x1) => x0.querySelectorAll(x1),
      xH: (x0,x1) => { x0.title = x1 },
      xI: x0 => x0.value,
      xJ: x0 => x0.HEAPU32,
      xK: x0 => x0.rasterStartMilliseconds,
      xL: () => globalThis.document,
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.target,
      yD: (o, p) => p in o,
      yE: x0 => x0.key,
      yF: (x0,x1) => x0.adoptText(x1),
      yG: (d, digits) => d.toFixed(digits),
      yH: (x0,x1) => x0.vibrate(x1),
      yI: x0 => x0.done,
      yJ: x0 => x0.HEAPU8,
      yK: x0 => x0.imageBitmaps,
      yL: (x0,x1) => x0.querySelector(x1),
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.clientY,
      zD: (x0,x1) => { x0.textContent = x1 },
      zE: x0 => x0.identifier,
      zF: x0 => x0.first(),
      zG: x0 => x0.maxHeight,
      zH: x0 => x0.content,
      zI: x0 => x0.cancel(),
      zJ: () => globalThis.createEarthtunesMSeedModule(),
      zK: x0 => x0.canvasKitMaximumSurfaces,
      zL: (o, a) => o + a,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
