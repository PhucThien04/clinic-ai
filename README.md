# Hệ thống Quản lý Phòng Khám Nha Khoa Đức Tín

Đặc tả nghiệp vụ, schema và API: [PROJECT_SPEC.md](./PROJECT_SPEC.md). Quy ước phát triển: [AGENTS.md](./AGENTS.md).

## Công nghệ và kiến trúc

React 19, TypeScript, Vite 8 và Tailwind CSS v4 ở Frontend; Node.js/Express 5, JWT và pg ở Backend; PostgreSQL 15; Python/FastAPI với rule engine và adapter LLM. AI chỉ hỗ trợ tham khảo cho bác sĩ và không truy cập database trực tiếp.

```text
Trình duyệt localhost:5173 -> frontend (Vite)
Trình duyệt localhost:5000/api -> backend -> db:5432 (PostgreSQL 15)
                                   |
                                   +-> ai-service:8000 -> External AI API
```

Compose gồm bốn service/container: `db`, `backend`, `frontend`, `ai-service`. Backend giữ kiến trúc Route → Middleware → Controller → Service/pg; chưa có tầng models riêng. Frontend tách Services/Hooks/Utils/Pages/Components; chỉ dùng utility Tailwind v4 trong JSX, entry là src/index.css.

## Cấu trúc triển khai

```text
clinic-ai/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json, package-lock.json
│   ├── src/ (config, controllers, middlewares, routes, services, utils)
│   └── migrations/ (SQL thủ công, không chạy tự động)
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json, package-lock.json
│   ├── vite.config.ts, tsconfig*.json, eslint.config.js, index.html
│   ├── public/
│   └── src/ (services, hooks, utils, pages, components)
├── ai-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example, requirements.txt
│   └── app/ (main, config, schemas, prompts, rules, services)
├── AGENTS.md
├── PROJECT_SPEC.md
└── README.md
```

Dependency, build output, .env, .venv, cache và các tests/ cục bộ được lược bỏ khỏi sơ đồ. Các Docker build context loại trừ chúng; không có secrets trong image.

## Chạy bằng Docker Compose

Cần Docker Desktop Linux containers và Docker Compose 2.24+ (env_file.required). Từ thư mục gốc:

```powershell
docker compose up --build -d
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (API dưới /api)
- FastAPI health: http://localhost:8000/health
- PostgreSQL: localhost:5432; Backend trong Docker kết nối db:5432.

Giữ nguyên backend/.env và ai-service/.env hiện có. Chỉ sao chép từ .env.example tương ứng nếu chưa có file cục bộ; cấu hình JWT_SECRET, tài khoản/mật khẩu database và Cloudinary theo môi trường. AI key là tùy chọn để thử fallback. Không commit .env hoặc đưa secrets vào Dockerfile. env_file.required=false cho phép thiếu tệp, nhưng Backend vẫn cần credentials/JWT hợp lệ để thực hiện đầy đủ nghiệp vụ.

Compose ghi đè PORT=5000, DB_HOST=db, DB_PORT=5432, AI_SERVICE_URL=http://ai-service:8000 của Backend; các giá trị khác giữ từ backend/.env. Các biến POSTGRES_* fallback trong Compose không đổi mật khẩu/role/database đã tồn tại trong volume. Nội suy ${DB_PASSWORD:-postgres} đọc shell/.env ở gốc, không tự đọc DB_PASSWORD trong env_file; không dùng fallback này làm mật khẩu của database hiện hữu. Khi dùng volume đã có dữ liệu, Backend phải dùng credentials hiện tại của chính database đó.

Frontend Axios vẫn gọi localhost:5000/api từ trình duyệt trên máy chạy Docker. Không đổi thành http://backend:5000 vì DNS nội bộ này không khả dụng trong trình duyệt host. Cấu hình này phục vụ development cục bộ.

### Dữ liệu PostgreSQL và chuyển từ datn

Service db dùng image postgres:15 và external volume:

```text
38f4822e157da812e7944c92878531210ee60ca166140bb67c891b8b62a63e67
```

Đây là chính volume đã gắn tại /var/lib/postgresql/data của datn, được gắn lại vào cùng đường dẫn của db. Việc chuyển không export/import schema, không reset/seed và không thay đổi dữ liệu. Chỉ xóa vỏ container datn sau khi db được kiểm tra. Không khởi động datn và db cùng lúc trên volume này. Không dùng docker rm -v, docker volume rm hoặc volume prune với volume dữ liệu.

Bản pg_dump trước khi chuyển và checksum dữ liệu nằm cục bộ trong .local-backups/ (Git ignore); chứa dữ liệu nhạy cảm, không chia sẻ/commit. Volume external không được Compose tạo tự động. Trên máy khác, cần có volume đã phục hồi từ backup và sửa name trong Compose theo volume thực tế. Compose không tự tạo schema 11 bảng; không tự chạy migration hoặc reset_and_seed_db.sql.

### Theo dõi và dừng

```powershell
docker compose ps
docker compose logs --tail 50 backend
docker compose stop
docker compose start
# Gỡ container/network khi cần; giữ external volume:
docker compose down
```

Backend bind mount src/ và chạy nodemon; Frontend mount src/ và index.html cho Vite HMR; AI mount app/ và chạy uvicorn --reload. Thay package/requirements hoặc cấu hình build cần chạy lại docker compose up --build -d. Dừng các server dev trên host đang dùng cổng 5000/5173/8000 trước khi khởi động Compose. Không xóa tiến trình hoặc dữ liệu ngoài dự án để giải phóng cổng.

## Chạy trực tiếp trên host (tùy chọn)

Dùng Node.js 22.14+ và Python 3.11+; container AI dùng Python 3.12. Dừng các service ứng dụng Compose cần thay thế trước để tránh xung đột cổng; giữ db chạy. Backend host dùng DB_HOST=localhost và AI_SERVICE_URL=http://localhost:8000 trong .env cục bộ. Chạy npm ci rồi npm run dev ở backend/ và frontend/; AI cài requirements vào .venv rồi chạy python -m uvicorn app.main:app --reload --port 8000. PowerShell chặn npm.ps1 thì dùng npm.cmd.

## Kiểm thử

Khi tests/ cục bộ có sẵn: backend chạy npm test và npm run test:integration; frontend chạy npm run lint, npm run build và node --test tests/patientActions.test.cjs; ai-service chạy python -m pytest. Integration dùng schema patient_test_*/clinical_test_* cách ly; không reset DB chính. Clone mới không chứa tests/ theo quy ước Git. Không dùng git add -f. Thay đổi thuần Docker cần kiểm tra compose config --quiet, build image, HTTP/health và bảo toàn volume/dữ liệu.
