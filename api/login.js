const crypto = require("crypto");
const { createToken } = require("./_shared");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(503).json({ error: "ระบบยังไม่ได้ตั้งค่าบัญชีแอดมิน" });
  }
  const supplied = Buffer.from(String(req.body?.password || ""));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD);
  const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  if (!valid) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
  return res.status(200).json({ token: createToken(), expiresIn: 28800 });
};
