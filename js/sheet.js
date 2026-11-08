/* Kết nối Google Sheets (Apps Script Web App) – phân quyền Học sinh / Giáo viên & đồng bộ nhật ký */
(function (root) {
  "use strict";

  function isValidSheetUrl(url) {
    if (typeof url !== "string") return false;
    const s = url.trim();
    return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(s);
  }

  function normalizeSheetUrl(url) {
    if (typeof url !== "string") return "";
    return url.trim().replace(/\s+/g, "");
  }

  /* Gửi POST request dạng text/plain tới Google Apps Script để tránh lỗi CORS preflight OPTIONS */
  async function callSheet(url, payload, fetchImpl) {
    const cleanUrl = normalizeSheetUrl(url);
    if (!isValidSheetUrl(cleanUrl)) {
      const err = new Error("URL Web App chưa đúng định dạng (cần bắt đầu bằng https://script.google.com/macros/s/.../exec).");
      err.code = "INVALID_SHEET_URL";
      throw err;
    }
    const f = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
    if (!f) throw new Error("Trình duyệt không hỗ trợ fetch.");

    let res;
    try {
      res = await f(cleanUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload || {}),
        redirect: "follow"
      });
    } catch (e) {
      const err = new Error("Không kết nối được tới Google Sheet. Hãy kiểm tra mạng hoặc quyền truy cập 'Bất kỳ ai (Anyone)' khi triển khai Apps Script.");
      err.code = "NETWORK_ERROR";
      throw err;
    }

    const txt = await res.text();
    let data = null;
    try {
      data = JSON.parse(txt);
    } catch (e) {
      const err = new Error("Phản hồi từ Google Sheet không phải JSON. Hãy chắc chắn bạn đã chọn 'Ai có quyền truy cập: Bất kỳ ai (Anyone)' khi Triển khai ứng dụng web.");
      err.code = "INVALID_RESPONSE";
      throw err;
    }
    if (!res.ok || !data || data.ok === false) {
      const err = new Error((data && data.error) || "Lỗi từ Google Sheet.");
      err.code = "SHEET_ERROR";
      throw err;
    }
    return data;
  }

  /* Tạo ID duy nhất cho từng bản ghi nhật ký để chống trùng lặp khi đồng bộ nhiều lần */
  function makeLogId(rec) {
    if (rec && rec.id) return String(rec.id);
    const r = rec || {};
    return [
      r.ts || "",
      (r.username || r.student || "hs").toLowerCase(),
      r.student || "",
      (r.cls || "").toUpperCase(),
      r.kind || "",
      r.exId || "",
      r.attempt != null ? r.attempt : "",
      r.mode || "",
      r.ctx || ""
    ].join("|");
  }

  /* Mã Google Apps Script tích hợp sẵn để giáo viên bấm "Sao chép mã" ngay trên giao diện */
  const GAS_SCRIPT_TEMPLATE = `const SHEET_USERS = "TaiKhoan";
const SHEET_LOGS = "NhatKy";
const SHEET_SUMMARY = "TongHop";

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let shUsers = ss.getSheetByName(SHEET_USERS);
  if (!shUsers) {
    shUsers = ss.insertSheet(SHEET_USERS);
    shUsers.appendRow(["username", "password", "name", "cls", "role", "createdAt", "lastActive"]);
    shUsers.getRange("A1:G1").setFontWeight("bold").setBackground("#dbeafe");
    shUsers.setFrozenRows(1);
    const now = new Date().toISOString();
    shUsers.appendRow(["gv", "123456", "Giáo viên bộ môn", "ALL", "teacher", now, now]);
    shUsers.appendRow(["hs01", "123456", "Nguyễn Văn An", "12G", "student", now, now]);
  }
  let shLogs = ss.getSheetByName(SHEET_LOGS);
  if (!shLogs) {
    shLogs = ss.insertSheet(SHEET_LOGS);
    shLogs.appendRow(["id", "ts", "username", "student", "cls", "kind", "exId", "etype", "choice", "correct", "score10", "attempt", "secs", "tag", "mode", "reasoning", "rawJson"]);
    shLogs.getRange("A1:Q1").setFontWeight("bold").setBackground("#dcfce7");
    shLogs.setFrozenRows(1);
  }
  let shSum = ss.getSheetByName(SHEET_SUMMARY);
  if (!shSum) {
    shSum = ss.insertSheet(SHEET_SUMMARY);
    shSum.appendRow(["Mã HS (username)", "Họ và tên", "Lớp", "Lượt luyện tập", "Số câu đúng", "Tỷ lệ đúng (%)", "Số bài KT", "Điểm KT đầu tiên", "Điểm KT gần nhất", "Điểm KT cao nhất", "Bài Điểm gãy", "Bảng kiểm đã lưu", "Số ngày học", "Cập nhật gần nhất"]);
    shSum.getRange("A1:N1").setFontWeight("bold").setBackground("#fef3c7");
    shSum.setFrozenRows(1);
  }
  return { ok: true, spreadsheetName: ss.getName(), spreadsheetUrl: ss.getUrl() };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const info = setupSheets();
    return jsonResponse({ ok: true, service: "CC-Navigator Google Sheets API", spreadsheetName: info.spreadsheetName });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const info = setupSheets();
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = body.action || "ping";
    if (action === "ping") return jsonResponse({ ok: true, spreadsheetName: info.spreadsheetName });
    if (action === "login") return jsonResponse(handleLogin(body));
    if (action === "syncLogs") return jsonResponse(handleSyncLogs(body));
    if (action === "getTeacherData") return jsonResponse(handleGetTeacherData(body));
    if (action === "upsertUser") return jsonResponse(handleUpsertUser(body));
    return jsonResponse({ ok: false, error: "Action không hợp lệ: " + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function normStr(v) { return String(v == null ? "" : v).trim(); }

function readUsers(shUsers) {
  const rows = shUsers.getDataRange().getValues(), list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i], username = normStr(r[0]);
    if (!username) continue;
    list.push({ rowIndex: i + 1, username, password: normStr(r[1]), name: normStr(r[2]), cls: normStr(r[3]).toUpperCase(), role: normStr(r[4]).toLowerCase() === "teacher" ? "teacher" : "student", createdAt: normStr(r[5]), lastActive: normStr(r[6]) });
  }
  return list;
}

function handleLogin(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), shUsers = ss.getSheetByName(SHEET_USERS), users = readUsers(shUsers);
  const rawUser = normStr(body.username).toLowerCase(), password = normStr(body.password), name = normStr(body.name), cls = normStr(body.cls).toUpperCase();
  const wantRole = normStr(body.role).toLowerCase() === "teacher" ? "teacher" : "student", now = new Date().toISOString();
  if (!rawUser) return { ok: false, error: "Vui lòng nhập Mã đăng nhập / Tên tài khoản." };
  const found = users.find(function (u) { return u.username.toLowerCase() === rawUser; });
  if (wantRole === "teacher") {
    if (!found || found.role !== "teacher") return { ok: false, error: "Tài khoản không có quyền Giáo viên trong trang tính TaiKhoan (mặc định: tài khoản 'gv', mật khẩu '123456')." };
    if (found.password && found.password !== password) return { ok: false, error: "Mật khẩu Giáo viên chưa chính xác." };
    shUsers.getRange(found.rowIndex, 7).setValue(now);
    return { ok: true, user: { username: found.username, name: found.name || "Giáo viên", cls: found.cls || "ALL", role: "teacher" } };
  }
  if (found) {
    if (found.role === "teacher") return { ok: false, error: "Đây là tài khoản Giáo viên. Vui lòng chuyển sang thẻ Giáo viên để đăng nhập." };
    if (found.password && found.password !== password) return { ok: false, error: "Mật khẩu / Mã PIN học sinh chưa đúng." };
    const updatedName = name || found.name || found.username, updatedCls = cls || found.cls || "";
    shUsers.getRange(found.rowIndex, 3).setValue(updatedName);
    shUsers.getRange(found.rowIndex, 4).setValue(updatedCls);
    shUsers.getRange(found.rowIndex, 7).setValue(now);
    return { ok: true, user: { username: found.username, name: updatedName, cls: updatedCls, role: "student" } };
  }
  const newName = name || rawUser;
  shUsers.appendRow([rawUser, password, newName, cls, "student", now, now]);
  return { ok: true, user: { username: rawUser, name: newName, cls: cls, role: "student" }, registered: true };
}

function handleSyncLogs(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), shLogs = ss.getSheetByName(SHEET_LOGS), shUsers = ss.getSheetByName(SHEET_USERS);
  const incoming = Array.isArray(body.logs) ? body.logs : [];
  if (!incoming.length) return { ok: true, added: 0 };
  const existingData = shLogs.getDataRange().getValues(), seenIds = new Set();
  for (let i = 1; i < existingData.length; i++) { const id = normStr(existingData[i][0]); if (id) seenIds.add(id); }
  const rowsToAdd = [];
  for (let i = 0; i < incoming.length; i++) {
    const l = incoming[i];
    if (!l || typeof l !== "object" || !l.kind) continue;
    const username = normStr(l.username || body.username || l.student || "hs").toLowerCase();
    const student = normStr(l.student || body.name || username);
    const cls = normStr(l.cls || body.cls || "").toUpperCase();
    const ts = normStr(l.ts || new Date().toISOString());
    const id = normStr(l.id) || [ts, username, student, cls, l.kind, l.exId || "", l.attempt || "", l.mode || "", l.ctx || ""].join("|");
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    const rec = Object.assign({}, l, { id, ts, username, student, cls });
    rowsToAdd.push([id, ts, username, student, cls, normStr(l.kind), normStr(l.exId), normStr(l.etype), l.choice != null ? l.choice : "", l.correct != null ? Boolean(l.correct) : "", l.score10 != null ? Number(l.score10) : "", l.attempt != null ? Number(l.attempt) : "", l.secs != null ? Number(l.secs) : "", normStr(l.tag), normStr(l.mode), normStr(l.reasoning), JSON.stringify(rec)]);
  }
  if (rowsToAdd.length > 0) shLogs.getRange(shLogs.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  if (body.username) {
    const u = readUsers(shUsers).find(function (x) { return x.username.toLowerCase() === normStr(body.username).toLowerCase(); });
    if (u) shUsers.getRange(u.rowIndex, 7).setValue(new Date().toISOString());
  }
  rebuildSummarySheet();
  return { ok: true, added: rowsToAdd.length, total: seenIds.size };
}

function rebuildSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), shLogs = ss.getSheetByName(SHEET_LOGS), shSum = ss.getSheetByName(SHEET_SUMMARY);
  const data = shLogs.getDataRange().getValues(), byStudent = {};
  for (let i = 1; i < data.length; i++) {
    const r = data[i], username = normStr(r[2]) || normStr(r[3]) || "Ẩn danh", student = normStr(r[3]) || username, cls = normStr(r[4]), kind = normStr(r[5]), ts = normStr(r[1]);
    const key = username.toLowerCase() + "|" + cls;
    if (!byStudent[key]) byStudent[key] = { username, student, cls, attempts: 0, correct: 0, tests: [], breakdown: 0, checklists: 0, days: {}, lastTs: "" };
    const s = byStudent[key];
    if (student) s.student = student;
    if (ts) { s.days[ts.slice(0, 10)] = true; if (ts > s.lastTs) s.lastTs = ts; }
    if (kind === "answer") {
      const mode = normStr(r[14]), choice = r[8], isCorrect = r[9] === true || String(r[9]).toLowerCase() === "true";
      if (mode !== "test" && choice !== -1 && choice !== "-1") { s.attempts++; if (isCorrect) s.correct++; }
    } else if (kind === "test") { const sc = Number(r[10]); if (!isNaN(sc)) s.tests.push(sc); }
    else if (kind === "breakdown") s.breakdown++;
    else if (kind === "checklist") s.checklists++;
  }
  const keys = Object.keys(byStudent).sort();
  if (shSum.getLastRow() > 1) shSum.getRange(2, 1, shSum.getLastRow() - 1, 14).clearContent();
  if (!keys.length) return;
  const outRows = keys.map(function (k) {
    const s = byStudent[k], acc = s.attempts ? Number(((s.correct / s.attempts) * 100).toFixed(1)) : 0;
    return [s.username, s.student, s.cls, s.attempts, s.correct, acc, s.tests.length, s.tests.length ? s.tests[0] : "", s.tests.length ? s.tests[s.tests.length - 1] : "", s.tests.length ? Math.max.apply(null, s.tests) : "", s.breakdown, s.checklists, Object.keys(s.days).length, s.lastTs ? s.lastTs.replace("T", " ").slice(0, 19) : ""];
  });
  shSum.getRange(2, 1, outRows.length, 14).setValues(outRows);
}

function handleGetTeacherData(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), shUsers = ss.getSheetByName(SHEET_USERS), shLogs = ss.getSheetByName(SHEET_LOGS), users = readUsers(shUsers);
  const tUser = normStr(body.username).toLowerCase(), tPass = normStr(body.password);
  const teacher = users.find(function (u) { return u.username.toLowerCase() === tUser && u.role === "teacher"; });
  if (!teacher || (teacher.password && teacher.password !== tPass)) return { ok: false, error: "Chỉ tài khoản Giáo viên hợp lệ mới có quyền tải dữ liệu cả lớp." };
  const logRows = shLogs.getDataRange().getValues(), logs = [];
  for (let i = 1; i < logRows.length; i++) {
    const r = logRows[i], rawJson = normStr(r[16]);
    if (rawJson) { try { logs.push(JSON.parse(rawJson)); continue; } catch (e) {} }
    logs.push({ id: normStr(r[0]), ts: normStr(r[1]), username: normStr(r[2]), student: normStr(r[3]), cls: normStr(r[4]), kind: normStr(r[5]), exId: normStr(r[6]), etype: normStr(r[7]), choice: r[8] === "" ? null : Number(r[8]), correct: r[9] === true || String(r[9]).toLowerCase() === "true", score10: r[10] === "" ? null : Number(r[10]), attempt: r[11] === "" ? 1 : Number(r[11]), secs: r[12] === "" ? 0 : Number(r[12]), tag: normStr(r[13]) || null, mode: normStr(r[14]), reasoning: normStr(r[15]) });
  }
  const publicUsers = users.map(function (u) { return { username: u.username, name: u.name, cls: u.cls, role: u.role, createdAt: u.createdAt, lastActive: u.lastActive }; });
  return { ok: true, spreadsheetName: ss.getName(), spreadsheetUrl: ss.getUrl(), users: publicUsers, logs: logs };
}

function handleUpsertUser(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), shUsers = ss.getSheetByName(SHEET_USERS), users = readUsers(shUsers);
  const tUser = normStr(body.teacherUsername).toLowerCase(), tPass = normStr(body.teacherPassword);
  const teacher = users.find(function (u) { return u.username.toLowerCase() === tUser && u.role === "teacher"; });
  if (!teacher || (teacher.password && teacher.password !== tPass)) return { ok: false, error: "Không có quyền Giáo viên." };
  const targetUser = normStr(body.username).toLowerCase(), targetPass = normStr(body.password || "123456"), targetName = normStr(body.name || targetUser), targetCls = normStr(body.cls).toUpperCase(), targetRole = normStr(body.role).toLowerCase() === "teacher" ? "teacher" : "student", now = new Date().toISOString();
  if (!targetUser) return { ok: false, error: "Thiếu mã đăng nhập." };
  const existing = users.find(function (u) { return u.username.toLowerCase() === targetUser; });
  if (existing) shUsers.getRange(existing.rowIndex, 2, 1, 4).setValues([[targetPass, targetName, targetCls, targetRole]]);
  else shUsers.appendRow([targetUser, targetPass, targetName, targetCls, targetRole, now, ""]);
  return { ok: true };
}`;

  const GS = {
    isValidSheetUrl,
    normalizeSheetUrl,
    callSheet,
    makeLogId,
    GAS_SCRIPT_TEMPLATE
  };

  if (typeof module !== "undefined" && module.exports) module.exports = GS;
  else root.CCN_SHEET = GS;
})(typeof window !== "undefined" ? window : globalThis);
