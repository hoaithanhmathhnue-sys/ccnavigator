// Vercel Serverless Function – trợ lý AI dùng khóa của máy chủ (tùy chọn).
// Người dùng tự nhập khóa thì trình duyệt gọi thẳng Google, không đi qua đây (xem js/ai.js).
// Khóa máy chủ chỉ nằm trong biến môi trường của Vercel, KHÔNG bao giờ gửi xuống trình duyệt.
//   GEMINI_API_KEY  (khuyến nghị)  + GEMINI_MODEL (tùy chọn, được thử trước chuỗi model dự phòng)
//   hoặc OPENAI_API_KEY + OPENAI_MODEL (mặc định gpt-4o-mini)
//
// Trình duyệt chỉ gửi mã bài, phương án chọn, lời giải thích và số lần thử. Đề bài, đáp án và
// kết quả đúng/sai do máy chủ tự tra trong js/data.js, nên điểm cuối này không dùng được
// như một cổng gọi AI tự do bằng khóa của giáo viên.

const { EXERCISES } = require("../js/data.js");
const { SYSTEM_PROMPT, displayOrder, buildUserMessage, callGemini, errorText } = require("../js/ai.js");

async function callOpenAI(userMsg) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.OPENAI_API_KEY },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 500,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }]
    })
  });
  if (!r.ok) throw new Error("OpenAI " + r.status);
  const j = await r.json();
  return { text: j?.choices?.[0]?.message?.content || "", model: process.env.OPENAI_MODEL || "gpt-4o-mini" };
}

// Chỉ nhận yêu cầu từ chính trang web của ứng dụng.
function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === (req.headers["x-forwarded-host"] || req.headers.host); }
  catch (e) { return false; }
}

// Giới hạn theo IP trong từng phiên bản hàm (chỉ chặn được phần lớn lạm dụng). Ngưỡng cao vì cả lớp dùng chung một IP.
const RATE_MAX = 120, RATE_WINDOW = 60000, hits = new Map();
function limited(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
  const now = Date.now();
  if (hits.size > 2000) hits.clear();
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { n: 1, reset: now + RATE_WINDOW }); return false; }
  return ++h.n > RATE_MAX;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const provider = process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : null;

  if (req.method === "GET") return res.status(200).json({ ai: !!provider });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!provider) return res.status(503).json({ error: "Chưa cấu hình khóa API trên máy chủ." });
  if (!sameOrigin(req)) return res.status(403).json({ error: "Không được phép." });
  if (limited(req)) return res.status(429).json({ error: "Quá nhiều yêu cầu, hệ thống dùng phản hồi dự phòng." });

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
  catch (e) { return res.status(400).json({ error: "Dữ liệu không hợp lệ." }); }
  const ex = EXERCISES.find((e) => e.id === body.exId), choice = body.choice;
  if (!ex || !Number.isInteger(choice) || !ex.options[choice]) return res.status(400).json({ error: "Dữ liệu không hợp lệ." });

  try {
    const userMsg = buildUserMessage(ex, displayOrder(body.perm, ex.options.length), choice, body);
    const result = provider === "gemini"
      ? await callGemini({ apiKey: process.env.GEMINI_API_KEY, userMsg, preferred: process.env.GEMINI_MODEL })
      : await callOpenAI(userMsg);
    const reply = result.text.trim();
    if (!reply) throw new Error("empty");
    return res.status(200).json({ reply: reply.slice(0, 1500), model: result.model });
  } catch (e) {
    console.error("AI error:", e.code || e.message); // chỉ ghi mã lỗi, không ghi nội dung bài làm
    return res.status(502).json({ error: errorText(e.code, false), code: e.code || "UNKNOWN" });
  }
};
