# Clinic AI --- Đặc tả dự án

**Phiên bản:** 1.1
**Trạng thái:** Baseline dự án
**Ngày cập nhật:** 17/10/2026

---

## 0. Quy ước ngôn ngữ và tài liệu

Toàn bộ tài liệu project sử dụng tiếng Việt; giữ nguyên các thuật ngữ kỹ
thuật phổ biến bằng tiếng Anh khi phù hợp. Tên bảng, tên trường trong
tài liệu Database hiện tại được giữ theo tài liệu đã thống nhất với
GVHD; không tự ý đổi tên khi chưa cập nhật đồng bộ ERD và tài liệu liên
quan.

Phân biệt rõ: - **Official:** Thông tin từ tên đề tài, đề cương, nhiệm
vụ đồ án hoặc tài liệu nguồn. - **GVHD Confirmed:** Nội dung được giảng
viên xác nhận trực tiếp. - **Decision:** Quyết định kỹ thuật/nghiệp vụ
đã thống nhất trong project. - **Proposed:** Đề xuất chưa được xác
nhận. - **Open Question:** Nội dung cần làm rõ.

Không biến đề xuất thành yêu cầu chính thức. Khi có mâu thuẫn, cập nhật
tài liệu liên quan đồng bộ trước khi triển khai.

## 1. Tổng quan dự án

### 1.1 Tên đề tài chính thức --- Official

**Xây dựng hệ thống quản lý phòng khám nha khoa Đức Tín, tích hợp AI tóm
tắt và phân tích hồ sơ bệnh nhân.**

### 1.2 Mục tiêu --- Official

Xây dựng hệ thống web hỗ trợ quản lý bệnh nhân, lịch làm việc, đặt lịch
và khám nha khoa; tích hợp AI tóm tắt tiền sử bệnh án, phân tích dữ liệu
lâm sàng nha khoa và cảnh báo sớm các dấu hiệu bất thường. AI hỗ trợ
nhân viên y tế, không thay thế quyết định chuyên môn của bác sĩ.

## 2. Actor và chức năng

Theo tài liệu Use Case đã thống nhất:

- **Bệnh nhân:** Đăng ký, đăng nhập, cập nhật hồ sơ bệnh nhân, xem
  lịch sử khám, xem lịch làm việc, đặt lịch, cập nhật lịch đặt và đăng
  xuất.
- **Nhân viên:** Đăng nhập, cập nhật thông tin cá nhân, cập nhật lịch
  đặt, cập nhật lịch làm việc và đăng xuất.
- **Y tá:** Đăng nhập, cập nhật thông tin cá nhân, cập nhật hồ sơ khám
  và đăng xuất.
- **Bác sĩ:** Đăng nhập, cập nhật thông tin cá nhân, cập nhật hồ sơ
  khám, xem lịch sử khám, tương tác với trợ lý AI và đăng xuất.
- **Admin:** Đăng nhập, cập nhật thông tin cá nhân, quản lý tài khoản
  người dùng và đăng xuất.
- **Chủ phòng khám:** Đăng nhập, cập nhật thông tin tài khoản, cập
  nhật thông tin phòng khám, sự kiện và dịch vụ.
- **Trợ lý AI:** Tóm tắt tiền sử bệnh án, phân tích dữ liệu lâm sàng
  nha khoa và cảnh báo lâm sàng.

Không suy diễn thêm quyền cho actor chỉ từ tên vai trò; quyền cụ thể
phải nhất quán giữa Use Case và Backend.

## 3. Phạm vi nghiệp vụ

Phạm vi theo tài liệu đồ án gồm: 1. Quản lý tài khoản và thông tin cá
nhân. 2. Quản lý hồ sơ bệnh nhân, bao gồm thông tin người thân. 3. Quản
lý tiền sử bệnh. 4. Quản lý lịch làm việc. 5. Đặt lịch và cập nhật lịch
đặt. 6. Cập nhật hồ sơ khám. 7. Quản lý phòng khám, sự kiện và dịch vụ. 8. AI tóm tắt tiền sử bệnh án. 9. AI phân tích dữ liệu lâm sàng nha
khoa. 10. AI cảnh báo sớm dấu hiệu bất thường.

Quy trình tổng quát: **Quản lý hồ sơ bệnh nhân → Quản lý lịch làm việc →
Đặt/cập nhật lịch đặt → Cập nhật hồ sơ khám → AI tóm tắt, phân tích và
cảnh báo → Bác sĩ xem xét kết quả và quyết định chuyên môn.**

## 4. Công nghệ và kiến trúc

Công nghệ sử dụng trong project (các lựa chọn kỹ thuật này không mặc
định là yêu cầu do GVHD xác nhận):

- **Frontend:** React, React Router, Axios, TanStack Query, Recharts.
- **Backend:** Node.js, Express.js, REST API.
- **AI Service:** Python, FastAPI, External AI API.
- **Database:** PostgreSQL.
- **Deployment:** Docker, cloud hosting.

```text
React Frontend
      │ REST API
      ▼
Node.js / Express Backend ───── HTTP ───── Python / FastAPI AI Service
      │                                         │
      ▼                                         ▼
  PostgreSQL                              External AI API
```

Backend là trung tâm của business workflow. Backend chịu trách nhiệm
Authentication, Authorization, kiểm tra quyền truy cập tài nguyên, lấy
và chuẩn hóa dữ liệu được phép gửi đi. AI Service không truy cập trực
tiếp PostgreSQL.

## 5. Mô hình dữ liệu --- Baseline theo tài liệu đồ án

### 5.1 Các bảng hiện tại

---

Bảng Vai trò

---

`TAIKHOAN` Tài khoản, thông tin cá nhân, trạng
thái và vai trò

`HOSOBENHNHAN` Hồ sơ bệnh nhân gắn với tài khoản
và loại thông tin

`THONGTINNGUOITHAN` Thông tin riêng của người thân và
mối quan hệ

`TIENSUBENH` Các bản ghi tiền sử bệnh của hồ sơ
bệnh nhân

`LICHDAT` Thông tin chung của lịch đặt

`CHITIETLICHDAT` Chi tiết lịch đặt theo hồ sơ bệnh
nhân và ca làm việc

`LICHLAMVIEC` Ca làm việc của bác sĩ tại phòng
khám

`AIKETQUA` Kết quả AI: tóm tắt, phân tích hoặc
cảnh báo

`PHONGKHAM` Thông tin phòng khám

`SUKIEN` Sự kiện của phòng khám

`DICHVU` Dịch vụ do phòng khám cung cấp

---

Không thêm lại bảng `BENHNHAN` nếu mô hình đã thống nhất loại bỏ bảng
này.

### 5.2 Quan hệ và quy tắc dữ liệu

- `HOSOBENHNHAN.IdTaiKhoan` tham chiếu `TAIKHOAN.IdTaiKhoan`.
- `THONGTINNGUOITHAN` lưu thông tin riêng của người thân và
  `MoiQuanHe`.
- `TIENSUBENH.IdHoSoBenhNhan` tham chiếu hồ sơ bệnh nhân.
- `TIENSUBENH.NguoiGhiNhan` là khóa ngoại đến `TAIKHOAN.IdTaiKhoan`,
  xác định tài khoản ghi nhận tiền sử bệnh.
- `TIENSUBENH.IdChiTietLD` liên kết bản ghi tiền sử với chi tiết lịch
  đặt/lần ghi nhận nguồn theo tài liệu hiện tại.
- `LICHDAT.IdTaiKhoan` tham chiếu tài khoản thực hiện đặt lịch.
- `CHITIETLICHDAT.IdLichDat` tham chiếu `LICHDAT.IdLichDat`.
- `CHITIETLICHDAT.IdHoSoBenhNhan` tham chiếu hồ sơ bệnh nhân được đặt
  lịch.
- `CHITIETLICHDAT.IdLichLamViec` tham chiếu
  `LICHLAMVIEC.IdLichLamViec`.
- `LICHLAMVIEC.IdBacSi` và `LICHLAMVIEC.NguoiCapNhat` tham chiếu
  `TAIKHOAN.IdTaiKhoan`.
- `LICHLAMVIEC.IdPhongKham` tham chiếu `PHONGKHAM.IdPhongKham`.
- `AIKETQUA.IdChiTietLD` tham chiếu chi tiết lịch đặt/lần ghi nhận
  tương ứng.
- `PHONGKHAM.ChuPhongKham` tham chiếu `TAIKHOAN.IdTaiKhoan`; `SUKIEN`
  và `DICHVU` gắn với phòng khám.

### 5.3 Hồ sơ và lịch sử khám

- Không ghi đè dữ liệu của lần khám trước bằng dữ liệu lần khám mới.
- Mỗi lần khám/ghi nhận cần được lưu riêng để bảo toàn lịch sử và hỗ
  trợ AI tổng hợp theo thời gian.
- `TIENSUBENH` là dữ liệu tiền sử gắn với hồ sơ bệnh nhân; chẩn đoán
  của một lần khám phải được giữ trong dữ liệu của lần khám đó.
- Không tự động coi mọi chẩn đoán cũ là tiền sử bệnh đã xác nhận. Việc
  cập nhật tiền sử cần theo quy tắc nghiệp vụ phù hợp.
- `NguoiGhiNhan` cho biết **ai** ghi nhận. Nếu cần phân biệt bệnh nhân
  tự khai báo với bác sĩ xác nhận, cần một trường nguồn thông tin
  riêng.

### 5.4 Các điểm phải đồng bộ trước khi triển khai

1.  Tài liệu mô tả bảng dùng tên `IdChiTietLD`; mọi khóa ngoại phải dùng
    thống nhất tên và tham chiếu đúng khóa chính.
2.  `HOSOBENHNHAN.LoaiThongTin`: tài liệu hiện tại quy định `0` là chủ
    tài khoản, `1` là người thân. Khi là chủ tài khoản, lấy thông tin cá
    nhân từ `TAIKHOAN`; khi là người thân, lấy thông tin riêng từ
    `THONGTINNGUOITHAN`.
3.  Cần bảo đảm dữ liệu của nhiều lần khám không bị ghi đè. Vị trí chính
    xác của các trường lâm sàng phải khớp với ERD và tài liệu Database
    cuối cùng.
4.  Kiểu dữ liệu, tính nullable và ràng buộc phải được chốt trong tài
    liệu Database trước khi tạo migration.

## 6. Nguyên tắc AI

- Chức năng AI trong phạm vi đề tài: tóm tắt tiền sử bệnh án, phân
  tích dữ liệu lâm sàng nha khoa và cảnh báo sớm.
- AI là công cụ hỗ trợ quyết định lâm sàng, không thay thế bác sĩ.
- AI không tự xác lập chẩn đoán chính thức hoặc tự thực hiện hành động
  y khoa.
- Kết quả AI phải được đánh dấu là nội dung do AI tạo; khi phù hợp,
  cho phép đối chiếu với dữ liệu nguồn.
- Backend/AI Service phải kiểm tra định dạng và tính hợp lệ của đầu
  ra.
- AI lỗi không được làm mất dữ liệu lâm sàng đã nhập.
- Chỉ gửi dữ liệu cần thiết tới External AI Provider.
- Dùng dữ liệu synthetic hoặc đã ẩn danh cho development, demo và
  evaluation; không sử dụng dữ liệu bệnh nhân thật nếu chưa có quyền
  phù hợp.
- Clinical Alert là cảnh báo hỗ trợ, không phải chẩn đoán. Nếu dùng
  ngưỡng hệ thống cấu hình, phải mô tả là quy tắc/ngưỡng phát hiện bất
  thường, không gọi là chuẩn chẩn đoán y khoa khi chưa có căn cứ
  chuyên môn.
- Provider được cấu hình, không gắn cứng vào business logic; AI
  Service không truy cập trực tiếp PostgreSQL.

## 7. Bảo mật

- Hash mật khẩu; không lưu mật khẩu dạng rõ.
- Secrets/API key qua environment variables, không commit lên Git.
- Authentication, Authorization và resource-level authorization do
  Backend kiểm soát.
- Validate dữ liệu đầu vào.
- Không log password, token hoặc API key.
- Hạn chế xóa cứng dữ liệu khám quan trọng trong workflow thông
  thường.
- Dùng synthetic/anonymized data khi phát triển, demo và đánh giá.
- Phạm vi Audit Log cần được xác định trong tài liệu chức năng trước
  khi triển khai.

## 8. Kiểm thử và đánh giá AI

### Kiểm thử hệ thống

- Unit test cho business logic quan trọng.
- API/integration test.
- Kiểm thử Authentication, Authorization và quyền truy cập dữ liệu.
- Kiểm thử cập nhật hồ sơ bệnh nhân, tiền sử bệnh, lịch làm việc, lịch
  đặt và hồ sơ khám.
- Kiểm thử trường hợp bệnh nhân có nhiều lần khám và dữ liệu cũ được
  giữ nguyên.
- Kiểm thử AI structured output, lỗi kết nối AI, dữ liệu thiếu và dữ
  liệu không nhất quán.
- End-to-end test theo luồng nghiệp vụ trong Use Case.

### Đánh giá AI

- **AI Summary:** Completeness, Factuality, Relevance, Consistency.
- **Clinical Analysis:** Correctness, Consistency, Evidence grounding.
- **Clinical Alert:** Chỉ dùng Precision/Recall/False Positive/False
  Negative khi có ground truth phù hợp; nếu không, dùng rubric và phân
  tích lỗi.

Dataset cần có hồ sơ bình thường, tiền sử dài, nhiều lần khám, xu hướng
tăng/giảm, dữ liệu bất thường, dữ liệu thiếu và dữ liệu không nhất quán.

## 9. Deployment

Triển khai production sau khi luồng chức năng chính ổn định. Mục tiêu
gồm Frontend, Backend, AI Service và PostgreSQL production; HTTPS; quản
lý environment variables và secrets.

## 10. Quản lý thay đổi

- Use Case, ERD, tài liệu mô tả bảng và đặc tả project phải nhất quán.
- Không tự ý đổi actor, tên bảng, tên trường hoặc quan hệ đã thống
  nhất với GVHD.
- Không tự ý thêm chức năng ngoài phạm vi.
- Khi phát hiện mâu thuẫn hoặc yêu cầu mới, cập nhật đồng bộ các tài
  liệu trước khi triển khai.
- Nội dung chưa được xác nhận phải được đánh dấu Proposed hoặc Open
  Question.

## 11. Các quyết định hiện tại

- Tài liệu project sử dụng tiếng Việt; giữ các thuật ngữ kỹ thuật phổ biến bằng tiếng Anh khi phù hợp.
- Giao diện web sử dụng tiếng Việt.
- Backend kiểm soát quyền truy cập và chuẩn bị dữ liệu được phép trước khi gọi AI Service.
- AI Service không truy cập PostgreSQL trực tiếp.
- AI hỗ trợ tóm tắt, phân tích và cảnh báo; không thay thế quyết định chuyên môn của bác sĩ.
- Mô hình dữ liệu không sử dụng bảng `BENHNHAN` riêng.
- Sử dụng `LICHDAT` và `CHITIETLICHDAT` để tách thông tin lịch đặt khỏi chi tiết của từng lượt khám.
- `TIENSUBENH.NguoiGhiNhan` tham chiếu `TAIKHOAN.IdTaiKhoan`.
- Bảo toàn dữ liệu của từng lần khám; không ghi đè lịch sử bằng dữ liệu của lần khám mới.

## 12. Trạng thái baseline

Trước khi triển khai Database, đối chiếu ERD với tài liệu mô tả bảng, đặc biệt tên khóa `IdChiTietLD` và vị trí các trường dữ liệu khám. Không xem các mục đang cần đồng bộ là đã được GVHD xác nhận nếu chưa có xác nhận trực tiếp.
