const { generateId } = require('../utils/idGenerator');

// Khóa tài khoản để hai lần đăng nhập đồng thời không tạo trùng hồ sơ bản thân.
async function ensureSelfProfile(client, idTaiKhoan) {
  await client.query('SELECT IdTaiKhoan AS "IdTaiKhoan" FROM TAIKHOAN WHERE IdTaiKhoan = $1 FOR UPDATE', [idTaiKhoan]);
  const existing = await client.query(`SELECT IdHoSoBenhNhan AS "IdHoSoBenhNhan"
    FROM HOSOBENHNHAN WHERE IdTaiKhoan = $1 AND LoaiThongTin = 0 LIMIT 1`, [idTaiKhoan]);
  if (existing.rows.length) return existing.rows[0].IdHoSoBenhNhan;
  const id = generateId('HS');
  await client.query('INSERT INTO HOSOBENHNHAN (IdHoSoBenhNhan, IdTaiKhoan, LoaiThongTin) VALUES ($1, $2, 0)', [id, idTaiKhoan]);
  return id;
}

module.exports = { ensureSelfProfile };
