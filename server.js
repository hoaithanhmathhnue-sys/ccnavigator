// Máy chủ chạy thử trên máy cá nhân (không dùng khi triển khai Vercel): node server.js
const http = require("http"), fs = require("fs"), path = require("path");
try { fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m && !l.trim().startsWith("#") && !process.env[m[1]]) process.env[m[1]] = m[2]; }); } catch (e) { /* không có .env */ }
const handler = require("./api/chat.js");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/api/chat") {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > 50000) req.destroy(); });
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
      res.status = (c) => { res.statusCode = c; return res; };
      res.json = (o) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(o)); };
      handler(req, res);
    });
    return;
  }
  let file = path.join(__dirname, url === "/" ? "index.html" : url);
  if (!file.startsWith(__dirname) || /[\\/](api|scripts|node_modules)[\\/]|\.env/.test(file)) { res.statusCode = 403; return res.end("Forbidden"); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream"); res.end(buf);
  });
}).listen(PORT, () => console.log("CC-Navigator chạy tại http://localhost:" + PORT));
