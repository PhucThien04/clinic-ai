const jwt = require('jsonwebtoken');

exports.requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.VaiTro)) {
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện chức năng này.' });
  }
  next();
};

exports.verifyToken = (req, res, next) => {
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
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};
