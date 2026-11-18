# Clinic AI — Hướng dẫn Bắt buộc cho Coding Agent (Codex)

## 1. Source of Truth & Quy tắc Khởi đầu
1. File **`PROJECT_SPEC.md`** tại thư mục gốc là nguồn sự thật duy nhất (Single Source of Truth) tổng hợp toàn bộ yêu cầu đề tài, Use Case, Database Schema và API. Không cần tìm kiếm thêm file `.docx` bên ngoài.
2. Trước khi tạo mới hoặc chỉnh sửa tính năng, đọc `PROJECT_SPEC.md` để xác định đúng `VaiTro`, bảng dữ liệu và endpoint liên quan.
3. Không tự ý thêm vai trò mới, không đổi tên bảng/cột đã chốt trong `PROJECT_SPEC.md`, không tự ý mở rộng scope ngoài phạm vi đồ án.
4. Nếu có thay đổi về schema hoặc API, cập nhật đồng bộ `PROJECT_SPEC.md` ngay trong cùng phiên làm việc.
5. Trước khi mô tả cấu trúc/cách chạy, đối chiếu workspace và cấu hình thực tế. `README.md` hướng dẫn vận hành; `PROJECT_SPEC.md` giữ đặc tả và trạng thái triển khai; tài liệu quy trình bổ trợ không thay thế đặc tả.
6. Hiện có mã trong `backend/`, `frontend/`; `ai-service/`, `.ai-workflow/` đang rỗng. Không có `database/`, `docs/`, Dockerfile hoặc Docker Compose. Không tự mô tả thư mục rỗng hay thành phần dự kiến là đã triển khai. Thư mục rỗng có thể vắng mặt khi clone vì Git không lưu chúng.

## 2. Quy ước Ngôn ngữ & Đặt tên
- **Tài liệu Markdown & Nội dung giao diện (UI):** Tiếng Việt.
- **Thuật ngữ kỹ thuật phổ biến:** Giữ nguyên tiếng Anh (REST API, JWT, Hook, Service, Component, Middleware...).
- **Code, biến, hàm, class, file, route, tên bảng/cột:** Giữ đúng chuẩn đã định nghĩa (PascalCase cho tên cột DB như `IdHoSoBenhNhan`, `LoaiThongTin`; camelCase cho biến/hàm JS/TS).
- **Git commit message:** Tiếng Anh ngắn gọn, rõ ý (ví dụ: `feat(doctor): build clinical workspace with AI summary`).

## 3. Clean Code & Kiến trúc Frontend (Tailwind CSS v4)
Luôn tuân thủ nguyên tắc tách lớp (Separation of Concerns), **tuyệt đối không gộp chung logic xử lý và API call vào file Component**:
- **`src/services/`**: Chứa các hàm gọi HTTP API qua Axios (`api.ts`, `authService.ts`, ...).
- **`src/hooks/`**: Chứa custom hooks quản lý state, side-effects và business logic của từng trang/tính năng (ví dụ: `usePatientHistory.ts`, `usePatientBooking.ts`, `useClinic.ts`).
- **`src/utils/`**: Chứa các hàm tiện ích thuần túy (format ngày tháng, tiền tệ, validate).
- **`src/pages/` & `src/components/`**: Chỉ tập trung render giao diện JSX và nhận dữ liệu/hàm xử lý từ hooks. Bắt buộc dùng `import type` cho các TypeScript interfaces/types khi `verbatimModuleSyntax` được bật.
- **Styling (Tailwind CSS v4):**
  - Dùng `@tailwindcss/vite` trong `frontend/vite.config.ts`; entry CSS là `frontend/src/index.css`. Không thêm cấu hình Tailwind v3 như hướng dẫn cài đặt hiện hành của dự án.
  - Sử dụng **Tailwind CSS utility classes** trực tiếp trong JSX; **không** tạo thêm các file `.css` rời cho từng page/component (chỉ giữ `src/index.css` chứa `@import "tailwindcss";`).
  - Duy trì hệ màu nhất quán của phòng khám: tông chủ đạo y tế `sky-600` (`#0284c7`) và `teal-600` (`#0d9488`), nền sáng `slate-50`, viền `slate-200`, cảnh báo bệnh nền tông `amber`.
  - Đảm bảo `DashboardLayout` giữ thanh sidebar cố định trên màn hình (`h-screen sticky top-0`) để khu vực tài khoản và nút đăng xuất không bị trôi khi nội dung chính dài.

## 4. Quy tắc Backend & Database (MVC REST API, Docker PostgreSQL)
- **Phân lớp MVC:** View ở React; Backend theo luồng `Route -> Middleware -> Controller -> Service/pg -> PostgreSQL`. Routes chỉ đăng ký endpoint/Middleware; Middleware kiểm tra xác thực và quyền; Controller điều phối HTTP/transaction; `services/` chứa nghiệp vụ dùng chung; `config/db.js` quản lý Pool; `utils/` chứa hàm thuần và sinh ID.
- **Hiện trạng tầng dữ liệu:** Chưa có `backend/src/models/`; SQL hiện ở Controller/Service. Không mô tả MVC đã tách Model hoàn chỉnh hoặc tự thêm thư mục chỉ để khớp sơ đồ. Khi bổ sung tầng dữ liệu thực sự, cập nhật cả sơ đồ và hướng dẫn liên quan. Chuẩn Clean Code áp dụng cho tính năng mới/refactor, không mặc định toàn bộ mã cũ đã đạt chuẩn.
- **PostgreSQL qua Docker:** Môi trường hiện có container `datn`, image `postgres:15`, cổng publish `5432` và Docker volume tại `/var/lib/postgresql/data`. Backend chạy trên host kết nối bằng `DB_HOST=localhost`, `DB_PORT=5432`; nếu container hóa Backend sau này, dùng tên dịch vụ/container DB trên cùng network.
- **Khởi tạo dữ liệu:** Repo chưa có SQL bootstrap/migration/seed. Schema chuẩn 11 bảng nằm trong `PROJECT_SPEC.md`; database mới cần nhập SQL schema/dump đã chuẩn bị theo đặc tả. Không khẳng định `docker run` hoặc Backend tự tạo bảng, không hướng dẫn chạy SQL trong `database/` không tồn tại. Không xóa volume hoặc tạo lại DB hiện có để kiểm thử; dùng schema kiểm thử riêng.
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

## 6. Cấu hình, chạy thử & xác minh tài liệu

- Mẫu cấu hình có nội dung là `backend/.env.example`; sao chép thành `backend/.env` khi chưa có tệp cục bộ. `.env.example` ở gốc hiện rỗng. Không ghi đè `.env` hiện có hoặc đưa giá trị bí mật vào tài liệu.
- Các biến Backend: `PORT`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`. Chạy từ `backend/` để dotenv đọc đúng `.env`; DB mặc định `clinic_duc_tin`.
- Mốc môi trường được tài liệu dự án dùng là Node.js **22.14+**, npm và Docker Desktop với Linux containers. Vite đang cài đặt yêu cầu `^20.19.0 || >=22.12.0`; utility test hiện dùng tính năng Node.js từ 22.14. Python/FastAPI là thành phần dự kiến, chưa có mã để chạy ở `ai-service/`.
- Development: `npm ci`, `npm run dev` trong từng thư mục `backend/` và `frontend/`; cổng Backend `5000`, Vite thường `5173`. Frontend Axios hiện trỏ tới `http://localhost:5000/api`. Trên PowerShell chặn `npm.ps1`, dùng `npm.cmd`.
- Kiểm tra thay đổi code theo phạm vi: `npm test` và `npm run test:integration` tại `backend/`; `node --test tests/patientActions.test.cjs` và `npm run build` tại `frontend/`. Integration test cần PostgreSQL có schema và quyền tạo schema `patient_test_*`, tự dọn dữ liệu kiểm thử sau khi chạy.
- Với thay đổi chỉ tài liệu: đối chiếu đường dẫn, scripts, dependency, sơ đồ kiến trúc, link và `git diff --check`. Phân biệt trạng thái triển khai hiện có với endpoint/chức năng dự kiến; không cần chạy lại test code nếu không thay đổi hành vi.
