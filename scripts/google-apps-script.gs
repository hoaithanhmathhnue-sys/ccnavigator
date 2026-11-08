/**
 * ============================================================================
 * MÃ KẾT NỐI GOOGLE SHEETS CHO ỨNG DỤNG CC-NAVIGATOR
 * (Phân quyền Học sinh / Giáo viên & Theo dõi hoạt động học tập thời gian thực)
 * ============================================================================
 *
 * HƯỚNG DẪN CÀI ĐẶT TRÊN GOOGLE SHEET (https://docs.google.com/spreadsheets/u/0/):
 * 1. Tạo một bảng tính Google Sheet mới và đặt tên (ví dụ: "CC-Navigator - Quản lý học tập").
 * 2. Trên thanh menu của Google Sheet, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa đoạn mã mặc định `function myFunction() {}` trong trình soạn thảo, sau đó
 *    DÁN TOÀN BỘ mã trong tệp này vào và bấm biểu tượng Lưu (Ctrl + S).
 * 4. (Tùy chọn) Bấm nút "Chạy" (Run) với hàm `setupSheets` ở thanh công cụ phía trên
 *    và cấp quyền để tạo sẵn 3 trang tính: TaiKhoan, NhatKy, TongHop.
 *    (Nếu bỏ qua bước 4, lần đầu tiên ứng dụng kết nối sẽ tự động tạo 3 trang tính này).
 * 5. Ở góc trên bên phải, bấm nút màu xanh:
 *    "Triển khai" (Deploy) -> "Triển khai mới" (New deployment).
 * 6. Bấm biểu tượng bánh răng (Chọn loại) -> chọn "Ứng dụng web" (Web app):
 *    - Mô tả: CC-Navigator API
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <-- RẤT QUAN TRỌNG!
 * 7. Bấm "Triển khai" (Deploy), cấp quyền truy cập tài khoản Google (chọn Advanced / Nâng cao
 *    -> Go to Untitled project (unsafe) -> Allow / Cho phép).
 * 8. Sao chép địa chỉ "URL ứng dụng web" (có dạng https://script.google.com/macros/s/.../exec)
 *    và dán vào mục "Kết nối Google Sheet" trên ứng dụng CC-Navigator.
 * ============================================================================
 */

const SHEET_USERS = "TaiKhoan";
const SHEET_LOGS = "NhatKy";
const SHEET_SUMMARY = "TongHop";

/**
 * Khởi tạo cấu trúc 3 trang tính chuẩn trên Google Sheet nếu chưa có
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Trang tính TaiKhoan (Quản lý phân quyền Giáo viên & Học sinh)
  let shUsers = ss.getSheetByName(SHEET_USERS);
  if (!shUsers) {
    shUsers = ss.insertSheet(SHEET_USERS);
    shUsers.appendRow([
      "username",
      "password",
      "name",
      "cls",
      "role",
      "createdAt",
      "lastActive"
    ]);
    shUsers.getRange("A1:G1").setFontWeight("bold").setBackground("#dbeafe");
    shUsers.setFrozenRows(1);
    // Tạo sẵn tài khoản Giáo viên mặc định và 1 tài khoản Học sinh mẫu
    const now = new Date().toISOString();
    shUsers.appendRow(["gv", "123456", "Giáo viên bộ môn", "ALL", "teacher", now, now]);
    shUsers.appendRow(["hs01", "123456", "Nguyễn Văn An", "12G", "student", now, now]);
  }

  // 2. Trang tính NhatKy (Lưu toàn bộ hoạt động học tập của học sinh)
  let shLogs = ss.getSheetByName(SHEET_LOGS);
  if (!shLogs) {
    shLogs = ss.insertSheet(SHEET_LOGS);
    shLogs.appendRow([
      "id",
      "ts",
      "username",
      "student",
      "cls",
      "kind",
      "exId",
      "etype",
      "choice",
      "correct",
      "score10",
      "attempt",
      "secs",
      "tag",
      "mode",
      "reasoning",
      "rawJson"
    ]);
    shLogs.getRange("A1:Q1").setFontWeight("bold").setBackground("#dcfce7");
    shLogs.setFrozenRows(1);
  }

  // 3. Trang tính TongHop (Tự động thống kê tiến bộ của từng học sinh)
  let shSum = ss.getSheetByName(SHEET_SUMMARY);
  if (!shSum) {
    shSum = ss.insertSheet(SHEET_SUMMARY);
    shSum.appendRow([
      "Mã HS (username)",
      "Họ và tên",
      "Lớp",
      "Lượt luyện tập",
      "Số câu đúng",
      "Tỷ lệ đúng (%)",
      "Số bài KT",
      "Điểm KT đầu tiên",
      "Điểm KT gần nhất",
      "Điểm KT cao nhất",
      "Bài Điểm gãy",
      "Bảng kiểm đã lưu",
      "Số ngày học",
      "Cập nhật gần nhất"
    ]);
    shSum.getRange("A1:N1").setFontWeight("bold").setBackground("#fef3c7");
    shSum.setFrozenRows(1);
  }

  return { ok: true, spreadsheetName: ss.getName(), spreadsheetUrl: ss.getUrl() };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý GET request (Kiểm tra trạng thái kết nối nhanh)
 */
function doGet(e) {
  try {
    const info = setupSheets();
    const action = (e && e.parameter && e.parameter.action) || "ping";
    if (action === "ping") {
      return jsonResponse({
        ok: true,
        service: "CC-Navigator Google Sheets API",
        spreadsheetName: info.spreadsheetName
      });
    }
    return jsonResponse({ ok: true, info: info });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/**
 * Xử lý POST request từ ứng dụng CC-Navigator
 * Hỗ trợ các action:
 * - ping: Kiểm tra kết nối & khởi tạo Sheet
 * - login: Đăng nhập & phân quyền (student / teacher)
 * - syncLogs: Học sinh đồng bộ nhật ký hoạt động lên Google Sheet
 * - getTeacherData: Giáo viên tải toàn bộ nhật ký & danh sách tài khoản về Dashboard
 * - upsertUser: Giáo viên thêm/cập nhật tài khoản trên Sheet
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const info = setupSheets();
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = body.action || "ping";

    if (action === "ping") {
      return jsonResponse({
        ok: true,
        spreadsheetName: info.spreadsheetName
      });
    }

    if (action === "login") {
      return jsonResponse(handleLogin(body));
    }

    if (action === "syncLogs") {
      return jsonResponse(handleSyncLogs(body));
    }

    if (action === "getTeacherData") {
      return jsonResponse(handleGetTeacherData(body));
    }

    if (action === "upsertUser") {
      return jsonResponse(handleUpsertUser(body));
    }

    return jsonResponse({ ok: false, error: "Action không hợp lệ: " + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function normStr(v) {
  return String(v == null ? "" : v).trim();
}

function readUsers(shUsers) {
  const rows = shUsers.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const username = normStr(r[0]);
    if (!username) continue;
    list.push({
      rowIndex: i + 1,
      username: username,
      password: normStr(r[1]),
      name: normStr(r[2]),
      cls: normStr(r[3]).toUpperCase(),
      role: normStr(r[4]).toLowerCase() === "teacher" ? "teacher" : "student",
      createdAt: normStr(r[5]),
      lastActive: normStr(r[6])
    });
  }
  return list;
}

/**
 * Xác thực đăng nhập và phân quyền Học sinh / Giáo viên
 */
function handleLogin(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shUsers = ss.getSheetByName(SHEET_USERS);
  const users = readUsers(shUsers);

  const rawUser = normStr(body.username).toLowerCase();
  const password = normStr(body.password);
  const name = normStr(body.name);
  const cls = normStr(body.cls).toUpperCase();
  const wantRole = normStr(body.role).toLowerCase() === "teacher" ? "teacher" : "student";
  const now = new Date().toISOString();

  if (!rawUser) {
    return { ok: false, error: "Vui lòng nhập Mã đăng nhập / Tên tài khoản." };
  }

  const found = users.find(function (u) {
    return u.username.toLowerCase() === rawUser;
  });

  if (wantRole === "teacher") {
    if (!found || found.role !== "teacher") {
      return {
        ok: false,
        error: "Tài khoản không có quyền Giáo viên trong trang tính TaiKhoan (mặc định: tài khoản 'gv', mật khẩu '123456')."
      };
    }
    if (found.password && found.password !== password) {
      return { ok: false, error: "Mật khẩu Giáo viên chưa chính xác." };
    }
    shUsers.getRange(found.rowIndex, 7).setValue(now);
    return {
      ok: true,
      user: {
        username: found.username,
        name: found.name || "Giáo viên",
        cls: found.cls || "ALL",
        role: "teacher"
      }
    };
  }

  // Nếu là Học sinh
  if (found) {
    if (found.role === "teacher") {
      return { ok: false, error: "Đây là tài khoản Giáo viên. Vui lòng chuyển sang thẻ Giáo viên để đăng nhập." };
    }
    if (found.password && found.password !== password) {
      return { ok: false, error: "Mật khẩu / Mã PIN học sinh chưa đúng." };
    }
    const updatedName = name || found.name || found.username;
    const updatedCls = cls || found.cls || "";
    shUsers.getRange(found.rowIndex, 3).setValue(updatedName);
    shUsers.getRange(found.rowIndex, 4).setValue(updatedCls);
    shUsers.getRange(found.rowIndex, 7).setValue(now);
    return {
      ok: true,
      user: {
        username: found.username,
        name: updatedName,
        cls: updatedCls,
        role: "student"
      }
    };
  }

  // Học sinh mới chưa có trong danh sách -> Tự động ghi danh vào trang tính TaiKhoan
  const newName = name || rawUser;
  shUsers.appendRow([rawUser, password, newName, cls, "student", now, now]);
  return {
    ok: true,
    user: {
      username: rawUser,
      name: newName,
      cls: cls,
      role: "student"
    },
    registered: true
  };
}

/**
 * Lưu nhật ký hoạt động của học sinh vào trang tính NhatKy (chống trùng lặp)
 * và cập nhật bảng TongHop
 */
function handleSyncLogs(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shLogs = ss.getSheetByName(SHEET_LOGS);
  const shUsers = ss.getSheetByName(SHEET_USERS);
  const incoming = Array.isArray(body.logs) ? body.logs : [];
  if (!incoming.length) {
    return { ok: true, added: 0 };
  }

  const existingData = shLogs.getDataRange().getValues();
  const seenIds = new Set();
  for (let i = 1; i < existingData.length; i++) {
    const id = normStr(existingData[i][0]);
    if (id) seenIds.add(id);
  }

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

    const recordToStore = Object.assign({}, l, {
      id: id,
      ts: ts,
      username: username,
      student: student,
      cls: cls
    });

    rowsToAdd.push([
      id,
      ts,
      username,
      student,
      cls,
      normStr(l.kind),
      normStr(l.exId),
      normStr(l.etype),
      l.choice != null ? l.choice : "",
      l.correct != null ? Boolean(l.correct) : "",
      l.score10 != null ? Number(l.score10) : "",
      l.attempt != null ? Number(l.attempt) : "",
      l.secs != null ? Number(l.secs) : "",
      normStr(l.tag),
      normStr(l.mode),
      normStr(l.reasoning),
      JSON.stringify(recordToStore)
    ]);
  }

  if (rowsToAdd.length > 0) {
    const startRow = shLogs.getLastRow() + 1;
    shLogs.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  }

  // Cập nhật thời gian hoạt động gần nhất của học sinh
  if (body.username) {
    const users = readUsers(shUsers);
    const u = users.find(function (x) { return x.username.toLowerCase() === normStr(body.username).toLowerCase(); });
    if (u) {
      shUsers.getRange(u.rowIndex, 7).setValue(new Date().toISOString());
    }
  }

  rebuildSummarySheet();
  return { ok: true, added: rowsToAdd.length, total: seenIds.size };
}

/**
 * Tự động tính toán lại trang tính TongHop trên Google Sheet để giáo viên xem trực tiếp
 */
function rebuildSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shLogs = ss.getSheetByName(SHEET_LOGS);
  const shSum = ss.getSheetByName(SHEET_SUMMARY);
  const data = shLogs.getDataRange().getValues();

  const byStudent = {};
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const username = normStr(r[2]) || normStr(r[3]) || "Ẩn danh";
    const student = normStr(r[3]) || username;
    const cls = normStr(r[4]);
    const kind = normStr(r[5]);
    const ts = normStr(r[1]);
    const key = username.toLowerCase() + "|" + cls;

    if (!byStudent[key]) {
      byStudent[key] = {
        username: username,
        student: student,
        cls: cls,
        attempts: 0,
        correct: 0,
        tests: [],
        breakdown: 0,
        checklists: 0,
        days: {},
        lastTs: ""
      };
    }
    const s = byStudent[key];
    if (student) s.student = student;
    if (ts) {
      s.days[ts.slice(0, 10)] = true;
      if (ts > s.lastTs) s.lastTs = ts;
    }
    if (kind === "answer") {
      const mode = normStr(r[14]);
      const choice = r[8];
      const isCorrect = r[9] === true || String(r[9]).toLowerCase() === "true";
      if (mode !== "test" && choice !== -1 && choice !== "-1") {
        s.attempts++;
        if (isCorrect) s.correct++;
      }
    } else if (kind === "test") {
      const sc = Number(r[10]);
      if (!isNaN(sc)) s.tests.push(sc);
    } else if (kind === "breakdown") {
      s.breakdown++;
    } else if (kind === "checklist") {
      s.checklists++;
    }
  }

  const keys = Object.keys(byStudent).sort();
  if (shSum.getLastRow() > 1) {
    shSum.getRange(2, 1, shSum.getLastRow() - 1, 14).clearContent();
  }
  if (!keys.length) return;

  const outRows = keys.map(function (k) {
    const s = byStudent[k];
    const acc = s.attempts ? Number(((s.correct / s.attempts) * 100).toFixed(1)) : 0;
    const firstT = s.tests.length ? s.tests[0] : "";
    const lastT = s.tests.length ? s.tests[s.tests.length - 1] : "";
    const bestT = s.tests.length ? Math.max.apply(null, s.tests) : "";
    return [
      s.username,
      s.student,
      s.cls,
      s.attempts,
      s.correct,
      acc,
      s.tests.length,
      firstT,
      lastT,
      bestT,
      s.breakdown,
      s.checklists,
      Object.keys(s.days).length,
      s.lastTs ? s.lastTs.replace("T", " ").slice(0, 19) : ""
    ];
  });

  shSum.getRange(2, 1, outRows.length, 14).setValues(outRows);
}

/**
 * Giáo viên tải toàn bộ dữ liệu lớp học từ Google Sheet về Dashboard trên ứng dụng
 */
function handleGetTeacherData(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shUsers = ss.getSheetByName(SHEET_USERS);
  const shLogs = ss.getSheetByName(SHEET_LOGS);
  const users = readUsers(shUsers);

  const tUser = normStr(body.username).toLowerCase();
  const tPass = normStr(body.password);
  const teacher = users.find(function (u) {
    return u.username.toLowerCase() === tUser && u.role === "teacher";
  });

  if (!teacher || (teacher.password && teacher.password !== tPass)) {
    return {
      ok: false,
      error: "Chỉ tài khoản Giáo viên hợp lệ mới có quyền tải dữ liệu cả lớp."
    };
  }

  const logRows = shLogs.getDataRange().getValues();
  const logs = [];
  for (let i = 1; i < logRows.length; i++) {
    const r = logRows[i];
    const rawJson = normStr(r[16]);
    if (rawJson) {
      try {
        logs.push(JSON.parse(rawJson));
        continue;
      } catch (e) {}
    }
    logs.push({
      id: normStr(r[0]),
      ts: normStr(r[1]),
      username: normStr(r[2]),
      student: normStr(r[3]),
      cls: normStr(r[4]),
      kind: normStr(r[5]),
      exId: normStr(r[6]),
      etype: normStr(r[7]),
      choice: r[8] === "" ? null : Number(r[8]),
      correct: r[9] === true || String(r[9]).toLowerCase() === "true",
      score10: r[10] === "" ? null : Number(r[10]),
      attempt: r[11] === "" ? 1 : Number(r[11]),
      secs: r[12] === "" ? 0 : Number(r[12]),
      tag: normStr(r[13]) || null,
      mode: normStr(r[14]),
      reasoning: normStr(r[15])
    });
  }

  const publicUsers = users.map(function (u) {
    return {
      username: u.username,
      name: u.name,
      cls: u.cls,
      role: u.role,
      createdAt: u.createdAt,
      lastActive: u.lastActive
    };
  });

  return {
    ok: true,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    users: publicUsers,
    logs: logs
  };
}

/**
 * Giáo viên thêm mới hoặc cập nhật tài khoản Học sinh / Giáo viên từ ứng dụng
 */
function handleUpsertUser(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shUsers = ss.getSheetByName(SHEET_USERS);
  const users = readUsers(shUsers);

  const tUser = normStr(body.teacherUsername).toLowerCase();
  const tPass = normStr(body.teacherPassword);
  const teacher = users.find(function (u) {
    return u.username.toLowerCase() === tUser && u.role === "teacher";
  });

  if (!teacher || (teacher.password && teacher.password !== tPass)) {
    return { ok: false, error: "Không có quyền Giáo viên." };
  }

  const targetUser = normStr(body.username).toLowerCase();
  const targetPass = normStr(body.password || "123456");
  const targetName = normStr(body.name || targetUser);
  const targetCls = normStr(body.cls).toUpperCase();
  const targetRole = normStr(body.role).toLowerCase() === "teacher" ? "teacher" : "student";
  const now = new Date().toISOString();

  if (!targetUser) return { ok: false, error: "Thiếu mã đăng nhập." };

  const existing = users.find(function (u) { return u.username.toLowerCase() === targetUser; });
  if (existing) {
    shUsers.getRange(existing.rowIndex, 2, 1, 4).setValues([[targetPass, targetName, targetCls, targetRole]]);
  } else {
    shUsers.appendRow([targetUser, targetPass, targetName, targetCls, targetRole, now, ""]);
  }

  return { ok: true };
}
