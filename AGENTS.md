# Clinic AI — Hướng dẫn Bắt buộc cho Coding Agent (Codex)

## 1. Source of Truth & Quy tắc Khởi đầu
1. File **`PROJECT_SPEC.md`** tại thư mục gốc là nguồn sự thật duy nhất (Single Source of Truth) tổng hợp toàn bộ yêu cầu đề tài, Use Case, Database Schema và API. Không cần tìm kiếm thêm file `.docx` bên ngoài.
2. Trước khi tạo mới hoặc chỉnh sửa tính năng, đọc `PROJECT_SPEC.md` để xác định đúng `VaiTro`, bảng dữ liệu và endpoint liên quan.
3. Không tự ý thêm vai trò mới, không đổi tên bảng/cột đã chốt trong `PROJECT_SPEC.md`, không tự ý mở rộng scope ngoài phạm vi đồ án.
4. Nếu có thay đổi về schema hoặc API, cập nhật đồng bộ `PROJECT_SPEC.md` ngay trong cùng phiên làm việc.

## 2. Quy ước Ngôn ngữ & Đặt tên
- **Tài liệu Markdown & Nội dung giao diện (UI):** Tiếng Việt.
- **Thuật ngữ kỹ thuật phổ biến:** Giữ nguyên tiếng Anh (REST API, JWT, Hook, Service, Component, Middleware...).
- **Code, biến, hàm, class, file, route, tên bảng/cột:** Giữ đúng chuẩn đã định nghĩa (PascalCase cho tên cột DB như `IdHoSoBenhNhan`, `LoaiThongTin`; camelCase cho biến/hàm JS/TS).
- **Git commit message:** Tiếng Anh ngắn gọn, rõ ý (ví dụ: `feat(doctor): build clinical workspace with AI summary`).

## 3. Clean Code & Kiến trúc Frontend (Tailwind CSS)
Luôn tuân thủ nguyên tắc tách lớp (Separation of Concerns), **tuyệt đối không gộp chung logic xử lý và API call vào file Component**:
- **`src/services/`**: Chứa các hàm gọi HTTP API qua Axios (`api.ts`, `authService.ts`, ...).
- **`src/hooks/`**: Chứa custom hooks quản lý state, side-effects và business logic của từng trang/tính năng (ví dụ: `usePatientHistory.ts`, `usePatientBooking.ts`, `useClinic.ts`).
- **`src/utils/`**: Chứa các hàm tiện ích thuần túy (format ngày tháng, tiền tệ, validate).
- **`src/pages/` & `src/components/`**: Chỉ tập trung render giao diện JSX và nhận dữ liệu/hàm xử lý từ hooks. Bắt buộc dùng `import type` cho các TypeScript interfaces/types khi `verbatimModuleSyntax` được bật.
- **Styling (Tailwind CSS):**
  - Sử dụng **Tailwind CSS utility classes** trực tiếp trong JSX; **không** tạo thêm các file `.css` rời cho từng page/component (chỉ giữ `src/index.css` chứa `@import "tailwindcss";`).
  - Duy trì hệ màu nhất quán của phòng khám: tông chủ đạo y tế `sky-600` (`#0284c7`) và `teal-600` (`#0d9488`), nền sáng `slate-50`, viền `slate-200`, cảnh báo bệnh nền tông `amber`.
  - Đảm bảo `DashboardLayout` giữ thanh sidebar cố định trên màn hình (`h-screen sticky top-0`) để khu vực tài khoản và nút đăng xuất không bị trôi khi nội dung chính dài.

## 4. Quy tắc Backend & Database (PostgreSQL)
- **Độ dài ID chuẩn `CHAR(13)`:** Mọi ID mới bắt buộc sinh qua `backend/src/utils/idGenerator.js` (`generateId('TK' | 'PK' | 'SK' | 'DV' | 'LLV' | 'LD' | 'HS' | 'NT' | 'CT' | 'TS' | 'AI')`). Không hard-code ID độ dài khác 13 ký tự.
- **Không ghi đè lịch sử khám:** Khi tạo lịch đặt (`POST /api/appointments`), nếu `IdHoSoBenhNhan` được chọn đã từng gắn với một `CHITIETLICHDAT` khác hoặc đã có `ChuanDoan`/`KetLuan`, Backend **phải** tạo mới một dòng `HOSOBENHNHAN` (và nhân bản `THONGTINNGUOITHAN` nếu `LoaiThongTin = 1`) cho lượt khám mới.
- **Alias PascalCase trong SQL:** Khi truy vấn PostgreSQL, luôn đặt alias trong ngoặc kép `AS "TenCot"` để trả về JSON khớp với interface PascalCase ở Frontend.
- **Transaction:** Các thao tác ghi nhiều bảng cùng lúc (tạo hồ sơ + người thân, tạo lịch đặt + chi tiết lịch đặt) phải bọc trong `BEGIN ... COMMIT / ROLLBACK`.
- **Parameterized Queries:** Luôn dùng `$1, $2, ...` với thư viện `pg` để chống SQL Injection.

## 5. Quy tắc AI Service & Bảo mật
- Giữ kiến trúc đơn giản: `React -> Node.js/Express -> PostgreSQL` và `Node.js/Express -> Python/FastAPI -> External AI API`.
- `ai-service` (Python/FastAPI) **không** kết nối trực tiếp PostgreSQL; mọi dữ liệu đầu vào phải đi qua Backend kiểm tra quyền và chuẩn hóa.
- Output từ AI phải có cấu trúc rõ ràng, đánh dấu là nội dung tham khảo hỗ trợ bác sĩ, không khẳng định thay chẩn đoán y khoa.
- Không commit `.env`, không hard-code API key hoặc password, không log token/mật khẩu ra console.