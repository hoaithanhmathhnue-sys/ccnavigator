/* Dữ liệu lý thuyết nền cho Cẩm nang CC-Navigator: liên kết (cohesion), mạch lạc (coherence), Given–New, cặp thoại liền kề... */
(function (root) {
  /* Mỗi mục: id, icon, title, blocks[]; block: {p}, {ul:[]}, {ex:"html"}, {tip}, {warn}, {table:{head:[],rows:[[]]}} (văn bản thuần, riêng ex có thể chứa <mark>) */
  const THEORY = [
    { id: "cc", icon: "🧭", title: "Cohesion và Coherence là gì?", blocks: [
      { p: "<b>Cohesion (liên kết)</b> là các <i>dấu hiệu hình thức</i> nối câu với câu: đại từ, từ nối, lặp từ, đồng nghĩa... Có thể chỉ ra bằng cách gạch chân trong văn bản." },
      { p: "<b>Coherence (mạch lạc)</b> là sự <i>thông suốt về nghĩa</i> của cả đoạn: các câu cùng bàn về một chủ đề, ý sau hợp lý với ý trước, sắp xếp theo trật tự logic mà người đọc hiểu được." },
      { table: { head: ["", "Cohesion", "Coherence"], rows: [["Bản chất", "Hình thức, nhìn thấy trên bề mặt văn bản", "Nội dung, nằm ở sự hiểu của người đọc"], ["Công cụ", "Đại từ, từ nối, lặp từ, cấu trúc song song", "Chủ đề thống nhất, trình tự logic, Given–New"], ["Dùng khi làm bài", "Tìm tín hiệu để nối câu", "Kiểm chứng đoạn có hợp lý về nghĩa không"]] } },
      { warn: "Có cohesion chưa chắc có coherence. Một đoạn đầy từ nối vẫn có thể vô nghĩa. Đây chính là cái bẫy của các phương án nhiễu: chúng thường 'trông có vẻ liên kết' nhưng gãy về nghĩa." },
      { ex: "Ví dụ có cohesion nhưng thiếu coherence: <i>I like coffee. <mark>However</mark>, the Earth goes around the Sun. <mark>Therefore</mark>, my shoes are blue.</i> Từ nối đầy đủ nhưng không câu nào liên quan đến câu nào." }
    ] },
    { id: "hh", icon: "📚", title: "5 phương tiện liên kết (Halliday & Hasan)", blocks: [
      { p: "Halliday và Hasan (1976, <i>Cohesion in English</i>) chia phương tiện liên kết thành 5 loại. Trong đề thi sắp xếp và đọc điền, em gặp nhiều nhất là loại 1, 4 và 5." },
      { table: { head: ["Loại", "Nội dung", "Ví dụ"], rows: [
        ["1. Reference (quy chiếu)", "Từ chỉ về một đối tượng đã/sắp nhắc tới: this, that, these, those, it, they, such, the former/latter", "Many students use AI. <b>This trend</b> is growing."],
        ["2. Substitution (thay thế)", "Thay một từ/cụm bằng từ khác: one(s), do so, so, not", "I lost my pen, so I bought a new <b>one</b>."],
        ["3. Ellipsis (tỉnh lược)", "Bỏ phần đã rõ từ ngữ cảnh", "Who wants tea? – <b>I do</b> (want tea)."],
        ["4. Conjunction (liên từ)", "Từ nối thể hiện quan hệ logic: đối lập, nhân quả, bổ sung, thời gian", "It was late. <b>Therefore</b>, we left."],
        ["5. Lexical cohesion (từ vựng)", "Lặp từ, đồng nghĩa, trái nghĩa, từ bao hàm, cùng trường nghĩa", "A <b>tiger</b> escaped. The <b>animal</b> was found later."]
      ] } },
      { tip: "Mẹo nhớ: quy chiếu = 'chỉ lại', thay thế/tỉnh lược = 'nói gọn', liên từ = 'bảo quan hệ', từ vựng = 'nhắc lại chủ đề'." }
    ] },
    { id: "ref", icon: "🔗", title: "Reference: truy ngược đại từ", blocks: [
      { p: "Quy chiếu có 2 hướng. <b>Anaphora</b> (quy chiếu ngược): từ chỉ về thứ đã nhắc ở trước, hướng phổ biến nhất. <b>Cataphora</b> (quy chiếu xuôi): từ chỉ về thứ sẽ nhắc ở sau." },
      { ex: "Anaphora: <i>Linh bought a laptop. <mark>It</mark> was expensive.</i> (It → laptop).<br>Cataphora: <i>When <mark>she</mark> arrived, Mai was tired.</i> (she → Mai, ở sau)." },
      { p: "<b>Các loại từ quy chiếu hay gặp:</b>" },
      { ul: [
        "Đại từ nhân xưng: he, she, it, they, him, her, them.",
        "Từ chỉ định: <b>this/that</b> (số ít), <b>these/those</b> (số nhiều), here, there, such.",
        "Cụm 'this/these/such + danh từ tóm lược' (<i>this issue, these changes, such a decision</i>): danh từ tóm lược này gói cả ý của câu trước."
      ] },
      { p: "<b>Quy trình 3 bước truy ngược:</b> (1) Khoanh từ quy chiếu. (2) Tìm danh từ hoặc ý ở ngay câu trước phù hợp về số ít/số nhiều và nghĩa. (3) Thay thử vào chỗ trống, nếu câu vẫn tự nhiên thì đúng." },
      { warn: "Bẫy thường gặp: <b>this + danh từ</b> không có gì ở trước để chỉ về (câu đầu đoạn không thể bắt đầu bằng 'This issue...'); <b>they/these</b> số nhiều nhưng câu trước chỉ có danh từ số ít; hai danh từ cùng phù hợp nên đại từ chỉ về nhầm." },
      { ex: "<i>Many urban areas face severe congestion. <mark>This issue</mark> requires action.</i> 'This issue' gói cả hiện tượng ùn tắc, không chỉ riêng từ 'areas'." }
    ] },
    { id: "con", icon: "🔀", title: "Conjunction: nhóm quan hệ logic của từ nối", blocks: [
      { p: "Từ nối không tự làm đoạn văn mạch lạc. Nó chỉ <i>công bố</i> quan hệ giữa hai ý. Việc của em là kiểm chứng quan hệ đó có thật không." },
      { table: { head: ["Quan hệ", "Từ nối tiêu biểu", "Câu hỏi tự kiểm chứng"], rows: [
        ["Bổ sung (addition)", "moreover, furthermore, in addition, besides, also", "Hai ý có cùng hướng, cùng ủng hộ một luận điểm không?"],
        ["Đối lập (contrast)", "however, but, yet, in contrast, on the other hand, nevertheless", "Ý sau có thật sự trái ngược hoặc nhượng bộ so với ý trước không?"],
        ["Nhân quả (cause–effect)", "therefore, thus, as a result, consequently, for this reason, so", "Câu trước có phải nguyên nhân của câu sau không? (không bị ngược chiều)"],
        ["Ví dụ (exemplification)", "for example, for instance, such as, namely", "Câu sau có phải trường hợp cụ thể của ý chung ở câu trước không?"],
        ["Thời gian, trình tự", "first, then, next, afterwards, finally, meanwhile", "Trình tự có hợp lý theo thời gian/quy trình không?"],
        ["Tóm tắt, kết luận", "in conclusion, in short, overall, to sum up", "Đây có phải câu khép đoạn không?"]
      ] } },
      { warn: "Phân biệt: <b>although/though/because/while</b> là liên từ nối <i>mệnh đề</i> trong cùng câu; <b>however/therefore/moreover</b> là trạng từ nối đứng ở <i>đầu câu mới</i> (có dấu phẩy sau). Dùng nhầm vị trí là lỗi ngữ pháp thường gặp ở phương án nhiễu." },
      { tip: "Chiêu 'xóa từ nối': che từ nối đi, tự hỏi hai câu quan hệ thế nào, rồi mới so với từ nối. Nếu không khớp thì đó là phương án nhiễu." }
    ] },
    { id: "lex", icon: "🧩", title: "Lexical Cohesion: chuỗi từ vựng của chủ đề", blocks: [
      { p: "Mỗi đoạn văn có một 'sợi chỉ' từ vựng. Lần theo sợi chỉ này giúp nhận ra câu lạc đề rất nhanh." },
      { ul: [
        "<b>Lặp từ (repetition):</b> pollution … pollution.",
        "<b>Đồng nghĩa (synonym):</b> big – huge, problem – issue.",
        "<b>Trái nghĩa (antonym):</b> advantage – disadvantage, urban – rural.",
        "<b>Từ bao hàm (hypernym):</b> a dog … the animal; cars … vehicles.",
        "<b>Cùng trường nghĩa (collocation/field):</b> doctor – hospital – patient – treatment."
      ] },
      { ex: "<i><mark>Ecotourism</mark> provides income to local communities. Such <mark>sustainable travel</mark> also protects <mark>natural habitats</mark>.</i> Cả ba cụm cùng trường nghĩa 'du lịch bền vững, môi trường'." },
      { tip: "Khi hai phương án đều có vẻ hợp ngữ pháp, chọn phương án giữ nguyên trường nghĩa của đoạn. Phương án nhảy sang chủ đề mới mà không có cầu nối thường là đáp án nhiễu." }
    ] },
    { id: "gn", icon: "🗺️", title: "Given–New và Theme–Rheme", blocks: [
      { p: "<b>Given (đã biết)</b> là thông tin người đọc đã nắm; <b>New (mới)</b> là thông tin được thêm vào. Nguyên tắc cốt lõi (Clark & Haviland, 1977): người viết thường đặt Given trước, New sau, và <b>New của câu trước hóa thành Given của câu sau</b>." },
      { p: "Theo ngữ pháp chức năng (Halliday), câu chia thành <b>Theme</b> (điểm xuất phát của câu, thường là phần đầu) và <b>Rheme</b> (phần còn lại). Mạch đoạn văn thường phát triển theo 2 kiểu:" },
      { ul: [
        "<b>Chuỗi tuyến tính:</b> Rheme câu 1 → Theme câu 2 → Rheme câu 2 → Theme câu 3. Hay gặp ở văn giải thích, lập luận.",
        "<b>Theme không đổi:</b> mọi câu cùng bắt đầu bằng một chủ thể (Ecotourism… It… This model…). Hay gặp ở văn miêu tả, giới thiệu."
      ] },
      { ex: "Chuỗi tuyến tính: <i>AI is transforming workplaces. <mark>It</mark> automates repetitive tasks. <mark>This shift</mark> raises concerns about jobs.</i>" },
      { p: "<b>Áp dụng khi sắp xếp câu:</b> (1) Tìm câu mở đoạn, thường là câu chỉ chứa Given chung và không có đại từ chỉ ngược. (2) Với mỗi câu, hỏi 'câu nào phải đứng ngay trước để cung cấp Given cho câu này?'. (3) Nối thành chuỗi, rồi đọc thử cả đoạn." },
      { warn: "Câu có <b>this/that/they/such/However...</b> ở đầu gần như chắc chắn <b>không phải câu đầu</b> của đoạn." }
    ] },
    { id: "adj", icon: "💬", title: "Cặp thoại liền kề và hội thoại", blocks: [
      { p: "Trong hội thoại, lượt lời có cặp bắt buộc: lượt thứ nhất đòi hỏi lượt thứ hai tương ứng (adjacency pair). Phương án đúng phải 'đáp đúng chức năng' của lượt trước." },
      { table: { head: ["Lượt thứ nhất", "Lượt đáp phù hợp", "Ví dụ"], rows: [
        ["Chào hỏi", "Chào lại, hỏi thăm", "Hi, how are you? – Fine, thanks. And you?"],
        ["Câu hỏi Yes/No", "Yes/No kèm bổ sung", "Do you like it? – Yes, it's lovely."],
        ["Câu hỏi Wh-", "Thông tin cụ thể", "Where do you live? – In Hai Phong."],
        ["Lời mời", "Nhận (I'd love to) hoặc từ chối lịch sự (I'm afraid I can't, because…)", "Would you like to join us? – I'd love to."],
        ["Lời đề nghị, nhờ vả", "Đồng ý hoặc từ chối", "Could you help me? – Sure, no problem."],
        ["Lời xin lỗi", "Chấp nhận (That's all right)", "Sorry I'm late. – Never mind."],
        ["Lời cảm ơn", "Đáp lời (You're welcome)", "Thanks a lot. – My pleasure."],
        ["Lời khen", "Cảm ơn, khiêm tốn", "Great job! – Thank you. I did my best."],
        ["Lời chúc", "Cảm ơn, chúc lại", "Good luck! – Thanks, you too."]
      ] } },
      { tip: "Khi sắp xếp hội thoại, lần theo chuỗi: chào hỏi → mở chủ đề → hỏi/đáp → đề nghị/mời → chấp nhận/từ chối → cảm ơn/tạm biệt. Câu có 'Yes, I'd love to' hay 'Sure' không thể đứng trước câu hỏi nó trả lời." },
      { warn: "Câu hỏi 'How about…?/Why don't we…?' là lời gợi ý, nên đáp 'Good idea' hay 'Sorry, I can't' chứ không đáp bằng 'Yes, I am'." }
    ] },
    { id: "par", icon: "🏛️", title: "Cấu trúc đoạn văn và thư/email", blocks: [
      { p: "<b>Đoạn văn chuẩn:</b> câu chủ đề (topic sentence) → câu triển khai (supporting) có ví dụ, số liệu → câu kết (concluding), có thể nhắc lại ý chính." },
      { table: { head: ["Vị trí", "Dấu hiệu nhận biết"], rows: [
        ["Câu mở đoạn", "Nêu chủ đề chung; ít đại từ quy chiếu; có thể có cụm 'There are…, Nowadays…, It is widely believed…'"],
        ["Câu triển khai", "First/Second, For example, Moreover; có số liệu, ví dụ, giải thích"],
        ["Câu đối lập/nhượng bộ", "However, Although…; thường đứng sau ý ủng hộ"],
        ["Câu kết", "Therefore, In conclusion, Overall, To sum up; thường tóm lược hoặc đưa ra khuyến nghị"]
      ] } },
      { p: "<b>Thư/email:</b> lời chào (Dear…) → lý do viết → nội dung chính → đề nghị/mong đợi hồi âm → kết thư (Best wishes/Yours sincerely) → tên người viết. Lời chào luôn đứng đầu, lời kết và tên luôn đứng cuối." },
      { tip: "Khi sắp xếp: xác định câu đầu và câu cuối trước (neo hai đầu), rồi mới xếp các câu ở giữa. Cách này thu hẹp phương án rất nhanh." }
    ] },
    { id: "bag", icon: "🚧", title: "10 bẫy thường gặp ở phương án nhiễu", blocks: [
      { ul: [
        "<b>1. Từ nối ảo ảnh:</b> dùng However/Therefore nhưng quan hệ thật không đúng.",
        "<b>2. Đại từ mồ côi:</b> this/they/it không có danh từ gốc ở câu trước.",
        "<b>3. Sai số:</b> this + danh từ số nhiều, they chỉ danh từ số ít.",
        "<b>4. Lạc chủ đề:</b> nhắc từ khóa nhưng đổi hướng lập luận.",
        "<b>5. Từ trùng hình thức:</b> lặp từ khóa giống đáp án đúng nhưng ý đảo ngược.",
        "<b>6. Đảo thứ tự nhân quả:</b> kết quả đứng trước nguyên nhân khi có 'because/therefore'.",
        "<b>7. Mở đoạn bằng câu phụ thuộc:</b> câu đầu có This/However/Also.",
        "<b>8. Đáp sai chức năng:</b> hỏi gợi ý mà đáp bằng thông tin, mời mà đáp bằng cảm ơn.",
        "<b>9. Gãy Given–New:</b> câu sau nói tới thông tin chưa hề được giới thiệu.",
        "<b>10. Sai mức độ/sắc thái:</b> đổi 'some' thành 'all', 'may' thành 'must'."
      ] },
      { tip: "Với mỗi phương án nhiễu, tập viết một câu: 'Phương án này gãy vì…'. Đây chính là Bước 4 của quy trình." }
    ] },
    { id: "task", icon: "🎯", title: "Chiến lược theo dạng bài", blocks: [
      { p: "<b>Dạng 1: Sắp xếp câu/đoạn/hội thoại (Ordering)</b>" },
      { ul: [
        "Đọc nhanh các câu, xác định chủ đề (30 giây).",
        "Tìm câu mở (không có tín hiệu chỉ ngược) và câu kết (có tín hiệu kết luận).",
        "Ghép các cặp 'chặt' trước: đại từ + danh từ gốc, câu hỏi + câu đáp, nguyên nhân + kết quả.",
        "Dùng các phương án A–D để loại trừ: nếu câu đầu tiên của phương án là câu có 'This…', loại ngay.",
        "Đọc lại cả đoạn theo thứ tự đã chọn."
      ] },
      { p: "<b>Dạng 2: Đọc điền câu/cụm vào chỗ trống (Gap-fill)</b>" },
      { ul: [
        "Đọc câu trước và câu sau chỗ trống, xác định thông tin Given ở trước và New cần dẫn sang sau.",
        "Tìm 'tín hiệu hai đầu': câu sau chỗ trống nhắc lại điều gì? Chỗ trống phải cung cấp điều đó.",
        "Kiểm tra số ít/số nhiều, từ nối, quy chiếu giữa phương án và câu trước, câu sau.",
        "Loại phương án có từ khóa đúng nhưng ý ngược chiều hoặc lạc chủ đề.",
        "Đọc lại cả đoạn với phương án đã điền."
      ] },
      { tip: "Quản lý thời gian: bài 10 câu/30 phút, tức khoảng 3 phút mỗi câu, gồm 30 giây đọc lướt, 1,5 phút đánh dấu tín hiệu và kiểm chứng, 1 phút viết lý do chọn." }
    ] }
  ];

  /* Thuật ngữ A–Z (Anh – Việt – giải thích ngắn) */
  const GLOSSARY = [
    ["Adjacency pair", "Cặp thoại liền kề", "Hai lượt lời đi liền nhau, lượt sau đáp đúng chức năng lượt trước (hỏi–đáp, mời–nhận)."],
    ["Anaphora", "Quy chiếu ngược", "Từ chỉ về đối tượng đã nhắc ở phía trước."],
    ["Cataphora", "Quy chiếu xuôi", "Từ chỉ về đối tượng sẽ nhắc ở phía sau."],
    ["Coherence", "Mạch lạc", "Sự thông suốt về nghĩa và logic của cả đoạn văn."],
    ["Cohesion", "Liên kết", "Các dấu hiệu hình thức nối câu với câu."],
    ["Cohesive device", "Phương tiện liên kết", "Từ hoặc cấu trúc tạo liên kết: đại từ, từ nối, lặp từ..."],
    ["Conjunction", "Liên từ / từ nối", "Từ báo hiệu quan hệ logic giữa hai ý."],
    ["Discourse marker", "Dấu hiệu diễn ngôn", "Từ/cụm tổ chức mạch nói viết: Well, Anyway, By the way, In fact..."],
    ["Ellipsis", "Tỉnh lược", "Lược bỏ phần đã rõ nghĩa từ ngữ cảnh."],
    ["Given information", "Thông tin đã biết", "Thông tin đã xuất hiện hoặc người đọc đã nắm."],
    ["New information", "Thông tin mới", "Thông tin lần đầu đưa vào."],
    ["Hypernym", "Từ bao hàm", "Từ có nghĩa rộng bao gồm từ khác (vehicle ⊃ car)."],
    ["Lexical chain", "Chuỗi từ vựng", "Dãy từ liên quan về nghĩa xuyên suốt đoạn."],
    ["Reference", "Quy chiếu", "Dùng từ chỉ về đối tượng khác trong văn bản."],
    ["Rheme", "Phần thuật (Rheme)", "Phần còn lại của câu sau Theme, mang thông tin mới."],
    ["Substitution", "Thay thế", "Dùng từ như one, do so thay cho một thành phần trước đó."],
    ["Supporting sentence", "Câu triển khai", "Câu cung cấp ví dụ, lý do, số liệu cho câu chủ đề."],
    ["Theme", "Phần đề (Theme)", "Điểm xuất phát của câu, thường là phần đầu câu."],
    ["Topic sentence", "Câu chủ đề", "Câu nêu ý chính của đoạn."],
    ["Distractor", "Phương án nhiễu", "Đáp án sai được thiết kế để trông hợp lý."],
    ["Breakdown", "Điểm gãy", "Vị trí mạch liên kết hoặc mạch lạc bị đứt trong văn bản."]
  ];

  /* Cụm/câu chức năng hội thoại (phục vụ dạng hội thoại) */
  const FUNCTIONS = [
    ["Chào hỏi, bắt chuyện", "Hi/Hello; How are you doing?; Nice to meet you.", "Fine, thanks; Nice to meet you too."],
    ["Mời, rủ rê", "Would you like to…?; Why don't we…?; How about…?; Shall we…?", "I'd love to; Sounds great; Sorry, I can't, because…"],
    ["Đề nghị giúp", "Can/Could you…?; Would you mind…?; Do you need a hand?", "Sure/Certainly; Of course not; Thanks, I'm fine."],
    ["Xin phép", "May I…?; Is it OK if I…?; Do you mind if I…?", "Go ahead; Sure; I'm afraid not."],
    ["Xin lỗi", "I'm sorry/I apologise for…; Excuse me.", "That's all right; Never mind; No problem."],
    ["Cảm ơn", "Thanks a lot; I really appreciate it.", "You're welcome; My pleasure; Don't mention it."],
    ["Khen ngợi", "You look great!; Well done!; That's a good idea.", "Thank you; That's kind of you; I'm glad you like it."],
    ["Đồng ý, không đồng ý", "I agree; I don't think so; You've got a point.", "Exactly; I see what you mean; I'm not sure about that."],
    ["Lời khuyên", "You should…; Why don't you…?; If I were you, I'd…", "Good idea; I'll try that; Thanks for the tip."],
    ["Tạm biệt", "See you later; Take care; Talk to you soon.", "Bye; You too; See you."]
  ];

  /* Câu hỏi nhanh củng cố lý thuyết */
  const QUIZ = [
    { q: "Câu nào KHÔNG thể là câu mở đầu của một đoạn văn?", o: ["Nowadays, many teenagers spend hours on social media.", "Climate change is one of the biggest challenges of our time.", "Reading is a habit that brings many benefits.", "These platforms have changed how young people communicate."], a: 3, why: "'These platforms' là quy chiếu ngược, cần có danh từ gốc ở câu trước." },
    { q: "Trong 'Cars are convenient. ___, they cause serious pollution.' từ nối phù hợp nhất là:", o: ["However", "Therefore", "For example", "Meanwhile"], a: 0, why: "Câu sau nêu mặt trái, đối lập với 'tiện lợi' nên dùng However." },
    { q: "Phân loại 'I lost my pen, so I bought a new one': 'one' thuộc loại liên kết nào?", o: ["Reference", "Substitution", "Ellipsis", "Conjunction"], a: 1, why: "'one' thay cho danh từ 'pen' nên là Substitution." },
    { q: "'Would you like to join our club?' Câu đáp phù hợp nhất:", o: ["Yes, I do.", "You're welcome.", "I'd love to, thanks.", "No, I haven't."], a: 2, why: "Lời mời cần đáp bằng nhận hoặc từ chối lịch sự." },
    { q: "Nguyên tắc Given–New nói rằng:", o: ["Thông tin mới luôn đứng đầu câu", "Thông tin mới của câu trước trở thành đã biết của câu sau", "Mỗi câu phải có từ nối", "Chỉ cần lặp từ khóa là mạch lạc"], a: 1, why: "Đây là nguyên tắc cốt lõi để lập bản đồ mạch thông tin." },
    { q: "Điều nào đúng về cohesion và coherence?", o: ["Cohesion là hình thức, coherence là sự thông suốt về nghĩa", "Có nhiều từ nối thì chắc chắn mạch lạc", "Hai khái niệm hoàn toàn giống nhau", "Coherence chỉ nằm ở đại từ"], a: 0, why: "Có thể có cohesion mà thiếu coherence (từ nối ảo ảnh)." },
    { q: "Từ nào là liên từ nối mệnh đề trong CÙNG một câu?", o: ["However", "Therefore", "Although", "Moreover"], a: 2, why: "Although nối hai mệnh đề trong một câu; ba từ còn lại thường đứng đầu câu mới." },
    { q: "'This issue' ở đầu câu 2 thường quy chiếu về:", o: ["Một danh từ hoặc cả ý ở câu 1", "Câu cuối đoạn", "Tiêu đề của bài", "Không về gì cả"], a: 0, why: "This + danh từ tóm lược gói thông tin ở câu trước." }
  ];

  const T = { THEORY, GLOSSARY, FUNCTIONS, QUIZ };
  if (typeof module !== "undefined" && module.exports) module.exports = T;
  else { root.CCN_DATA = root.CCN_DATA || {}; Object.assign(root.CCN_DATA, T); }
})(typeof window !== "undefined" ? window : globalThis);
