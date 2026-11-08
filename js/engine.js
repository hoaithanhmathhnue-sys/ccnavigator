/* Bộ máy phân tích Cohesion & Coherence – không phụ thuộc DOM (chạy được trên trình duyệt và Node). */
(function (root) {
  const D = typeof module !== "undefined" && module.exports ? require("./data.js") : root.CCN_DATA;

  const REF_WORDS = ["this", "that", "these", "those", "such", "it", "its", "they", "them", "their", "he", "she", "his", "her", "him", "one", "ones", "both", "another"];
  const CONJ = [
    ["for this reason", "Kết quả"], ["for that reason", "Kết quả"], ["as a result", "Kết quả"], ["on the other hand", "Đối lập"],
    ["in addition", "Bổ sung"], ["in contrast", "Đối lập"], ["for example", "Ví dụ"], ["for instance", "Ví dụ"],
    ["however", "Đối lập"], ["nevertheless", "Đối lập"], ["nonetheless", "Đối lập"], ["therefore", "Kết quả"], ["consequently", "Kết quả"],
    ["thus", "Kết quả"], ["hence", "Kết quả"], ["moreover", "Bổ sung"], ["furthermore", "Bổ sung"], ["besides", "Bổ sung"],
    ["meanwhile", "Thời gian"], ["then", "Thời gian"], ["finally", "Thời gian"], ["afterwards", "Thời gian"], ["instead", "Đối lập"]
  ];
  const STOP = new Set(("a an the and or but so of to in on at for with by from as is are was were be been being has have had do does did will would can could should may might " +
    "this that these those such it its they them their he she his her him we you i our your my not no also very more most many much some any all each other than then there here which who whom whose what when where why how into about over after before").split(" "));

  const norm = (w) => {
    w = w.toLowerCase().replace(/[^a-z']/g, "");
    if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
    if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
    if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
    return w;
  };
  const tokens = (s) => (s.toLowerCase().match(/[a-z']+/g) || []);
  const contentStems = (s) => tokens(s).filter((w) => !STOP.has(w) && w.length > 2).map(norm);

  function conjOf(sentence) {
    const head = tokens(sentence).slice(0, 4).join(" ");
    for (const [w, rel] of CONJ) if (head === w || head.startsWith(w + " ")) return { word: w, rel };
    return null;
  }

  function analyzePair(prev, next) {
    const nt = tokens(next);
    const refs = nt.map((w, i) => ({ w, i })).filter((x) => REF_WORDS.includes(x.w));
    const strongRefs = refs.filter((x) => x.i < 5).map((x) => x.w);
    const conj = conjOf(next);
    const prevStems = contentStems(prev), nextStems = contentStems(next);
    const shared = [...new Set(nextStems.filter((s) => prevStems.includes(s)))];
    const prevTail = new Set(contentStems(prev).slice(-6));
    const nextHead = contentStems(next).slice(0, 7);
    const givenNew = [...new Set(nextHead.filter((s) => prevTail.has(s)))];
    const score = (strongRefs.length ? 1 : 0) + (conj ? 1 : 0) + (shared.length ? 1 : 0) + (givenNew.length || strongRefs.length ? 1 : 0);
    const verdict = score >= 3 ? "strong" : score >= 2 ? "ok" : score === 1 ? "weak" : "break";
    return { refs: [...new Set(refs.map((x) => x.w))], strongRefs, conj, shared, givenNew, score, verdict };
  }

  function analyzeText(sentences) {
    const clean = sentences.map((s) => s.trim()).filter(Boolean);
    const warnings = [];
    if (clean.length) {
      const first = tokens(clean[0]).slice(0, 4);
      const hit = first.filter((w) => REF_WORDS.includes(w));
      const c = conjOf(clean[0]);
      if (hit.length) warnings.push(`Câu 1 bắt đầu bằng “${hit[0]}” nhưng chưa có danh từ gốc để truy ngược – câu mở đầu đoạn thường không chứa đại từ quy chiếu.`);
      if (c) warnings.push(`Câu 1 bắt đầu bằng từ nối “${c.word}” (${c.rel}) nhưng chưa có ý nào phía trước để nối.`);
    }
    const pairs = [];
    for (let i = 1; i < clean.length; i++) pairs.push({ from: i, to: i + 1, ...analyzePair(clean[i - 1], clean[i]) });
    return { sentences: clean, pairs, warnings };
  }

  /* ---------- Bài tập ---------- */
  const orderArr = (opt) => opt.order.split("-");
  const correctOrder = (ex) => orderArr(ex.options[ex.answer]);
  const LETTERS = ["A", "B", "C", "D"];

  /* Các vị trí “gãy” trong một thứ tự sai: 0 = trước câu đầu, i = giữa câu i và i+1 */
  function breaksOf(ex, seq) {
    const good = correctOrder(ex), out = [];
    if (seq[0] !== good[0]) out.push(0);
    for (let i = 0; i < seq.length - 1; i++) {
      const k = good.indexOf(seq[i]);
      if (good[k + 1] !== seq[i + 1]) out.push(i + 1);
    }
    const soft = softOf(ex, seq);
    return out.filter((i) => !soft.includes(i));
  }
  /* Chỗ nối không theo đáp án nhưng vẫn đọc được (khai báo ở ex.soft): không tính đúng/sai khi chấm */
  function softOf(ex, seq) {
    const soft = ex.soft || [], out = [];
    for (let i = 0; i < seq.length - 1; i++) if (soft.includes(seq[i] + "-" + seq[i + 1])) out.push(i + 1);
    return out;
  }

  const clip = (t, n) => (t.length > n ? t.slice(0, n - 1) + "…" : t);

  /* Phản hồi cục bộ (không cần AI) – bám System Prompt của Phụ lục 7 */
  function localFeedback(ex, choice, reasoning, attempt, reveal, letterOf) {
    const correct = choice === ex.answer;
    const opt = ex.options[choice];
    const tag = opt && opt.tag ? D.TAGS[opt.tag] : null;
    const r = (reasoning || "").toLowerCase();
    let text = "";
    if (correct) {
      text = "✅ Chính xác! Chuỗi liên kết: " + ex.chain;
      if (!r.trim()) text += "\n\n✍️ Hãy tập thói quen Bước 4: viết 1–2 câu giải thích vì sao đáp án này đúng và vì sao các phương án còn lại gãy.";
      else {
        const hit = ex.keywords.filter((k) => r.includes(k.toLowerCase()));
        text += hit.length ? `\n\n👍 Lời giải thích của em đã nêu được bằng chứng: “${hit.slice(0, 3).join("”, “")}”.` : `\n\n✍️ Lời giải thích chưa chỉ ra tín hiệu liên kết nào. Hãy nhắc đến: ${ex.keywords.slice(0, 3).join(", ")}.`;
      }
      text += "\n\n❓ Em hãy chỉ ra điểm gãy mạch lạc của một phương án nhiễu bất kỳ.";
    } else {
      text = "❌ Chưa đúng.";
      if (tag) text += `\n\n🔎 Điểm gãy ở phương án em chọn thuộc nhóm “${tag.label}”: ${opt.why}`;
      if (reveal) text += `\n\n✅ Đáp án đúng là ${(letterOf || ((i) => LETTERS[i]))(ex.answer)}. ${ex.chain}`;
      else text += `\n\n💡 Gợi ý: ${ex.hints[Math.min(attempt - 1, ex.hints.length - 1)]}`;
      text += reveal ? "\n\n❓ Em hãy diễn đạt lại bằng lời của mình vì sao đáp án đúng khớp mạch Given – New." : "\n\n❓ Em hãy kiểm tra lại: thông tin mới của câu trước đã trở thành thông tin đã biết ở câu sau chưa?";
    }
    return { correct, tag: !correct && opt ? opt.tag || null : null, text };
  }

  /* ---------- Thống kê nhật ký ---------- */
  const KINDS = ["answer", "reveal", "test", "checklist", "breakdown"];
  const hasTag = (t) => typeof t === "string" && Object.prototype.hasOwnProperty.call(D.TAGS, t);
  const text = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");

  /* Làm sạch nhật ký học sinh gửi lên: bỏ bản ghi hỏng và bản ghi trùng (khi nhập lại cùng một tệp) */
  function cleanLogs(list) {
    const ids = D.EXERCISES.map((e) => e.id), seen = new Set(), out = [];
    for (const x of Array.isArray(list) ? list : []) {
      if (!x || typeof x !== "object" || !KINDS.includes(x.kind)) continue;
      if ((x.kind === "answer" || x.kind === "reveal") && !ids.includes(x.exId)) continue;
      if (x.kind === "test" && !Number.isFinite(x.score10)) continue;
      const rec = { ...x, ts: text(x.ts, 30), student: text(x.student, 40), cls: text(x.cls, 12), tag: hasTag(x.tag) ? x.tag : null };
      const key = [rec.ts, rec.student, rec.cls, rec.kind, rec.exId, rec.attempt, rec.mode, rec.ctx].join("|");
      if (seen.has(key)) continue;
      seen.add(key); out.push(rec);
    }
    return out;
  }

  function aggregate(logs) {
    const practice = logs.filter((l) => l.kind === "answer" && l.choice !== -1); /* câu bỏ trống không phải một lượt trả lời */
    const byStudent = {};
    for (const l of logs) {
      const key = (l.student || "Ẩn danh") + "|" + (l.cls || "");
      const s = (byStudent[key] = byStudent[key] || { student: l.student || "Ẩn danh", cls: l.cls || "", attempts: 0, correct: 0, tests: [], checklists: 0, breakdown: 0, tags: {}, days: new Set() });
      s.days.add((l.ts || "").slice(0, 10));
      if (l.kind === "answer") {
        if (!l.correct && l.tag) s.tags[l.tag] = (s.tags[l.tag] || 0) + 1;
        if (l.mode !== "test") { s.attempts++; if (l.correct) s.correct++; } /* “lượt luyện” không tính câu trong bài kiểm tra */
      }
      if (l.kind === "test") s.tests.push(l.score10);
      if (l.kind === "checklist") s.checklists++;
      if (l.kind === "breakdown") s.breakdown++;
    }
    const rows = Object.values(byStudent).map((s) => ({ ...s, days: s.days.size, accuracy: s.attempts ? s.correct / s.attempts : 0, bestTest: s.tests.length ? Math.max(...s.tests) : null, firstTest: s.tests.length ? s.tests[0] : null, lastTest: s.tests.length ? s.tests[s.tests.length - 1] : null }));
    const tags = {};
    practice.filter((l) => !l.correct && l.tag).forEach((l) => (tags[l.tag] = (tags[l.tag] || 0) + 1));
    const byEx = {};
    practice.forEach((l) => { const e = (byEx[l.exId] = byEx[l.exId] || { n: 0, ok: 0 }); e.n++; if (l.correct) e.ok++; });
    return { rows, tags, byEx, total: logs.length };
  }

  const E = { REF_WORDS, tokens, analyzePair, analyzeText, correctOrder, orderArr, breaksOf, softOf, localFeedback, cleanLogs, aggregate, clip, LETTERS };
  if (typeof module !== "undefined" && module.exports) module.exports = E; else root.CCN_ENGINE = E;
})(typeof window !== "undefined" ? window : globalThis);
