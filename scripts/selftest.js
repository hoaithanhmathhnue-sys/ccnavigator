// Kiểm tra nhanh tính toàn vẹn của ngân hàng bài tập và bộ máy phân tích: npm test
const D = require("../js/data.js"), E = require("../js/engine.js");
let bad = 0; const fail = (m) => { bad++; console.error("✗", m); };
for (const ex of D.EXERCISES) {
  if (ex.options.length !== 4) fail(ex.id + ": cần 4 phương án");
  if (!(ex.answer >= 0 && ex.answer < ex.options.length)) fail(ex.id + ": đáp án ngoài phạm vi");
  ex.options.forEach((o, i) => { if (i !== ex.answer && (!o.why || !o.tag || !D.TAGS[o.tag])) fail(`${ex.id}[${i}]: thiếu tag/why`); });
  if (ex.type === "order") {
    const keys = Object.keys(ex.sentences).sort().join();
    ex.options.forEach((o, i) => { if (E.orderArr(o).slice().sort().join() !== keys) fail(`${ex.id}[${i}]: thứ tự không dùng đủ câu`); if (i !== ex.answer && !E.breaksOf(ex, E.orderArr(o)).length) fail(`${ex.id}[${i}]: không có điểm gãy`); });
  } else if (!ex.stem.includes("(___)")) fail(ex.id + ": thiếu (___)");
  if (ex.hints.length < 2) fail(ex.id + ": cần 2 gợi ý");
  if (ex.type === "gap" && /phương án [A-D]\b/.test(ex.chain)) fail(ex.id + ": chuỗi liên kết không được gọi tên phương án theo chữ cái vì vị trí đã bị đảo");
}
const rec = { ts: "2026-12-20T01:00:00Z", student: "HS1", cls: "12G", kind: "answer", exId: "O1", correct: true, mode: "ai", attempt: 1 };
const once = E.cleanLogs([rec, rec, { kind: "answer", exId: "<img>" }, { kind: "answer", exId: "O1", ts: 5, tag: "__proto__" }, null, 7]);
if (once.length !== 2 || once[1].tag !== null || once[1].ts !== "") fail("cleanLogs: phải bỏ bản ghi trùng/hỏng và làm sạch trường");
if (E.aggregate(E.cleanLogs([rec, { ...rec, exId: "O2", choice: -1, correct: false, mode: "test" }])).rows[0].attempts !== 1) fail("aggregate: câu trong bài kiểm tra không phải lượt luyện");
const r = E.analyzeText(["Artificial intelligence is transforming the modern workplace.", "It automates repetitive tasks and enhances overall productivity.", "However, this technological shift also raises serious concerns about job displacement."]);
if (r.pairs.length !== 2 || r.pairs.some((p) => p.verdict === "break")) fail("analyzeText: ví dụ AI phải có liên kết");
const w = E.analyzeText(["It automates tasks.", "Dogs run fast in parks."]);
if (!w.warnings.length || w.pairs[0].verdict !== "break") fail("analyzeText: phải cảnh báo đại từ đầu đoạn và gãy mạch");
console.log(bad ? `${bad} lỗi` : `OK: ${D.EXERCISES.length} bài tập, bộ máy phân tích hoạt động đúng`);
process.exit(bad ? 1 : 0);
