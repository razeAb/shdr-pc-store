/**
 * Organizes the imported PC-hardware batch (CPUs, motherboards, RAM, GPUs,
 * storage, cases, PSUs, cooling, accessories, monitors, laptops) so it shows
 * up in the storefront nav and filters:
 *
 *  - moves the Hebrew component categories under one "PC Components"
 *    category with a productType per component
 *  - fills brand, productType, filterable `attributes` and (laptops) `specs`
 *  - repairs spec lists whose label/value lines got shifted during import
 *    and strips scraped boilerplate from descriptions
 *
 * Dry run by default (prints a report). Pass --apply to write.
 *   node scripts/organizeHardware.js
 *   node scripts/organizeHardware.js --apply
 *   node scripts/organizeHardware.js --show "RTX 3050"
 */
import dns from "node:dns";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Node on Windows sometimes can't resolve Atlas SRV records via the system
// resolver; public resolvers work reliably.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const APPLY = process.argv.includes("--apply");
// --show "<part of a title>" prints that product's description before/after.
const SHOW = process.argv.includes("--show") ? process.argv[process.argv.indexOf("--show") + 1] : "";

export const COMPONENTS_CATEGORY = "PC Components";
const SPEC_HEADER = "מפרט טכני:";

// Source category (as imported) -> productType under "PC Components".
const COMPONENT_TYPES = {
  "מעבדים": "CPU",
  "לוחות אם": "Motherboard",
  "זיכרונות RAM": "Memory (RAM)",
  "אחסון SSD ודיסקים קשיחים": "Internal Storage",
  "כרטיסי מסך": "Graphics Card",
  "מארזים": "PC Case",
  "ספקי כוח": "Power Supply",
  "קירור ומאווררים": "Cooling",
  "אביזרים לבניית מחשב": "PC Building Accessory",
};
const TYPE_TO_SOURCE = Object.fromEntries(Object.entries(COMPONENT_TYPES).map(([he, type]) => [type, he]));

// ---------------------------------------------------------------------------
// Description parsing / repair
// ---------------------------------------------------------------------------

const JUNK_LINE = /כל הזכויות שמורות|morlevi|מור לוי/i;

function splitFirst(line) {
  const i = line.indexOf(":");
  return i < 0 ? [line.trim(), ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
}

function splitLast(line) {
  const i = line.lastIndexOf(":");
  return i < 0 ? [line.trim(), ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
}

function parseDescription(description = "") {
  const [introPart, specPart = ""] = description.split(SPEC_HEADER);
  const lines = specPart
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !JUNK_LINE.test(line));
  return { intro: introPart.trim(), lines };
}

/**
 * During import, a spec with an empty value made every following line read
 * "<previous value>: <next label>". From the first such line on, re-pair the
 * tokens: the label that lost its value is dropped, the rest line up again.
 */
function repairSpecLines(lines, knownLabels) {
  const shiftAt = lines.findIndex((line) => {
    const [, value] = splitFirst(line);
    return value && knownLabels.has(value);
  });
  if (shiftAt < 0) return { pairs: lines.map(splitFirst), repaired: false };

  const pairs = lines.slice(0, shiftAt).map(splitFirst);
  const [, firstLabel] = splitFirst(lines[shiftAt]);
  const tokens = [firstLabel];
  lines.slice(shiftAt + 1).forEach((line) => tokens.push(...splitLast(line)));
  for (let i = 0; i + 1 < tokens.length; i += 2) pairs.push([tokens[i], tokens[i + 1]]);
  return { pairs, repaired: true };
}

function cleanPairs(pairs) {
  const seen = new Set();
  return pairs.filter(([label, value]) => {
    if (!label || !value || JUNK_LINE.test(label) || JUNK_LINE.test(value)) return false;
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

function buildDescription(intro, pairs) {
  const specText = pairs.map(([label, value]) => `${label}: ${value}`).join("\n");
  return specText ? `${intro}\n\n${SPEC_HEADER}\n${specText}` : intro;
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

// [canonical brand, pattern] — first match by position in the title wins.
const BRANDS = [
  ["Gigabyte", /gigabyte|aorus/i],
  ["Cooler Master", /cooler\s*master|coolermaster|\bCM\b/i],
  ["DeepCool", /deep\s*cool/i],
  ["Corsair", /corsair|corasir/i],
  ["Antec", /antec|אנטק/i],
  ["Kingston", /kingston/i],
  ["Crucial", /crucial/i],
  ["KLEVV", /klevv/i],
  ["ADATA", /adata/i],
  ["Netac", /netac/i],
  ["Lexar", /lexar/i],
  ["Samsung", /samsung/i],
  ["Seagate", /seagate/i],
  ["Western Digital", /western\s*digital|\bWD\b/i],
  ["SanDisk", /sandisk/i],
  ["Toshiba", /toshiba/i],
  ["PNY", /\bPNY\b/i],
  ["SAMA", /\bSAMA\b/i],
  ["Chenbro", /chenbro/i],
  ["Noctua", /noctua/i],
  ["Lenovo", /lenovo/i],
  ["ASUS", /\basus\b/i],
  ["HP", /\bHP\b/],
  ["Dell", /\bdell\b/i],
  ["Solid", /\bsolid\b/i],
  ["Intel", /\bintel\b/i],
  ["AMD", /\bAMD\b/i],
  ["NVIDIA", /nvidia/i],
];

function detectBrand(title) {
  let best = null;
  for (const [brand, pattern] of BRANDS) {
    const match = pattern.exec(title);
    if (match && (!best || match.index < best.index)) best = { brand, index: match.index };
  }
  return best?.brand || "";
}

// ---------------------------------------------------------------------------
// Attribute extraction
// ---------------------------------------------------------------------------

const num = (value) => {
  const match = /(\d+(?:\.\d+)?)/.exec(value || "");
  return match ? Number(match[1]) : null;
};

const sizeLabel = (gb) => (gb >= 1000 ? `${+(gb / 1000).toFixed(1)}TB` : `${gb}GB`);

function normalizeSocket(value = "", title = "") {
  const text = `${value} ${title}`;
  if (/AM5/i.test(text)) return "AM5";
  if (/AM4/i.test(text)) return "AM4";
  const lga = /LGA\s*-?\s*(\d{4})/i.exec(text);
  return lga ? `LGA${lga[1]}` : "";
}

function cpuSeries(value = "", title = "") {
  const text = `${value} ${title}`;
  let m = /core\s*ultra\s*(\d)/i.exec(text);
  if (m) return `Core Ultra ${m[1]}`;
  m = /\b(?:intel\s*|core\s*)?i([3579])\b|\bi([3579])-\d/i.exec(text);
  if (m) return `Core i${m[1] || m[2]}`;
  m = /ryzen\s*(?:r)?([3579])/i.exec(text);
  if (m) return `Ryzen ${m[1]}`;
  return "";
}

function cpuCores(value = "", title = "") {
  const hybrid = /preformance\s*(\d+)\D+(\d+)/i.exec(value);
  if (hybrid) return String(Number(hybrid[1]) + Number(hybrid[2]));
  if (/^\d+$/.test(value.trim())) return value.trim();
  const fromTitle = /(\d+)\s*cores?/i.exec(title);
  return fromTitle ? fromTitle[1] : "";
}

function chipset(value = "", title = "") {
  const fromValue = /\b([ABHXZ]\d{3}E?)\b/i.exec(value);
  if (fromValue) return fromValue[1].toUpperCase();
  const fromTitle = /\b([ABHXZ]\d{3}E?)M?\b/i.exec(title);
  return fromTitle ? fromTitle[1].toUpperCase() : "";
}

function formFactor(value = "", title = "") {
  const text = `${value} ${title}`;
  if (/mini[\s-]*itx/i.test(text)) return "Mini-ITX";
  if (/micro[\s-]*atx|m-atx|\bmatx\b/i.test(text)) return "Micro-ATX";
  if (/\bE-?ATX\b/i.test(text)) return "E-ATX";
  if (/\bATX\b/i.test(text)) return "ATX";
  // Gigabyte names micro-ATX boards "<chipset>M ..." (e.g. B650M).
  if (/\b[ABHXZ]\d{3}E?M\b/i.test(title)) return "Micro-ATX";
  return "";
}

function memoryType(value = "", title = "") {
  const m = /DDR([45])/i.exec(`${value} ${title}`);
  return m ? `DDR${m[1]}` : "";
}

function wifi(value = "", title = "") {
  if (value && !/ללא/.test(value)) {
    if (/wi-?fi\s*7|be20|be\b|7\b/i.test(value)) return "Wi-Fi 7";
    if (/6E/i.test(value)) return "Wi-Fi 6E";
    if (/wi-?fi\s*6|ax\b/i.test(value)) return "Wi-Fi 6";
    return "Wi-Fi";
  }
  if (/wi-?fi\s*7|wifi7|\bWF7\b/i.test(title)) return "Wi-Fi 7";
  if (/wi-?fi\s*6e|wifi6e|\bWF6E\b/i.test(title)) return "Wi-Fi 6E";
  if (/wi-?fi|\bWF\d?\b|\bAX\b/i.test(title)) return "Wi-Fi";
  return "No Wi-Fi";
}

function ramModules(value = "", title = "") {
  const kit = /(\d)\s*x\s*(\d+)/i.exec(value) || /(\d)\s*x\s*(\d+)\s*GB/i.exec(title);
  if (kit) return `${kit[1]}x${kit[2]}GB`;
  const single = num(value) || num(/(\d+)\s*GB/i.exec(title)?.[0]);
  return single ? `1x${single}GB` : "";
}

function ramCapacity(value = "", title = "") {
  const modules = ramModules(value, title);
  const m = /(\d)x(\d+)GB/.exec(modules);
  return m ? `${Number(m[1]) * Number(m[2])}GB` : "";
}

function ramSpeed(value = "", title = "") {
  const speed = num(value) || num(/(\d{4})\s*MHZ/i.exec(title)?.[1]) || num(/DDR[45]\s+(\d{4})\b/i.exec(title)?.[1]);
  return speed ? `${speed}MHz` : "";
}

function storageType(spec, title) {
  if (spec["סל\"ד RPM"] || /דיסק קשיח|\bHDD\b|ironwolf|barracuda|skyhawk|\bWD (red|purple|blue)\b/i.test(title)) return "HDD";
  if (/nvme|pci/i.test(`${spec["ממשק"] || ""} ${title}`)) return "NVMe SSD";
  return "SATA SSD";
}

function pcieGen(spec, title) {
  const m = /(?:pci-?express|pcie)\s*(?:gen\s*)?([345])\.0/i.exec(`${spec["ממשק"] || ""} ${title}`) ||
    /gen\s*([345])\b/i.exec(title);
  return m ? `PCIe ${m[1]}.0` : "";
}

function capacityFromValue(value = "", title = "") {
  const tb = /(\d+(?:\.\d+)?)\s*TB/i.exec(value) || /(\d+(?:\.\d+)?)\s*TB/i.exec(title);
  if (tb) return `${+tb[1]}TB`;
  const gb = /(\d+)\s*GB/i.exec(value) || /(\d+)\s*GB/i.exec(title);
  return gb ? sizeLabel(Number(gb[1])) : "";
}

function gpuModel(value = "", title = "") {
  const text = `${value} ${title}`.replace(/™|®/g, "");
  let m = /\bRTX\s*PRO\s*(\d{4})/i.exec(text);
  if (m) return `RTX PRO ${m[1]}`;
  m = /\b(?:RTX|AMPER\w*)\s*A(\d{3,4})\b/i.exec(text);
  if (m) return `RTX A${m[1]}`;
  m = /\bRTX\s*(\d{4})\s*(Ti)?/i.exec(text);
  if (m) return `RTX ${m[1]}${m[2] ? " Ti" : ""}`;
  m = /\bRX\s*(\d{4})\s*(XT)?/i.exec(text);
  if (m) return `RX ${m[1]}${m[2] ? " XT" : ""}`;
  m = /\bGT\s*(\d{4})/i.exec(text);
  if (m) return `GT ${m[1]}`;
  m = /quadro\s*(\w+)/i.exec(text);
  if (m) return `Quadro ${m[1].toUpperCase()}`;
  return "";
}

function gpuChipset(model) {
  if (/^RX/.test(model)) return "AMD";
  return model ? "NVIDIA" : "";
}

function caseSize(value = "", title = "") {
  const text = `${value} ${title}`;
  if (/full\s*tower/i.test(text)) return "Full Tower";
  if (/mini\s*tower/i.test(text)) return "Mini Tower";
  if (/slim/i.test(text)) return "Slim";
  if (/mid\s*tower/i.test(text)) return "Mid Tower";
  return "";
}

function boardSupport(value = "") {
  if (/E-ATX|XL-ATX/i.test(value)) return "E-ATX";
  if (/(^|[^-\w])ATX/i.test(value)) return "ATX";
  if (/micro-ATX/i.test(value)) return "Micro-ATX";
  if (/mini-ITX/i.test(value)) return "Mini-ITX";
  return "";
}

function color(value = "", title = "") {
  if (/לבן|white/i.test(`${value} ${title}`)) return "White";
  if (/שחור|black/i.test(`${value} ${title}`)) return "Black";
  return value ? "Other" : "";
}

function efficiency(value = "", title = "") {
  const m = /(white|bronze|silver|gold|platinum|titanium)/i.exec(`${value} ${title}`);
  return m ? `80+ ${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()}` : "";
}

function coolingType(title) {
  if (/נוזלי|liquid|\bAIO\b|waterforce|ק\.נוזלי/i.test(title)) return "Liquid Cooler";
  if (/hub|splitter|מפצל|adapter|מתאם/i.test(title)) return "Cooling Accessory";
  if (/למארז|case fan|3\s*pack|3PK/i.test(title)) return "Case Fan";
  if (/למעבד|cpu|air cooler|קירור אוויר|tdp|noctua|hyper|\bAK\d/i.test(title)) return "CPU Air Cooler";
  if (/מאוורר|מאורר|fan/i.test(title)) return "Case Fan";
  return "Cooling Accessory";
}

function accessoryType(title) {
  if (/זכוכית|פנל|צד ימין|panel|glass/i.test(title)) return "Case Panel";
  if (/תומך|bracket|holder|support/i.test(title)) return "GPU Support";
  if (/כרטיס הרחבה|adapter.*m\.2|m\.2.*adapter/i.test(title)) return "Expansion Card";
  if (/כבל|מתאם|מפצל|cable|adapter|molex|splitter/i.test(title)) return "Cables & Adapters";
  return "Other";
}

function screenSize(value = "") {
  const inches = num(value);
  if (!inches) return "";
  const rounded = Math.round(inches);
  return `${rounded}"`;
}

function laptopScreenSize(value = "") {
  const inches = num(value);
  if (!inches) return "";
  return `${Number.isInteger(inches) ? inches : inches.toFixed(1)}"`;
}

function resolution(value = "") {
  const m = /(\d{3,4})\s*x\s*(\d{3,4})/i.exec(value);
  if (!m) return "";
  const key = `${m[1]}x${m[2]}`;
  return (
    {
      "1920x1080": "Full HD (1080p)",
      "2560x1440": "QHD (1440p)",
      "3840x2160": "4K UHD",
      "3440x1440": "UWQHD (3440x1440)",
      "5120x1440": "DQHD (5120x1440)",
    }[key] || key
  );
}

function refreshRate(value = "") {
  const base = value.replace(/\([^)]*\)/g, "");
  const rates = (base.match(/\d+/g) || []).map(Number).filter((n) => n >= 50);
  return rates.length ? `${Math.max(...rates)}Hz` : "";
}

function panelType(value = "") {
  if (/QD-?OLED/i.test(value)) return "QD-OLED";
  if (/OLED/i.test(value)) return "OLED";
  if (/IPS/i.test(value)) return "IPS";
  if (/VA/i.test(value)) return "VA";
  if (/TN/i.test(value)) return "TN";
  return "";
}

// Laptop specs, in the same short format the Gaming PCs already use.
function laptopSpecs(spec) {
  const cpuText = (spec["מעבד"] || "").replace(/®|™|Processor/g, "").replace(/\s+/g, " ").trim();
  const cpuBrand = /amd|ryzen|athlon/i.test(cpuText) ? "AMD" : /intel|core/i.test(cpuText) ? "Intel" : "";
  const cpu = cpuText.replace(/^(intel|amd)\s+/i, "").trim();
  const gpuModelName = gpuModel(spec["מאיץ גרפי"] || "");
  const ram = /(\d+)\s*GB/i.exec(spec["נפח זיכרון"] || "");
  const storageMatch = /(\d+)\s*(TB|GB)?/i.exec(spec["אחסון ראשי"] || "");
  let storage = "";
  if (storageMatch) {
    const unit = (storageMatch[2] || "GB").toUpperCase();
    storage = `${storageMatch[1]}${unit}`;
  }
  return {
    cpuBrand,
    cpu,
    gpu: gpuModelName || (spec["מאיץ גרפי"] ? "Integrated" : ""),
    ram: ram ? `${ram[1]}GB` : "",
    storage,
  };
}

function laptopOs(value = "") {
  if (/windows\s*11\s*pro/i.test(value)) return "Windows 11 Pro";
  if (/windows/i.test(value)) return "Windows 11 Home";
  if (/linux|ubuntu/i.test(value)) return "Linux";
  if (/dos/i.test(value)) return "No OS (FreeDOS)";
  return "";
}

function extractAttributes(productType, spec, title) {
  const s = (label) => spec[label] || "";
  switch (productType) {
    case "CPU":
      return {
        cpuSeries: cpuSeries(s("סוג מעבד"), title),
        socket: normalizeSocket(s("תושבת מעבד"), title),
        cores: cpuCores(s("ליבות"), title),
        igpu: s("ליבה גרפית") ? (/ללא/.test(s("ליבה גרפית")) ? "No" : "Yes") : /no gpu|\b\d+F\b/i.test(title) ? "No" : "",
      };
    case "Motherboard":
      return {
        socket: normalizeSocket(s("תושבת"), title),
        chipset: chipset(s("ערכת שבבים"), title),
        formFactor: formFactor(s("גודל לוח"), title),
        memoryType: memoryType(s("סוג זכרון"), title),
        wifi: wifi(s("WIFI"), title),
      };
    case "Memory (RAM)":
      return {
        memoryType: memoryType(s("סוג זכרון"), title),
        capacity: ramCapacity(s("נפח"), title),
        modules: ramModules(s("נפח"), title),
        speed: ramSpeed(s("תדר שעון"), title),
      };
    case "Internal Storage": {
      const type = storageType(spec, title);
      return {
        storageType: type,
        capacity: capacityFromValue(s("נפח"), title),
        pcieGen: type === "NVMe SSD" ? pcieGen(spec, title) : "",
      };
    }
    case "Graphics Card": {
      const model = gpuModel(s("מנוע גרפי"), title);
      return {
        gpuChipset: gpuChipset(model),
        gpuModel: model,
        vram: capacityFromValue(s("זיכרון"), ""),
      };
    }
    case "PC Case":
      return {
        caseSize: caseSize(s("תצורה"), title),
        boardSupport: boardSupport(s("גודל לוח נתמך")),
        color: color(s("צבע מארז"), title),
      };
    case "Power Supply":
      return {
        wattage: num(s("WATT")) ? `${num(s("WATT"))}W` : "",
        efficiency: efficiency(s("תקנים"), title),
        atxVersion: /3\.1/.test(s("תקן ATX")) ? "ATX 3.1" : /3\.0/.test(s("תקן ATX")) ? "ATX 3.0" : "",
      };
    case "Cooling": {
      const type = coolingType(title);
      const radiator = /\b(240|280|360|420)\b/.exec(`${s("גודל רדיאטור במ\"מ")} ${title}`);
      return {
        coolingType: type,
        radiatorSize: type === "Liquid Cooler" && radiator ? `${radiator[1]}mm` : "",
        color: color("", title),
      };
    }
    case "PC Building Accessory":
      return { accessoryType: accessoryType(title) };
    case "Monitor":
      return {
        screenSize: screenSize(s("גודל מסך")),
        resolution: resolution(s("רזולוציה")),
        refreshRate: refreshRate(s("קצב רענון")),
        panelType: panelType(s("סוג פנל")),
        screenShape: /קעור/.test(s("צורת מסך")) ? "Curved" : s("צורת מסך") ? "Flat" : "",
      };
    case "Laptop":
      return {
        screenSize: laptopScreenSize(s("גודל מסך")),
        os: laptopOs(s("מערכת הפעלה")),
      };
    default:
      return {};
  }
}

const toAttributeList = (attrs) =>
  Object.entries(attrs)
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value }));

// ---------------------------------------------------------------------------

function classify(product) {
  if (COMPONENT_TYPES[product.category]) return COMPONENT_TYPES[product.category];
  if (product.category === COMPONENTS_CATEGORY) return product.productType;
  if (product.category === "Monitors & Desk Setup") return "Monitor";
  if (product.category === "Laptops") return "Laptop";
  return "";
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  // The imported batch: everything whose images come from the supplier feed,
  // plus anything already moved under "PC Components" (re-runs are safe).
  const products = await Product.find({
    automationLocked: { $ne: true },
    $or: [
      { images: { $elemMatch: { $regex: "morlevi\\.co\\.il" } }, createdAt: { $gte: new Date("2026-11-07") } },
      { category: COMPONENTS_CATEGORY },
    ],
  }).lean();

  // Labels seen in each source group, used to detect shifted spec lines.
  // Shifted lists put values ("3 שנים") in the label slot, so a label only
  // counts when it shows up as a label more often than as a value.
  const statsByType = {};
  products.forEach((product) => {
    const type = classify(product);
    const { lines } = parseDescription(product.description);
    const stats = (statsByType[type] ??= { labels: new Map(), values: new Map() });
    lines.forEach((line) => {
      const [label, value] = splitFirst(line);
      stats.labels.set(label, (stats.labels.get(label) || 0) + 1);
      if (value) stats.values.set(value, (stats.values.get(value) || 0) + 1);
    });
  });
  const knownLabels = Object.fromEntries(
    Object.entries(statsByType).map(([type, { labels, values }]) => [
      type,
      new Set(
        [...labels]
          .filter(([label, n]) => n >= 3 && n > (values.get(label) || 0) && !/^\d/.test(label))
          .map(([label]) => label)
      ),
    ])
  );

  const ops = [];
  const report = { repaired: [], junkRemoved: 0, noBrand: [], missingAttrs: {}, byType: {} };

  for (const product of products) {
    const productType = classify(product);
    if (!productType) continue;

    const { intro, lines } = parseDescription(product.description);
    const hadJunk = JUNK_LINE.test(product.description);
    const { pairs: rawPairs, repaired } = repairSpecLines(lines, knownLabels[productType] || new Set());
    const pairs = cleanPairs(rawPairs);
    const spec = Object.fromEntries(pairs);
    const title = product.title.replace(/\s+/g, " ").trim();
    const attrs = extractAttributes(productType, spec, title);

    // A repaired CPU can lose its core count; the title still states it.
    if (productType === "CPU" && !spec["ליבות"] && attrs.cores) {
      const at = pairs.findIndex(([label]) => label === "תדר שעון מקסימלי");
      pairs.splice(at < 0 ? pairs.length : at + 1, 0, ["ליבות", attrs.cores]);
    }
    const description = buildDescription(intro.replace(/\s+/g, " ").trim() || title, pairs);
    const isComponent = Boolean(TYPE_TO_SOURCE[productType]);
    const brand = detectBrand(title) || product.brand || "";

    const update = {
      title,
      description,
      brand,
      productType,
      subCategory: "",
      attributes: toAttributeList(attrs),
    };
    if (isComponent) update.category = COMPONENTS_CATEGORY;
    if (productType === "Laptop") update.specs = laptopSpecs(spec);

    if (SHOW && title.toLowerCase().includes(SHOW.toLowerCase())) {
      console.log(`\n----- ${title}\nBEFORE:\n${product.description}\n\nAFTER:\n${description}\n`, attrs);
    }

    report.byType[productType] = (report.byType[productType] || 0) + 1;
    if (repaired) report.repaired.push(title);
    if (hadJunk) report.junkRemoved++;
    if (!brand) report.noBrand.push(title);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value) return;
      // Optional by nature: only some products have these.
      if (["pcieGen", "radiatorSize", "atxVersion", "color"].includes(key)) return;
      (report.missingAttrs[`${productType}.${key}`] ??= []).push(title);
    });

    ops.push({ updateOne: { filter: { _id: product._id, automationLocked: { $ne: true } }, update: { $set: update } }, preview: { title, productType, brand, attrs, specs: update.specs } });
  }

  // ---- report ----
  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — ${ops.length} products\n`);
  console.log("By type:", report.byType);
  console.log(`\nRepaired shifted spec lists (${report.repaired.length}):`);
  report.repaired.forEach((t) => console.log("  -", t));
  console.log(`\nDescriptions with scraped copyright line removed: ${report.junkRemoved}`);
  console.log(`\nNo brand detected (${report.noBrand.length}):`);
  report.noBrand.forEach((t) => console.log("  -", t));
  console.log("\nMissing attribute values:");
  Object.entries(report.missingAttrs).forEach(([key, titles]) => {
    console.log(`  ${key}: ${titles.length}`);
    titles.slice(0, 5).forEach((t) => console.log("     ·", t));
  });

  // Value distribution per type/attribute, to eyeball the filters.
  const dist = {};
  ops.forEach(({ preview }) => {
    Object.entries({ brand: preview.brand, ...preview.attrs, ...(preview.specs || {}) }).forEach(([key, value]) => {
      if (!value) return;
      const bucket = (dist[`${preview.productType}.${key}`] ??= {});
      bucket[value] = (bucket[value] || 0) + 1;
    });
  });
  console.log("\nFilter values:");
  Object.entries(dist).forEach(([key, values]) => {
    const list = Object.entries(values)
      .sort((a, b) => b[1] - a[1])
      .map(([value, n]) => `${value}(${n})`)
      .join(" | ");
    console.log(`  ${key}: ${list}`);
  });

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to write these changes.");
    await mongoose.disconnect();
    return;
  }

  const result = await Product.bulkWrite(ops.map(({ updateOne }) => ({ updateOne })));
  console.log("\nUpdated products:", result.modifiedCount);

  // Keep the categories collection in sync: add the new one, drop the
  // Hebrew source categories once no product uses them.
  await Category.updateOne(
    { nameLower: COMPONENTS_CATEGORY.toLowerCase() },
    { $setOnInsert: { name: COMPONENTS_CATEGORY, nameLower: COMPONENTS_CATEGORY.toLowerCase() } },
    { upsert: true }
  );
  for (const name of Object.keys(COMPONENT_TYPES)) {
    if (!(await Product.exists({ category: name }))) await Category.deleteOne({ nameLower: name.toLowerCase() });
  }
  console.log("Categories updated.");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("organizeHardware failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
