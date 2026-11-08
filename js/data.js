/* Dữ liệu nội dung của CC-Navigator – bám sát SKKN (Giải pháp 1, 2, 3 và Phụ lục 4, 5, 6, 7). */
(function (root) {
  const TAGS = {
    Reference: { label: "Quy chiếu", color: "#2563eb", desc: "Đại từ/từ chỉ định (this, that, these, it, they…) không có danh từ gốc ở câu trước." },
    Conjunction: { label: "Từ nối", color: "#d97706", desc: "Từ nối (However, As a result…) dùng sai quan hệ logic hoặc đặt sai vị trí." },
    GivenNew: { label: "Đã biết – Mới", color: "#7c3aed", desc: "Thông tin mới của câu trước không trở thành thông tin đã biết của câu sau." },
    Adjacency: { label: "Cặp thoại liền kề", color: "#059669", desc: "Câu đáp không khớp chức năng giao tiếp của câu hỏi/lời mời liền trước." },
    Topic: { label: "Lạc chủ đề / Từ vựng", color: "#dc2626", desc: "Phương án lạc chủ đề hoặc mâu thuẫn với chuỗi từ vựng của đoạn." }
  };

  /* Bộ công cụ Cohesion Decoder Toolkit (Phụ lục 4) */
  const GROUPS = [
    { id: "ref", icon: "🔗", name: "Nhóm 1 – Reference (Đại từ quy chiếu)", words: "this, that, these, those, such, it, they, he, she, one, ones",
      rule: "Bắt buộc truy ngược về danh từ số ít/số nhiều ở câu đứng trước.",
      example: "Many urban areas are facing severe traffic congestion. <mark>This issue</mark> requires immediate intervention from local authorities.",
      note: "“This issue” thay cho toàn bộ hiện tượng tắc nghẽn giao thông ở câu trước." },
    { id: "lex", icon: "🧩", name: "Nhóm 2 – Lexical Cohesion (Liên kết từ vựng)", words: "lặp từ khóa, đồng nghĩa/trái nghĩa, trường từ vựng",
      rule: "Nhận diện chuỗi từ vựng xuyên suốt để giữ vững chủ đề đoạn văn.",
      example: "<mark>Ecotourism</mark> provides financial benefits to local communities. Such <mark>sustainable travel models</mark> also help preserve natural habitats.",
      note: "ecotourism ↔ sustainable travel models cùng trường nghĩa du lịch bền vững." },
    { id: "con", icon: "🔀", name: "Nhóm 3 – Conjunction (Liên từ logic)", words: "However, Therefore, Furthermore, In addition, Consequently, Meanwhile",
      rule: "Kiểm tra mối quan hệ ngữ nghĩa thực sự (nhân quả, đối lập, bổ sung) trước khi chọn.",
      example: "Social media is popular. <mark>However</mark>, some users post private details without realising the risks.",
      note: "However chỉ đúng khi câu sau thật sự đối lập với câu trước." },
    { id: "str", icon: "🏗️", name: "Nhóm 4 – Structural Cohesion (Liên kết cấu trúc)", words: "cấu trúc song song, cặp thoại liền kề (hỏi – đáp, mời – nhận/từ chối, cảm ơn – đáp lời)",
      rule: "Kiểm tra câu sau có đáp đúng chức năng giao tiếp của câu trước hay không.",
      example: "– Would you like to join the club? <mark>– Yes, I’d love to.</mark>",
      note: "Câu đáp phải đứng liền sau câu hỏi/lời mời." }
  ];

  /* Bảng tra từ nối */
  const CONNECTORS = [
    ["however", "Đối lập", "Câu sau trái ngược/nhượng bộ so với câu trước.", "Cars are convenient. However, they cause pollution."],
    ["nevertheless / nonetheless", "Đối lập", "Vẫn… bất chấp điều vừa nêu.", "It was raining. Nevertheless, we went out."],
    ["in contrast / on the other hand", "Đối lập", "Đặt hai mặt tương phản cạnh nhau.", "Cities are crowded. In contrast, villages are quiet."],
    ["therefore / thus / hence", "Kết quả", "Câu sau là kết luận từ câu trước.", "He studied hard. Therefore, he passed."],
    ["as a result / consequently", "Kết quả", "Câu sau là hệ quả của sự việc đã nêu.", "Traffic is heavy. As a result, people arrive late."],
    ["for this reason", "Kết quả", "Câu trước nêu nguyên nhân; câu sau nêu hành động/kết luận.", "Data can be stolen. For this reason, schools should teach online safety."],
    ["moreover / furthermore / in addition", "Bổ sung", "Thêm một ý cùng hướng.", "It is cheap. Moreover, it is fast."],
    ["for example / for instance", "Ví dụ", "Câu sau minh họa cho ý trước.", "Many animals are endangered. For example, tigers."],
    ["meanwhile", "Thời gian", "Việc khác diễn ra cùng lúc.", "I was cooking. Meanwhile, he was cleaning."],
    ["then / afterwards / finally", "Thời gian", "Trình tự các sự việc.", "First we planned. Then we acted."],
    ["because of / due to", "Nguyên nhân", "Theo sau là cụm danh từ.", "Because of the rain, the match was cancelled."],
    ["although / even though", "Nhượng bộ", "Mệnh đề nhượng bộ trong cùng câu.", "Although it was late, they kept working."]
  ];

  const STEPS = [
    { n: 1, en: "Skimming & Topic Identification", vi: "Đọc lướt tổng thể, định hình khung chủ đề.", tip: "Không dịch ngay. Xác định chủ đề lớn (môi trường, đô thị hóa, công nghệ…) để loại phương án lạc đề." },
    { n: 2, en: "Analyze Cohesive Devices", vi: "Khoanh vùng tín hiệu liên kết trên đề thi.", tip: "Gạch chân this/that/these/those/such, đại từ, từ nối và các từ khóa lặp lại." },
    { n: 3, en: "Map Coherence Flow", vi: "Lập bản đồ dòng chảy Given – New theo từng cặp câu.", tip: "Vẽ ô – mũi tên nháp trong 30 giây: thông tin mới của câu trước = thông tin đã biết của câu sau." },
    { n: 4, en: "Evidence-based Verification", vi: "Tự giải thích lý do chọn đáp án đúng và chỉ ra điểm gãy của phương án nhiễu.", tip: "Viết 1–2 câu: “Đáp án đúng vì…, phương án nhiễu gãy vì…”." }
  ];

  const CHECKLIST = [
    "Đã truy ngược tất cả đại từ quy chiếu (this, that, they, it…) về danh từ gốc chưa?",
    "Mạch thông tin Given – New đã xuyên suốt từ câu đầu đến câu cuối chưa?",
    "Đã kiểm chứng ý nghĩa thực của từ nối (However, Therefore…) chưa?",
    "Đã chỉ ra được điểm gãy mạch lạc của cả 3 phương án nhiễu chưa?"
  ];

  /* Ngân hàng 10 câu: 5 sắp xếp + 5 đọc điền (khớp ma trận Phụ lục 6) */
  const EXERCISES = [
    { id: "O1", type: "order", level: "Nhận biết", topic: "Hội thoại – câu lạc bộ",
      prompt: "Choose the best order of the sentences (a – d) to make a meaningful conversation.",
      sentences: { a: "Mai: “Hi Nam, are you joining the English club this semester?”", b: "Nam: “Yes, I am. I want to improve my speaking skills.”", c: "Mai: “That’s great! We meet every Friday afternoon in Room 12.”", d: "Nam: “Perfect. Friday afternoons are free for me, so I’ll see you there.”" },
      options: [
        { order: "b-a-c-d", tag: "Adjacency", why: "Câu đáp b (“Yes, I am”) đứng trước câu hỏi a nên không có gì để đáp." },
        { order: "a-b-c-d" },
        { order: "a-c-b-d", tag: "Adjacency", why: "c (“That’s great!”) chen vào giữa cặp hỏi – đáp a–b; c chỉ là phản hồi cho b." },
        { order: "c-a-b-d", tag: "Adjacency", why: "Mở đầu bằng phản hồi “That’s great!” khi chưa có thông tin nào được chia sẻ." }
      ], answer: 1,
      chain: "a (câu hỏi) → b (đáp “Yes, I am”) → c (“That’s great!” phản hồi b + thông tin lịch họp) → d (nhắc lại “Friday afternoons” từ c).",
      hints: ["Câu mở đầu có phải là một câu hỏi/lời mời không? Câu nào là câu đáp trực tiếp?", "“That’s great!” đang phản hồi cho thông tin nào đã xuất hiện trước đó?"],
      keywords: ["hỏi", "đáp", "adjacency", "friday", "yes"] },

    { id: "O2", type: "order", level: "Vận dụng", topic: "Đô thị hóa",
      prompt: "Choose the best order of the sentences (a – e) to make a cohesive paragraph.",
      sentences: { a: "To tackle these problems, local authorities have begun to invest in metro lines and bus rapid transit.", b: "These measures, however, will only work if they are combined with careful urban planning.", c: "Many cities in Vietnam are expanding rapidly as more people move in from the countryside.", d: "As a result, residents in inner districts spend hours in traffic every day.", e: "This trend creates huge pressure on housing and public transport." },
      options: [
        { order: "c-d-e-a-b", tag: "GivenNew", why: "d (“As a result”) đứng ngay sau c khi áp lực nhà ở – giao thông ở e chưa được nêu; “This trend” ở e bị d chen ngang nên mất quy chiếu về c." },
        { order: "c-e-d-a-b" },
        { order: "e-c-d-a-b", tag: "Reference", why: "“This trend” ở đầu đoạn không có danh từ gốc để truy ngược." },
        { order: "c-e-a-d-b", tag: "Conjunction", why: "“As a result” (d) đứng sau giải pháp (a) làm đảo ngược quan hệ nhân quả; “these problems” ở a cũng chưa có vấn đề nào được nêu rõ." }
      ], answer: 1, soft: ["c-d", "e-a"],
      chain: "c → e: “This trend” = các thành phố mở rộng nhanh (Reference); e → d: “As a result” nêu hệ quả (Conjunction); d → a: “these problems” gom ùn tắc và áp lực hạ tầng (Reference); a → b: “These measures” = metro, xe buýt nhanh; “however” mở điều kiện đối lập hợp lý.",
      hints: ["Câu nào giới thiệu chủ đề mà không cần đại từ quy chiếu?", "“These problems” trong câu a gom những vấn đề nào? Chúng phải xuất hiện ở câu nào trước a?"],
      keywords: ["this trend", "as a result", "these problems", "these measures", "however", "quy chiếu"] },

    { id: "O3", type: "order", level: "Thông hiểu", topic: "Trí tuệ nhân tạo",
      prompt: "Choose the best order of the sentences (a – c) to make a meaningful paragraph.",
      sentences: { a: "However, this technological shift also raises serious concerns about job displacement.", b: "It automates repetitive tasks and enhances overall productivity.", c: "Artificial intelligence is transforming the modern workplace." },
      options: [
        { order: "b-c-a", tag: "Reference", why: "“It” ở đầu đoạn không có danh từ gốc ở câu trước." },
        { order: "c-a-b", tag: "Conjunction", why: "“However” mở đối lập trước khi có ý tích cực (b) để đối lập; “this technological shift” cũng chưa được mô tả." },
        { order: "c-b-a" },
        { order: "a-c-b", tag: "Conjunction", why: "“However” đứng đầu đoạn nên không có ý nào để đối lập." }
      ], answer: 2, soft: ["c-a"],
      chain: "c (artificial intelligence) → b (“It” = AI; New: tự động hóa) → a (“this technological shift” = tự động hóa; “However” nêu mặt trái).",
      hints: ["Câu nào không chứa đại từ hay từ nối nên có thể đứng đầu?", "“this technological shift” đang chỉ vào thông tin nào được nêu ở câu liền trước?"],
      keywords: ["it", "artificial intelligence", "this technological shift", "however", "given"] },

    { id: "O4", type: "order", level: "Thông hiểu", topic: "Hội thoại – lời mời",
      prompt: "Choose the best order of the sentences (a – d) to make a meaningful conversation.",
      sentences: { a: "Lan: “Would you like to come to my birthday party on Saturday?”", b: "Tom: “I’d love to, but I have a football match that afternoon.”", c: "Lan: “No problem. The party starts at 7 p.m., so you can join us after the match.”", d: "Tom: “Great! Thanks for understanding. I’ll be there.”" },
      options: [
        { order: "a-b-d-c", tag: "Adjacency", why: "d (“Thanks for understanding”) là lời đáp cho c nên không thể đứng trước c." },
        { order: "b-a-c-d", tag: "Adjacency", why: "b (“I’d love to, but…”) trả lời lời mời, không thể đứng trước lời mời a." },
        { order: "a-c-b-d", tag: "Adjacency", why: "c (“No problem”) phản hồi lời từ chối ở b; đặt trước b làm mất cặp thoại." },
        { order: "a-b-c-d" }
      ], answer: 3,
      chain: "a (lời mời) → b (nhận kèm từ chối nhẹ) → c (“No problem” + giải pháp “after the match”) → d (cảm ơn, “the match” đã biết).",
      hints: ["Câu nào là lời mời? Câu nào là phản hồi trực tiếp cho lời mời?", "“No problem” đang đáp lại điều gì mà người kia vừa nói?"],
      keywords: ["lời mời", "từ chối", "no problem", "match", "adjacency"] },

    { id: "O5", type: "order", level: "Vận dụng cao", topic: "Du lịch sinh thái",
      prompt: "Choose the best order of the sentences (a – d) to make a cohesive paragraph.",
      sentences: { a: "Ecotourism provides financial benefits to local communities.", b: "Such sustainable travel models also help preserve natural habitats.", c: "As a result, more villages are choosing to protect their forests instead of selling the land.", d: "Tourism has grown quickly in recent years, but not all of it is environmentally friendly." },
      options: [
        { order: "a-b-c-d", tag: "GivenNew", why: "Đoạn kết thúc bằng câu giới thiệu chủ đề chung (d) nên mạch từ cụ thể đến khái quát bị đảo ngược; “Ecotourism” xuất hiện khi chưa có bối cảnh." },
        { order: "d-a-b-c" },
        { order: "d-b-a-c", tag: "Reference", why: "“Such sustainable travel models” ở b chưa có mô hình nào để quy chiếu (ecotourism ở a)." },
        { order: "d-c-a-b", tag: "Conjunction", why: "“As a result” ở c chưa có nguyên nhân phía trước (lợi ích tài chính, bảo tồn)." }
      ], answer: 1, soft: ["a-c"],
      chain: "d (tourism – chủ đề chung) → a (ecotourism – New) → b (“Such sustainable travel models” = ecotourism) → c (“As a result” nêu hệ quả của a, b).",
      hints: ["Câu nào nêu chủ đề rộng nhất, chưa dùng thuật ngữ “ecotourism”?", "“Such sustainable travel models” thay cho khái niệm nào đã nêu?"],
      keywords: ["such", "ecotourism", "as a result", "sustainable travel models", "quy chiếu"] },

    { id: "G1", type: "gap", level: "Thông hiểu", topic: "Mạng xã hội",
      prompt: "Choose the sentence that best fills the blank.",
      stem: "Many students use social media to share their daily lives. (___). For this reason, schools should teach students how to protect personal information online.",
      options: [
        { text: "However, some of them post private details without realising the risks." },
        { text: "Therefore, social media has become the most popular subject at school.", tag: "Conjunction", why: "Tạo quan hệ nhân quả không có cơ sở và không dẫn tới “protect personal information”." },
        { text: "Moreover, this website was created in 2004 by a group of students.", tag: "Topic", why: "Lạc sang lịch sử trang web; “this website” không có danh từ gốc." },
        { text: "Instead, they never use the Internet at home.", tag: "Topic", why: "Mâu thuẫn với câu đầu (“use social media”)." }
      ], answer: 0,
      chain: "“For this reason” ở câu sau cần một nguyên nhân là rủi ro; phương án đúng nêu hành vi gây rủi ro nên khớp Given – New (some of them = many students).",
      hints: ["“For this reason” ở câu sau cần một lý do. Lý do đó phải là điều gì?", "Phương án nào nêu ra một rủi ro liên quan đến thông tin cá nhân?"],
      keywords: ["for this reason", "rủi ro", "private", "however", "some of them"] },

    { id: "G2", type: "gap", level: "Nhận biết", topic: "Giao thông đô thị",
      prompt: "Choose the sentence that best fills the blank.",
      stem: "Many urban areas are facing severe traffic congestion. (___).",
      options: [
        { text: "This issue requires immediate intervention from local authorities." },
        { text: "These factories require immediate intervention from local authorities.", tag: "Reference", why: "“These factories” không có danh từ gốc ở câu trước." },
        { text: "However, traffic is not a problem in any city.", tag: "Conjunction", why: "“However” tạo đối lập nhưng mâu thuẫn trực tiếp với câu trước." },
        { text: "Meanwhile, this festival attracts thousands of visitors.", tag: "Topic", why: "Lạc chủ đề; “this festival” không quy chiếu được." }
      ], answer: 0,
      chain: "“This issue” = tình trạng tắc nghẽn giao thông ở câu trước (Reference); New → Given: congestion → this issue.",
      hints: ["Đại từ chỉ định ở phương án nào có danh từ gốc ở câu trước?", "Từ nối có tạo quan hệ logic thật sự với câu trước không?"],
      keywords: ["this issue", "congestion", "quy chiếu", "tắc nghẽn"] },

    { id: "G3", type: "gap", level: "Thông hiểu", topic: "Nông thôn – đô thị",
      prompt: "Choose the phrase that best fills the blank.",
      stem: "Economic challenges are growing in rural areas. (___), many young people are moving to cities to find jobs.",
      options: [
        { text: "Because of these difficulties" },
        { text: "Although these difficulties have disappeared", tag: "Conjunction", why: "Mâu thuẫn với câu trước (challenges are growing)." },
        { text: "Unlike these difficulties", tag: "Conjunction", why: "“Unlike” không tạo quan hệ logic ở đây và sai ngữ pháp kết hợp." },
        { text: "Such as these difficulties", tag: "Topic", why: "“Such as” dùng để liệt kê ví dụ, không mở được mệnh đề chính." }
      ], answer: 0,
      chain: "“these difficulties” = economic challenges (Reference); “Because of” nêu nguyên nhân dẫn tới việc thanh niên di cư.",
      hints: ["Quan hệ giữa khó khăn kinh tế và việc thanh niên rời quê là nhân quả hay đối lập?", "Cụm nào theo sau là cụm danh từ và nêu nguyên nhân?"],
      keywords: ["because of", "these difficulties", "nguyên nhân", "nhân quả"] },

    { id: "G4", type: "gap", level: "Vận dụng", topic: "Thói quen đọc",
      prompt: "Choose the sentence that best fills the blank.",
      stem: "Many teenagers now read e-books on their phones. (___). This shift worries some teachers, who fear students will lose focus.",
      options: [
        { text: "Print books, once the main source of reading, are being used far less often.", },
        { text: "Therefore, paper is made from trees.", tag: "Conjunction", why: "“Therefore” không có quan hệ kết quả với câu trước." },
        { text: "Moreover, the first printing press was invented in Germany.", tag: "Topic", why: "Lạc sang lịch sử máy in; không tạo ra “shift” cho câu sau." },
        { text: "They are cheap to buy in rural areas.", tag: "Reference", why: "“They” mơ hồ (e-books? phones?) và không dẫn tới “This shift”." }
      ], answer: 0,
      chain: "“This shift” = chuyển dịch từ sách in sang sách điện tử; chỉ câu về sách in (“Print books…”) nêu rõ sự chuyển dịch đó (New của câu này → Given của câu sau).",
      hints: ["“This shift” chỉ sự thay đổi từ đâu sang đâu? Thông tin đó phải có trong chỗ trống.", "Phương án nào mô tả sự sụt giảm của sách in?"],
      keywords: ["this shift", "print books", "e-books", "chuyển dịch"] },

    { id: "G5", type: "gap", level: "Vận dụng cao", topic: "Nhà máy mới",
      prompt: "Choose the sentence that best fills the blank.",
      stem: "The local residents were worried about the new factory. (___). For that reason, they organised a meeting with the city council.",
      options: [
        { text: "The factory will produce 500 bicycles per month in 2030.", tag: "Topic", why: "Thông tin sản lượng không phải lý do cho “For that reason”." },
        { text: "Nevertheless, residents welcomed the factory with a party.", tag: "Conjunction", why: "Mâu thuẫn với “worried” và với hành động họp ở câu sau." },
        { text: "Therefore, the council has built a new school.", tag: "Conjunction", why: "“Therefore” không có nguyên nhân phía trước; lạc chủ đề." },
        { text: "They feared that the noise and smoke would harm their children’s health." }
      ], answer: 3,
      chain: "“They” = the local residents (Reference); nêu nỗi lo cụ thể làm “For that reason” có nguyên nhân hợp lý.",
      hints: ["“For that reason” cần một lý do. Lý do đó liên quan trực tiếp đến cảm xúc nào ở câu đầu?", "Đại từ “They” ở phương án nào quy chiếu rõ về danh từ ở câu trước?"],
      keywords: ["for that reason", "they", "residents", "worried", "feared"] }
  ];

  const SYSTEM_PROMPT_VI = [
    "Bạn là trợ lý ngôn ngữ học văn bản cho học sinh lớp 12 trình độ trung bình – khá; chỉ làm việc với dạng bài sắp xếp câu/đoạn và đọc điền.",
    "Khi học sinh gửi đáp án và lời giải: trước hết xác nhận phần đúng, sau đó chỉ ra chính xác điểm gãy mạch lạc (đại từ không có danh từ gốc, từ nối sai quan hệ, đứt Given – New, lạc chủ đề).",
    "Không đưa đáp án ngay ở lần phản hồi đầu: dùng câu hỏi gợi mở; chỉ nêu đáp án khi hệ thống cho phép (revealAnswer = true).",
    "Giải thích bằng tiếng Việt đơn giản, tối đa 120 từ, dẫn trực tiếp cụm từ trong văn bản làm bằng chứng; không dùng kiến thức ngoài chương trình Tiếng Anh 12 Global Success.",
    "Kết thúc mỗi phản hồi bằng một câu hỏi tự kiểm tra.",
    "Không yêu cầu học sinh cung cấp thông tin cá nhân; nhắc học sinh tự kiểm chứng phản hồi của AI với bằng chứng trong văn bản."
  ];

  const DATA = { TAGS, GROUPS, CONNECTORS, STEPS, CHECKLIST, EXERCISES, SYSTEM_PROMPT_VI };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.CCN_DATA = DATA;
})(typeof window !== "undefined" ? window : globalThis);
