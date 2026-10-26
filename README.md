# Hệ thống Quản lý Phòng Khám Nha Khoa Đức Tín (Tích hợp AI)

Đề tài Đồ án tốt nghiệp Khoa Công nghệ Số, Trường Đại học Sư phạm Kỹ thuật - ĐHĐN.

## 1. Giới thiệu dự án

Hệ thống web hỗ trợ quản lý toàn diện hoạt động vận hành tại phòng khám nha khoa Đức Tín, bao gồm:

- Quản lý tài khoản, phân quyền người dùng (Bệnh nhân, Nhân viên, Y tá, Bác sĩ, Admin, Chủ phòng khám).
- Quản lý hồ sơ bệnh nhân, thông tin người thân và lịch sử tiền sử bệnh.
- Quản lý lịch làm việc của bác sĩ, quy trình đặt lịch khám và tiếp nhận bệnh nhân.
- Ghi nhận thông tin khám lâm sàng, sinh hiệu, chẩn đoán và kết luận của bác sĩ (bảo toàn lịch sử qua các lần khám).
- **Trợ lý AI tích hợp:** Hỗ trợ tóm tắt tiền sử bệnh án, phân tích dữ liệu lâm sàng nha khoa và đưa ra các cảnh báo sớm bất thường (hỗ trợ bác sĩ ra quyết định chuyên môn, không thay thế chẩn đoán y khoa).

## 2. Kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình client-server kết hợp AI microservice độc lập:

- **Frontend:** React, React Router, Tailwind CSS, TanStack Query, Axios, Recharts.
- **Backend:** Node.js, Express.js (đóng vai trò trung tâm xử lý business logic, xác thực, phân quyền và điều phối dữ liệu).
- **AI Service:** Python, FastAPI (nhận request từ Backend để xử lý các tác vụ AI qua HTTP; **không** kết nối trực tiếp cơ sở dữ liệu).
- **Database:** PostgreSQL.

## 3. Cấu trúc thư mục dự án

```text
clinic-ai/
├── ai-service/       # Python & FastAPI (Xử lý tóm tắt, phân tích AI)
├── backend/          # Node.js & Express.js (API Server, Auth, Business logic)
├── database/         # SQL scripts, migration & ERD documentation
├── docs/             # Tài liệu đồ án, đặc tả kỹ thuật và use-case
├── frontend/         # React application (UI/UX)
├── .env.example      # Mẫu cấu hình biến môi trường
├── AGENTS.md         # Hướng dẫn và quy tắc dành cho Coding Agent
└── README.md         # Tài liệu tổng quan dự án
```

## 4. Hướng dẫn thiết lập môi trường (Development Setup)

Yêu cầu hệ thống chuẩn bị:
Node.js (v18+)

Python (v3.10+)

PostgreSQL

Các bước cài đặt:
Clone repository và cấu hình biến môi trường:
Sao chép file .env.example thành .env ở các thư mục tương ứng (backend/.env, ai-service/.env) và điền đầy đủ thông tin cấu hình (Database connection, AI Provider API Key,... tuyệt đối không commit file .env lên Git).

Khởi tạo Database:
Chạy các script SQL trong thư mục database/ trên PostgreSQL để khởi tạo các bảng TAIKHOAN, HOSOBENHNHAN, THONGTINNGUOITHAN, TIENSUBENH, LICHDAT, CHITIETLICHDAT, LICHLAMVIEC, PHONGKHAM, SUKIEN, DICHVU, AIKETQUA.

Chạy Backend:

Bash
cd backend
npm install
npm run dev
Chạy AI Service:

Bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
Chạy Frontend:

Bash
cd frontend
npm install
npm run dev

## 5. Quy tắc phát triển

Tuân thủ tuyệt đối các quy tắc được định nghĩa trong AGENTS.md.

Đảm bảo đồng bộ tài liệu PROJECT_SPEC.md trước khi tiến hành mở rộng scope hoặc thay đổi cấu trúc dữ liệu.
