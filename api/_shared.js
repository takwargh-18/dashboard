const crypto = require("crypto");

const DEFAULT_DATA = [
  { m: "ก.พ. 69", opd: 3238, er: 1261, ipd: 211, lr: 2, death: 1, refer: 120, dental: 496, physical: 210, thai: 126 },
  { m: "มี.ค. 69", opd: 2840, er: 1242, ipd: 209, lr: 2, death: 4, refer: 118, dental: 396, physical: 266, thai: 134 },
  { m: "เม.ย. 69", opd: 2624, er: 1176, ipd: 257, lr: 2, death: 3, refer: 90, dental: 361, physical: 192, thai: 113 },
  { m: "พ.ค. 69", opd: 3453, er: 1078, ipd: 236, lr: 9, death: 1, refer: 122, dental: 412, physical: 208, thai: 101 },
  { m: "มิ.ย. 69", opd: 3194, er: 1424, ipd: 346, lr: 5, death: 0, refer: 127, dental: 444, physical: 221, thai: 100 }
];

const METRICS = ["opd", "er", "ipd", "lr", "death", "refer", "dental", "physical", "thai"];

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

async function readData() {
  try {
    const stored = await redis(["GET", "hospital:dashboard:data"]);
    return stored ? JSON.parse(stored) : DEFAULT_DATA;
  } catch (error) {
    if (error.message === "STORAGE_NOT_CONFIGURED") return DEFAULT_DATA;
    throw error;
  }
}

async function writeData(data) {
  await redis(["SET", "hospital:dashboard:data", JSON.stringify(data)]);
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

function validateData(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 60) return null;
  const months = new Set();
  const clean = [];
  for (const row of input) {
    const m = String(row.m || "").trim().slice(0, 30);
    if (!m || months.has(m)) return null;
    months.add(m);
    const next = { m };
    for (const key of METRICS) {
      const value = Number(row[key]);
      if (!Number.isInteger(value) || value < 0 || value > 10000000) return null;
      next[key] = value;
    }
    clean.push(next);
  }
  return clean;
}

module.exports = { DEFAULT_DATA, METRICS, createToken, readData, validateData, verifyToken, writeData };
