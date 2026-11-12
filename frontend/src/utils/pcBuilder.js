import { hasPrice, parseSpecSheet } from "./products.js";

// PC builder: step definitions and compatibility rules. Every rule reads the
// product's `attributes` (socket, memoryType…) or its spec sheet (GPU length,
// case clearances…), so new stock is picked up without code changes.

export const PLATFORMS = {
  AMD: {
    key: "AMD",
    title: { en: "AMD build", he: "בנייה על AMD" },
    blurb: {
      en: "Ryzen processors. Great gaming value, especially the X3D chips.",
      he: "מעבדי Ryzen. תמורה מצוינת לגיימינג, במיוחד דגמי X3D."
    }
  },
  Intel: {
    key: "Intel",
    title: { en: "Intel build", he: "בנייה על Intel" },
    blurb: {
      en: "Core and Core Ultra processors. Strong for gaming and multitasking.",
      he: "מעבדי Core ו-Core Ultra. חזקים לגיימינג ולעבודה במקביל."
    }
  }
};

export const BUILD_STEPS = [
  { key: "cpu", type: "CPU", title: { en: "Processor", he: "מעבד" } },
  { key: "motherboard", type: "Motherboard", title: { en: "Motherboard", he: "לוח אם" } },
  { key: "ram", type: "Memory (RAM)", title: { en: "Memory", he: "זיכרון RAM" } },
  { key: "gpu", type: "Graphics Card", title: { en: "Graphics card", he: "כרטיס מסך" } },
  { key: "storage", type: "Internal Storage", title: { en: "Storage", he: "אחסון" } },
  { key: "cooler", type: "Cooling", title: { en: "CPU cooler", he: "קירור למעבד" } },
  { key: "psu", type: "Power Supply", title: { en: "Power supply", he: "ספק כוח" } },
  { key: "case", type: "PC Case", title: { en: "Case", he: "מארז" } }
];

// ---------------------------------------------------------------------------
// Reading product data
// ---------------------------------------------------------------------------

export const getAttr = (product, key) =>
  product?.attributes?.find((attribute) => attribute.key === key)?.value || "";

const specCache = new WeakMap();
const getSpecs = (product) => {
  if (!product) return {};
  if (!specCache.has(product)) {
    const rows = parseSpecSheet(product.description).rows;
    specCache.set(product, Object.fromEntries(rows.map(({ label, value }) => [label, value])));
  }
  return specCache.get(product);
};

const firstNumber = (value) => {
  const match = /(\d+(?:\.\d+)?)/.exec(value || "");
  return match ? Number(match[1]) : null;
};

const spec = (product, label) => getSpecs(product)[label] || "";

// Every spec line whose label mentions compatibility ("תאימות למעבדי AMD"…).
const coolerSocketText = (cooler) =>
  Object.entries(getSpecs(cooler))
    .filter(([label]) => label.includes("תאימות"))
    .map(([, value]) => value)
    .join(" ");

const cpuTdp = (cpu) => firstNumber(spec(cpu, "TDP מקסימלי")) || firstNumber(spec(cpu, "TDP מינימלי"));
const gpuMinPsu = (gpu) => firstNumber(spec(gpu, "מינימום דרישת ספק כוח"));
const gpuLength = (gpu) => firstNumber(spec(gpu, "אורך כרטיס (במ\"מ)"));
const caseMaxGpu = (pcCase) => firstNumber(spec(pcCase, "גודל מקסימלי לכרטיס מסך במ\"מ"));
const caseMaxCoolerHeight = (pcCase) => firstNumber(spec(pcCase, "גובה מקסימלי לקירור מעבד במ\"מ"));
const caseRadiatorText = (pcCase) => spec(pcCase, "מקום לקירור נוזלי");
const coolerHeight = (cooler) => firstNumber(spec(cooler, "גובה Clearance במ\"מ"));
const coolerTdp = (cooler) => firstNumber(spec(cooler, "TDP בW"));
const radiatorSize = (cooler) => firstNumber(getAttr(cooler, "radiatorSize"));

const BOARD_SIZE_RANK = { "Mini-ITX": 1, "Micro-ATX": 2, ATX: 3, "E-ATX": 4 };

const SOCKET_TOKEN = { AM4: "AM4", AM5: "AM5", LGA1700: "1700", LGA1851: "1851" };

// Recommended PSU size: the GPU maker's minimum, or CPU + headroom when
// there's no graphics card, rounded up to a common PSU size.
export const getRecommendedWattage = (parts) => {
  const cpuWatts = cpuTdp(parts.cpu) || 125;
  const fromGpu = parts.gpu ? gpuMinPsu(parts.gpu) || 650 : 0;
  const estimate = Math.max(fromGpu, cpuWatts + (parts.gpu ? 300 : 200));
  return Math.max(450, Math.ceil(estimate / 50) * 50);
};

// The selected CPU has no integrated graphics → a graphics card is required.
export const isGpuRequired = (parts) => getAttr(parts.cpu, "igpu") === "No";

// ---------------------------------------------------------------------------
// Compatibility
// ---------------------------------------------------------------------------
// check(product, parts, platform) → { ok, reason?, warning?, note? }
//   ok=false hides the product in that step and drops it from a build when an
//   earlier choice changes; `warning` shows but still allows the pick.

const fail = (reason) => ({ ok: false, reason });
const pass = (extra = {}) => ({ ok: true, ...extra });

const CHECKS = {
  cpu: (cpu, _parts, platform) =>
    cpu.brand === platform ? pass() : fail({ en: "Different platform", he: "פלטפורמה אחרת" }),

  motherboard: (board, parts, platform) => {
    const socket = getAttr(board, "socket");
    if (parts.cpu) {
      const cpuSocket = getAttr(parts.cpu, "socket");
      if (socket !== cpuSocket) {
        return fail({ en: `Needs a ${cpuSocket} board`, he: `נדרש לוח עם תושבת ${cpuSocket}` });
      }
    } else if (platform === "AMD" ? !socket.startsWith("AM") : !socket.startsWith("LGA")) {
      return fail({ en: "Different platform", he: "פלטפורמה אחרת" });
    }
    if (parts.ram && getAttr(parts.ram, "memoryType") !== getAttr(board, "memoryType")) {
      return fail({ en: "Different memory type", he: "סוג זיכרון שונה" });
    }
    if (parts.case) {
      const boardRank = BOARD_SIZE_RANK[getAttr(board, "formFactor")] || 3;
      const caseRank = BOARD_SIZE_RANK[getAttr(parts.case, "boardSupport")] || 3;
      if (boardRank > caseRank) return fail({ en: "Too big for the case", he: "גדול מדי למארז" });
    }
    return pass();
  },

  ram: (ram, parts) => {
    if (parts.motherboard) {
      const boardType = getAttr(parts.motherboard, "memoryType");
      if (getAttr(ram, "memoryType") !== boardType) {
        return fail({ en: `Board takes ${boardType}`, he: `הלוח תומך ב-${boardType}` });
      }
    }
    return pass();
  },

  gpu: (gpu, parts) => {
    const length = gpuLength(gpu);
    const maxLength = caseMaxGpu(parts.case);
    if (length && maxLength && length > maxLength) {
      return fail({ en: `Longer than the case allows (${maxLength}mm)`, he: `ארוך מהמותר במארז (${maxLength} מ"מ)` });
    }
    if (parts.psu) {
      const needed = gpuMinPsu(gpu);
      const has = firstNumber(getAttr(parts.psu, "wattage"));
      if (needed && has && has < needed) {
        return pass({ warning: { en: `Needs a ${needed}W power supply`, he: `דורש ספק של ${needed}W` } });
      }
    }
    return pass();
  },

  storage: () => pass(),

  cooler: (cooler, parts) => {
    const type = getAttr(cooler, "coolingType");
    if (type !== "CPU Air Cooler" && type !== "Liquid Cooler") {
      return fail({ en: "Not a CPU cooler", he: "לא קירור למעבד" });
    }
    if (parts.cpu) {
      const token = SOCKET_TOKEN[getAttr(parts.cpu, "socket")];
      const supported = coolerSocketText(cooler);
      if (token && supported && !supported.toUpperCase().includes(token)) {
        return fail({ en: "Doesn't fit this socket", he: "לא מתאים לתושבת" });
      }
    }
    if (parts.case) {
      const radiator = radiatorSize(cooler);
      const room = caseRadiatorText(parts.case);
      if (type === "Liquid Cooler" && radiator && room) {
        const maxRadiator = firstNumber(room);
        if (/אין/.test(room) || (maxRadiator && radiator > maxRadiator)) {
          return fail({ en: "Radiator doesn't fit the case", he: "הרדיאטור לא נכנס למארז" });
        }
      }
      const height = coolerHeight(cooler);
      const maxHeight = caseMaxCoolerHeight(parts.case);
      if (type === "CPU Air Cooler" && height && maxHeight && height > maxHeight) {
        return fail({ en: "Too tall for the case", he: "גבוה מדי למארז" });
      }
    }
    const coolerWatts = coolerTdp(cooler);
    const cpuWatts = cpuTdp(parts.cpu);
    if (coolerWatts && cpuWatts && coolerWatts < cpuWatts) {
      return pass({ warning: { en: `Rated ${coolerWatts}W — may run hot`, he: `מדורג ל-${coolerWatts}W, עלול להתחמם` } });
    }
    if (parts.cpu && !coolerSocketText(cooler)) {
      return pass({ note: { en: "Socket support not listed", he: "תאימות תושבת לא צוינה" } });
    }
    return pass();
  },

  psu: (psu, parts) => {
    const watts = firstNumber(getAttr(psu, "wattage"));
    const needed = getRecommendedWattage(parts);
    if (watts && watts < needed) return fail({ en: `Below ${needed}W`, he: `מתחת ל-${needed}W` });
    if (watts && watts <= needed + 250) return pass({ note: { en: "Recommended", he: "מומלץ" }, recommended: true });
    return pass();
  },

  case: (pcCase, parts) => {
    if (parts.motherboard) {
      const boardRank = BOARD_SIZE_RANK[getAttr(parts.motherboard, "formFactor")] || 3;
      const caseRank = BOARD_SIZE_RANK[getAttr(pcCase, "boardSupport")] || 3;
      if (boardRank > caseRank) return fail({ en: "Motherboard won't fit", he: "הלוח לא נכנס" });
    }
    if (parts.gpu) {
      const length = gpuLength(parts.gpu);
      const maxLength = caseMaxGpu(pcCase);
      if (length && maxLength && length > maxLength) return fail({ en: "Graphics card won't fit", he: "כרטיס המסך לא נכנס" });
    }
    if (parts.cooler) {
      const type = getAttr(parts.cooler, "coolingType");
      const room = caseRadiatorText(pcCase);
      const radiator = radiatorSize(parts.cooler);
      if (type === "Liquid Cooler" && room && (/אין/.test(room) || (radiator && radiator > (firstNumber(room) || Infinity)))) {
        return fail({ en: "No room for the radiator", he: "אין מקום לרדיאטור" });
      }
      const height = coolerHeight(parts.cooler);
      const maxHeight = caseMaxCoolerHeight(pcCase);
      if (type === "CPU Air Cooler" && height && maxHeight && height > maxHeight) {
        return fail({ en: "Cooler too tall", he: "הקירור גבוה מדי" });
      }
    }
    return pass();
  }
};

export const checkPart = (stepKey, product, parts, platform) => {
  // A part is never checked against itself (e.g. re-checking the chosen case).
  const others = { ...parts, [stepKey]: undefined };
  return CHECKS[stepKey](product, others, platform);
};

/** Products offered in a step, compatible first and cheapest first. */
export const getStepOptions = (products, step, parts, platform) => {
  const results = products
    .filter((product) => product.productType === step.type && hasPrice(product) && product.inStock !== false)
    .map((product) => ({ product, check: checkPart(step.key, product, parts, platform) }));
  return {
    options: results.filter((item) => item.check.ok),
    hiddenCount: results.filter((item) => !item.check.ok).length
  };
};

/**
 * After a part changes, drop any other chosen part that no longer fits.
 * Returns the cleaned parts and the step keys that were removed.
 */
export const pruneIncompatible = (parts, platform, changedKey) => {
  const next = { ...parts };
  const removed = [];
  BUILD_STEPS.forEach(({ key }) => {
    if (key === changedKey || !next[key]) return;
    if (!checkPart(key, next[key], next, platform).ok) {
      removed.push(key);
      delete next[key];
    }
  });
  return { parts: next, removed };
};

export const isStepRequired = (stepKey, parts) => (stepKey === "gpu" ? isGpuRequired(parts) : true);

// Short facts shown on each option row.
export const STEP_FACTS = {
  cpu: ["cpuSeries", "socket", "cores"],
  motherboard: ["chipset", "formFactor", "memoryType", "wifi"],
  ram: ["capacity", "modules", "speed"],
  gpu: ["gpuModel", "vram"],
  storage: ["storageType", "capacity", "pcieGen"],
  cooler: ["coolingType", "radiatorSize"],
  psu: ["wattage", "efficiency", "atxVersion"],
  case: ["caseSize", "boardSupport", "color"]
};
