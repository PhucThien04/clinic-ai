# Clinic AI — Đặc tả Kỹ thuật & Nghiệp vụ Dự án (Single Source of Truth)

**Phiên bản:** 2.4 (Thông báo theo vai trò và tinh chỉnh UX quản lý)

**Cập nhật:** 19/11/2026

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
Node.js / Express Backend trên host ── HTTP ── Python / FastAPI (dự kiến)
       │                                           │
       ▼                                           ▼
PostgreSQL 15 trong Docker                   External AI API (dự kiến)
```

- **Frontend:** React 19, TypeScript, Vite 8, React Router, Axios, Lucide React và **Tailwind CSS v4**. `@tailwindcss/vite` được đăng ký trong `frontend/vite.config.ts`; entry CSS là `frontend/src/index.css` với `@import "tailwindcss";`.
- **Backend:** Node.js, Express 5, `pg`, JWT (`jsonwebtoken`), bcrypt, dotenv và nodemon. Backend xử lý nghiệp vụ, kiểm tra quyền và truy cập PostgreSQL qua `backend/src/config/db.js`.
- **AI Service dự kiến:** Python/FastAPI, giao tiếp External AI Provider; **tuyệt đối không** truy cập trực tiếp PostgreSQL. `ai-service/` hiện rỗng, chưa có mã FastAPI, `requirements.txt` hoặc luồng gọi External AI API. Các chức năng AI trong đặc tả là yêu cầu đích, không đồng nghĩa đã triển khai xong.
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
├── ai-service/               # Đang rỗng; dành cho Python/FastAPI dự kiến
├── backend/
│   ├── src/
│   │   ├── config/           # db.js: PostgreSQL Pool qua pg
│   │   ├── controllers/      # Controller REST API; hiện còn chứa SQL
│   │   ├── middlewares/     # JWT và quyền sở hữu dữ liệu
│   │   ├── routes/          # Đăng ký endpoint Express
│   │   ├── services/        # Nghiệp vụ dùng chung, tạo hồ sơ bản thân
│   │   ├── utils/           # Sinh ID CHAR(13)
│   │   └── server.js        # Entry point Backend
│   ├── tests/               # Test cục bộ, được .gitignore bỏ qua
│   ├── .env.example         # Mẫu cấu hình Backend có nội dung
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/              # Tài nguyên tĩnh
│   ├── src/
│   │   ├── assets/
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

Không có `.ai-workflow/`, `database/` hoặc `docs/` trong workspace. `ai-service/` đang rỗng, có thể không xuất hiện khi clone vì Git không lưu thư mục rỗng. `.env.example` tại gốc hiện rỗng; mẫu cấu hình Backend có nội dung là `backend/.env.example`. Các thư mục `tests/` giữ cục bộ, được `.gitignore` bỏ qua và không còn trong Git tracking; clone mới không có bộ test. Đây là chính sách lưu trữ, không thay đổi yêu cầu kiểm thử nghiệp vụ.

### 4.4. Khởi tạo môi trường Development

1. Chuẩn bị Node.js **22.14+**, npm và Docker Desktop với Linux containers. Vite đang cài đặt chấp nhận Node.js `^20.19.0 || >=22.12.0`; mốc 22.14+ cũng đáp ứng utility test. Python chỉ cần khi bắt đầu triển khai FastAPI.
2. Kiểm tra container PostgreSQL bằng `docker ps -a`; nếu container `datn` đã có nhưng dừng, dùng `docker start datn`. Kiểm tra sẵn sàng bằng `docker exec datn pg_isready -U postgres -d clinic_duc_tin`. Hướng dẫn tạo container PostgreSQL 15 mới và volume riêng nằm trong [README, mục 4.1](./README.md#41-postgresql-qua-docker).
3. Container mới chỉ tạo database rỗng, không tự tạo 11 bảng. Repo hiện chưa có SQL bootstrap, migration hoặc seed. Giữ schema đang có trên môi trường hiện tại; với môi trường mới, nhập SQL schema/dump đã chuẩn bị theo mục 5 bên dưới bằng `psql` trong container. Không hướng dẫn chạy script từ thư mục `database/` không tồn tại.
4. Nếu chưa có `backend/.env`, sao chép `backend/.env.example` vào đó rồi điền `PORT`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`. Mặc định database `clinic_duc_tin`; mật khẩu phải khớp cấu hình PostgreSQL. Chạy Backend từ `backend/` để dotenv đọc đúng tệp. Nếu sau này Backend chạy trong Docker, dùng tên dịch vụ/container DB trên cùng network làm `DB_HOST`.
5. Tại `backend/`, chạy `npm ci` rồi `npm run dev` (Express `http://localhost:5000`). Tại terminal khác trong `frontend/`, chạy `npm ci` rồi `npm run dev` (Vite thường `http://localhost:5173`). Axios hiện dùng `http://localhost:5000/api`.
6. Chưa có lệnh khởi động AI Service có thể thực thi trong repo. Chỉ thêm hướng dẫn pip/uvicorn sau khi có dependency và entry point FastAPI thật. Trên PowerShell chặn `npm.ps1`, dùng `npm.cmd`.

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
| **DICHVU** | `IdDichVu` | `CHAR(13)` | `PK, NOT NULL` | Mã dịch vụ (`DV...`) |
| | `IdPhongKham` | `CHAR(13)` | `FK -> PHONGKHAM, NOT NULL` | Mã phòng khám |
| | `TenDichVu` | `VARCHAR(255)` | `NOT NULL` | Tên dịch vụ nha khoa |
| | `MoTa` | `VARCHAR(255)` | `NULL` | Mô tả dịch vụ |
| | `Gia` | `DECIMAL(18,2)` | `NOT NULL` | Đơn giá dịch vụ (VNĐ) |
| | `TrangThai` | `VARCHAR(50)` | `NOT NULL` | `Hiển thị`, `Hoạt động`, `Ngừng cung cấp` |
| **LICHLAMVIEC** | `IdLichLamViec` | `CHAR(13)` | `PK, NOT NULL` | Mã ca làm việc (`LLV...`) |
| | `IdBacSi` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Mã bác sĩ phụ trách |
| | `IdPhongKham` | `CHAR(13)` | `FK -> PHONGKHAM, NOT NULL` | Mã phòng khám |
| | `NgayLamViec` | `DATE` | `NOT NULL` | Ngày làm việc |
| | `GioBatDau` | `TIME` | `NOT NULL` | Giờ bắt đầu ca |
| | `GioKetThuc` | `TIME` | `NOT NULL` | Giờ kết thúc ca |
| | `TrangThai` | `VARCHAR(30)` | `NOT NULL` | `Hoạt động`, `Tạm ngưng` |
| | `GhiChu` | `VARCHAR(255)` | `NULL` | Ghi chú ca khám |
| | `NguoiCapNhat` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Người tạo/cập nhật lịch |
| **LICHDAT** | `IdLichDat` | `CHAR(13)` | `PK, NOT NULL` | Mã lịch đặt (`LD...`) |
| | `IdTaiKhoan` | `CHAR(13)` | `FK -> TAIKHOAN, NOT NULL` | Tài khoản đặt lịch |
| | `TrangThai` | `VARCHAR(30)` | `NOT NULL` | `Đã đặt`, `Đã xác nhận`, `Đang khám`, `Hoàn thành`, `Đã hủy` |
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
| | `ThoiDiemCapNhat` | `TIMESTAMP` | `NULL` | Thời điểm bác sĩ cập nhật chẩn đoán |
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

Các endpoint quản lý ca, duyệt lịch, tài khoản, thông tin phòng khám, dịch vụ và sự kiện bên dưới đã được đăng ký trong mã nguồn. `POST /api/ai/analyze` vẫn là **endpoint dự kiến**; AI hiện chỉ có API lưu/đọc kết quả tại Backend.

- **Auth (`/api/auth`):** `POST /register`, `POST /login`
  - Đăng ký công khai luôn tạo vai trò `Bệnh nhân`, bỏ qua `VaiTro` do client gửi. Tài khoản và hồ sơ bản thân (`LoaiThongTin = 0`) được tạo trong cùng transaction.
  - Đăng nhập chặn tài khoản không ở trạng thái `Hoạt động` (`403`). Bệnh nhân cũ chưa có hồ sơ bản thân được tự tạo hồ sơ trước khi nhận token; khóa dòng tài khoản tránh tạo trùng khi đăng nhập đồng thời.
  - `verifyToken` đọc lại vai trò/trạng thái từ DB sau khi kiểm tra JWT để thao tác khóa/đổi vai trò có hiệu lực với token đã cấp. Tài khoản bị khóa/không tồn tại trả `403`; DB không khả dụng khi xác thực trả `503`.
- **Profile (`/api/profile`):** `GET /`, `PUT /` (đường dẫn hiện tại; tài khoản lấy từ JWT, không có tham số `:idTaiKhoan`)
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
  - Tất cả endpoint yêu cầu JWT. Các endpoint Bệnh nhân giới hạn quyền sở hữu theo tài khoản trong token; không nhận tài khoản khác từ request. `GET /all` chỉ trả các `IdLichLamViec` đã kín chỗ, không trả ID lịch đặt, tài khoản hoặc hồ sơ của người khác.
  - `GET /manage` và `PUT /:id/status` yêu cầu vai trò `Nhân viên`, `Admin`, `Chủ phòng khám`, đặt trước Middleware `scopeAccount` để được quản lý lịch toàn phòng khám. `GET /manage` nhận tùy chọn `date=YYYY-MM-DD`, `status`, trả đủ thông tin lượt khám, bệnh nhân/người thân, người đặt, lịch/giờ/bác sĩ/phòng khám, lý do/ghi chú/trạng thái theo PascalCase.
  - Tab duyệt lịch của Nhân viên mặc định không lọc ngày, nhãn `Ngày khám` và nút `Tất cả ngày` khi đang chọn ngày. API và Frontend ưu tiên lịch `Đã đặt`, sau đó ngày/giờ khám tăng dần để không bỏ sót lịch chờ xác nhận ở ngày khác.
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
  - `PUT /diagnosis`: dành cho `Bác sĩ`, `Admin`, `Chủ phòng khám`. Body gồm `idHoSoBenhNhan`, `ChuanDoan`, `KetLuan` (bắt buộc, tối đa 255 ký tự mỗi trường). Trong transaction, khóa lượt khám/hồ sơ, cập nhật chẩn đoán/kết luận và `ThoiDiemCapNhat = NOW()`, chuyển lịch liên kết chưa hủy sang `Hoàn thành`. Cho phép bác sĩ tải lại và hiệu chỉnh kết luận sẵn có; không tác động hồ sơ của các lượt khác. Lượt đã hủy trả `409`; hồ sơ chưa gắn lịch/không tồn tại trả `404` khi lưu.
  - Dữ liệu đọc và `RETURNING` đều có alias PascalCase. Frontend tách API trong `examinationService.ts`, logic trong `useNurseExam.ts`/`useDoctorExam.ts` và các Hook dùng chung. Giao diện có bộ lọc ngày/trạng thái, tìm tên/mã hồ sơ, tự nạp form, cảnh báo bệnh nền tông `amber`; khung Phân Tích AI chỉ là placeholder, chưa gọi AI Service.
- **Clinic (`/api/clinic`):** `GET /info`, `POST /info`, `GET /services`, `POST /services`, `PUT /services/:id`, `GET /events`, `POST /events`, `PUT /events/:id`
  - `GET /info`, `GET /services`, `GET /events` public. Các API ghi yêu cầu JWT và vai trò `Chủ phòng khám`/`Admin`. Danh sách public chỉ có dịch vụ `Hiển thị`/`Hoạt động`, sự kiện `Hiển thị`; `?manage=true` yêu cầu cùng quyền quản lý và trả cả nội dung đã ngừng/ẩn để chỉnh sửa.
  - `POST /info` lấy `ChuPhongKham` từ JWT, cập nhật phòng khám hiện tại (bản ghi đầu theo `IdPhongKham`) hoặc tạo `generateId('PK')` nếu chưa có. `GET /info` trả bản ghi đó hoặc `null` khi chưa cấu hình. Việc tạo ban đầu được khóa để tránh hai bản ghi đồng thời.
  - Dịch vụ/sự kiện mặc định lấy phòng khám hiện tại nếu không gửi `IdPhongKham`; mã mới qua `generateId('DV')`/`generateId('SK')`. Sửa bản ghi không tồn tại trả `404`; giá dịch vụ không âm, tối đa 2 chữ số thập phân. Ngừng cung cấp dịch vụ/ẩn sự kiện thay cho xóa cứng để giữ dữ liệu.
  - Hai trường thời gian sự kiện dùng `TIMESTAMP` theo PostgreSQL hiện có (đã sửa mô tả `TIME` cũ ở schema trên, không chạy migration thay đổi DB). API nhận/trả chuỗi ngày giờ `YYYY-MM-DDTHH:mm[:ss]` theo giờ phòng khám, form dùng `datetime-local`; nếu có thời gian, cần đủ bắt đầu/kết thúc và bắt đầu trước kết thúc. Toàn bộ dữ liệu đọc/ghi trả alias PascalCase.
- **Users (`/api/users`):** `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, chỉ dành cho `Admin` qua JWT và `requireRoles('Admin')`.
  - Danh sách/kết quả ghi trả PascalCase, `NgaySinh` dạng `YYYY-MM-DD`, tuyệt đối không trả `MatKhau`/hash. Tạo tài khoản bằng `generateId('TK')`, hash bcrypt; kiểm tra 6 vai trò chuẩn và trùng tên đăng nhập/CCCD/SĐT/email (`409`). Tài khoản Bệnh nhân có hồ sơ bản thân được tạo trong cùng transaction qua `ensureSelfProfile`.
  - Cập nhật họ tên, vai trò, `Hoạt động`/`Khóa`, SĐT, email, địa chỉ; chỉ đổi hash mật khẩu khi gửi mật khẩu mới không rỗng. Không cho Admin tự khóa hoặc tự đổi khỏi vai trò `Admin` (`400`). Chuyển một tài khoản sang Bệnh nhân cũng bảo đảm hồ sơ bản thân có sẵn.
  - Xóa tài khoản trong transaction, khóa bản ghi khi kiểm tra. Không tồn tại trả `404`; tự xóa trả `400`: "Không thể tự xóa tài khoản Admin đang đăng nhập." Chỉ dọn hồ sơ bản thân trống của Bệnh nhân chưa phát sinh nghiệp vụ rồi xóa tài khoản. Có lịch, dữ liệu lâm sàng, tiền sử, người thân hoặc ràng buộc nghiệp vụ/FK thì rollback và trả `409`: "Không thể xóa tài khoản đã phát sinh dữ liệu nghiệp vụ liên quan. Vui lòng chuyển trạng thái sang Khóa."
  - Frontend bảo vệ từng workspace bằng `ClinicalAccess` với đúng một vai trò: Bệnh nhân `/patient-appointments`, `/patient-history`; Nhân viên `/staff`; Y tá `/nurse`; Bác sĩ `/doctor`; Admin `/admin/users`; Chủ phòng khám `/owner/clinic`. Header có liên kết công khai và workspace của chính actor; sidebar chỉ có Trang chủ và nhóm chức năng của actor đó. Admin/Chủ phòng khám không kế thừa menu hoặc quyền vào trang của actor khác. Quyền Backend rộng hơn đã đặc tả ở các API vẫn giữ nguyên.
  - Quản lý tài khoản dùng bảng toàn chiều rộng, nút icon thêm/tải lại/sửa/xóa (có nhãn truy cập); không cho tự xóa trên UI. Form tạo/sửa tài khoản, ca làm việc, dịch vụ và sự kiện nằm trong modal có nút X, Escape và quản lý focus; thao tác tải lại dùng RefreshCw quay khi tải. API ở Services, state/nghiệp vụ ở Hooks; giao diện JSX dùng Tailwind CSS v4.
  - Modal tài khoản không có cảnh báo vàng mặc định. Chỉ cảnh báo khi sửa chính tài khoản đang đăng nhập mà chọn trạng thái khác `Hoạt động`/vai trò khác `Admin`, hoặc có lỗi tự tác động từ Backend; chặn lưu thay đổi tự khóa/đổi vai trò tại Hook. Nút tự xóa vẫn bị vô hiệu hóa.
- **Notifications (`/api/notifications`) — đã triển khai:** `GET /` yêu cầu `verifyToken`, tài khoản/vai trò lấy từ JWT đã đối chiếu DB; không nhận bộ lọc tài khoản từ client. Trả `{ notifications: [{ id, title, message, type, category, link, timestamp }] }`, tối đa 20 phần tử; `type` là `info`/`warning`/`success`. Không tạo bảng mới, không ghi dữ liệu nghiệp vụ. Response không cache.
  - Bệnh nhân: chỉ lịch do tài khoản đặt với trạng thái `Đã xác nhận`, `Đang khám`, `Hoàn thành` có kết luận hoặc `Đã hủy`; nhắc lịch đã xác nhận hôm nay/ngày mai theo giờ Việt Nam; sự kiện `Hiển thị`. Link tới lịch cá nhân, lịch sử hoặc sự kiện.
  - Nhân viên: lịch `Đã đặt` chờ duyệt (tên bệnh nhân, ngày/giờ, bác sĩ), lịch hủy có ngày khám từ 7 ngày trước tới ngày mai và ca làm việc hôm nay; link `/staff`. Y tá: lịch hôm nay đã xác nhận chưa có sinh hiệu hoặc đang khám; link `/nurse`.
  - Bác sĩ: chỉ ca của chính bác sĩ hôm nay, trạng thái đã xác nhận/đang khám. Ưu tiên cảnh báo đã đo sinh hiệu hoặc có tiền sử bệnh; tìm tiền sử cùng cá nhân qua chủ tài khoản/loại hồ sơ và tên/quan hệ nếu là người thân; link `/doctor`.
  - Admin: 8 tài khoản gần nhất theo mã `TK` giảm dần, tổng số tài khoản khóa và 5 sự kiện `Hiển thị` mới nhất theo mã; link quản lý tài khoản/sự kiện. Chủ phòng khám: tổng lượt hôm nay theo 4 trạng thái chờ duyệt/xác nhận/đang khám/hoàn thành, 5 dịch vụ gần nhất và 5 sự kiện `Hiển thị`; link `/owner/clinic`.
  - Ưu tiên cảnh báo và tổng hợp trước; lịch ưu tiên chờ duyệt/đang khám rồi ngày khám gần hôm nay, giờ khám; các danh mục dùng mã giảm dần. Bệnh nhân/Nhân viên lấy tối đa 15 lịch để dành chỗ cho sự kiện/ca làm việc. Không coi mã có phần ngẫu nhiên là thứ tự tạo chính xác trong cùng ngày.
  - Giới hạn schema hiện có: chưa lưu thời điểm đăng ký/đổi trạng thái/đăng sự kiện. `timestamp` là ISO có `+07:00` của giờ khám hoặc thời gian bắt đầu sự kiện nếu có; các thông báo không có thời gian đáng tin cậy trả `null`. "Gần đây" của lịch hủy dựa trên ngày khám, không phải ngày hủy. Đây là danh sách suy ra từ trạng thái hiện tại, không phải lịch sử sự kiện được lưu bền vững.
  - Frontend tách `notificationService.ts`, `useNotifications.ts`, `NotificationBell.tsx`. Chuông cạnh khu vực tài khoản trên Header/Sidebar cho cả 6 vai trò, badge chưa đọc, popover xuống dưới trên Header và lên trên/sang phải trên Sidebar; đóng khi click ngoài hoặc Escape. Click thông báo đánh dấu đọc và điều hướng, có nút `Đánh dấu đã đọc tất cả`.
  - Tải khi đăng nhập, mỗi 45 giây và khi đổi route; hủy request khi rời trang/đổi tài khoản để tránh ghi nhầm kết quả. ID đã đọc lưu riêng theo `IdTaiKhoan` trong `localStorage` (tối đa 1.000 ID), cập nhật giữa các tab; không đồng bộ sang thiết bị khác. Lỗi tải được thông báo trong popover và tự thử lại, không làm hỏng workspace.
- **AI (`/api/ai`):** `GET /results?idChiTietLD=...`, `POST /results`, `POST /analyze` (gọi sang FastAPI AI Service)

---

## 7. Nguyên tắc AI, Bảo mật & Kiểm thử

- **AI Safety:** Kết quả AI phải gắn nhãn rõ ràng là nội dung hỗ trợ tham khảo; AI không bịa dữ liệu bệnh nhân; kết hợp rule-based threshold (ngưỡng sinh hiệu bất thường) và LLM phân tích; AI lỗi không làm mất dữ liệu lâm sàng bác sĩ/y tá đã nhập.
- **Security:** Mật khẩu hash bằng `bcrypt`; secrets/API key lưu qua `.env` (không commit lên Git); kiểm tra xác thực và phân quyền theo `VaiTro` ở Backend.
- **Testing:** Kiểm thử đủ các luồng Use Case, đặc biệt case **1 bệnh nhân khám nhiều lần** đảm bảo không ghi đè chẩn đoán cũ, và đánh giá AI bằng bộ dữ liệu giả lập (synthetic data) theo các tiêu chí Factuality, Consistency, Evidence grounding.
