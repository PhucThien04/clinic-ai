# Clinic AI — Đặc tả Kỹ thuật & Nghiệp vụ Dự án (Single Source of Truth)

**Phiên bản:** 3.0 (Trợ lý AI lâm sàng FastAPI)

**Cập nhật:** 20/11/2026

**Đề tài:** Xây dựng hệ thống quản lý phòng khám nha khoa Đức Tín, tích hợp AI tóm tắt và phân tích hồ sơ bệnh nhân.  
**Đơn vị:** Khoa Công nghệ Số — Trường Đại học Sư phạm Kỹ thuật - ĐHĐN  
**Sinh viên thực hiện:** Nguyễn Phúc Thiên (MSV: 22115053122343 — Lớp: 22T3)  
**Giảng viên hướng dẫn:** TS. Hoàng Thị Mỹ Lệ  
**Thời gian thực hiện:** 30/08/2026 – 20/12/2026  

---

## 1. Tổng quan & Mục tiêu Hệ thống
Xây dựng ứng dụng web số hóa quy trình vận hành tại **Phòng khám Nha khoa Đức Tín**, bao gồm: quản lý tài khoản phân quyền, hồ sơ bệnh nhân & người thân, tiền sử bệnh nền, lịch làm việc bác sĩ, đặt lịch khám, tiếp nhận sinh hiệu và khám nha khoa lâm sàng.

Hệ thống tích hợp **Trợ lý AI** thực hiện 3 nhiệm vụ cốt lõi:
1. **Tóm tắt tiền sử bệnh án** qua các đợt điều trị.
2. **Phân tích dữ liệu lâm sàng nha khoa** (sinh hiệu, triệu chứng, tiền sử).
3. **Cảnh báo sớm dấu hiệu bất thường** hỗ trợ bác sĩ ra quyết định chuyên môn.

> **Nguyên tắc cốt lõi:** AI chỉ đóng vai trò hỗ trợ quyết định lâm sàng (Clinical Decision Support), không tự ý chẩn đoán chính thức và không thay thế bác sĩ.

---

## 2. Tác nhân (Actors) & Phạm vi Chức năng

Hệ thống gồm **7 tác nhân** với phân quyền chặt chẽ ở Backend:

1. **Khách / Bệnh nhân (`Bệnh nhân`):**
   - Xem trang chủ giới thiệu phòng khám, bảng giá dịch vụ (`DICHVU`) và chương trình ưu đãi/sự kiện (`SUKIEN`).
   - Đăng ký, đăng nhập, cập nhật thông tin cá nhân (`TAIKHOAN`), đăng xuất.
   - Quản lý danh sách hồ sơ bệnh nhân của bản thân (`LoaiThongTin = 0`) và người thân (`LoaiThongTin = 1`): thêm, sửa, xóa hồ sơ người thân (`THONGTINNGUOITHAN`).
   - Khai báo, chỉnh sửa, xóa tiền sử bệnh / bệnh nền (`TIENSUBENH`) cho từng hồ sơ.
   - Xem lịch làm việc của bác sĩ (`LICHLAMVIEC`), đặt lịch khám (`LICHDAT`, `CHITIETLICHDAT`), cập nhật hoặc hủy lịch đặt.
   - Xem lịch sử các lần khám bệnh tại phòng khám (triệu chứng, sinh hiệu, chẩn đoán, kết luận).
2. **Nhân viên (`Nhân viên`):**
   - Đăng nhập, cập nhật thông tin cá nhân, đăng xuất.
   - Quản lý lịch làm việc của bác sĩ (`LICHLAMVIEC`: tạo ca, cập nhật trạng thái/ghi chú).
   - Quản lý và cập nhật trạng thái lịch đặt của bệnh nhân (`LICHDAT`: Đã đặt, Đã xác nhận, Đang khám, Hoàn thành, Đã hủy).
3. **Y tá (`Y tá`):**
   - Đăng nhập, cập nhật thông tin cá nhân, đăng xuất.
   - Tiếp nhận bệnh nhân theo lịch hẹn, ghi nhận chỉ số sinh hiệu (`NhietDo`, `HuyetApTamThu`, `HuyetApTamTruong`, `NhipTim`, `NhipTho`, `CanNang`, `ChieuCao`) và triệu chứng lâm sàng ban đầu vào bản ghi khám (`HOSOBENHNHAN`).
4. **Bác sĩ (`Bác sĩ`):**
   - Đăng nhập, cập nhật thông tin cá nhân, đăng xuất.
   - Xem hồ sơ bệnh nhân, tiền sử bệnh nền và lịch sử các lần khám trước.
   - Tương tác với Trợ lý AI để xem tóm tắt tiền sử, phân tích lâm sàng và cảnh báo bất thường.
   - Cập nhật `ChuanDoan`, `KetLuan` và `ThoiDiemCapNhat` cho lượt khám hiện tại.
5. **Admin (`Admin`):**
   - Đăng nhập, cập nhật thông tin cá nhân, đăng xuất.
   - Quản lý tài khoản người dùng (`TAIKHOAN`: tạo tài khoản nhân sự, phân vai trò `VaiTro`, khóa/mở khóa `TrangThai`).
6. **Chủ phòng khám (`Chủ phòng khám`):**
   - Đăng nhập, cập nhật thông tin cá nhân, đăng xuất.
   - Cập nhật thông tin phòng khám (`PHONGKHAM`), quản lý danh mục dịch vụ nha khoa (`DICHVU`) và sự kiện/khuyến mãi (`SUKIEN`).
7. **Trợ lý AI (Internal Service):**
   - Tóm tắt tiền sử bệnh án (`TOMTAT`).
   - Phân tích dữ liệu lâm sàng nha khoa (`PHANTICH`).
   - Cảnh báo sớm dấu hiệu bất thường (`CANHBAO`).

---

## 3. Quy trình Nghiệp vụ Tổng quát

```text
[1. Bệnh nhân tạo hồ sơ bản thân/người thân & khai báo bệnh nền]
        │
        ▼
[2. Nhân viên / Chủ PK tạo lịch làm việc bác sĩ (LICHLAMVIEC)]
        │
        ▼
[3. Bệnh nhân đặt lịch khám (LICHDAT + CHITIETLICHDAT) -> Gắn 1 bản ghi HOSOBENHNHAN riêng cho lượt khám]
        │
        ▼
[4. Nhân viên xác nhận lịch -> Y tá đo sinh hiệu & ghi nhận triệu chứng ban đầu]
        │
        ▼
[5. Bác sĩ yêu cầu AI tóm tắt tiền sử, phân tích lâm sàng & cảnh báo (AIKETQUA)]
        │
        ▼
[6. Bác sĩ khám, đưa ra ChuanDoan & KetLuan -> Hoàn tất lượt khám (bảo toàn lịch sử)]
```

---

## 4. Kiến trúc & Công nghệ Hệ thống

```text
React Frontend trên host (TypeScript + Vite + Tailwind CSS v4)
       │ REST API (JSON + JWT)
       ▼
Node.js / Express Backend trên host ── HTTP ── Python / FastAPI (:8000)
       │                                           │
       ▼                                           ▼
PostgreSQL 15 trong Docker                   External AI API (cấu hình qua .env)
```

- **Frontend:** React 19, TypeScript 7 cho compiler (`@typescript/native` alias) và TypeScript 6 API cho ESLint (`typescript` alias sang `@typescript/typescript6`), Vite 8, React Router, Axios, Lucide React và **Tailwind CSS v4**. `@tailwindcss/vite` được đăng ký trong `frontend/vite.config.ts`; entry CSS là `frontend/src/index.css` với `@import "tailwindcss";`.
- **Backend:** Node.js, Express 5, `pg`, JWT (`jsonwebtoken`), bcrypt, dotenv và nodemon. Backend xử lý nghiệp vụ, kiểm tra quyền và truy cập PostgreSQL qua `backend/src/config/db.js`.
- **AI Service đã triển khai:** Python 3.11+ / FastAPI, Pydantic v2, httpx, python-dotenv; cổng 8000. Nhận JSON từ Backend, tính rule-based và gọi Gemini/OpenAI-compatible; không có driver DB, không truy cập PostgreSQL. Thiếu key/lỗi provider trả tổng hợp an toàn HTTP 200.
- **Database:** PostgreSQL 15 trong Docker, image `postgres:15`. Môi trường đã kiểm tra có container `datn`, publish cổng host `5432`, lưu dữ liệu ở Docker volume gắn tại `/var/lib/postgresql/data`. Backend chạy trên host dùng `DB_HOST=localhost`, `DB_PORT=5432`; chưa có Dockerfile hoặc Docker Compose trong repo.

### 4.1. Clean Code & phân lớp Frontend

- `services/`: các hàm HTTP qua Axios; không gọi API trực tiếp từ Page/Component khi tạo mới hoặc refactor.
- `hooks/`: state, side-effect và nghiệp vụ của tính năng.
- `utils/`: hàm thuần như format ngày lịch, validation và ánh xạ thông báo lỗi.
- `pages/`, `components/`: render JSX và nhận dữ liệu/hành động từ Hook. Dùng `import type` với TypeScript type/interface khi bật `verbatimModuleSyntax`.
- Tailwind CSS v4 utility classes trong JSX; không tạo CSS riêng cho Page/Component. Giữ `index.css` làm entry Tailwind. Hệ màu `sky-600`, `teal-600`, nền `slate-50`, viền `slate-200`, cảnh báo `amber`; sidebar `DashboardLayout` giữ `h-screen sticky top-0`.

### 4.2. MVC với Backend REST API

View nằm ở React; Express dùng luồng `Route -> Middleware -> Controller -> Service/pg -> PostgreSQL`. Routes đăng ký endpoint; Middleware xác thực, kiểm tra quyền; Controller điều phối HTTP và transaction; Services chứa nghiệp vụ dùng chung; `config/db.js` quản lý Pool; Utils chứa hàm thuần và sinh ID.

Workspace hiện **chưa có `backend/src/models/`**; SQL đang nằm trong Controller/Service. Đây là cách phân lớp theo MVC cho REST API tách Frontend, chưa phải MVC đã tách Model đầy đủ. Khi phát triển tiếp, tách nghiệp vụ dùng chung vào Service, giữ SQL parameterized, alias PascalCase và transaction; chỉ bổ sung tầng Model khi có thay đổi mã thực tế và cập nhật tài liệu cùng phiên. Các quy tắc này là chuẩn áp dụng cho thay đổi mới/refactor, không khẳng định toàn bộ mã cũ đã tuân thủ.

### 4.3. Cấu trúc workspace thực tế

Sơ đồ các thư mục nguồn và tệp cấu hình chính bên dưới đồng bộ với README; lược bỏ `.git/`, `node_modules/`, `dist/` và `backend/.env`.

```text
clinic-ai/
├── ai-service/               # FastAPI; không kết nối DB
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # /health, /analyze
│   │   ├── config.py
│   │   ├── schemas.py
│   │   ├── rules/            # __init__.py, vital_rules.py
│   │   ├── prompts/          # __init__.py, clinical_prompt.py
│   │   └── services/         # __init__.py, llm_service.py
│   ├── tests/                # Cục bộ, Git ignore
│   ├── .env.example
│   └── requirements.txt
├── backend/
│   ├── src/
│   │   ├── config/           # db.js: PostgreSQL Pool qua pg
│   │   ├── controllers/      # Controller REST API; hiện còn chứa SQL
│   │   ├── middlewares/     # JWT và quyền sở hữu dữ liệu
│   │   ├── routes/          # Đăng ký endpoint Express
│   │   ├── services/        # Nghiệp vụ dùng chung, tạo hồ sơ bản thân
│   │   ├── utils/           # Sinh ID CHAR(13)
│   │   └── server.js        # Entry point Backend
│   ├── migrations/          # SQL chạy thủ công, không gắn startup
│   ├── tests/               # Test cục bộ, được .gitignore bỏ qua
│   ├── .env.example         # Mẫu cấu hình Backend có nội dung
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/              # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/           # admin, auth, doctor, home, nurse, owner, patient, staff
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css        # Entry CSS Tailwind v4
│   ├── tests/               # Test cục bộ, được .gitignore bỏ qua
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md            # Tài liệu Frontend
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .env.example             # Tệp gốc hiện rỗng, chưa dùng để chạy Backend
├── .gitignore
├── AGENTS.md
├── PROJECT_SPEC.md
└── README.md
```

Không có `.ai-workflow/`, `database/` hoặc `docs/` trong workspace. `ai-service/` đã triển khai FastAPI, rule engine và adapter LLM. `.env.example` tại gốc hiện rỗng; mẫu cấu hình Backend có nội dung là `backend/.env.example`. Các thư mục `tests/` giữ cục bộ, được `.gitignore` bỏ qua và không còn trong Git tracking; clone mới không có bộ test. Đây là chính sách lưu trữ, không thay đổi yêu cầu kiểm thử nghiệp vụ.

### 4.4. Khởi tạo môi trường Development

1. Chuẩn bị Node.js **22.14+**, npm và Docker Desktop với Linux containers. Vite đang cài đặt chấp nhận Node.js `^20.19.0 || >=22.12.0`; mốc 22.14+ cũng đáp ứng utility test. Python 3.11+ cần cho AI Service (môi trường kiểm thử 3.13).
2. Kiểm tra container PostgreSQL bằng `docker ps -a`; nếu container `datn` đã có nhưng dừng, dùng `docker start datn`. Kiểm tra sẵn sàng bằng `docker exec datn pg_isready -U postgres -d clinic_duc_tin`. Hướng dẫn tạo container PostgreSQL 15 mới và volume riêng nằm trong [README, mục 4.1](./README.md#41-postgresql-qua-docker).
3. Container mới chỉ tạo database rỗng, không tự tạo 11 bảng. Repo chưa có SQL bootstrap/seed; có migration thủ công riêng cho nội dung AI. Với môi trường mới, nhập schema/dump theo mục 5; ba cột ảnh và `ThoiDiemCapNhat` của 5 bảng TAIKHOAN/SUKIEN/DICHVU/LICHLAMVIEC/LICHDAT phải có sẵn. Backend khởi động bằng app.listen trực tiếp, không chạy ALTER TABLE, CREATE FUNCTION/TRIGGER hoặc sửa schema trong request. TIENSUBENH.IdChiTietLD phải nullable theo đặc tả; đã bỏ fallback tự DROP NOT NULL. Integration test clone schema hiện có và không gọi DDL từ mã ứng dụng.
4. Nếu chưa có `backend/.env`, sao chép `backend/.env.example` vào đó rồi điền `PORT`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`. Mặc định database `clinic_duc_tin`; mật khẩu phải khớp cấu hình PostgreSQL. Chạy Backend từ `backend/` để dotenv đọc đúng tệp. Nếu sau này Backend chạy trong Docker, dùng tên dịch vụ/container DB trên cùng network làm `DB_HOST`.
5. Tại `backend/`, chạy `npm ci` rồi `npm run dev` (Express `http://localhost:5000`). Tại terminal khác trong `frontend/`, chạy `npm ci` rồi `npm run dev` (Vite thường `http://localhost:5173`). Axios hiện dùng `http://localhost:5000/api`.
6. Trong `ai-service/`: `python -m venv .venv`, `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`; nếu chưa có .env thì sao chép `.env.example`. Chạy `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000`. Trên Linux/macOS dùng `.venv/bin/python`. Backend cần AI_SERVICE_URL (mặc định http://localhost:8000) và AI_SERVICE_TIMEOUT_MS (25000). Không ghi đè .env hiện có; trên PowerShell chặn npm.ps1 dùng npm.cmd.

---

## 5. Mô hình Cơ sở dữ liệu (PostgreSQL — Chuẩn `CHAR(13)`)

### 5.1 Quy ước Sinh mã ID (`CHAR(13)`)
Toàn bộ khóa chính (`PK`) và khóa ngoại (`FK`) tham chiếu ID đều dùng kiểu **`CHAR(13)`**, sinh tập trung qua `backend/src/utils/idGenerator.js`:
- `TK...`: `TAIKHOAN`
- `PK...`: `PHONGKHAM`
- `SK...`: `SUKIEN`
- `DV...`: `DICHVU`
- `LLV...`: `LICHLAMVIEC`
- `LD...`: `LICHDAT`
- `HS...`: `HOSOBENHNHAN`
- `NT...`: `THONGTINNGUOITHAN`
- `CT...`: `CHITIETLICHDAT`
- `TS...`: `TIENSUBENH`
- `AI...`: `AIKETQUA`

### 5.2 Quy tắc Dữ liệu Quan trọng (Bắt buộc tuân thủ)
1. **Không dùng bảng `BENHNHAN` riêng:** Thông tin bệnh nhân được quản lý qua `HOSOBENHNHAN` kết hợp `TAIKHOAN` (khi `LoaiThongTin = 0` — chủ tài khoản) hoặc `THONGTINNGUOITHAN` (khi `LoaiThongTin = 1` — người thân).
2. **Bảo toàn lịch sử khám (Không ghi đè dữ liệu cũ):**
   - Mỗi lượt khám (`CHITIETLICHDAT`) phải liên kết với **một bản ghi `HOSOBENHNHAN` riêng biệt**.
   - Khi bệnh nhân đặt lịch khám mới bằng một hồ sơ đã từng đặt lịch hoặc đã có `ChuanDoan`/`KetLuan`, Backend **bắt buộc tự động tạo một bản ghi `HOSOBENHNHAN` mới** (và nhân bản `THONGTINNGUOITHAN` tương ứng nếu `LoaiThongTin = 1`) để gắn vào `CHITIETLICHDAT` mới.
   - Khi hiển thị danh sách hồ sơ ở Frontend, gom nhóm theo từng cá nhân (`SELF` hoặc `HoTen + MoiQuanHe`) để không bị trùng thẻ hồ sơ, đồng thời gom toàn bộ lịch sử khám và tiền sử bệnh của cùng một người.
3. **Tiền sử bệnh độc lập với lượt khám:** `TIENSUBENH.IdChiTietLD` cho phép `NULL` để bệnh nhân có thể tự khai báo bệnh nền trước khi đặt lịch.

### 5.3 Chi tiết 11 Bảng Cơ sở dữ liệu

| Bảng | Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **TAIKHOAN** | `IdTaiKhoan` | `CHAR(13)` | `PK, NOT NULL` | Mã tài khoản (`TK...`) |
| | `TenTaiKhoan` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Tên đăng nhập |
| | `MatKhau` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu đã mã hóa (bcrypt) |
| | `HoTen` | `VARCHAR(255)` | `NOT NULL` | Họ và tên |
| | `CCCD` | `CHAR(12)` | `UNIQUE, NOT NULL` | Số căn cước công dân |
| | `NgaySinh` | `TIMESTAMP` | `NULL` | Ngày sinh |
| | `GioiTinh` | `VARCHAR(20)` | `NULL` | Giới tính |
| | `Email` | `VARCHAR(100)` | `UNIQUE, NULL` | Email |
| | `SoDienThoai` | `CHAR(10)` | `UNIQUE, NOT NULL` | Số điện thoại |
| | `DiaChi` | `VARCHAR(255)` | `NULL` | Địa chỉ |
| | `TrangThai` | `VARCHAR(50)` | `NOT NULL` | Trạng thái (`Hoạt động`, `Khóa`) |
| | `VaiTro` | `VARCHAR(100)` | `NOT NULL` | `Bệnh nhân`, `Nhân viên`, `Y tá`, `Bác sĩ`, `Admin`, `Chủ phòng khám` |
| | `AnhDaiDien` | `VARCHAR(500)` | `NULL` | URL ảnh đại diện http/https; null khi chưa có/xóa ảnh |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL`, default giờ Việt Nam hiện tại | SQL INSERT/UPDATE ghi khi tạo/cập nhật tài khoản để thông báo Admin có thời gian thực |
| **PHONGKHAM** | `IdPhongKham` | `CHAR(13)` | `PK, NOT NULL` | Mã phòng khám (`PK...`) |
| | `ChuPhongKham` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Mã tài khoản chủ phòng khám |
| | `TenPhongKham` | `VARCHAR(255)` | `NOT NULL` | Tên phòng khám |
| | `DiaChi` | `VARCHAR(255)` | `NOT NULL` | Địa chỉ phòng khám |
| | `SoDienThoai` | `CHAR(10)` | `NOT NULL` | Số điện thoại liên hệ |
| | `Email` | `VARCHAR(100)` | `NOT NULL` | Email phòng khám |
| | `GioiThieu` | `VARCHAR(255)` | `NULL` | Giới thiệu ngắn |
| | `GioMoCua` | `TIME` | `NULL` | Giờ mở cửa |
| | `GioDongCua` | `TIME` | `NULL` | Giờ đóng cửa |
| **SUKIEN** | `IdSuKien` | `CHAR(13)` | `PK, NOT NULL` | Mã sự kiện (`SK...`) |
| | `IdPhongKham` | `CHAR(13)` | `FK -> PHONGKHAM, NOT NULL` | Mã phòng khám |
| | `TieuDe` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề sự kiện / ưu đãi |
| | `NoiDung` | `TEXT` | `NOT NULL` | Nội dung chi tiết |
| | `TrangThai` | `VARCHAR(50)` | `NOT NULL` | `Hiển thị`, `Ẩn` |
| | `ThoiGianBatDau` | `TIMESTAMP` | `NULL` | Ngày giờ bắt đầu áp dụng (khớp PostgreSQL hiện tại) |
| | `ThoiGianKetThuc` | `TIMESTAMP` | `NULL` | Ngày giờ kết thúc áp dụng (khớp PostgreSQL hiện tại) |
| | `HinhAnh` | `VARCHAR(500)` | `NULL` | URL ảnh sự kiện http/https |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL`, default giờ Việt Nam hiện tại | Controller tự gán trong SQL INSERT/UPDATE sự kiện |
| **DICHVU** | `IdDichVu` | `CHAR(13)` | `PK, NOT NULL` | Mã dịch vụ (`DV...`) |
| | `IdPhongKham` | `CHAR(13)` | `FK -> PHONGKHAM, NOT NULL` | Mã phòng khám |
| | `TenDichVu` | `VARCHAR(255)` | `NOT NULL` | Tên dịch vụ nha khoa |
| | `MoTa` | `VARCHAR(255)` | `NULL` | Mô tả dịch vụ |
| | `Gia` | `DECIMAL(18,2)` | `NOT NULL` | Đơn giá dịch vụ (VNĐ) |
| | `TrangThai` | `VARCHAR(50)` | `NOT NULL` | `Hiển thị`, `Hoạt động`, `Ngừng cung cấp` |
| | `HinhAnh` | `VARCHAR(500)` | `NULL` | URL ảnh dịch vụ http/https |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL`, default giờ Việt Nam hiện tại | Controller tự gán trong SQL INSERT/UPDATE dịch vụ |
| **LICHLAMVIEC** | `IdLichLamViec` | `CHAR(13)` | `PK, NOT NULL` | Mã ca làm việc (`LLV...`) |
| | `IdBacSi` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Mã bác sĩ phụ trách |
| | `IdPhongKham` | `CHAR(13)` | `FK -> PHONGKHAM, NOT NULL` | Mã phòng khám |
| | `NgayLamViec` | `DATE` | `NOT NULL` | Ngày làm việc |
| | `GioBatDau` | `TIME` | `NOT NULL` | Giờ bắt đầu ca |
| | `GioKetThuc` | `TIME` | `NOT NULL` | Giờ kết thúc ca |
| | `TrangThai` | `VARCHAR(30)` | `NOT NULL` | `Hoạt động`, `Tạm ngưng` |
| | `GhiChu` | `VARCHAR(255)` | `NULL` | Ghi chú ca khám |
| | `NguoiCapNhat` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Người tạo/cập nhật lịch |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL`, default giờ Việt Nam hiện tại | Controller tự gán trong SQL INSERT/UPDATE ca làm việc |
| **LICHDAT** | `IdLichDat` | `CHAR(13)` | `PK, NOT NULL` | Mã lịch đặt (`LD...`) |
| | `IdTaiKhoan` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Tài khoản đặt lịch |
| | `TrangThai` | `VARCHAR(30)` | `NOT NULL` | `Đã đặt`, `Đã xác nhận`, `Đang khám`, `Hoàn thành`, `Đã hủy` |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL`, default giờ Việt Nam hiện tại | Controller tự gán trong SQL INSERT/UPDATE lịch đặt; đổi chi tiết lịch cũng chạm cột này |
| **HOSOBENHNHAN** | `IdHoSoBenhNhan` | `CHAR(13)` | `PK, NOT NULL` | Mã phiếu hồ sơ / lượt khám (`HS...`) |
| | `IdTaiKhoan` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Chủ tài khoản quản lý |
| | `LoaiThongTin` | `SMALLINT` | `CHECK (0 hoặc 1)` | `0`: Chủ tài khoản, `1`: Người thân |
| | `NhietDo` | `NUMERIC(4,1)` | `NULL` | Nhiệt độ (°C) |
| | `HuyetApTamThu` | `SMALLINT` | `NULL` | Huyết áp tâm thu (mmHg) |
| | `HuyetApTamTruong` | `SMALLINT` | `NULL` | Huyết áp tâm trương (mmHg) |
| | `NhipTim` | `SMALLINT` | `NULL` | Nhịp tim (lần/phút) |
| | `NhipTho` | `SMALLINT` | `NULL` | Nhịp thở (lần/phút) |
| | `CanNang` | `NUMERIC(5,2)` | `NULL` | Cân nặng (kg) |
| | `ChieuCao` | `NUMERIC(5,2)` | `NULL` | Chiều cao (cm) |
| | `TrieuChung` | `VARCHAR(255)` | `NULL` | Triệu chứng lâm sàng |
| | `ThoiDiemKhoiPhat` | `TIMESTAMP` | `NULL` | Thời điểm khởi phát triệu chứng |
| | `MucDo` | `VARCHAR(50)` | `NULL` | Mức độ triệu chứng (`Nhẹ`, `Trung bình`, `Nặng`) |
| | `GhiChu` | `VARCHAR(255)` | `NULL` | Ghi chú lâm sàng |
| | `ChuanDoan` | `VARCHAR(255)` | `NULL` | Chẩn đoán của bác sĩ |
| | `KetLuan` | `VARCHAR(255)` | `NULL` | Kết luận & hướng điều trị |
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL` | Thời điểm cập nhật sinh hiệu hoặc chẩn đoán của lượt khám, theo giờ Việt Nam |
| **THONGTINNGUOITHAN** | `IdThongTinNguoiThan` | `CHAR(13)` | `PK, NOT NULL` | Mã thông tin người thân (`NT...`) |
| | `IdHoSoBenhNhan` | `CHAR(13)` | `FK -> HOSOBENHNHAN, NOT NULL` | Hồ sơ bệnh nhân tương ứng |
| | `MoiQuanHe` | `VARCHAR(100)` | `NOT NULL` | `Cha`, `Mẹ`, `Con`, `Vợ/Chồng`, `Người thân` |
| | `HoTen` | `VARCHAR(255)` | `NULL` | Họ tên người thân |
| | `CCCD` | `CHAR(12)` | `NULL` | CCCD người thân |
| | `NgaySinh` | `TIMESTAMP` | `NULL` | Ngày sinh người thân |
| | `GioiTinh` | `VARCHAR(20)` | `NULL` | Giới tính người thân |
| | `SoDienThoai` | `CHAR(10)` | `NULL` | Số điện thoại người thân |
| | `DiaChi` | `VARCHAR(255)` | `NULL` | Địa chỉ người thân |
| **CHITIETLICHDAT** | `IdChiTietLD` | `CHAR(13)` | `PK, NOT NULL` | Mã chi tiết lượt khám (`CT...`) |
| | `IdHoSoBenhNhan` | `CHAR(13)` | `FK -> HOSOBENHNHAN, NOT NULL` | Phiếu hồ sơ khám riêng của lượt này |
| | `IdLichLamViec` | `CHAR(13)` | `FK -> LICHLAMVIEC, NOT NULL` | Ca làm việc bác sĩ |
| | `IdLichDat` | `CHAR(13)` | `FK -> LICHDAT, NOT NULL` | Lịch đặt tổng |
| | `LiDoKham` | `VARCHAR(255)` | `NULL` | Lý do khám |
| | `GhiChu` | `VARCHAR(255)` | `NULL` | Ghi chú đặt lịch |
| **TIENSUBENH** | `IdTienSuBenh` | `CHAR(13)` | `PK, NOT NULL` | Mã tiền sử bệnh (`TS...`) |
| | `IdHoSoBenhNhan` | `CHAR(13)` | `FK -> HOSOBENHNHAN, NOT NULL` | Hồ sơ bệnh nhân |
| | `IdChiTietLD` | `CHAR(13)` | `FK -> CHITIETLICHDAT, NULL` | Lượt khám phát hiện (Null nếu tự khai báo) |
| | `NguoiGhiNhan` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Tài khoản ghi nhận |
| | `TenBenh` | `VARCHAR(100)` | `NOT NULL` | Tên bệnh nền / dị ứng |
| | `MoTa` | `VARCHAR(255)` | `NULL` | Mô tả chi tiết |
| | `ThoiDiemMac` | `TIMESTAMP` | `NULL` | Thời điểm phát hiện/mắc bệnh |
| | `TrangThai` | `VARCHAR(50)` | `NULL` | `Đang điều trị`, `Ổn định`, `Đã khỏi` |
| **AIKETQUA** | `IdAIKetQua` | `CHAR(13)` | `PK, NOT NULL` | Mã kết quả AI (`AI...`) |
| | `IdChiTietLD` | `CHAR(13)` | `FK -> CHITIETLICHDAT, NOT NULL` | Lượt khám được phân tích |
| | `LoaiKetQua` | `VARCHAR(30)` | `NOT NULL` | `TOMTAT`, `PHANTICH`, `CANHBAO` |
| | `NoiDung` | `TEXT` | `NOT NULL` | Nội dung kết quả do AI tạo |
| | `ThoiDiemTao` | `TIMESTAMP` | `NOT NULL` | Thời điểm tạo kết quả |

---

## 6. Danh sách REST API Endpoints (Backend Port `5000`)

Các endpoint bên dưới, bao gồm `POST /api/ai/analyze`, đã được đăng ký trong mã nguồn. Phân tích AI đi qua Backend kiểm tra quyền, FastAPI xử lý và lưu 3 kết quả tham khảo vào AIKETQUA.

- **Auth (`/api/auth`):** `POST /register`, `POST /login`
  - Đăng ký công khai luôn tạo vai trò `Bệnh nhân`, bỏ qua `VaiTro` do client gửi. Tài khoản và hồ sơ bản thân (`LoaiThongTin = 0`) được tạo trong cùng transaction.
  - Đăng nhập chặn tài khoản không ở trạng thái `Hoạt động` (`403`). Bệnh nhân cũ chưa có hồ sơ bản thân được tự tạo hồ sơ trước khi nhận token; khóa dòng tài khoản tránh tạo trùng khi đăng nhập đồng thời.
  - `verifyToken` đọc lại vai trò/trạng thái từ DB sau khi kiểm tra JWT để thao tác khóa/đổi vai trò có hiệu lực với token đã cấp. Tài khoản bị khóa/không tồn tại trả `403`; DB không khả dụng khi xác thực trả `503`.
- **Profile (`/api/profile`):** `GET /`, `PUT /` (đường dẫn hiện tại; tài khoản lấy từ JWT, không có tham số `:idTaiKhoan`)
  - Trả PascalCase, ngày sinh `YYYY-MM-DD`, đọc/lưu `AnhDaiDien`. Bỏ qua trường ảnh khi không gửi, gửi `null`/chuỗi rỗng để xóa. Xóa avatar khóa dòng tài khoản trong transaction, xóa file Cloudinary thuộc thư mục của tài khoản trước khi cập nhật DB về NULL. Không được chọn URL Cloudinary của thư mục tài khoản khác. Đổi sang ảnh khác giữ ảnh cũ trong thư viện.
  - Profile không có card nhập ảnh riêng hoặc ô dán URL. Chỉ avatar đầu trang với lớp phủ Camera khi hover/focus, aria-label `Chỉnh sửa ảnh đại diện`, mở `AvatarManagerModal`; đã bỏ nút Pencil trùng chức năng cạnh vai trò. Logic ở Hooks, API ở Services, hình học cắt ảnh/Canvas ở `utils/avatarCrop.ts`.
  - Modal có thư viện avatar của tài khoản, chọn ảnh cũ làm avatar, xóa avatar/xóa ảnh thư viện với xác nhận. Chọn file mới chỉ tạo object URL xem trước; bước Crop có khung tròn 256px, pan bằng chuột/chạm/phím mũi tên và zoom 1–3. `Xác nhận & Lưu` mới xuất PNG vuông 512×512 bằng Canvas, upload một lần rồi PUT profile. Có khóa chống bấm lặp và giữ URL đã upload để thử lại lưu DB mà không upload trùng. Object URL được thu hồi khi hủy/đóng.
  - Sau khi đổi/xóa thành công, cập nhật user trong `sessionStorage` và phát `auth-user-updated`. `useCurrentUser` giúp Header/Sidebar cập nhật ngay, có ảnh tròn cạnh tên/vai trò và fallback icon khi chưa có ảnh/ảnh lỗi.
- **Patients (`/api/patients`):**
  - Tất cả endpoint yêu cầu Bearer JWT hợp lệ (`401` nếu thiếu/sai/hết hạn). Chỉ được truy cập hồ sơ, người thân, tiền sử và lịch sử khám thuộc `IdTaiKhoan` trong token; truy cập chéo tài khoản trả `403`, dữ liệu không tồn tại trả `404`.
  - `GET /profiles` mặc định lấy tài khoản trong token; tham số `idTaiKhoan` cũ chỉ được dùng khi trùng tài khoản đó. `POST /profiles` lấy chủ hồ sơ từ token; loại `0` trả hồ sơ bản thân sẵn có hoặc tạo mới, loại `1` yêu cầu họ tên/quan hệ người thân.
  - `POST /histories` lấy `NguoiGhiNhan` từ token; nếu có `IdChiTietLD`, lượt khám phải thuộc đúng hồ sơ và tài khoản hiện tại.
  - `GET /profiles?idTaiKhoan=...`, `POST /profiles`, `DELETE /profiles/:idHoSo`
  - `GET /relatives?idHoSoBenhNhan=...`, `PUT /relatives`
  - `GET /histories?idHoSoBenhNhan=...`, `POST /histories`, `PUT /histories/:idTienSu`, `DELETE /histories/:idTienSu`
  - `GET /exam-histories?idHoSoBenhNhan=...` (Lịch sử khám lâm sàng qua các đợt)
- **Schedules (`/api/schedules`):** `GET /` public; `GET /resources`, `POST /`, `PUT /:id` yêu cầu JWT và vai trò `Nhân viên`, `Admin` hoặc `Chủ phòng khám`.
  - `GET /resources` trả `{ doctors, clinics }`: bác sĩ đang `Hoạt động` và danh sách phòng khám, với alias PascalCase.
  - Tạo/sửa ca lấy `NguoiCapNhat` từ JWT, kiểm tra bác sĩ đúng vai trò, phòng khám tồn tại, ngày hợp lệ và `GioBatDau < GioKetThuc`. `TrangThai` chỉ là `Hoạt động`/`Tạm ngưng`. Ca hoạt động trùng khung giờ với ca hoạt động khác của cùng bác sĩ trong ngày trả `409`; hai ca tiếp giáp được phép. Khóa transaction để chống tạo ca trùng đồng thời.
  - Ca có lịch đặt chưa hủy chỉ được sửa `TrangThai`/`GhiChu`; đổi bác sĩ, phòng khám, ngày hoặc giờ trả `409`. Các bản ghi tạo mới dùng `generateId('LLV')`; ca không tồn tại khi sửa trả `404`.
  - `NgayLamViec` trong kết quả `GET /api/schedules` và `GET /api/appointments` là chuỗi ngày `YYYY-MM-DD`, không kèm múi giờ. Frontend giữ nguyên ngày lịch khi chọn/lọc/hiển thị, không chuyển ngày này qua UTC/Local.
- **Appointments (`/api/appointments`):** `GET /`, `GET /all`, `POST /`, `PUT /:id`, `PUT /:id/cancel`, `GET /manage`, `PUT /:id/status`
  - Khu vực `Lịch Hẹn Đã Đặt` của Bệnh nhân có tab và số lượng: `all` (mặc định), `pending` (`Đã đặt`/`Chờ duyệt`), `confirmed`, `inProgress`, `completed`, `cancelled`. Lọc tại Hook, đếm trên toàn danh sách tài khoản; thông báo trống theo tab, không thay đổi điều kiện sửa/hủy lịch.
  - Tất cả endpoint yêu cầu JWT. Các endpoint Bệnh nhân giới hạn quyền sở hữu theo tài khoản trong token; không nhận tài khoản khác từ request. `GET /all` chỉ trả các `IdLichLamViec` đã kín chỗ, không trả ID lịch đặt, tài khoản hoặc hồ sơ của người khác.
  - `GET /manage` và `PUT /:id/status` yêu cầu vai trò `Nhân viên`, `Admin`, `Chủ phòng khám`, đặt trước Middleware `scopeAccount` để được quản lý lịch toàn phòng khám. `GET /manage` nhận tùy chọn `date=YYYY-MM-DD`, `status`, trả đủ thông tin lượt khám, bệnh nhân/người thân, người đặt, lịch/giờ/bác sĩ/phòng khám, lý do/ghi chú/trạng thái theo PascalCase.
  - Tab duyệt lịch của Nhân viên mặc định không lọc ngày, nhãn `Ngày khám` và nút `Tất cả ngày` khi đang chọn ngày. API và Frontend ưu tiên lịch `Đã đặt`, sau đó ngày/giờ khám tăng dần để không bỏ sót lịch chờ xác nhận ở ngày khác.
  - Trang Nhân viên mang tiêu đề `Quản lý lịch đặt & Ca làm việc`, đồng bộ Header/Sidebar. Xác nhận/hủy dùng icon Check tông teal và X tông đỏ, có title/aria-label. Tab ca làm việc có ngày chọn riêng (mặc định hôm nay), hàng thẻ ngày từ danh sách ca + hôm nay + ngày đang chọn, input chọn ngày tùy ý và nút Plus; tạo ca tự điền ngày đang chọn. Ca của ngày chọn được sắp theo giờ, hiển thị lưới 1/2/3 cột với giờ, bác sĩ, phòng khám, badge trạng thái, ghi chú và Pencil sửa ca. Lọc ngày lịch đặt không ảnh hưởng ngày ca làm việc.
  - `PUT /:id/status` dùng `IdChiTietLD`, body `{ TrangThai }`. Chỉ cho `Đã đặt -> Đã xác nhận/Đã hủy` và `Đã xác nhận -> Đã hủy`. Trạng thái đã xử lý, đang khám, hoàn thành hoặc đã hủy trả `409`; mã không tồn tại trả `404`. Khóa lượt khám/lịch đặt trong transaction để tránh chuyển trạng thái đồng thời.
  - `POST /`: hồ sơ phải thuộc người đăng nhập; ca khám phải tồn tại, `Hoạt động`, chưa bắt đầu và chưa kín chỗ. Khóa dòng ca khám trong transaction trước khi kiểm tra chỗ trống để ngăn đặt trùng đồng thời. Ca quá hạn/tạm ngưng trả `400`; ca kín chỗ trả `409`.
  - `PUT /:id`: `id` là `IdChiTietLD`; cho phép cập nhật `IdLichLamViec`, `LiDoKham`, `GhiChu` khi trạng thái `Đã đặt` hoặc `Chờ duyệt` và lịch cũ còn ít nhất 6 tiếng. Ca mới cũng phải còn ít nhất 6 tiếng, đang hoạt động và trống (bỏ qua chính lịch đang sửa). Cập nhật trong transaction; không thay hồ sơ hoặc ghi đè dữ liệu lâm sàng. Trả `400` khi sai trạng thái/quá hạn, `409` khi ca kín chỗ.
  - `PUT /:id/cancel`: `id` là `IdChiTietLD`; chỉ hủy trạng thái `Đã đặt` hoặc `Chờ duyệt`, trước giờ khám ít nhất 6 tiếng (giờ Việt Nam). Trả `400` khi sai trạng thái/quá hạn, `404` khi không tìm thấy.
- **Quy tắc xóa hồ sơ:** `DELETE /api/patients/profiles/:idHoSo` xóa hồ sơ chưa gắn lịch khám và chưa có chẩn đoán/kết luận, cùng dữ liệu `THONGTINNGUOITHAN`, `TIENSUBENH` trong một transaction. Trả `404` nếu không tồn tại; `409` nếu đã gắn lịch khám, có chẩn đoán/kết luận hoặc còn ràng buộc dữ liệu, nhằm bảo toàn lịch sử khám và kết quả AI.
- **Examinations (`/api/examinations`) — đã triển khai:** `GET /queue`, `GET /patient/:idHoSoBenhNhan`, `PUT /vitals`, `PUT /diagnosis`
  - Toàn bộ router yêu cầu Bearer JWT qua `verifyToken`. `requireRoles(...roles)` trả `403` với thông báo `Bạn không có quyền thực hiện chức năng này.` khi sai vai trò; thiếu/sai token trả `401`.
  - `GET /queue`: dành cho `Y tá`, `Bác sĩ`, `Admin`, `Chủ phòng khám`. Chỉ lấy lịch `Đã xác nhận`, `Đang khám`, `Hoàn thành`; không đưa lịch chờ nhân viên duyệt vào lâm sàng. Query `date=YYYY-MM-DD` mặc định là ngày hiện tại theo `Asia/Ho_Chi_Minh`; `all=true` lấy mọi ngày trong các trạng thái trên. Trả các mã lượt khám/lịch/hồ sơ, ngày lịch dạng `YYYY-MM-DD`, giờ khám, bác sĩ/phòng khám, lý do, trạng thái, nhân thân và cờ `DaDoSinhHieu`, `DaChanDoan`. Với Bác sĩ, ca thuộc người đăng nhập được ưu tiên và đánh dấu `LaCaCuaToi`; giao diện mặc định lọc ca của tôi và cho phép bỏ lọc để xem toàn phòng khám.
  - `GET /patient/:idHoSoBenhNhan`: cùng quyền đọc như queue. Trả tất cả trường lâm sàng theo PascalCase, thông tin hành chính đúng `LoaiThongTin`, thông tin lượt khám, `tienSuBenh` và `lichSuKhamTruoc`. Gom cùng cá nhân theo `IdTaiKhoan` + `LoaiThongTin`, thêm `HoTen`/`MoiQuanHe` khi là người thân; lịch sử không chứa lượt hiện tại, lượt đã hủy hoặc lượt chưa có chẩn đoán/kết luận.
  - `PUT /vitals`: dành cho `Y tá`, `Admin`, `Chủ phòng khám`; chỉ ghi khi lịch `Đã xác nhận`/`Đang khám`. Nếu còn `Đã đặt`, trả `409` với `Lịch hẹn chưa được nhân viên xác nhận.` Body dùng `idHoSoBenhNhan` và các trường sinh hiệu/triệu chứng; số phải hữu hạn, không âm và phù hợp kiểu cột, giữ nguyên giá trị `0`. Trường không gửi giữ nguyên; trường gửi `null`/chuỗi rỗng được xóa, nhưng phải có ít nhất một giá trị sinh hiệu/triệu chứng. Trong cùng transaction, khóa lượt khám/hồ sơ, cập nhật `HOSOBENHNHAN` và chuyển `LICHDAT` từ `Đã xác nhận` sang `Đang khám`. Các trạng thái khác trả `409`.
  - `PUT /diagnosis`: dành cho `Bác sĩ`, `Admin`, `Chủ phòng khám`. Body gồm `idHoSoBenhNhan`, `ChuanDoan`, `KetLuan` (bắt buộc, tối đa 255 ký tự mỗi trường). Trong transaction, khóa lượt khám/hồ sơ, cập nhật chẩn đoán/kết luận và `ThoiDiemCapNhat = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'`, chuyển lịch liên kết chưa hủy sang `Hoàn thành`. Cho phép bác sĩ tải lại và hiệu chỉnh kết luận sẵn có; không tác động hồ sơ của các lượt khác. Lượt đã hủy trả `409`; hồ sơ chưa gắn lịch/không tồn tại trả `404` khi lưu.
  - Dữ liệu đọc và `RETURNING` đều có alias PascalCase. Frontend tách API trong `examinationService.ts`, logic trong `useNurseExam.ts`/`useDoctorExam.ts` và các Hook dùng chung. Giao diện có bộ lọc ngày/trạng thái, tìm tên/mã hồ sơ, tự nạp form, cảnh báo bệnh nền tông `amber`; DoctorExam đã nạp/phân tích AI thật qua Services/Hooks, tách ClinicalAIPanel và giữ form chẩn đoán độc lập khi AI lỗi. Trang Bác sĩ được lazy-load để giảm bundle khởi động.
- **Clinic (`/api/clinic`):** `GET /info`, `POST /info`, `GET /services`, `POST /services`, `PUT /services/:id`, `DELETE /services/:id`, `GET /events`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
  - `GET /info`, `GET /services`, `GET /events` public. Các API ghi yêu cầu JWT và vai trò `Chủ phòng khám`/`Admin`. Danh sách public chỉ có dịch vụ `Hiển thị`/`Hoạt động`, sự kiện `Hiển thị`; `?manage=true` yêu cầu cùng quyền quản lý và trả cả nội dung đã ngừng/ẩn để chỉnh sửa.
  - `POST /info` lấy `ChuPhongKham` từ JWT, cập nhật phòng khám hiện tại (bản ghi đầu theo `IdPhongKham`) hoặc tạo `generateId('PK')` nếu chưa có. `GET /info` trả bản ghi đó hoặc `null` khi chưa cấu hình. Việc tạo ban đầu được khóa để tránh hai bản ghi đồng thời.
  - Dịch vụ/sự kiện mặc định lấy phòng khám hiện tại nếu không gửi `IdPhongKham`; mã mới qua `generateId('DV')`/`generateId('SK')`. Sửa bản ghi không tồn tại trả `404`; giá dịch vụ không âm, tối đa 2 chữ số thập phân. Ngừng cung cấp dịch vụ/ẩn sự kiện thay cho xóa cứng để giữ dữ liệu.
  - Hai trường thời gian sự kiện dùng `TIMESTAMP` theo PostgreSQL hiện có (đã sửa mô tả `TIME` cũ ở schema trên, không chạy migration thay đổi DB). API nhận/trả chuỗi ngày giờ `YYYY-MM-DDTHH:mm[:ss]` theo giờ phòng khám, form dùng `datetime-local`; nếu có thời gian, cần đủ bắt đầu/kết thúc và bắt đầu trước kết thúc. Toàn bộ dữ liệu đọc/ghi trả alias PascalCase.
  - Tab thông tin phòng khám dùng form toàn chiều rộng, một cột trên màn hình nhỏ và hai cột từ `md`: tên/SĐT, email/địa chỉ, giờ mở/đóng cửa; giới thiệu chiếm cả hai cột. Nút `Lưu thông tin phòng khám` căn phải. Form tạo/sửa dịch vụ và sự kiện vẫn dùng modal.
  - Trang chủ và trang sự kiện dùng `PublicEventCard` chung: xếp dọc trên mobile, ngang từ `sm`, ảnh bên trái `sm:w-56 h-36`, nội dung flex-1 và nút hành động shrink-0 bên phải. Danh sách quản lý dịch vụ/sự kiện dùng thumbnail `w-28 h-20`, nội dung giữa và cụm Sửa/Xóa bên phải. Hook quản lý phòng khám đọc/ghi `?tab=services`/`?tab=events`; điều hướng cùng pathname vẫn đổi tab ngay, query không hợp lệ về tab thông tin.
  - Dịch vụ/sự kiện đọc/lưu `HinhAnh` trong GET/POST/PUT, URL http/https tối đa 500 ký tự hoặc null. Khi PUT không gửi ảnh, giữ giá trị cũ; null/chuỗi rỗng xóa ảnh. Modal chỉ chọn file từ máy, không có ô dán URL; giữ thumbnail và icon Trash2 cạnh Pencil. Đổi/xóa ảnh cũng dọn file Cloudinary cũ thuộc thư mục danh mục tương ứng. `mediaUrl.js` vẫn được dùng để validate giá trị URL lưu trong DB, không phải tính năng nhập URL trên giao diện.
  - DELETE chỉ dành Chủ phòng khám/Admin, khóa dòng `FOR UPDATE` và xóa trong transaction. Không tồn tại trả `404`; FK `23503` rollback và trả `409` hướng dẫn chuyển `Ngừng cung cấp`/`Ẩn`. SQL DELETE kiểm tra FK trước khi gọi destroy để không xóa ảnh của bản ghi bị chặn. Nếu Cloudinary báo lỗi, rollback thay đổi DB và trả `502`.
- **Users (`/api/users`):** `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, chỉ dành cho `Admin` qua JWT và `requireRoles('Admin')`.
  - Danh sách/kết quả ghi trả PascalCase, `NgaySinh` dạng `YYYY-MM-DD`, tuyệt đối không trả `MatKhau`/hash. Tạo tài khoản bằng `generateId('TK')`, hash bcrypt; kiểm tra 6 vai trò chuẩn và trùng tên đăng nhập/CCCD/SĐT/email (`409`). Tài khoản Bệnh nhân có hồ sơ bản thân được tạo trong cùng transaction qua `ensureSelfProfile`.
  - Cập nhật họ tên, vai trò, `Hoạt động`/`Khóa`, SĐT, email, địa chỉ; chỉ đổi hash mật khẩu khi gửi mật khẩu mới không rỗng. Không cho Admin tự khóa hoặc tự đổi khỏi vai trò `Admin` (`400`). Chuyển một tài khoản sang Bệnh nhân cũng bảo đảm hồ sơ bản thân có sẵn.
  - Xóa tài khoản trong transaction, khóa bản ghi khi kiểm tra. Không tồn tại trả `404`; tự xóa trả `400`: "Không thể tự xóa tài khoản Admin đang đăng nhập." Chỉ dọn hồ sơ bản thân trống của Bệnh nhân chưa phát sinh nghiệp vụ rồi xóa tài khoản. Có lịch, dữ liệu lâm sàng, tiền sử, người thân hoặc ràng buộc nghiệp vụ/FK thì rollback và trả `409`: "Không thể xóa tài khoản đã phát sinh dữ liệu nghiệp vụ liên quan. Vui lòng chuyển trạng thái sang Khóa."
  - Frontend bảo vệ từng workspace bằng `ClinicalAccess` với đúng một vai trò: Bệnh nhân `/patient-appointments`, `/patient-history`; Nhân viên `/staff`; Y tá `/nurse`; Bác sĩ `/doctor`; Admin `/admin/users`; Chủ phòng khám `/owner/clinic`. Header có liên kết công khai và workspace của chính actor; sidebar chỉ có Trang chủ và nhóm chức năng của actor đó. Admin/Chủ phòng khám không kế thừa menu hoặc quyền vào trang của actor khác. Quyền Backend rộng hơn đã đặc tả ở các API vẫn giữ nguyên.
  - Quản lý tài khoản dùng bảng toàn chiều rộng, nút icon thêm/tải lại/sửa/xóa (có nhãn truy cập); không cho tự xóa trên UI. Form tạo/sửa tài khoản, ca làm việc, dịch vụ và sự kiện nằm trong modal có nút X, Escape và quản lý focus; thao tác tải lại dùng RefreshCw quay khi tải. API ở Services, state/nghiệp vụ ở Hooks; giao diện JSX dùng Tailwind CSS v4.
  - Modal tài khoản không có cảnh báo vàng mặc định. Chỉ cảnh báo khi sửa chính tài khoản đang đăng nhập mà chọn trạng thái khác `Hoạt động`/vai trò khác `Admin`, hoặc có lỗi tự tác động từ Backend; chặn lưu thay đổi tự khóa/đổi vai trò tại Hook. Nút tự xóa vẫn bị vô hiệu hóa.
  - GET/POST/PUT tài khoản đọc/lưu `AnhDaiDien`, kiểm tra URL cùng chuẩn với danh mục; bảng/modal có avatar và trường chọn file, không còn nhập URL. Login trả `AnhDaiDien`. Khi Admin lưu ảnh chính mình, đồng bộ session hiện tại. Ảnh do Admin upload luôn thuộc thư viện tài khoản Admin đang đăng nhập, không được giả mạo thư mục tài khoản khác.
- **Upload (`/api/upload`) — đã triển khai:** tất cả endpoint yêu cầu JWT.
  - `POST /?type=avatar`: nhận một field `file`, lưu vào `clinic-ai/avatars/${IdTaiKhoan}` lấy từ user xác thực. Giữ tương thích `folder=avatars` (mặc định); `folder=services/events` trong body/query lưu vào `clinic-ai/services` hoặc `clinic-ai/events`, upload danh mục chỉ dành Chủ phòng khám/Admin.
  - Dùng multer memory storage, tối đa 5MB, chỉ JPEG/PNG/WebP/GIF; kiểm tra MIME và chữ ký file. Thiếu/sai file/folder/type trả `400`, quá dung lượng `413`, sai quyền `403`. Dùng `resource_type: image`, `quality: auto`, `fetch_format: auto`, trả `{ url: secure_url }`.
  - `GET /avatars`: Cloudinary Admin API liệt kê đầy đủ qua phân trang nội bộ theo prefix `clinic-ai/avatars/${IdTaiKhoan}/`, lọc lại đúng prefix, trả `{ images: [{ publicId, url, createdAt }] }`; không nhận tài khoản khác từ client, response no-store.
  - `DELETE /`: body `{ url }` hoặc `{ publicId }`. Helper `cloudinaryMedia.js` tách public_id từ URL image/upload có hoặc không có version, kiểm tra đúng host/cloud và ID hợp lệ. Chỉ cho xóa avatar trong prefix tài khoản hiện tại (có ranh giới `/`); Nhân viên/Admin/Chủ phòng khám được xóa ảnh trong prefix services/events. Sai ID/URL trả `400`, vượt quyền `403`. Gọi destroy với invalidate cache, `not found` được coi là đã xóa; đồng thời xóa tham chiếu DB trùng public_id trong phạm vi được phép.
  - `cloudinaryService.js` chứa upload/list/destroy và cleanup dùng chung. Cấu hình ở `backend/.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; chưa đủ trả `503`, nhà cung cấp lỗi trả `502`. Không log/commit secret, không có phương án dán URL trên UI.
  - Ảnh dữ liệu cũ nằm ngoài Cloudinary hoặc ngoài thư mục được cấp phép chỉ được gỡ tham chiếu, không suy đoán quyền xóa file. PostgreSQL và Cloudinary không có transaction phân tán: DB rollback khi Cloudinary thất bại, nhưng không thể khôi phục file đã destroy nếu COMMIT DB thất bại sau đó.
  - Frontend tách Services/Hooks/Utils/Components; `ImageUploadField` dùng chung chỉ chọn file, preview và xóa file, khóa lưu khi đang xử lý. Không lưu binary trong DB, không tạo CSS riêng; crop dùng Tailwind v4 và tọa độ động cho pan/zoom.
- **Notifications (`/api/notifications`) — đã triển khai:** `GET /` yêu cầu `verifyToken`, tài khoản/vai trò lấy từ JWT đã đối chiếu DB; không nhận bộ lọc tài khoản từ client. Trả `{ notifications: [{ id, title, message, type, category, link, timestamp }] }`, tối đa 20 phần tử; `type` là `info`/`warning`/`success`. Không tạo bảng mới, không ghi dữ liệu nghiệp vụ. Response không cache.
  - Bệnh nhân: chỉ lịch do tài khoản đặt với trạng thái `Đã xác nhận`, `Đang khám`, `Hoàn thành` có kết luận hoặc `Đã hủy`; nhắc lịch đã xác nhận hôm nay/ngày mai theo giờ Việt Nam; sự kiện `Hiển thị`. Link tới lịch cá nhân, lịch sử hoặc sự kiện.
  - Nhân viên: lịch `Đã đặt` chờ duyệt (tên bệnh nhân, ngày/giờ, bác sĩ), lịch hủy được cập nhật trong 7 ngày gần nhất và ca làm việc hôm nay; link `/staff`. Y tá: lịch hôm nay đã xác nhận chưa có sinh hiệu hoặc đang khám; link `/nurse`.
  - Bác sĩ: chỉ ca của chính bác sĩ hôm nay, trạng thái đã xác nhận/đang khám. Ưu tiên cảnh báo đã đo sinh hiệu hoặc có tiền sử bệnh; tìm tiền sử cùng cá nhân qua chủ tài khoản/loại hồ sơ và tên/quan hệ nếu là người thân; link `/doctor`.
  - Admin: chỉ có 8 tài khoản cập nhật gần nhất và tổng số tài khoản khóa, link `/admin/users`; vẫn không truy vấn/trả thông báo sự kiện. Chủ phòng khám: tổng lượt hôm nay link `/owner/clinic`, dịch vụ link `/owner/clinic?tab=services`, sự kiện link `/owner/clinic?tab=events`; Bệnh nhân nhận sự kiện link `/su-kien`. Các link lịch cá nhân/lâm sàng/Nhân viên giữ đúng workspace tương ứng.
  - Ưu tiên cảnh báo và tổng hợp trước, sau đó timestamp cập nhật giảm dần. Bệnh nhân/Nhân viên lấy tối đa 15 lịch để dành chỗ cho sự kiện/ca làm việc. ID thông báo gắn timestamp phiên bản để nội dung được chỉnh sửa có thể trở thành chưa đọc dù trạng thái không đổi.
  - Mọi `timestamp` là ISO 8601 chuẩn UTC (`Z`) từ thời điểm cập nhật thực; không suy ra từ mã ID, không dùng giờ bắt đầu khám/sự kiện hay mốc cứng 00:00/08:00. Lượt khám lấy GREATEST của lịch đặt, ca làm việc và hồ sơ; danh mục/ca/tài khoản lấy cột cập nhật; tổng số tài khoản khóa lấy MAX timestamp; tổng hợp hoạt động lấy lần cập nhật lịch/ca gần nhất hoặc thời điểm quan sát khi chưa có lượt.
  - Cột ThoiDiemCapNhat nullable TIMESTAMP đã có sẵn trên 5 bảng DICHVU/SUKIEN/LICHDAT/LICHLAMVIEC/TAIKHOAN. Các SQL INSERT/UPDATE gán trực tiếp `NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'`, kể cả xóa tham chiếu ảnh và chuyển trạng thái lâm sàng. Không còn service sửa schema runtime; không phụ thuộc trigger để ghi timestamp. Trigger cũ nếu có trong DB chính không bị ứng dụng tạo/xóa. HOSOBENHNHAN chỉ cập nhật cột sẵn có khi lưu sinh hiệu/chẩn đoán; đổi chi tiết lịch chạm timestamp LICHDAT trong cùng transaction.
  - Dữ liệu cũ thiếu timestamp được ghi nhận mốc chuyển đổi một lần; đây không phải thời điểm tạo/cập nhật lịch sử được khôi phục. DB vẫn chỉ lưu trạng thái mới nhất, không phải audit log toàn bộ thông báo. Thông báo hủy gần đây được lọc theo thời điểm hủy/cập nhật thực, không phải ngày khám.
  - Frontend tách Services/Hooks/Utils/Components. Chuông giữ vị trí Header/Sidebar, badge chưa đọc, đóng khi click ngoài/Escape. `formatRelativeTime` hiển thị `Vừa xong`, số phút/giờ, `Hôm qua`, số ngày trước và `HH:mm · DD/MM/YYYY` theo giờ Việt Nam; nhãn tự cập nhật mỗi 30 giây khi mở. Click item đánh dấu đọc, đóng popover, navigate đầy đủ pathname + query; có nút đánh dấu tất cả.
  - Header phân cách ba tab công khai với workspace bằng vạch dọc; nút workspace có icon vai trò, viền/nền teal riêng và trạng thái active teal đậm. Bệnh nhân dùng nhãn `Đặt lịch khám`; mỗi actor vẫn chỉ thấy workspace của mình.
  - Tải khi đăng nhập, mỗi 45 giây, đổi route/query, mở chuông và sau POST/PUT/PATCH/DELETE thành công qua Axios. Event `notifications-changed` debounce 150ms; nếu đang tải thì xếp lượt tải tiếp để không bỏ sót dữ liệu mới, hủy request khi rời trang/đổi tài khoản. ID đã đọc lưu riêng theo tài khoản trong localStorage (tối đa 1.000), không đồng bộ thiết bị khác. Không dùng WebSocket/SSE; lỗi tải hiển thị trong popover và tự thử lại.
- **AI (`/api/ai`) — đã triển khai:** toàn bộ router yêu cầu verifyToken. GET results dành Bác sĩ/Y tá/Admin/Chủ phòng khám; POST results/analyze chỉ Bác sĩ/Admin/Chủ phòng khám. Sai vai trò 403, thiếu/sai JWT 401.
  - `GET /results?idChiTietLD=...`: CT + 11 ký tự chữ/số, trả 400 nếu sai mã, 404 nếu không có lượt; kết quả PascalCase (`IdAIKetQua`, `IdChiTietLD`, `LoaiKetQua`, `NoiDung`, `ThoiDiemTao`), mảng rỗng nếu chưa phân tích. Response no-store.
  - `POST /results`: body `{ IdChiTietLD, LoaiKetQua, NoiDung }`, chỉ nhận TOMTAT/PHANTICH/CANHBAO, nội dung không rỗng tối đa 500.000 ký tự; mã mới qua generateId('AI'), thời điểm lưu theo giờ Việt Nam; lượt đã hủy trả 409. Trả 201 `{ message, aiResult }`.
  - `POST /analyze`: body `{ idHoSoBenhNhan }` chuẩn HS + 11 ký tự chữ/số. Backend gọi examinationService, không nhận hồ sơ/tiền sử tùy ý từ client. Không có hồ sơ 404; chưa gắn lượt hoặc đã hủy 409. Payload gồm IdChiTietLD, IdHoSoBenhNhan, BenhNhan, SinhHieu, LamSang, tienSuBenh và lichSuKhamTruoc; số NUMERIC từ pg được đổi thành JSON number. Không gửi chẩn đoán hiện tại vào dữ liệu đầu vào AI.
  - Gọi FastAPI qua HTTP trước khi mở transaction; timeout Backend mặc định 25s (`AI_SERVICE_TIMEOUT_MS`), URL `AI_SERVICE_URL` mặc định localhost:8000, giới hạn response 2MB. Lỗi mạng/timeout/JSON hoặc hợp đồng thiếu/sai ba loại trả 502: "Dịch vụ phân tích AI hiện không khả dụng. Vui lòng thử lại sau." Kết quả cũ được giữ nguyên.
  - Sau khi nhận hợp đồng hợp lệ, khóa lượt/lịch/hồ sơ/ca, kiểm tra lại trạng thái và snapshot dữ liệu; thay đổi trong lúc phân tích trả 409. Dùng cùng transaction client để đọc lại, tránh cạn Pool do lấy thêm kết nối khi đang giữ khóa. Xóa kết quả AI cũ của chính lượt này và chèn đúng 3 dòng trong cùng BEGIN/COMMIT; lỗi insert rollback khôi phục bộ cũ. Không thay đổi sinh hiệu, chẩn đoán, kết luận hoặc lịch khám.
  - Trả `{ IdChiTietLD, nhanThamKhao, canhBaoSinhHieu, metadata, results }`. Metadata gồm ruleEngineVersion 1.0, llmUsed, model; results là ba dòng đã lưu PascalCase. Cảnh báo có chiSo/giaTri/mucDo (Lưu ý/Cảnh báo)/moTa. Cảnh báo có cấu trúc và metadata chỉ có trong response phân tích; GET chỉ phục hồi ba nội dung đã lưu, không giả định lại model từ lịch sử.
  - Schema chuẩn là AIKETQUA.NoiDung TEXT. Môi trường cũ đã phát hiện VARCHAR(255): migration thủ công `backend/migrations/20261120_ai_result_content.sql` mở rộng TEXT giữ nguyên dữ liệu; không được cắt ngắn nội dung y khoa để vừa 255 và không chạy migration từ server/request.
  - DoctorExam tự nạp kết quả cũ khi chọn bệnh nhân, dùng selectionVersion/aiRequest chống phản hồi của bệnh nhân cũ ghi lên bệnh nhân mới; đóng hồ sơ reset toàn bộ state AI. Nút phân tích khóa khi chưa chọn/đang tải/đang phân tích/lượt hủy. Lỗi amber không chặn lưu chẩn đoán. Hiển thị cảnh báo định lượng và TOMTAT → PHANTICH → CANHBAO, luôn có nhãn tham khảo; cột AI 340px ở 2xl.

### 6.1. Hợp đồng FastAPI nội bộ (`ai-service`, cổng 8000)

- GET `/health` → `{ "status": "ok", "service": "clinic-ai-service" }`.
- POST `/analyze` nhận JSON PascalCase và hai mảng camelCase: `IdChiTietLD`, `IdHoSoBenhNhan`; `BenhNhan` (TenBenhNhan/GioiTinh/NgaySinh); `SinhHieu` (NhietDo/HuyetApTamThu/HuyetApTamTruong/NhipTim/NhipTho/CanNang/ChieuCao); `LamSang` (LiDoKham/TrieuChung/ThoiDiemKhoiPhat/MucDo/GhiChu); `tienSuBenh` và `lichSuKhamTruoc` theo DTO Backend. Dữ liệu thiếu giữ null/"Chưa ghi nhận", không chuyển số 0 thành null. Pydantic v2 từ chối ID sai, số âm/không hữu hạn, bool giả số nguyên và trường lạ (422). Mỗi mảng tối đa 100 dòng, chuỗi mô tả tối đa 255 theo giới hạn cột DB; request quá hợp đồng trả 422, Backend không ghi kết quả.
- Rule engine 1.0 là ngưỡng sàng lọc tham khảo theo yêu cầu đồ án ở người lớn, chưa phải quy trình điều trị được xác thực: nhiệt độ <35,5; 37,5–<38; ≥38; huyết áp tâm thu ≥140 HOẶC tâm trương ≥90, hoặc tâm thu <90 HOẶC tâm trương <60; nhịp tim <60/>100; nhịp thở <12/>20; BMI = kg/(cm/100)², lưu ý <18,5 hoặc ≥25. Cần xác minh phép đo và bối cảnh, không chẩn đoán tăng huyết áp từ một lần đo; nhắc bác sĩ đánh giá thuốc tê có chất co mạch, không đưa liều/đơn thuốc. Không tính BMI khi dữ liệu không hợp lệ; luôn cảnh báo giới hạn tuổi/trẻ em/thai kỳ.
- Cấu hình dotenv: AI_PROVIDER=gemini (hoặc openai/openai-compatible), AI_API_KEY, AI_BASE_URL, AI_MODEL, AI_TIMEOUT_SECONDS (20 mặc định). Gemini generateContent dùng key trong header, responseMimeType application/json; adapter tương thích OpenAI dùng chat/completions. Temperature 0,15; timeout toàn bộ lượt HTTP, không tự retry gây trùng chi phí.
- Chống bịa dữ liệu: prompt coi dữ liệu là nội dung không tin cậy; không gửi tên/ngày sinh định danh tới LLM. Rule engine tạo các khối nguồn từ dữ liệu thực; LLM chỉ sắp xếp lại nguyên văn các dòng trong từng khối. So sánh đầy đủ các dòng để chặn thêm thuốc/bệnh/xét nghiệm hoặc bỏ cảnh báo; không khớp thì fallback. Vì vậy đây là tổng hợp có kiểm soát, không phải sinh chẩn đoán tự do.
- Thiếu key, provider lỗi, timeout hoặc parse/grounding không hợp lệ trả HTTP 200 cùng ba khối tổng hợp xác định, cảnh báo định lượng và llmUsed=false/model=null. Luôn có nhãn: "Nội dung do AI tổng hợp chỉ mang tính chất tham khảo hỗ trợ lâm sàng, không thay thế chẩn đoán và quyết định điều trị của bác sĩ."
- FastAPI không có driver/credentials PostgreSQL; mặc định uvicorn bind localhost. Chỉ Backend có JWT/role guard và truy cập DB. Khi triển khai qua mạng phải giữ AI Service trong mạng nội bộ được kiểm soát. Không log khóa hoặc toàn bộ hồ sơ. Tests chỉ dùng dữ liệu giả lập/mocks, không gọi provider thật.

---

## 7. Nguyên tắc AI, Bảo mật & Kiểm thử

- **AI Safety:** Kết quả AI phải gắn nhãn rõ ràng là nội dung hỗ trợ tham khảo; AI không bịa dữ liệu bệnh nhân; kết hợp rule-based threshold (ngưỡng sinh hiệu bất thường) và LLM phân tích; AI lỗi không làm mất dữ liệu lâm sàng bác sĩ/y tá đã nhập.
- **Security:** Mật khẩu hash bằng `bcrypt`; secrets/API key lưu qua `.env` (không commit lên Git); kiểm tra xác thực và phân quyền theo `VaiTro` ở Backend.
- **Testing:** Kiểm thử đủ các luồng Use Case, đặc biệt case **1 bệnh nhân khám nhiều lần** đảm bảo không ghi đè chẩn đoán cũ, và đánh giá AI bằng bộ dữ liệu giả lập (synthetic data) theo các tiêu chí Factuality, Consistency, Evidence grounding.
