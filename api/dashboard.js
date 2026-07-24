const { readData, validateData, verifyToken, writeData } = require("./_shared");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  try {
    if (req.method === "GET") {
      return res.status(200).json({ data: await readData(), syncedAt: new Date().toISOString() });
    }
    if (req.method === "POST") {
      const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (!verifyToken(token)) return res.status(401).json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
      const clean = validateData(req.body?.data);
      if (!clean) return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบเดือนและตัวเลข" });
      await writeData(clean);
      return res.status(200).json({ data: clean, syncedAt: new Date().toISOString() });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    const message = error.message === "STORAGE_NOT_CONFIGURED"
      ? "ยังไม่ได้เชื่อมต่อฐานข้อมูล Upstash Redis"
      : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
    return res.status(503).json({ error: message });
  }
};
