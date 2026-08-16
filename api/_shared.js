const crypto = require("crypto");

const STORAGE_KEY = "hospital:dashboard:admin-data";
const LEGACY_DASHBOARD_KEY = "hospital:dashboard:data";

const DEFAULT_DATA = [
  { m: "ก.พ. 69", opd: 3238, er: 1261, ipd: 211, lr: 2, death: 1, refer: 120, dental: 496, physical: 210, thai: 126 },
  { m: "มี.ค. 69", opd: 2840, er: 1242, ipd: 209, lr: 2, death: 4, refer: 118, dental: 396, physical: 266, thai: 134 },
  { m: "เม.ย. 69", opd: 2624, er: 1176, ipd: 257, lr: 2, death: 3, refer: 90, dental: 361, physical: 192, thai: 113 },
  { m: "พ.ค. 69", opd: 3453, er: 1078, ipd: 236, lr: 9, death: 1, refer: 122, dental: 412, physical: 208, thai: 101 },
  { m: "มิ.ย. 69", opd: 3194, er: 1424, ipd: 346, lr: 5, death: 0, refer: 127, dental: 444, physical: 221, thai: 100 }
];

const METRICS = ["opd", "er", "ipd", "lr", "death", "refer", "dental", "physical", "thai"];

const SERVICE_SECTIONS = [
  {
    id: "physical",
    title: "จำนวนบริการกายภาพบำบัด",
    shortTitle: "กายภาพบำบัด",
    columns: [
      { key: "jointMobilization", label: "การดัดดึงข้อต่อ" },
      { key: "ultrasoundTherapy", label: "การรักษาด้วยคลื่นเสียง" },
      { key: "electricalStimulation", label: "การกระตุ้นด้วยกระแสไฟฟ้า" },
      { key: "paraffinBath", label: "การแช่พาราฟิน" },
      { key: "pelvicTraction", label: "การดึงหลังด้วยเครื่อง(Pelvic Traction)" },
      { key: "acupressureMassage", label: "การกดจุดและการนวด(Acupressure& Massage)" },
      { key: "cervicalTraction", label: "การดึงคอด้วยเครื่อง(Cervical Traction)" },
      { key: "passiveMovement", label: "Passive Movement" },
      { key: "homeProgramEducation", label: "สอนญาติและผู้ป่วยปฏิบัติตนที่บ้าน" },
      { key: "heatCompress", label: "การประคบด้วยแผ่นความร้อน" }
    ]
  },
  {
    id: "thai",
    title: "จำนวนบริการแพทย์แผนไทย",
    shortTitle: "แพทย์แผนไทย",
    columns: [
      { key: "herbalMedicine", label: "จ่ายยาสมุนไพร" },
      { key: "herbalMassageCompress", label: "นวดและประคบสมุนไพร" },
      { key: "herbalSteam", label: "อบไอน้ำสมุนไพร" },
      { key: "kneePoultice", label: "พอกเข่า" },
      { key: "postpartumProcedureKit", label: "ชุดหัตถการสำหรับแม่หลังคลอด" }
    ]
  }
];

const SERVICE_KEYS = Object.fromEntries(
  SERVICE_SECTIONS.map(section => [section.id, section.columns.map(column => column.key)])
);

const DEFAULT_SERVICES = {
  physical: [
    {
      m: "ก.พ. 69",
      jointMobilization: 203,
      ultrasoundTherapy: 207,
      electricalStimulation: 68,
      paraffinBath: 14,
      pelvicTraction: 201,
      acupressureMassage: 203,
      cervicalTraction: 21,
      passiveMovement: 81,
      homeProgramEducation: 210,
      heatCompress: 195
    },
    {
      m: "มี.ค. 69",
      jointMobilization: 252,
      ultrasoundTherapy: 254,
      electricalStimulation: 68,
      paraffinBath: 16,
      pelvicTraction: 252,
      acupressureMassage: 257,
      cervicalTraction: 20,
      passiveMovement: 100,
      homeProgramEducation: 261,
      heatCompress: 248
    },
    {
      m: "เม.ย. 69",
      jointMobilization: 177,
      ultrasoundTherapy: 168,
      electricalStimulation: 32,
      paraffinBath: 10,
      pelvicTraction: 150,
      acupressureMassage: 162,
      cervicalTraction: 9,
      passiveMovement: 75,
      homeProgramEducation: 164,
      heatCompress: 146
    },
    {
      m: "พ.ค. 69",
      jointMobilization: 103,
      ultrasoundTherapy: 46,
      electricalStimulation: 197,
      paraffinBath: 6,
      pelvicTraction: 57,
      acupressureMassage: 137,
      cervicalTraction: 18,
      passiveMovement: 190,
      homeProgramEducation: 146,
      heatCompress: 193
    },
    {
      m: "มิ.ย. 69",
      jointMobilization: 118,
      ultrasoundTherapy: 49,
      electricalStimulation: 217,
      paraffinBath: 7,
      pelvicTraction: 56,
      acupressureMassage: 151,
      cervicalTraction: 23,
      passiveMovement: 98,
      homeProgramEducation: 192,
      heatCompress: 192
    }
  ],
  thai: [
    {
      m: "ก.พ. 69",
      herbalMedicine: 94,
      herbalMassageCompress: 122,
      herbalSteam: 57,
      kneePoultice: 1,
      postpartumProcedureKit: 7
    },
    {
      m: "มี.ค. 69",
      herbalMedicine: 118,
      herbalMassageCompress: 138,
      herbalSteam: 85,
      kneePoultice: 1,
      postpartumProcedureKit: 5
    },
    {
      m: "เม.ย. 69",
      herbalMedicine: 76,
      herbalMassageCompress: 111,
      herbalSteam: 52,
      kneePoultice: 2,
      postpartumProcedureKit: 0
    },
    {
      m: "พ.ค. 69",
      herbalMedicine: 82,
      herbalMassageCompress: 94,
      herbalSteam: 65,
      kneePoultice: 2,
      postpartumProcedureKit: 10
    },
    {
      m: "มิ.ย. 69",
      herbalMedicine: 76,
      herbalMassageCompress: 94,
      herbalSteam: 61,
      kneePoultice: 0,
      postpartumProcedureKit: 6
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultStore() {
  return {
    dashboard: clone(DEFAULT_DATA),
    services: clone(DEFAULT_SERVICES)
  };
}

function env(nameA, nameB) {
  return process.env[nameA] || process.env[nameB];
}

function redisConfig() {
  return {
    url: env("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL"),
    token: env("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN")
  };
}

async function redis(command) {
  const { url, token } = redisConfig();
  if (!url || !token) throw new Error("STORAGE_NOT_CONFIGURED");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`STORAGE_${response.status}`);
  return (await response.json()).result;
}

function validateRows(input, keys, options = {}) {
  const { minRows = 1, maxRows = 60 } = options;
  if (!Array.isArray(input) || input.length < minRows || input.length > maxRows) return null;
  const months = new Set();
  const clean = [];
  for (const row of input) {
    const m = String(row.m || "").trim().slice(0, 30);
    if (!m || months.has(m)) return null;
    months.add(m);
    const next = { m };
    for (const key of keys) {
      const value = Number(row[key]);
      if (!Number.isInteger(value) || value < 0 || value > 10000000) return null;
      next[key] = value;
    }
    clean.push(next);
  }
  return clean;
}

function validateData(input) {
  return validateRows(input, METRICS);
}

function validateServices(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const clean = {};
  for (const section of SERVICE_SECTIONS) {
    const rows = validateRows(input[section.id], SERVICE_KEYS[section.id]);
    if (!rows) return null;
    clean[section.id] = rows;
  }
  return clean;
}

function normalizeStore(store = {}) {
  const fallback = defaultStore();
  const dashboard = validateData(store.dashboard) || fallback.dashboard;
  const services = validateServices(store.services) || fallback.services;
  return { dashboard, services };
}

async function readStore() {
  try {
    const stored = await redis(["GET", STORAGE_KEY]);
    if (stored) return normalizeStore(JSON.parse(stored));

    const fallback = defaultStore();
    const legacyDashboard = await redis(["GET", LEGACY_DASHBOARD_KEY]);
    if (!legacyDashboard) return fallback;

    const parsedLegacy = validateData(JSON.parse(legacyDashboard));
    if (parsedLegacy) fallback.dashboard = parsedLegacy;
    return fallback;
  } catch (error) {
    if (error.message === "STORAGE_NOT_CONFIGURED") return defaultStore();
    throw error;
  }
}

async function writeStore(store) {
  const clean = normalizeStore(store);
  await redis(["SET", STORAGE_KEY, JSON.stringify(clean)]);
}

async function readData() {
  return (await readStore()).dashboard;
}

async function writeData(data) {
  const store = await readStore();
  store.dashboard = data;
  await writeStore(store);
}

async function readServices() {
  return (await readStore()).services;
}

async function writeServices(services) {
  const store = await readStore();
  store.services = services;
  await writeStore(store);
}

function secret() {
  return process.env.SESSION_SECRET || "";
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token = "") {
  if (!secret() || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    return parsed.role === "admin" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

module.exports = {
  DEFAULT_DATA,
  DEFAULT_SERVICES,
  METRICS,
  SERVICE_SECTIONS,
  createToken,
  readData,
  readServices,
  validateData,
  validateServices,
  verifyToken,
  writeData,
  writeServices
};
