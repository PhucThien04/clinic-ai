# Hệ thống Quản lý Phòng Khám Nha Khoa Đức Tín (Tích hợp AI)

Đề tài Đồ án tốt nghiệp — Khoa Công nghệ Số, Trường Đại học Sư phạm Kỹ thuật - ĐHĐN.  
Chi tiết đặc tả kỹ thuật, schema cơ sở dữ liệu và quy ước phát triển xem tại [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) và [`AGENTS.md`](./AGENTS.md).

## 1. Giới thiệu dự án
Hệ thống web số hóa toàn diện quy trình vận hành tại Phòng khám Nha khoa Đức Tín:
- **Quản lý tài khoản & phân quyền (6 vai trò người dùng):** Bệnh nhân, Nhân viên, Y tá, Bác sĩ, Admin, Chủ phòng khám.
- **Quản lý hồ sơ sức khỏe & người thân:** Hỗ trợ đặt lịch và theo dõi bệnh án cho cả chủ tài khoản lẫn người thân; khai báo bệnh nền độc lập.
- **Quản lý lịch làm việc & đặt lịch khám:** Điều phối ca khám bác sĩ, đặt lịch trực tuyến, bảo toàn dữ liệu riêng biệt qua từng đợt khám.
- **Khám lâm sàng & Trợ lý AI:** Y tá ghi nhận sinh hiệu/triệu chứng; Trợ lý AI tóm tắt tiền sử bệnh án, phân tích dữ liệu lâm sàng nha khoa và cảnh báo sớm dấu hiệu bất thường hỗ trợ bác sĩ ra quyết định.

## 2. Công nghệ & Kiến trúc
- **Frontend:** React, TypeScript, React Router, Axios, Lucide React, Tailwind CSS.
- **Backend:** Node.js, Express.js (REST API, JWT Auth, Business Workflow).
- **AI Service:** Python, FastAPI (xử lý tóm tắt, phân tích và cảnh báo lâm sàng qua HTTP; không truy cập trực tiếp Database).
- **Database:** PostgreSQL (11 bảng chuẩn khóa chính `CHAR(13)`).

## 3. Cấu trúc thư mục
```text
clinic-ai/
├── ai-service/       # Python & FastAPI (AI tóm tắt, phân tích & cảnh báo)
├── backend/          # Node.js & Express.js (REST API, Auth, Controllers)
├── database/         # SQL schema (CHAR(13)) & dữ liệu mẫu (mock data)
├── frontend/         # React + TypeScript + Tailwind CSS (components, hooks, services, pages)
├── AGENTS.md         # Quy tắc bắt buộc dành cho Coding Agent (Codex)
├── PROJECT_SPEC.md   # Đặc tả nghiệp vụ, ERD/Schema 11 bảng & API endpoints
└── README.md         # Tổng quan & hướng dẫn cài đặt dự án
```

## 4. Hướng dẫn cài đặt & Chạy thử (Development)
1. **Chuẩn bị môi trường:** Node.js (v18+), Python (v3.10+), PostgreSQL.
2. **Cấu hình biến môi trường:** Sao chép `.env.example` thành `.env` tại `backend/.env` và `ai-service/.env` (không commit `.env`).
3. **Khởi tạo Database:** Chạy script SQL trong thư mục `database/` trên PostgreSQL để tạo 11 bảng (`TAIKHOAN`, `PHONGKHAM`, `SUKIEN`, `DICHVU`, `LICHLAMVIEC`, `LICHDAT`, `HOSOBENHNHAN`, `THONGTINNGUOITHAN`, `CHITIETLICHDAT`, `TIENSUBENH`, `AIKETQUA`).
4. **Khởi động các dịch vụ:**
   - **Backend (`http://localhost:5000`):**
     ```bash
     cd backend && npm install && npm run dev
     ```
   - **AI Service (`http://localhost:8000`):**
     ```bash
     cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload
     ```
   - **Frontend (`http://localhost:5173`):**
     ```bash
     cd frontend && npm install && npm run dev
     ```