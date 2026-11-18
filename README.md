# Hệ thống Quản lý Phòng Khám Nha Khoa Đức Tín (Tích hợp AI)

Đề tài Đồ án tốt nghiệp — Khoa Công nghệ Số, Trường Đại học Sư phạm Kỹ thuật - ĐHĐN.
Đặc tả nghiệp vụ, schema và API xem tại [PROJECT_SPEC.md](./PROJECT_SPEC.md); quy tắc phát triển tại [AGENTS.md](./AGENTS.md).

## 1. Giới thiệu dự án

Hệ thống số hóa quy trình phòng khám với 6 vai trò người dùng: Bệnh nhân, Nhân viên, Y tá, Bác sĩ, Admin và Chủ phòng khám. Phạm vi gồm tài khoản, hồ sơ bản thân/người thân, bệnh nền, lịch làm việc, đặt/đổi/hủy lịch và lịch sử khám qua từng đợt. Trợ lý AI tóm tắt, phân tích và cảnh báo lâm sàng là phần tích hợp theo đặc tả, chỉ hỗ trợ tham khảo cho bác sĩ.

Hiện có mã Frontend và Backend, cùng kiểm thử luồng Bệnh nhân. Thư mục `ai-service/` đang rỗng; chưa có ứng dụng FastAPI hoặc luồng gọi External AI API để chạy thử.

## 2. Công nghệ & Kiến trúc

- **Frontend:** React 19, TypeScript, Vite 8, React Router, Axios, Lucide React và **Tailwind CSS v4**. Tích hợp bằng `@tailwindcss/vite` trong `frontend/vite.config.ts`; `frontend/src/index.css` chứa `@import "tailwindcss";`.
- **Backend:** Node.js, Express 5, REST API, JWT (`jsonwebtoken`), bcrypt và `pg`; `dotenv` đọc cấu hình từ `backend/.env`. Chạy development bằng nodemon.
- **Database:** PostgreSQL 15 trong Docker. Backend chạy trên máy host và kết nối qua cổng publish `localhost:5432`; dữ liệu nằm trong Docker volume, không nằm trong thư mục SQL của repo.
- **AI Service dự kiến:** Python/FastAPI, chỉ nhận dữ liệu qua Backend và gọi External AI API; không kết nối PostgreSQL trực tiếp.
- **Clean Code/MVC:** View là React; Express Routes chuyển request qua Middleware đến Controller; `services/` chứa nghiệp vụ dùng chung, `config/db.js` cung cấp kết nối dữ liệu. Hiện SQL nằm trong Controller/Service, chưa có thư mục `models/`; không coi đây là MVC đã tách Model hoàn chỉnh. Frontend tách API vào Service, state/nghiệp vụ vào Hook, hàm thuần vào Utility và JSX vào Page/Component.

```text
React/Vite (host :5173) -> Express (host :5000) -> PostgreSQL (Docker :5432)
                                |
                                +-> FastAPI -> External AI API (dự kiến)
```

## 3. Cấu trúc thư mục thực tế

Sơ đồ liệt kê các thư mục nguồn và tệp cấu hình chính tại thời điểm rà soát 18/11/2026. Đã lược bỏ `.git/`, dependency `node_modules/`, output `dist/` và tệp bí mật `backend/.env`.

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
│   │   ├── pages/           # auth, doctor, home, nurse, patient
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

Hiện không có `.ai-workflow/`, `database/`, `docs/`, `Dockerfile` hoặc Docker Compose trong workspace. Thư mục rỗng `ai-service/` không được Git lưu nếu chưa có tệp, nên có thể vắng mặt khi clone mới. Schema 11 bảng được đặc tả trong `PROJECT_SPEC.md`; repo chưa có SQL bootstrap, migration hoặc seed để tự khởi tạo schema đó.

## 4. Hướng dẫn cài đặt & Chạy thử (Development)

Các lệnh dưới đây dùng PowerShell, bắt đầu từ thư mục gốc repo. Cần **Node.js 22.14+**, npm và Docker Desktop đang chạy với Linux containers. Vite đang cài đặt yêu cầu Node.js `^20.19.0 || >=22.12.0`; mốc 22.14+ cũng đáp ứng utility test hiện có. Python chưa cần cho hai dịch vụ đã triển khai.

### 4.1. PostgreSQL qua Docker

Môi trường đã kiểm tra có container **`datn`**, image **`postgres:15`**, cổng host **5432** và một Docker volume gắn tại `/var/lib/postgresql/data`.

```powershell
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
# Nếu container datn đã có nhưng đang dừng:
docker start datn
docker exec datn pg_isready -U postgres -d clinic_duc_tin
```

Nếu máy mới chưa có container PostgreSQL, có thể tạo bằng lệnh sau. Đây là cấu hình mẫu cho môi trường mới, không phải file triển khai có sẵn trong repo; chỉ chạy khi tên `datn` và cổng 5432 chưa được sử dụng:

```powershell
# Nhập mật khẩu DB cục bộ; dùng cùng mật khẩu này trong backend/.env.
$databaseCredential = Get-Credential -UserName postgres -Message "Mật khẩu PostgreSQL cục bộ"
$env:POSTGRES_PASSWORD = $databaseCredential.GetNetworkCredential().Password
try {
    docker run --detach --name datn --publish 127.0.0.1:5432:5432 --env POSTGRES_USER=postgres --env POSTGRES_DB=clinic_duc_tin --env POSTGRES_PASSWORD --mount type=volume,source=clinic_ai_pgdata,target=/var/lib/postgresql/data postgres:15
} finally {
    Remove-Item Env:POSTGRES_PASSWORD
    Remove-Variable databaseCredential
}
docker exec datn pg_isready -U postgres -d clinic_duc_tin
```

Lệnh này chỉ tạo PostgreSQL và database rỗng `clinic_duc_tin`, **chưa tạo 11 bảng nghiệp vụ**. Với container hiện có, giữ nguyên volume và schema đang dùng. Với môi trường mới, cần nhập bản SQL schema/dump đã được chuẩn bị theo mục 5 của `PROJECT_SPEC.md`. Repo chưa cung cấp bản SQL đó. Ví dụ sau giả định bạn đã có tệp SQL hợp lệ ngoài repo:

```powershell
docker cp "C:\duong-dan\clinic-schema.sql" datn:/tmp/clinic-schema.sql
docker exec datn psql -U postgres -d clinic_duc_tin -v ON_ERROR_STOP=1 -f /tmp/clinic-schema.sql
docker exec datn psql -U postgres -d clinic_duc_tin -c '\dt public.*'
```

Schema cần đủ `TAIKHOAN`, `PHONGKHAM`, `SUKIEN`, `DICHVU`, `LICHLAMVIEC`, `LICHDAT`, `HOSOBENHNHAN`, `THONGTINNGUOITHAN`, `CHITIETLICHDAT`, `TIENSUBENH`, `AIKETQUA` và các ràng buộc theo đặc tả. Khởi động Backend không tự tạo các bảng này.

### 4.2. Cấu hình Backend

```powershell
Copy-Item backend/.env.example backend/.env
```

Chỉ sao chép khi chưa có `backend/.env`; nếu đã có, cập nhật cấu hình phù hợp và giữ thông tin cục bộ hiện tại. Điền các biến sau trong tệp đó:

| Biến | Ý nghĩa khi Backend chạy trên host |
| --- | --- |
| `PORT` | Cổng Express, mặc định `5000` |
| `DB_HOST` | `localhost` khi dùng cổng PostgreSQL đã publish |
| `DB_PORT` | Cổng host, thông thường `5432` |
| `DB_NAME` | `clinic_duc_tin` |
| `DB_USER` | User PostgreSQL, ví dụ `postgres` |
| `DB_PASSWORD` | Mật khẩu DB do bạn cấu hình |
| `JWT_SECRET` | Secret riêng cho môi trường cục bộ, bắt buộc điền |

Backend đọc `.env` theo thư mục chạy, vì vậy cần chạy lệnh trong `backend/`. `.env.example` ở gốc hiện rỗng, không thay thế mẫu trong `backend/`. Không commit `.env`, mật khẩu hoặc token. Nếu sau này container hóa Backend, cần cấu hình `DB_HOST` theo tên dịch vụ/container trên cùng Docker network thay cho `localhost`.

### 4.3. Khởi động ứng dụng

Terminal thứ nhất:

```powershell
cd backend
npm ci
npm run dev
```

Backend: `http://localhost:5000`. Terminal thứ hai, từ thư mục gốc:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend: thường là `http://localhost:5173` (xem URL Vite in ra). Axios hiện trỏ đến `http://localhost:5000/api` trong `frontend/src/services/api.ts`. Không có bước `pip install`/`uvicorn` chạy được ở hiện trạng vì `ai-service/` chưa có `requirements.txt` hoặc entry point FastAPI.

## 5. Kiểm thử

Các thư mục `tests/` chỉ được giữ cục bộ và đã gỡ khỏi Git tracking; clone mới không có các tệp test này. Các lệnh kiểm thử dưới đây áp dụng khi máy đã có bộ test cục bộ. Quy tắc `.gitignore` không xóa test trên máy và không xóa chúng khỏi lịch sử commit cũ.

- Tại `backend/`: `npm test` chạy unit test.
- Tại `backend/`: `npm run test:integration` chạy HTTP/PostgreSQL integration test. Cần DB đã có schema và user có quyền tạo schema. Bộ test tạo schema `patient_test_*` riêng, sao chép cấu trúc bảng và tự dọn sau khi chạy.
- Tại `frontend/`: `node --test tests/patientActions.test.cjs` kiểm tra ngày tháng/thông báo lỗi.
- Tại `frontend/`: `npm run build` chạy TypeScript và Vite build; output nằm trong `frontend/dist/` và không commit.
- Trên PowerShell có chặn `npm.ps1`, dùng `npm.cmd` thay cho `npm`.
