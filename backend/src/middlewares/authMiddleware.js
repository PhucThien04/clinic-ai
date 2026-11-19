const jwt = require('jsonwebtoken');

exports.requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.VaiTro)) {
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện chức năng này.' });
  }
  next();
};

exports.verifyToken = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Truy cập bị từ chối. Không tìm thấy token.' });
  }

  try {
    // Thông thường, token được gửi dưới dạng "Bearer <token>"
    if (!/^Bearer \S+$/.test(token)) return res.status(401).json({ error: 'Token không hợp lệ.' });
    const bearer = token.split(' ');
    const bearerToken = bearer[1];
    
    // Kiểm tra token với JWT_SECRET trong tệp .env
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    if (!decoded.IdTaiKhoan) return res.status(401).json({ error: 'Token không hợp lệ.' });
    // Đọc quyền/trạng thái hiện hành để khóa tài khoản hoặc đổi vai trò có hiệu lực với JWT đã cấp.
    const pool = require('../config/db');
    let account;
    try {
      account = await pool.query('SELECT VaiTro AS "VaiTro", TrangThai AS "TrangThai" FROM TAIKHOAN WHERE IdTaiKhoan=$1',[decoded.IdTaiKhoan]);
    } catch {
      return res.status(503).json({ error: 'Không thể kiểm tra tài khoản. Vui lòng thử lại.' });
    }
    if(!account.rows.length||account.rows[0].TrangThai!=='Hoạt động')return res.status(403).json({error:'Tài khoản đã bị khóa hoặc không còn tồn tại.'});
    req.user = { ...decoded, VaiTro: account.rows[0].VaiTro };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};
