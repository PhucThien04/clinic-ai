# Clinic AI — Đặc tả Kỹ thuật & Nghiệp vụ Dự án (Single Source of Truth)

**Phiên bản:** 2.1 (Tailwind CSS Baseline)  
**Cập nhật:** 16/11/2026  
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
React Frontend (TypeScript + React Router + Axios + Tailwind CSS)
       │ REST API (JSON + JWT)
       ▼
Node.js / Express Backend ───── HTTP ───── Python / FastAPI AI Service
       │                                           │
       ▼                                           ▼
  PostgreSQL                                External AI API
```

- **Frontend:** React, TypeScript, React Router, Axios, Lucide React, Tailwind CSS.
- **Backend:** Node.js, Express.js (trung tâm xử lý nghiệp vụ, xác thực JWT, kiểm tra quyền truy cập, chuẩn hóa dữ liệu gửi sang AI Service).
- **AI Service:** Python, FastAPI (giao tiếp với External AI Provider; **tuyệt đối không** truy cập trực tiếp PostgreSQL).
- **Database:** PostgreSQL.

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
| | `ThoiGianBatDau` | `TIME` | `NULL` | Giờ bắt đầu áp dụng |
| | `ThoiGianKetThuc` | `TIME` | `NULL` | Giờ kết thúc áp dụng |
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

- **Auth (`/api/auth`):** `POST /register`, `POST /login`
- **Profile (`/api/profile`):** `GET /:idTaiKhoan`, `PUT /:idTaiKhoan`
- **Patients (`/api/patients`):**
  - `GET /profiles?idTaiKhoan=...`, `POST /profiles`, `DELETE /profiles/:idHoSo`
  - `GET /relatives?idHoSoBenhNhan=...`, `PUT /relatives`
  - `GET /histories?idHoSoBenhNhan=...`, `POST /histories`, `PUT /histories/:idTienSu`, `DELETE /histories/:idTienSu`
  - `GET /exam-histories?idHoSoBenhNhan=...` (Lịch sử khám lâm sàng qua các đợt)
- **Schedules (`/api/schedules`):** `GET /`, `POST /`, `PUT /:id`
  - `NgayLamViec` trong kết quả `GET /api/schedules` và `GET /api/appointments` là chuỗi ngày `YYYY-MM-DD`, không kèm múi giờ. Frontend giữ nguyên ngày lịch khi chọn/lọc/hiển thị, không chuyển ngày này qua UTC/Local.
- **Appointments (`/api/appointments`):** `GET /`, `GET /all`, `POST /`, `PUT /:id`, `PUT /:id/cancel`
  - `PUT /:id/cancel`: `id` là `IdChiTietLD`; chỉ hủy trạng thái `Đã đặt` hoặc `Chờ duyệt`, trước giờ khám ít nhất 6 tiếng (giờ Việt Nam). Trả `400` khi sai trạng thái/quá hạn, `404` khi không tìm thấy.
- **Quy tắc xóa hồ sơ:** `DELETE /api/patients/profiles/:idHoSo` xóa hồ sơ chưa gắn lịch khám và chưa có chẩn đoán/kết luận, cùng dữ liệu `THONGTINNGUOITHAN`, `TIENSUBENH` trong một transaction. Trả `404` nếu không tồn tại; `409` nếu đã gắn lịch khám, có chẩn đoán/kết luận hoặc còn ràng buộc dữ liệu, nhằm bảo toàn lịch sử khám và kết quả AI.
- **Examinations (`/api/examinations`):** `PUT /vitals`, `PUT /diagnosis`
- **Clinic (`/api/clinic`):** `GET /info`, `POST /info`, `GET /services`, `POST /services`, `PUT /services/:id`, `GET /events`, `POST /events`, `PUT /events/:id`
- **AI (`/api/ai`):** `GET /results?idChiTietLD=...`, `POST /results`, `POST /analyze` (gọi sang FastAPI AI Service)

---

## 7. Nguyên tắc AI, Bảo mật & Kiểm thử

- **AI Safety:** Kết quả AI phải gắn nhãn rõ ràng là nội dung hỗ trợ tham khảo; AI không bịa dữ liệu bệnh nhân; kết hợp rule-based threshold (ngưỡng sinh hiệu bất thường) và LLM phân tích; AI lỗi không làm mất dữ liệu lâm sàng bác sĩ/y tá đã nhập.
- **Security:** Mật khẩu hash bằng `bcrypt`; secrets/API key lưu qua `.env` (không commit lên Git); kiểm tra xác thực và phân quyền theo `VaiTro` ở Backend.
- **Testing:** Kiểm thử đủ các luồng Use Case, đặc biệt case **1 bệnh nhân khám nhiều lần** đảm bảo không ghi đè chẩn đoán cũ, và đánh giá AI bằng bộ dữ liệu giả lập (synthetic data) theo các tiêu chí Factuality, Consistency, Evidence grounding.
