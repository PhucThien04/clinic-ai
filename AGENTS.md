# Clinic AI — Hướng dẫn cho Coding Agent

## 1. Quy tắc bắt buộc

Trước khi triển khai hoặc thay đổi một feature quan trọng:

1. Đọc `PROJECT_SPEC.md`.
2. Xác định feature thuộc scope nào.
3. Không tự biến nội dung `Proposed` thành `Official`.
4. Không mở rộng scope nếu không có lý do rõ ràng.
5. Ưu tiên giải pháp đơn giản, dễ bảo trì và phù hợp project cá nhân 3 tháng.

## 2. Quy ước ngôn ngữ

- Tài liệu Markdown: **Tiếng Việt**.
- Thuật ngữ kỹ thuật phổ biến: giữ **English**.
- Code, variable, function, class, table, column, endpoint: **English**.
- Git commit message: **English**.

Không dịch gượng ép thuật ngữ kỹ thuật.

## 3. Technology baseline

- Frontend: React.
- Backend: Node.js + Express.js.
- AI Service: Python + FastAPI.
- Database: PostgreSQL.
- API style: REST.
- Deployment direction: Docker + cloud.

Đây là baseline đề xuất; nếu `PROJECT_SPEC.md` được cập nhật thì phải ưu tiên phiên bản mới nhất.

## 4. Kiến trúc

Không tạo microservices đầy đủ nếu chưa có lý do.

Giữ hệ thống đơn giản:

React → Node.js/Express → PostgreSQL

và:

Node.js/Express → Python/FastAPI → External AI API

## 5. AI safety

- AI là clinical decision support.
- Không trình bày AI output như chẩn đoán y khoa chắc chắn.
- Không bịa dữ liệu bệnh nhân.
- Ưu tiên structured output.
- Khi có thể, lưu nguồn dữ liệu/context dùng để tạo kết quả.
- Cảnh báo nên kết hợp rule-based detection và AI analysis.
- AI output phải được đánh dấu rõ ràng.

## 6. Security

- Không hard-code secrets.
- Không commit `.env`.
- Dùng `.env.example` để mô tả biến môi trường.
- Hash password.
- Validate input.
- Kiểm tra authentication và authorization ở backend.
- Không sử dụng dữ liệu bệnh nhân thật trong development nếu chưa được phép.

## 7. Development style

- Không over-engineer.
- Không tạo abstraction chỉ để "trông chuyên nghiệp".
- Tách business logic khỏi route/controller khi module đủ lớn.
- Reuse component/service khi có nhu cầu thực tế.
- Ưu tiên code dễ đọc và dễ test.

## 8. Khi implement feature

Trình tự ưu tiên:

1. Xác định requirement.
2. Xác định data model.
3. Thiết kế API.
4. Implement backend.
5. Implement frontend.
6. Integration.
7. Test.
8. Cập nhật documentation nếu architecture hoặc behavior thay đổi.

## 9. Không tự ý

Coding agent không được tự ý:

- Thêm role mới.
- Thêm module lớn.
- Đổi database.
- Đổi framework chính.
- Đổi AI provider.
- Thêm mobile application.
- Thêm feature AI ngoài scope.

Nếu thay đổi có ảnh hưởng kiến trúc hoặc scope, phải nêu rõ lý do và cập nhật `PROJECT_SPEC.md`.

## 10. Source of truth

Thứ tự ưu tiên khi có mâu thuẫn:

1. Yêu cầu chính thức mới nhất của giảng viên.
2. Nội dung `Confirmed` trong `PROJECT_SPEC.md`.
3. Nội dung `Official` trong tài liệu nguồn.
4. Quyết định đã được thống nhất.
5. `Proposed`.
6. Suy luận của coding agent.

Khi thông tin không đủ, không được giả định một yêu cầu là chính thức.
