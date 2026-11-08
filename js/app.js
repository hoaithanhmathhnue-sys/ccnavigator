(function () {
  "use strict";
  const D = window.CCN_DATA, E = window.CCN_ENGINE;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = E.LETTERS;

  /* ---------------- Lưu trữ ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("ccn_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ccn_" + k, JSON.stringify(v)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ } }
  };
  let profile = store.get("profile", { name: "", cls: "" });
  let logs = store.get("logs", []);
  let progress = store.get("progress", {});
  function addLog(entry) {
    logs.push({ ts: new Date().toISOString(), student: profile.name, cls: profile.cls, ...entry });
    if (logs.length > 5000) logs = logs.slice(-5000);
    store.set("logs", logs);
  }
  const pct = (x) => (x * 100).toFixed(1).replace(".", ",") + "%";
  const num = (x, d = 2) => Number(x).toFixed(d).replace(".", ",");

  /* ---------------- Trạng thái AI ---------------- */
  const S = { ai: false, aiOn: false, cur: 0, filter: "all", rt: {}, view: "home" };
  fetch("/api/chat", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.ai) { S.ai = true; S.aiOn = true; if (S.view === "practice") render(); } }).catch(() => {});

  /* ---------------- Tiện ích ---------------- */
  function seeded(id) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function perm(ex) { // đảo vị trí phương án đọc điền để đáp án không cố định ở A
    const idx = ex.options.map((_, i) => i);
    if (ex.type !== "gap") return idx;
    const r = seeded(ex.id + "x"); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  }
  const optText = (ex, i) => (ex.type === "order" ? E.orderArr(ex.options[i]).join(" – ") : ex.options[i].text);
  const byId = (id) => D.EXERCISES.find((e) => e.id === id);
  const tagChip = (t) => (t && D.TAGS[t] ? `<span class="pill" style="background:${D.TAGS[t].color}">${esc(D.TAGS[t].label)}</span>` : "");
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- Điều hướng ---------------- */
  const VIEWS = [["home", "🏠 Trang chủ"], ["guide", "📘 Cẩm nang"], ["practice", "🤖 Trợ lý AI"], ["map", "🗺️ Bản đồ Given–New"], ["breakdown", "🔍 Điểm gãy"], ["test", "📝 Kiểm tra"], ["dash", "📊 Tiến bộ"]];
  function renderNav() {
    $("#nav").innerHTML = VIEWS.map(([k, t]) => `<a href="#${k}" class="${S.view === k ? "on" : ""}">${t}</a>`).join("");
    $("#whoBtn").textContent = profile.name ? `👤 ${profile.name}${profile.cls ? " · " + profile.cls : ""}` : "👤 Nhập tên / lớp";
  }
  function render() {
    const v = (location.hash || "#home").slice(1);
    S.view = VIEWS.some((x) => x[0] === v) ? v : "home";
    renderNav();
    const fn = { home, guide, practice, map: mapView, breakdown, test: testView, dash }[S.view];
    fn(); window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", () => { stopTimer(); render(); });

  /* ================= TRANG CHỦ ================= */
  function home() {
    const att = logs.filter((l) => l.kind === "answer" && l.mode !== "test");
    const ok = att.filter((l) => l.correct).length;
    const tests = logs.filter((l) => l.kind === "test");
    $("#app").innerHTML = `
    <section class="hero">
      <h1>🧭 CC-Navigator</h1>
      <p><b>Giải pháp 3</b> của sáng kiến: phần mềm tích hợp <b>trợ lý AI định hướng</b> và <b>hệ thống kiểm tra đánh giá chuyên sâu</b>, giúp học sinh chuyển từ “dịch thô/đoán nghĩa” sang <b>phân tích bằng chứng ngôn ngữ</b> khi làm dạng bài <b>sắp xếp</b> và <b>đọc điền</b> theo định dạng đề thi mới.</p>
      <div class="row"><a class="btn" href="#guide">Bắt đầu với Cẩm nang</a><a class="btn sec" href="#practice">Luyện cùng trợ lý AI</a><a class="btn sec" href="#test">Làm bài kiểm tra 30 phút</a></div>
    </section>
    <div class="grid g4">
      <div class="card kpi"><b>${att.length}</b><span>lượt luyện tập</span></div>
      <div class="card kpi"><b>${att.length ? pct(ok / att.length) : "–"}</b><span>tỷ lệ đúng</span></div>
      <div class="card kpi"><b>${tests.length}</b><span>bài kiểm tra đã làm</span></div>
      <div class="card kpi"><b>${tests.length ? num(tests[tests.length - 1].score10, 1) : "–"}</b><span>điểm kiểm tra gần nhất</span></div>
    </div>
    <h2>Ba phân hệ của CC-Navigator</h2>
    <div class="grid g3">
      <div class="card"><h3>📘 Phân hệ 1 – Dẫn đường phương pháp</h3><p>Method &amp; Strategy Guide: sơ đồ 4 nhóm phương tiện liên kết, bảng tra từ nối và thẻ chiến lược 4 bước. Dùng bất cứ lúc nào, kể cả tự học tại nhà.</p><a class="btn sec" href="#guide">Mở cẩm nang</a></div>
      <div class="card"><h3>🤖 Phân hệ 2 – Trợ lý phản biện logic</h3><p>AI Discourse Assistant: nhập đáp án và lời giải của em, trợ lý “bóc lỗi tư duy”, gợi mở bằng câu hỏi và chỉ nêu đáp án sau khi em thử từ 2 lần. Kèm công cụ <b>Bản đồ Given–New</b> tự phân tích văn bản.</p><a class="btn sec" href="#practice">Luyện tập</a> <a class="btn ghost" href="#map">Bản đồ</a></div>
      <div class="card"><h3>📝 Phân hệ 3 – Kiểm tra &amp; đánh giá</h3><p>Bài kiểm tra 10 câu theo ma trận đề mới, <b>Breakdown Analysis Tasks</b>, bảng kiểm tự đánh giá và bảng điều khiển tiến bộ; giáo viên gộp nhật ký cả lớp để theo dõi.</p><a class="btn sec" href="#test">Kiểm tra</a> <a class="btn ghost" href="#breakdown">Điểm gãy</a> <a class="btn ghost" href="#dash">Tiến bộ</a></div>
    </div>
    <div class="card"><h3>Lộ trình gợi ý cho học sinh</h3><ol>
      <li>Xem <b>thẻ 4 bước</b> trong Cẩm nang (3 phút).</li><li>Luyện 3–5 câu với trợ lý AI; viết lời giải thích bằng chứng trước khi bấm “Kiểm tra”.</li>
      <li>Làm <b>Breakdown Analysis Tasks</b>: nhấp vào chỗ “gãy mạch” trong đoạn văn bị xáo trộn.</li><li>Làm bài kiểm tra 30 phút và tự điền <b>bảng kiểm</b>; theo dõi tiến bộ ở mục “Tiến bộ”.</li></ol>
      <p class="muted small">🔒 Nhật ký học tập lưu trên thiết bị của em. Hãy dùng tên/biệt danh hoặc mã số, không nhập thông tin cá nhân nhạy cảm.</p></div>`;
  }

  /* ================= CẨM NANG (Phân hệ 1) ================= */
  function guide() {
    S.gtab = S.gtab || "theory";
    const tabs = [["theory", "Lý thuyết nền"], ["groups", "4 nhóm liên kết"], ["conn", "Tra từ nối"], ["func", "Hội thoại"], ["steps", "Thẻ 4 bước"], ["gn", "Given – New"], ["gloss", "Thuật ngữ"], ["quiz", "Quiz lý thuyết"]];
    let body = "";
    if (S.gtab === "theory") body = theoryBody();
    if (S.gtab === "func") body = `<div class="card"><h3>Cụm chức năng trong hội thoại</h3><div class="scroll"><table><thead><tr><th>Chức năng</th><th>Lượt thứ nhất</th><th>Lượt đáp phù hợp</th></tr></thead><tbody>${D.FUNCTIONS.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div><p class="muted small">Dùng khi sắp xếp hội thoại: câu đáp phải khớp chức năng của câu hỏi liền trước.</p></div>`;
    if (S.gtab === "gloss") body = `<div class="card"><h3>Thuật ngữ A–Z</h3><div class="scroll"><table><thead><tr><th>Thuật ngữ</th><th>Tiếng Việt</th><th>Giải thích</th></tr></thead><tbody>${D.GLOSSARY.slice().sort((a, b) => a[0].localeCompare(b[0])).map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div></div>`;
    if (S.gtab === "quiz") body = quizBody();
    if (S.gtab === "groups") body = `<div class="card"><h3>🧠 Sơ đồ tư duy tổng hợp</h3><div class="mm"><div class="mm-root">Cohesion Decoder Toolkit<small>Tìm tín hiệu liên kết thay vì dịch thô</small></div><div class="mm-branches">${D.GROUPS.map((g) => `<div class="mm-b"><b>${g.icon} ${esc(g.name)}</b><span>${esc(g.words)}</span><em>${esc(g.rule)}</em></div>`).join("")}</div></div></div>
      <div class="grid g2">${D.GROUPS.map((g) => `<div class="card"><h3>${g.icon} ${esc(g.name)}</h3><p><b>Từ khóa:</b> ${esc(g.words)}</p><p><b>Quy tắc xử lý:</b> ${esc(g.rule)}</p><p class="stem">${g.example}</p><p class="muted small">${esc(g.note)}</p></div>`).join("")}</div>
      <div class="card"><h3>📓 Sổ tay liên kết cá nhân</h3><p class="muted small">Ghi lại các tín hiệu liên kết em gặp (sản phẩm của Bước 1 – Cohesion Decoder Toolkit). Lưu tự động trên thiết bị.</p><textarea id="notes" placeholder="Ví dụ: “This issue” = traffic congestion (Reference)…">${esc(store.get("notes", ""))}</textarea></div>`;
    if (S.gtab === "conn") body = `<div class="card"><div class="row"><input type="search" id="cq" placeholder="Tìm từ nối hoặc quan hệ (ví dụ: however, kết quả, đối lập)…" style="max-width:420px"></div>
      <div class="scroll"><table><thead><tr><th>Từ nối</th><th>Quan hệ</th><th>Cách kiểm chứng</th><th>Ví dụ</th></tr></thead><tbody id="ctb"></tbody></table></div>
      <p class="muted small">⚠️ “Bẫy từ nối ảo ảnh”: thấy However không có nghĩa hai câu bắt buộc đối lập – hãy kiểm chứng quan hệ ngữ nghĩa thật sự.</p></div>`;
    if (S.gtab === "steps") body = `<div class="grid g2">${D.STEPS.map((s) => `<div class="card"><h3>Bước ${s.n}: ${esc(s.en)}</h3><p>${esc(s.vi)}</p><p class="muted">💡 ${esc(s.tip)}</p></div>`).join("")}</div>
      <div class="card"><h3>Ví dụ Bước 4 (Evidence-based Verification)</h3><p class="stem">Em chọn phương án B vì <i>they</i> thay cho <i>local residents</i> ở câu trước; phương án C gãy mạch vì “Therefore” không có nguyên nhân phía trước.</p><a class="btn" href="#practice">Luyện 4 bước cùng trợ lý AI</a></div>`;
    if (S.gtab === "gn") body = `<div class="card"><h3>Nguyên tắc Thông tin Đã biết – Mới (Given – New)</h3><p>Thông tin đã biết thường đứng ở đầu câu để neo mạch văn; thông tin mới đứng ở phần sau để phát triển ý. <b>Thông tin mới của câu trước trở thành thông tin đã biết của câu sau.</b></p>
      <div class="flow"><div class="fbox"><b>A</b> <mark>Artificial intelligence</mark> is transforming the modern workplace.</div><div class="farrow"><span class="ar">↓</span><span class="badge b-ref">It = artificial intelligence</span></div>
      <div class="fbox"><b>B</b> <mark>It</mark> automates repetitive tasks and enhances overall productivity.</div><div class="farrow"><span class="ar">↓</span><span class="badge b-ref">this technological shift = tự động hóa</span><span class="badge b-con">However</span></div>
      <div class="fbox"><b>C</b> However, <mark>this technological shift</mark> also raises serious concerns about job displacement.</div></div>
      <p style="margin-top:12px"><a class="btn" href="#map">Thử với văn bản của em ở Bản đồ Given–New</a></p></div>`;
    $("#app").innerHTML = `<h1>📘 Phân hệ 1 – Dẫn đường phương pháp</h1><div class="tabs">${tabs.map(([k, t]) => `<button data-act="gtab" data-v="${k}" class="${S.gtab === k ? "on" : ""}">${t}</button>`).join("")}</div>${body}`;
    if (S.gtab === "groups") $("#notes").addEventListener("input", (e) => store.set("notes", e.target.value));
    if (S.gtab === "conn") { const draw = () => { const q = $("#cq").value.toLowerCase(); $("#ctb").innerHTML = D.CONNECTORS.filter((r) => r.join(" ").toLowerCase().includes(q)).map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td><i>${esc(r[3])}</i></td></tr>`).join("") || `<tr><td colspan="4">Không tìm thấy.</td></tr>`; }; $("#cq").addEventListener("input", draw); draw(); }
  }

  function theoryBody() {
    S.tsec = S.tsec || D.THEORY[0].id;
    const sec = D.THEORY.find((t) => t.id === S.tsec) || D.THEORY[0];
    const blk = (b) => b.p ? `<p>${b.p}</p>` : b.ul ? `<ul>${b.ul.map((x) => `<li>${x}</li>`).join("")}</ul>` : b.ex ? `<p class="stem">${b.ex}</p>` : b.tip ? `<p class="callout tip">💡 ${b.tip}</p>` : b.warn ? `<p class="callout warn">⚠️ ${b.warn}</p>` : b.table ? `<div class="scroll"><table><thead><tr>${b.table.head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
    return `<div class="layout"><aside><div class="exlist">${D.THEORY.map((t) => `<button class="${t.id === sec.id ? "on" : ""}" data-act="tsec" data-v="${t.id}"><span>${t.icon} ${esc(t.title)}</span></button>`).join("")}</div></aside><section><div class="card"><h2>${sec.icon} ${esc(sec.title)}</h2>${sec.blocks.map(blk).join("")}</div></section></div>`;
  }
  function quizBody() {
    S.qz = S.qz || {};
    const done = Object.keys(S.qz).length, ok = D.QUIZ.filter((q, i) => S.qz[i] === q.a).length;
    return `<div class="card"><h3>Quiz củng cố lý thuyết (${D.QUIZ.length} câu)</h3><p class="muted small">Đã trả lời ${done}/${D.QUIZ.length} · Đúng ${ok}. <a href="#" data-act="qzreset">Làm lại</a></p></div>` + D.QUIZ.map((q, i) => {
      const a = S.qz[i];
      return `<div class="card"><p><b>${i + 1}. ${esc(q.q)}</b></p>${q.o.map((t, j) => `<div class="opt${a != null ? " locked" : ""}${a != null && j === q.a ? " right" : ""}${a === j && j !== q.a ? " wrong" : ""}" ${a != null ? "" : `data-act="qzpick" data-v="${i}:${j}"`}><span class="l">${L[j]}</span><span>${esc(t)}</span></div>`).join("")}${a != null ? `<p class="callout ${a === q.a ? "tip" : "warn"}">${a === q.a ? "✅ Đúng." : "❌ Chưa đúng."} ${esc(q.why)}</p>` : ""}</div>`;
    }).join("");
  }

  /* ================= LUYỆN TẬP + TRỢ LÝ AI (Phân hệ 2) ================= */
  function rtOf(ex) { return (S.rt[ex.id] = S.rt[ex.id] || { attempts: 0, sel: null, reasoning: "", done: false, fb: null, perm: perm(ex), t0: Date.now() }); }
  function exBody(ex, rt, locked, selIdx, showKey) {
    const sents = ex.type === "order" ? Object.entries(ex.sentences).map(([k, v]) => `<div class="sent"><b>${k}.</b><span>${esc(v)}</span></div>`).join("") : `<div class="stem">${esc(ex.stem).replace("(___)", '<span class="gap">&nbsp;&nbsp;?&nbsp;&nbsp;</span>')}</div>`;
    const opts = rt.perm.map((oi, pos) => {
      let cls = "opt" + (locked ? " locked" : "") + (selIdx === oi ? " sel" : "");
      if (showKey) { if (oi === ex.answer) cls += " right"; else if (selIdx === oi) cls += " wrong"; }
      return `<div class="${cls}" ${locked ? "" : `data-act="pick" data-v="${oi}"`}><span class="l">${L[pos]}</span><span>${esc(optText(ex, oi))}</span></div>`;
    }).join("");
    return `<p><b>${esc(ex.prompt)}</b></p>${sents}${opts}`;
  }
  function practice() {
    const list = D.EXERCISES.filter((e) => S.filter === "all" || e.type === S.filter);
    if (!list.some((e) => D.EXERCISES.indexOf(e) === S.cur)) S.cur = D.EXERCISES.indexOf(list[0]);
    const ex = D.EXERCISES[S.cur], rt = rtOf(ex);
    const items = list.map((e) => `<button class="${D.EXERCISES.indexOf(e) === S.cur ? "on" : ""}" data-act="goex" data-v="${D.EXERCISES.indexOf(e)}"><span class="dot ${progress[e.id] || ""}"></span><span><b>${e.id}</b> · ${e.type === "order" ? "Sắp xếp" : "Đọc điền"}<br><span class="muted small">${esc(e.topic)} · ${esc(e.level)}</span></span></button>`).join("");
    $("#app").innerHTML = `<h1>🤖 Phân hệ 2 – Trợ lý phản biện logic</h1>
    <div class="layout"><aside>
      <div class="tabs"><button data-act="filter" data-v="all" class="${S.filter === "all" ? "on" : ""}">Tất cả</button><button data-act="filter" data-v="order" class="${S.filter === "order" ? "on" : ""}">Sắp xếp</button><button data-act="filter" data-v="gap" class="${S.filter === "gap" ? "on" : ""}">Đọc điền</button></div>
      <div class="exlist">${items}</div>
      <div class="card small"><b>Trợ lý AI:</b> ${S.ai ? `<label class="ai-switch"><input type="checkbox" id="aiSw" ${S.aiOn ? "checked" : ""}> Dùng AI (máy chủ đã cấu hình)</label>` : `<span class="muted">Chưa kết nối AI nên đang dùng <b>phản hồi cục bộ</b> theo chuỗi liên kết đã soạn sẵn. Cấu hình khóa API trên Vercel để bật AI.</span>`}</div>
    </aside><section>
      <div class="card"><div class="row"><span class="chip">${ex.id}</span><span class="chip">${ex.type === "order" ? "Sắp xếp câu/đoạn" : "Đọc điền"}</span><span class="chip">${esc(ex.level)}</span><span class="muted small">Chủ đề: ${esc(ex.topic)} · Lần thử: ${rt.attempts}</span></div>
        <div id="exbody" style="margin-top:10px">${exBody(ex, rt, rt.done, rt.sel, rt.done)}</div>
        <div style="margin-top:12px"><label for="why">✍️ Bước 4 – Em giải thích vì sao chọn phương án này (nêu tín hiệu liên kết làm bằng chứng):</label>
        <textarea id="why" placeholder="Ví dụ: Em chọn … vì “this issue” thay cho … ở câu trước…" ${rt.done ? "disabled" : ""}>${esc(rt.reasoning)}</textarea></div>
        <div class="row" style="margin-top:10px">
          <button class="btn" data-act="check" ${rt.done ? "disabled" : ""}>Kiểm tra</button>
          <button class="btn sec" data-act="reveal" ${!rt.done && rt.attempts >= 2 ? "" : "disabled"} title="Mở khi em đã thử từ 2 lần">Xem đáp án</button>
          <button class="btn ghost" data-act="retry" ${rt.done ? "" : "disabled"}>Làm lại</button>
          <button class="btn ghost" data-act="nextex">Câu tiếp theo →</button>
        </div>
        <div id="fb">${rt.fb ? fbHtml(rt.fb) : ""}</div>
        ${rt.done ? analysisHtml(ex) : ""}
      </div>
      ${checklistCard("practice")}
    </section></div>`;
    $("#why").addEventListener("input", (e) => { rt.reasoning = e.target.value; });
    const sw = $("#aiSw"); if (sw) sw.addEventListener("change", (e) => { S.aiOn = e.target.checked; });
  }
  const fbHtml = (f) => `<div class="fb ${f.correct === true ? "good" : f.correct === false ? "err" : ""}"><span class="src">${esc(f.src)}</span>${esc(f.text)}</div>`;
  function analysisHtml(ex) {
    return `<h3 style="margin-top:16px">🔎 Phân tích điểm gãy của các phương án (Bước 4)</h3><div class="scroll"><table><thead><tr><th>Phương án</th><th>Kết luận</th></tr></thead><tbody>${rtOf(ex).perm.map((oi, pos) => `<tr><td><b>${L[pos]}</b>. ${esc(E.clip(optText(ex, oi), 70))}</td><td>${oi === ex.answer ? "✅ Đúng – " + esc(ex.chain) : tagChip(ex.options[oi].tag) + " " + esc(ex.options[oi].why)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  async function askAI(ex, rt, reveal) {
    const body = { exId: ex.id, choice: rt.sel, perm: rt.perm, reasoning: rt.reasoning, attempt: rt.attempts, reveal };
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.reply) throw new Error(j.error || "");
    return j.reply;
  }

  async function doCheck(reveal) {
    const ex = D.EXERCISES[S.cur], rt = rtOf(ex);
    if (!reveal) {
      if (rt.sel == null) { alert("Em hãy chọn một phương án trước."); return; }
      rt.attempts++;
    }
    const sel = reveal && rt.sel == null ? ex.answer : rt.sel;
    const fin = reveal || sel === ex.answer || rt.attempts >= 3;
    const local = E.localFeedback(ex, sel, rt.reasoning, Math.max(rt.attempts, 1), reveal || (fin && sel !== ex.answer), (i) => L[rt.perm.indexOf(i)]);
    rt.fb = { src: "Phản hồi cục bộ (theo chuỗi liên kết đã soạn sẵn)", text: local.text, correct: local.correct };
    if (fin) rt.done = true;
    progress[ex.id] = local.correct && !reveal ? "ok" : (progress[ex.id] === "ok" ? "ok" : "bad"); store.set("progress", progress);
    addLog({ kind: reveal ? "reveal" : "answer", exId: ex.id, etype: ex.type, choice: sel, correct: !reveal && local.correct, tag: local.tag, attempt: rt.attempts, secs: Math.round((Date.now() - rt.t0) / 1000), mode: S.ai && S.aiOn ? "ai" : "local" });
    practice();
    if (S.ai && S.aiOn && rt.sel != null) {
      $("#fb").innerHTML = fbHtml({ src: "⏳ Trợ lý AI đang phân tích…", text: local.text, correct: local.correct });
      try {
        const txt = await askAI(ex, rt, fin && !local.correct);
        rt.fb = { src: "🤖 Trợ lý AI (hãy tự đối chiếu với bằng chứng trong văn bản)", text: txt, correct: local.correct };
      } catch (e) { rt.fb.src = "Phản hồi cục bộ (" + ((e.name === "Error" && e.message) || "không gọi được AI nên dùng bản dự phòng") + ")"; }
      if (S.view === "practice" && D.EXERCISES[S.cur] === ex) $("#fb").innerHTML = fbHtml(rt.fb);
    }
  }

  /* ---- Bảng kiểm dùng chung ---- */
  function checklistCard(ctx) {
    return `<div class="card cl"><h3>✅ Bảng kiểm tự đánh giá (Checklist)</h3>${D.CHECKLIST.map((c, i) => `<label><input type="checkbox" class="clx" data-i="${i}"> ${esc(c)}</label>`).join("")}<button class="btn sec" data-act="savecl" data-v="${ctx}">Lưu bảng kiểm</button> <span id="clmsg-${ctx}" class="muted small"></span></div>`;
  }

  /* ================= BẢN ĐỒ GIVEN–NEW ================= */
  const SAMPLES = {
    ai: ["Artificial intelligence is transforming the modern workplace.", "It automates repetitive tasks and enhances overall productivity.", "However, this technological shift also raises serious concerns about job displacement."],
    urban: ["Many cities in Vietnam are expanding rapidly as more people move in from the countryside.", "This trend creates huge pressure on housing and public transport.", "As a result, residents in inner districts spend hours in traffic every day.", "To tackle these problems, local authorities have begun to invest in metro lines and bus rapid transit.", "These measures, however, will only work if they are combined with careful urban planning."],
    wrong: ["It automates repetitive tasks and enhances overall productivity.", "However, this technological shift also raises serious concerns about job displacement.", "Artificial intelligence is transforming the modern workplace."]
  };
  function highlight(s, isFirst, next) {
    let h = esc(s);
    // Một lượt quét: từ nối đầu câu được ưu tiên để “this” trong “For this reason” không bị tách ra.
    return h.replace(/^(for this reason|for that reason|as a result|on the other hand|in addition|in contrast|for example|for instance|however|nevertheless|nonetheless|therefore|consequently|thus|hence|moreover|furthermore|besides|meanwhile|then|finally|afterwards|instead)\b|\b(this|that|these|those|such|it|its|they|them|their|he|she|his|her|him)\b/gi,
      (m, conj) => `<span class="badge ${conj ? "b-con" : "b-ref"}">${m}</span>`);
  }
  function mapView() {
    $("#app").innerHTML = `<h1>🗺️ Coherence Flow-Mapping</h1><p class="muted">Dán các câu (mỗi câu một dòng) theo thứ tự em đang thử. Công cụ tự tìm <span class="badge b-ref">đại từ quy chiếu</span>, <span class="badge b-con">từ nối</span>, <span class="badge b-lex">từ khóa lặp</span> và <span class="badge b-gn">cầu nối Given–New</span> giữa từng cặp câu, rồi cảnh báo chỗ có thể “gãy mạch”.</p>
    <div class="card"><div class="row"><b>Ví dụ:</b><button class="btn sec" data-act="sample" data-v="ai">AI &amp; nơi làm việc</button><button class="btn sec" data-act="sample" data-v="urban">Đô thị hóa (đúng trật tự)</button><button class="btn sec" data-act="sample" data-v="wrong">Thứ tự sai (để thấy điểm gãy)</button></div>
    <textarea id="mapin" style="min-height:140px;margin-top:10px" placeholder="Mỗi dòng một câu tiếng Anh…">${esc((S.mapText || SAMPLES.ai.join("\n")))}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn" data-act="runmap">Phân tích</button><span class="muted small">Gợi ý: công cụ chỉ là phép kiểm tra nhanh dựa trên tín hiệu bề mặt; em vẫn cần tự giải thích bằng chứng ở Bước 4.</span></div></div><div id="mapout"></div>`;
    runMap();
  }
  function runMap() {
    const txt = $("#mapin").value; S.mapText = txt;
    const res = E.analyzeText(txt.split(/\n+/));
    if (!res.sentences.length) { $("#mapout").innerHTML = ""; return; }
    const lab = { strong: "Liên kết chặt", ok: "Liên kết khá", weak: "Liên kết yếu – kiểm tra lại", break: "Có thể gãy mạch" };
    let h = `<div class="card">${res.warnings.map((w) => `<p class="v-break">⚠️ ${esc(w)}</p>`).join("")}<div class="flow">`;
    res.sentences.forEach((s, i) => {
      h += `<div class="fbox"><b>${String.fromCharCode(65 + i)}</b> ${highlight(s)}</div>`;
      const p = res.pairs[i];
      if (p) {
        const b = [];
        if (p.strongRefs.length) b.push(`<span class="badge b-ref">Quy chiếu: ${esc(p.strongRefs.join(", "))}</span>`);
        if (p.conj) b.push(`<span class="badge b-con">Từ nối: ${esc(p.conj.word)} (${esc(p.conj.rel)})</span>`);
        if (p.shared.length) b.push(`<span class="badge b-lex">Từ khóa lặp: ${esc(p.shared.slice(0, 4).join(", "))}</span>`);
        if (p.givenNew.length) b.push(`<span class="badge b-gn">Given–New: ${esc(p.givenNew.join(", "))}</span>`);
        h += `<div class="farrow"><span class="ar">↓</span>${b.join("") || '<span class="muted">không thấy tín hiệu bề mặt</span>'}<span class="v-${p.verdict}">${lab[p.verdict]}</span></div>`;
      }
    });
    $("#mapout").innerHTML = h + `</div><p class="muted small">Câu hỏi tự kiểm tra: thông tin mới ở cuối câu trước đã trở thành thông tin đã biết ở đầu câu sau chưa?</p></div>`;
  }

  /* ================= BREAKDOWN ANALYSIS TASKS ================= */
  function newBreakdown(id) {
    const pool = D.EXERCISES.filter((e) => e.type === "order");
    const ex = id ? byId(id) : pool[Math.floor(Math.random() * pool.length)];
    const wrongs = ex.options.map((o, i) => i).filter((i) => i !== ex.answer);
    const oi = wrongs[Math.floor(Math.random() * wrongs.length)];
    S.bd = { exId: ex.id, oi, marks: new Set(), done: false };
  }
  function breakdown() {
    if (!S.bd) newBreakdown();
    const b = S.bd, ex = byId(b.exId), seq = E.orderArr(ex.options[b.oi]), truth = E.breaksOf(ex, seq), soft = E.softOf(ex, seq);
    const J = (i) => {
      let cls = "jbtn", txt = i === 0 ? "▲ bắt đầu đoạn có vấn đề?" : "✂️ gãy mạch ở đây?";
      const on = b.marks.has(i);
      if (b.done && soft.includes(i)) return `<div class="junction"><span class="muted small">⚪ Chỗ nối này vẫn đọc được, đánh dấu hay không đều không tính điểm</span></div>`;
      if (b.done) { const t = truth.includes(i); if (on && t) { cls += " hit"; txt = "✅ đúng, có điểm gãy"; } else if (on && !t) { cls += " on"; txt = "❌ chỗ này không gãy"; } else if (!on && t) { cls += " miss"; txt = "⚠️ em bỏ sót điểm gãy"; } else return ""; }
      else if (on) { cls += " on"; txt = "✂️ đã đánh dấu gãy"; }
      return `<div class="junction"><button class="${cls}" data-act="junc" data-v="${i}" ${b.done ? "disabled" : ""}>${txt}</button></div>`;
    };
    let h = `<h1>🔍 Breakdown Analysis Tasks</h1><p class="muted">Đoạn văn dưới đây đã bị xáo trộn có chủ ý. Hãy nhấp vào những chỗ nối <b>gãy mạch lạc</b> (đại từ không có danh từ gốc, từ nối sai quan hệ, đứt Given–New, cặp thoại sai).</p>
    <div class="card"><div class="row"><span class="chip">${ex.id}</span><span class="muted small">${esc(ex.topic)}</span></div>${J(0)}`;
    seq.forEach((k, i) => { h += `<div class="sent"><b>${i + 1}.</b><span>${esc(ex.sentences[k])}</span></div>` + (i < seq.length - 1 ? J(i + 1) : ""); });
    h += `<div class="row" style="margin-top:12px"><button class="btn" data-act="gradebd" ${b.done ? "disabled" : ""}>Chấm bài</button><button class="btn ghost" data-act="newbd">Bài khác</button></div>`;
    if (b.done) {
      const scored = [...b.marks].filter((m) => !soft.includes(m)), hit = scored.filter((m) => truth.includes(m)).length, fp = scored.length - hit, miss = truth.length - hit;
      h += `<div class="fb ${hit === truth.length && !fp ? "good" : "err"}"><span class="src">Kết quả</span>Đúng ${hit}/${truth.length} điểm gãy · đánh dấu nhầm ${fp} · bỏ sót ${miss}.\n\n${ex.options[b.oi].tag ? "Lỗi nổi bật: " + D.TAGS[ex.options[b.oi].tag].label + " – " + ex.options[b.oi].why : ""}\n\n✅ Thứ tự đúng: ${E.correctOrder(ex).join(" – ")}. ${ex.chain}</div>`;
    }
    $("#app").innerHTML = h + `</div>${b.done ? checklistCard("breakdown") : ""}`;
  }

  /* ================= KIỂM TRA ĐỊNH KỲ (Phân hệ 3) ================= */
  let timerId = null;
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  const TEST_SECS = 30 * 60;
  function testView() {
    stopTimer();
    const T = S.test;
    if (!T) {
      const hist = logs.filter((l) => l.kind === "test");
      $("#app").innerHTML = `<h1>📝 Bài kiểm tra thực nghiệm ngắn (Diagnostic Test)</h1><div class="card"><p>Gồm <b>10 câu</b> (5 sắp xếp + 5 đọc điền) theo ma trận đề thi tốt nghiệp THPT định dạng mới, thời gian <b>30 phút</b>. Trong khi làm bài, hệ thống <b>không hiện phản hồi</b>; kết quả và phân tích điểm gãy được hiển thị sau khi nộp.</p>
      ${profile.name ? "" : `<p class="v-weak">Em chưa nhập tên/lớp. <a href="#" data-act="profile">Nhập ngay</a> để giáo viên theo dõi tiến bộ.</p>`}
      <button class="btn" data-act="starttest">Bắt đầu làm bài</button></div>
      ${hist.length ? `<div class="card"><h3>Lịch sử</h3><div class="scroll"><table><thead><tr><th>Ngày</th><th>Điểm (thang 10)</th><th>Đúng</th><th>Thời gian</th></tr></thead><tbody>${hist.slice().reverse().map((l) => `<tr><td>${esc((l.ts || "").slice(0, 16).replace("T", " "))}</td><td>${num(l.score10, 1)}</td><td>${l.correct}/${l.total}</td><td>${Math.floor(l.secs / 60)}′${String(l.secs % 60).padStart(2, "0")}″</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
      return;
    }
    if (T.finished) return testResult();
    const ex = byId(T.ids[T.i]), rt = { perm: perm(ex) };
    $("#app").innerHTML = `<div class="row" style="justify-content:space-between"><h1>📝 Câu ${T.i + 1}/${T.ids.length}</h1><div class="timer" id="timer">--:--</div></div>
    <div class="card"><div class="qnav" style="margin-bottom:12px">${T.ids.map((id, i) => `<button data-act="qgo" data-v="${i}" class="${T.ans[id] != null ? "done" : ""} ${i === T.i ? "cur" : ""}">${i + 1}</button>`).join("")}</div>
      ${exBody(ex, rt, false, T.ans[ex.id], false)}
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-act="qprev" ${T.i === 0 ? "disabled" : ""}>← Trước</button><button class="btn ghost" data-act="qnext" ${T.i === T.ids.length - 1 ? "disabled" : ""}>Sau →</button><span style="flex:1"></span><button class="btn bad" data-act="submit">Nộp bài</button></div>
      <p class="muted small">Đã trả lời ${Object.keys(T.ans).length}/${T.ids.length} câu.</p></div>`;
    const tick = () => { const left = Math.max(0, TEST_SECS - Math.floor((Date.now() - T.t0) / 1000)); const el = $("#timer"); if (el) el.textContent = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0"); if (left <= 0) { stopTimer(); finishTest(true); } };
    tick(); timerId = setInterval(tick, 1000);
  }
  function finishTest(auto) {
    const T = S.test; if (!T || T.finished) return;
    stopTimer();
    const correct = T.ids.filter((id) => T.ans[id] === byId(id).answer).length;
    T.finished = true; T.correct = correct; T.secs = Math.min(TEST_SECS, Math.round((Date.now() - T.t0) / 1000)); T.score10 = correct / T.ids.length * 10; T.auto = !!auto;
    const tags = {}; T.ids.forEach((id) => { const ex = byId(id), a = T.ans[id]; if (a != null && a !== ex.answer && ex.options[a].tag) tags[ex.options[a].tag] = (tags[ex.options[a].tag] || 0) + 1; });
    const ord = T.ids.filter((id) => byId(id).type === "order"), gap = T.ids.filter((id) => byId(id).type === "gap");
    const ok = (arr) => arr.filter((id) => T.ans[id] === byId(id).answer).length;
    addLog({ kind: "test", score10: T.score10, correct, total: T.ids.length, secs: T.secs, orderOk: ok(ord), orderN: ord.length, gapOk: ok(gap), gapN: gap.length, tags });
    T.ids.forEach((id) => { const ex = byId(id), a = T.ans[id]; addLog({ kind: "answer", exId: id, etype: ex.type, choice: a == null ? -1 : a, correct: a === ex.answer, tag: a != null && a !== ex.answer ? ex.options[a].tag || null : null, attempt: 1, mode: "test" }); });
    testView();
  }
  function testResult() {
    const T = S.test;
    $("#app").innerHTML = `<h1>📝 Kết quả bài kiểm tra</h1><div class="grid g4"><div class="card kpi"><b>${num(T.score10, 1)}</b><span>điểm (thang 10)</span></div><div class="card kpi"><b>${T.correct}/${T.ids.length}</b><span>câu đúng</span></div><div class="card kpi"><b>${Math.floor(T.secs / 60)}′${String(T.secs % 60).padStart(2, "0")}″</b><span>thời gian làm bài</span></div><div class="card kpi"><b>${T.auto ? "Hết giờ" : "Đã nộp"}</b><span>trạng thái</span></div></div>
    <div class="card"><h3>Chi tiết từng câu – tự phân tích điểm gãy (Bước 4)</h3>${T.ids.map((id, n) => { const ex = byId(id), a = T.ans[id], ok = a === ex.answer; return `<details style="margin:6px 0" ${ok ? "" : "open"}><summary>${ok ? "✅" : "❌"} <b>Câu ${n + 1} (${id})</b> – ${esc(ex.topic)} ${a == null ? "<i>(chưa trả lời)</i>" : ""}</summary><div style="padding:8px 0 8px 18px">${ex.type === "order" ? Object.entries(ex.sentences).map(([k, v]) => `<div class="sent"><b>${k}.</b><span>${esc(v)}</span></div>`).join("") : `<div class="stem">${esc(ex.stem)}</div>`}<p><b>Em chọn:</b> ${a == null ? "–" : esc(optText(ex, a))}<br><b>Đáp án:</b> ${esc(optText(ex, ex.answer))}</p>${!ok && a != null ? `<p>${tagChip(ex.options[a].tag)} ${esc(ex.options[a].why)}</p>` : ""}<p class="muted">${esc(ex.chain)}</p></div></details>`; }).join("")}</div>
    ${checklistCard("test")}<div class="row"><button class="btn" data-act="retest">Làm lại bài</button><a class="btn sec" href="#dash">Xem tiến bộ</a></div>`;
  }

  /* ================= BẢNG TIẾN BỘ + GIÁO VIÊN ================= */
  const csvCell = (v) => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; // chặn công thức Excel trong tên học sinh
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  function bars(tags) {
    const keys = Object.keys(D.TAGS), max = Math.max(1, ...keys.map((k) => tags[k] || 0));
    return keys.map((k) => `<div style="margin:8px 0"><div class="row small" style="justify-content:space-between"><span>${tagChip(k)} <span class="muted">${esc(D.TAGS[k].desc)}</span></span><b>${tags[k] || 0}</b></div><div class="bar"><i style="width:${(tags[k] || 0) / max * 100}%;background:${D.TAGS[k].color}"></i></div></div>`).join("");
  }
  function dash() {
    S.dtab = S.dtab || "me";
    const tabs = `<div class="tabs"><button data-act="dtab" data-v="me" class="${S.dtab === "me" ? "on" : ""}">Của em</button><button data-act="dtab" data-v="teacher" class="${S.dtab === "teacher" ? "on" : ""}">Giáo viên (gộp cả lớp)</button></div>`;
    $("#app").innerHTML = `<h1>📊 Theo dõi tiến bộ</h1>${tabs}<div id="dbody"></div>`;
    S.dtab === "me" ? dashMe() : dashTeacher();
  }
  function dashMe() {
    const mine = logs.filter((l) => !profile.name || l.student === profile.name || !l.student);
    const A = E.aggregate(mine), row = A.rows.reduce((a, r) => { a.attempts += r.attempts; a.correct += r.correct; return a; }, { attempts: 0, correct: 0 });
    const tests = mine.filter((l) => l.kind === "test"), cl = mine.filter((l) => l.kind === "checklist").length, bd = mine.filter((l) => l.kind === "breakdown");
    $("#dbody").innerHTML = `<div class="grid g4"><div class="card kpi"><b>${row.attempts}</b><span>lượt luyện tập</span></div><div class="card kpi"><b>${row.attempts ? pct(row.correct / row.attempts) : "–"}</b><span>tỷ lệ đúng</span></div><div class="card kpi"><b>${bd.length}</b><span>bài Breakdown</span></div><div class="card kpi"><b>${cl}</b><span>bảng kiểm đã lưu</span></div></div>
    <div class="grid g2"><div class="card"><h3>Các lỗi tư duy em hay mắc</h3>${bars(A.tags)}<p class="muted small">Tính từ các phương án sai em đã chọn.</p></div>
    <div class="card"><h3>Điểm các bài kiểm tra</h3>${tests.length ? `<div class="scroll"><table><thead><tr><th>Lần</th><th>Ngày</th><th>Điểm</th></tr></thead><tbody>${tests.map((t, i) => `<tr><td>${i + 1}</td><td>${esc(t.ts.slice(0, 10))}</td><td><b>${num(t.score10, 1)}</b></td></tr>`).join("")}</tbody></table></div>${tests.length > 1 ? `<p>Tiến bộ: <b>${num(tests[tests.length - 1].score10 - tests[0].score10, 1)}</b> điểm so với lần đầu.</p>` : ""}` : `<p class="muted">Chưa có bài kiểm tra nào.</p>`}</div></div>
    <div class="card"><div class="row"><button class="btn" data-act="exportjson">⬇️ Xuất nhật ký (JSON) gửi giáo viên</button><button class="btn bad" data-act="clearlogs">Xóa dữ liệu trên máy này</button></div><p class="muted small">Giáo viên gộp các tệp JSON của học sinh ở thẻ “Giáo viên”.</p></div>`;
  }
  function dashTeacher() {
    const all = S.imported ? S.imported : [];
    const merged = E.cleanLogs((S.useLocal ? logs : []).concat(all));
    const A = E.aggregate(merged);
    const topTag = (t) => { const e = Object.entries(t).sort((a, b) => b[1] - a[1])[0]; return e ? D.TAGS[e[0]].label : "–"; };
    const classes = Object.create(null); A.rows.forEach((r) => { const c = (classes[r.cls || "(chưa ghi lớp)"] = classes[r.cls || "(chưa ghi lớp)"] || { n: 0, att: 0, ok: 0, first: [], last: [] }); c.n++; c.att += r.attempts; c.ok += r.correct; if (r.firstTest != null) { c.first.push(r.firstTest); c.last.push(r.lastTest); } });
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const hard = Object.entries(A.byEx).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 5);
    $("#dbody").innerHTML = `<div class="card"><h3>Gộp nhật ký của học sinh</h3><p class="muted small">Mỗi học sinh xuất tệp JSON ở thẻ “Của em”. Chọn nhiều tệp để gộp. Dữ liệu chỉ xử lý trên trình duyệt, không gửi lên máy chủ.</p>
      <div class="row"><input type="file" id="files" accept=".json" multiple><label class="row" style="font-weight:500"><input type="checkbox" id="uselocal" ${S.useLocal ? "checked" : ""} style="width:auto"> Gộp cả nhật ký trên máy này</label><button class="btn sec" data-act="clearimp">Xóa dữ liệu đã nhập</button></div>
      <p class="small">Đã nhập: <b>${all.length}</b> bản ghi · Tổng đang phân tích: <b>${merged.length}</b></p></div>
    ${A.rows.length ? `<div class="card"><h3>Tổng hợp theo lớp</h3><div class="scroll"><table><thead><tr><th>Lớp</th><th>Số HS</th><th>Lượt luyện</th><th>Tỷ lệ đúng</th><th>Điểm KT lần đầu (TB)</th><th>Điểm KT gần nhất (TB)</th></tr></thead><tbody>${Object.entries(classes).map(([k, c]) => `<tr><td><b>${esc(k)}</b></td><td>${c.n}</td><td>${c.att}</td><td>${c.att ? pct(c.ok / c.att) : "–"}</td><td>${avg(c.first) == null ? "–" : num(avg(c.first), 2)}</td><td>${avg(c.last) == null ? "–" : num(avg(c.last), 2)}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="grid g2"><div class="card"><h3>Lỗi tư duy phổ biến của cả nhóm</h3>${bars(A.tags)}</div><div class="card"><h3>Câu khó nhất (≥3 lượt)</h3>${hard.length ? `<table><tbody>${hard.map(([id, v]) => `<tr><td><b>${esc(id)}</b> – ${esc(byId(id) ? byId(id).topic : "")}</td><td>${pct(v.ok / v.n)} đúng (${v.n} lượt)</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Chưa đủ dữ liệu.</p>`}</div></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h3>Chi tiết từng học sinh</h3><button class="btn" data-act="exportcsv">⬇️ Xuất CSV (Excel)</button></div><div class="scroll"><table><thead><tr><th>Học sinh</th><th>Lớp</th><th>Lượt luyện</th><th>Tỷ lệ đúng</th><th>KT lần đầu → gần nhất</th><th>Breakdown</th><th>Bảng kiểm</th><th>Số ngày học</th><th>Lỗi hay mắc</th></tr></thead><tbody>${A.rows.sort((a, b) => a.cls.localeCompare(b.cls) || a.student.localeCompare(b.student)).map((r) => `<tr><td>${esc(r.student)}</td><td>${esc(r.cls)}</td><td>${r.attempts}</td><td>${r.attempts ? pct(r.accuracy) : "–"}</td><td>${r.firstTest == null ? "–" : num(r.firstTest, 1) + " → " + num(r.lastTest, 1)}</td><td>${r.breakdown}</td><td>${r.checklists}</td><td>${r.days}</td><td>${esc(topTag(r.tags))}</td></tr>`).join("")}</tbody></table></div></div>` : `<div class="card"><p class="muted">Chưa có dữ liệu để thống kê.</p></div>`}`;
    S._agg = A;
  }

  /* ---------------- Hồ sơ ---------------- */
  function profileModal() {
    $("#modal").innerHTML = `<div class="modal"><div class="box"><h3>Thông tin học sinh</h3><p class="muted small">Dùng tên/biệt danh hoặc mã số. Chỉ lưu trên thiết bị này.</p>
    <label>Tên / mã số</label><input type="text" id="pn" value="${esc(profile.name)}" maxlength="40"><label style="display:block;margin-top:8px">Lớp</label><input type="text" id="pc" value="${esc(profile.cls)}" maxlength="12" placeholder="Ví dụ: 12G">
    <div class="row" style="margin-top:14px"><button class="btn" data-act="saveprofile">Lưu</button><button class="btn ghost" data-act="closemodal">Đóng</button></div></div></div>`;
  }

  /* ---------------- Xử lý sự kiện ---------------- */
  document.addEventListener("click", (e) => {
    const goEl = e.target.closest("[data-go]"); if (goEl) { location.hash = goEl.dataset.go; return; }
    const t = e.target.closest("[data-act]"); if (!t) return;
    const a = t.dataset.act, v = t.dataset.v;
    if (t.tagName === "A") e.preventDefault();
    switch (a) {
      case "profile": profileModal(); break;
      case "closemodal": $("#modal").innerHTML = ""; break;
      case "saveprofile": profile = { name: $("#pn").value.trim(), cls: $("#pc").value.trim().toUpperCase() }; store.set("profile", profile); $("#modal").innerHTML = ""; render(); break;
      case "gtab": S.gtab = v; guide(); break;
      case "tsec": S.tsec = v; guide(); break;
      case "qzpick": { const [i, j] = v.split(":").map(Number); S.qz = S.qz || {}; S.qz[i] = j; guide(); break; }
      case "qzreset": S.qz = {}; guide(); break;
      case "filter": S.filter = v; practice(); break;
      case "goex": S.cur = +v; practice(); break;
      case "pick": { if (S.view !== "practice") break; const ex = D.EXERCISES[S.cur], rt = rtOf(ex); if (!rt.done) { rt.sel = +v; $("#exbody").innerHTML = exBody(ex, rt, false, rt.sel, false); } break; }
      case "check": doCheck(false); break;
      case "reveal": doCheck(true); break;
      case "retry": { const ex = D.EXERCISES[S.cur]; delete S.rt[ex.id]; practice(); break; }
      case "nextex": { const list = D.EXERCISES.filter((x) => S.filter === "all" || x.type === S.filter); const i = list.indexOf(D.EXERCISES[S.cur]); S.cur = D.EXERCISES.indexOf(list[(i + 1) % list.length]); practice(); break; }
      case "savecl": { const box = t.closest(".cl"), checked = [...box.querySelectorAll(".clx")].map((x) => x.checked); addLog({ kind: "checklist", ctx: v, items: checked, done: checked.filter(Boolean).length }); const m = $("#clmsg-" + v); if (m) m.textContent = `Đã lưu (${checked.filter(Boolean).length}/${checked.length} mục).`; break; }
      case "sample": $("#mapin").value = SAMPLES[v].join("\n"); runMap(); break;
      case "runmap": runMap(); break;
      case "junc": { const i = +v; S.bd.marks.has(i) ? S.bd.marks.delete(i) : S.bd.marks.add(i); breakdown(); break; }
      case "gradebd": { const b = S.bd; b.done = true; const ex = byId(b.exId), seq = E.orderArr(ex.options[b.oi]), truth = E.breaksOf(ex, seq), soft = E.softOf(ex, seq), scored = [...b.marks].filter((m) => !soft.includes(m)), hit = scored.filter((m) => truth.includes(m)).length; addLog({ kind: "breakdown", exId: b.exId, hit, truth: truth.length, fp: scored.length - hit }); breakdown(); break; }
      case "newbd": newBreakdown(); breakdown(); break;
      case "starttest": S.test = { ids: shuffle(D.EXERCISES.map((x) => x.id)), i: 0, ans: {}, t0: Date.now(), finished: false }; testView(); break;
      case "qgo": S.test.i = +v; testView(); break;
      case "qprev": S.test.i--; testView(); break;
      case "qnext": S.test.i++; testView(); break;
      case "submit": { const n = S.test.ids.length - Object.keys(S.test.ans).length; if (confirm(n ? `Em còn ${n} câu chưa trả lời. Vẫn nộp bài?` : "Nộp bài ngay?")) finishTest(false); break; }
      case "retest": S.test = null; testView(); break;
      case "dtab": S.dtab = v; dash(); break;
      case "exportjson": { const mine = logs.filter((l) => !profile.name || l.student === profile.name || !l.student); download(`ccn-nhat-ky-${(profile.name || "hs").replace(/[^\p{L}\p{N}]+/gu, "_")}.json`, JSON.stringify(mine), "application/json"); break; }
      case "clearlogs": if (confirm("Xóa toàn bộ nhật ký học tập trên máy này? Không thể hoàn tác.")) { logs = []; progress = {}; store.set("logs", logs); store.set("progress", progress); dash(); } break;
      case "clearimp": S.imported = []; dash(); break;
      case "exportcsv": { const A = S._agg; if (!A) break; const head = ["Học sinh", "Lớp", "Lượt luyện", "Số đúng", "Tỷ lệ đúng", "KT lần đầu", "KT gần nhất", "KT tốt nhất", "Breakdown", "Bảng kiểm", "Số ngày học"]; const rows = A.rows.map((r) => [r.student, r.cls, r.attempts, r.correct, r.attempts ? (r.accuracy * 100).toFixed(1) : "", r.firstTest ?? "", r.lastTest ?? "", r.bestTest ?? "", r.breakdown, r.checklists, r.days]); download("ccn-tong-hop-lop.csv", "\ufeff" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8"); break; }
    }
  });
  document.addEventListener("click", (e) => { const o = e.target.closest(".opt[data-act=pick]"); if (o && S.view === "test") { const T = S.test; T.ans[T.ids[T.i]] = +o.dataset.v; testView(); } }, true);
  document.addEventListener("change", (e) => {
    if (e.target.id === "uselocal") { S.useLocal = e.target.checked; dash(); }
    if (e.target.id === "files") {
      const fs = [...e.target.files]; S.imported = S.imported || [];
      Promise.all(fs.map((f) => f.text().then((t) => { try { const j = JSON.parse(t); return Array.isArray(j) ? j.slice(0, 5000) : []; } catch (er) { return []; } }))).then((arrs) => { S.imported = E.cleanLogs(S.imported.concat(...arrs)); dash(); });
    }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "mapin") { clearTimeout(S._mt); S._mt = setTimeout(runMap, 250); } });

  render();
})();
