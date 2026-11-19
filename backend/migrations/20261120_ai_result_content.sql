-- Chạy thủ công một lần nếu schema cũ vẫn giới hạn nội dung AI ở 255 ký tự.
-- Không chạy từ server.js hoặc từ request. Mở rộng kiểu giữ nguyên nội dung hiện có.
BEGIN;
ALTER TABLE AIKETQUA ALTER COLUMN NoiDung TYPE TEXT;
COMMIT;
