const { SERVICE_SECTIONS, readServices, validateServices, verifyToken, writeServices } = require("./_shared");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        sections: SERVICE_SECTIONS,
        services: await readServices(),
        syncedAt: new Date().toISOString()
      });
    }

    if (req.method === "POST") {
      const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (!verifyToken(token)) return res.status(401).json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });

      const clean = validateServices(req.body?.services);
      if (!clean) return res.status(400).json({ error: "ข้อมูลบริการไม่ถูกต้อง กรุณาตรวจสอบเดือนและตัวเลขอีกครั้ง" });

      await writeServices(clean);
      return res.status(200).json({
        sections: SERVICE_SECTIONS,
        services: clean,
        syncedAt: new Date().toISOString()
      });
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
