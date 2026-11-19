// Nhận Pool/Client để integration test có thể dùng schema cách ly.
async function ensureMediaColumns(db){
  await db.query('ALTER TABLE TAIKHOAN ADD COLUMN IF NOT EXISTS AnhDaiDien VARCHAR(500)');
  await db.query('ALTER TABLE DICHVU ADD COLUMN IF NOT EXISTS HinhAnh VARCHAR(500)');
  await db.query('ALTER TABLE SUKIEN ADD COLUMN IF NOT EXISTS HinhAnh VARCHAR(500)');
}
module.exports={ensureMediaColumns};
