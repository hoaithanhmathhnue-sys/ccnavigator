# 🧭 CC-Navigator (Coherence & Cohesion Navigator)

Ứng dụng web đi kèm sáng kiến **“Một số biện pháp rèn luyện tư duy mạch lạc và liên kết văn bản (Cohesion & Coherence) cho học sinh THPT nhằm nâng cao hiệu quả làm dạng bài sắp xếp và đọc điền theo định dạng đề thi mới”** (Giải pháp 3), Trường THPT Khúc Thừa Dụ.

## Chức năng bám theo sáng kiến

| Phân hệ | Chức năng | Mục trong ứng dụng |
|---|---|---|
| 1. Dẫn đường phương pháp | 4 nhóm phương tiện liên kết (Cohesion Decoder Toolkit), bảng tra từ nối, thẻ chiến lược 4 bước, sổ tay liên kết, nguyên tắc Given – New | 📘 Cẩm nang |
| 2. Trợ lý phản biện logic | 10 bài (5 sắp xếp + 5 đọc điền); học sinh nhập đáp án + lời giải thích; “bóc lỗi tư duy” theo 5 nhóm lỗi; gợi mở trước, chỉ cho xem đáp án sau 2 lần thử; AI tùy chọn qua máy chủ | 🤖 Trợ lý AI |
| 2. Coherence Flow-Mapping | Tự tìm đại từ quy chiếu, từ nối, từ khóa lặp, cầu nối Given – New giữa từng cặp câu và cảnh báo chỗ gãy mạch | 🗺️ Bản đồ Given–New |
| 3. Breakdown Analysis Tasks | Đoạn văn bị xáo trộn có chủ ý; học sinh đánh dấu điểm gãy mạch, hệ thống chấm | 🔍 Điểm gãy |
| 3. Kiểm tra đánh giá | Bài 10 câu, 30 phút, không phản hồi khi làm; sau khi nộp có phân tích từng câu; bảng kiểm tự đánh giá (4 tiêu chí) | 📝 Kiểm tra |
| 3. Theo dõi tiến bộ | Thống kê cá nhân; giáo viên gộp tệp JSON của cả lớp, xem tỷ lệ đúng, điểm lần đầu → gần nhất, lỗi phổ biến, câu khó nhất; xuất CSV | 📊 Tiến bộ |

Trợ lý AI dùng System Prompt theo Phụ lục 7 của sáng kiến (tiếng Việt, ≤120 từ, dẫn bằng chứng văn bản, không nêu đáp án khi chưa cho phép, kết thúc bằng câu hỏi tự kiểm tra). Khi chưa cấu hình AI, ứng dụng vẫn đầy đủ chức năng với phản hồi cục bộ.

## Cấu trúc

```
index.html        giao diện (không cần build)
css/style.css
js/data.js        ngân hàng bài tập, công cụ liên kết, bảng từ nối
js/theory.js      lý thuyết nền, thuật ngữ, cụm chức năng, quiz
js/engine.js      bộ máy phân tích, phản hồi cục bộ, thống kê
js/app.js         giao diện và điều hướng
api/chat.js       Vercel Serverless Function gọi Gemini hoặc OpenAI (khóa nằm ở biến môi trường)
scripts/dev-server.js  chạy thử trên máy cá nhân (npm start); không đặt tệp server.js ở thư mục gốc vì Vercel sẽ coi đó là máy chủ của cả trang
scripts/selftest.js  kiểm tra ngân hàng bài tập (npm test)
vercel.json  package.json  .env.example  .gitignore  .vercelignore
```

## Đưa lên GitHub và triển khai Vercel

1. Tạo repository mới trên GitHub, tải toàn bộ nội dung thư mục này lên (không cần `node_modules`).
2. Vào vercel.com → **Add New → Project** → chọn repository vừa tạo.
3. Framework Preset: **Other**; Build Command và Output Directory: để trống → **Deploy**.
4. (Tùy chọn, để bật trợ lý AI) Project → **Settings → Environment Variables**, thêm `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`), có thể thêm `GEMINI_MODEL`/`OPENAI_MODEL` (mặc định `gemini-3.5-flash-lite`); sau đó **Redeploy**.

Không bao giờ ghi khóa API vào mã nguồn hay đẩy tệp `.env` lên GitHub (đã có trong `.gitignore`). Nên đặt hạn mức chi tiêu cho khóa API tại Google AI Studio. Máy chủ tự tra đề và đáp án trong `js/data.js`, chỉ nhận yêu cầu từ chính trang web và giới hạn tần suất; khi nhà cung cấp AI báo quá tải, học sinh tự động nhận phản hồi cục bộ.

## Chạy thử trên máy

Cần Node.js ≥ 18: sao chép `.env.example` thành `.env` (điền khóa nếu muốn bật AI), chạy `npm start`, mở http://localhost:3000. Chạy `npm test` để kiểm tra ngân hàng bài tập.

## Quyền riêng tư

Nhật ký học tập lưu trong `localStorage` của trình duyệt học sinh; không có cơ sở dữ liệu máy chủ. Học sinh dùng tên/biệt danh hoặc mã số. Khi bật AI, chỉ nội dung bài làm (đề, phương án chọn, lời giải thích) được gửi tới nhà cung cấp AI qua máy chủ Vercel, không gửi tên hay lớp.

## Lưu ý về nội dung

Ngữ liệu bài tập do tác giả soạn minh họa theo ma trận của sáng kiến; giáo viên nên bổ sung ngữ liệu từ sách giáo khoa Tiếng Anh 12 Global Success và đề thi chính thức bằng cách thêm phần tử vào `js/data.js` (mỗi bài gồm đề, 4 phương án, đáp án, chuỗi liên kết, 2 gợi ý; phương án sai cần có `tag` và `why`). Các bài tập đang có chỉ là công cụ luyện tập, không thay thế đề thi chính thức.

Đáp án nằm trong `js/data.js` tải về trình duyệt, và bài kiểm tra dùng lại đúng 10 câu của phần luyện tập. Vì vậy không dùng bài kiểm tra trên ứng dụng để lấy điểm chính thức hay số liệu chẩn đoán/sau tác động; các bài đó cần làm riêng trên giấy.

Với bài sắp xếp, có thể khai báo `soft: ["c-d"]` cho những chỗ nối không theo đáp án nhưng vẫn đọc được; phần Điểm gãy sẽ không tính đúng/sai ở các chỗ đó. Với bài đọc điền, không gọi tên phương án bằng chữ cái trong `chain` vì vị trí phương án được đảo khi hiển thị.
