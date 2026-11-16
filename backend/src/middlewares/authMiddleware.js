const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Truy cập bị từ chối. Không tìm thấy token.' });
  }

  try {
    // Thông thường, token được gửi dưới dạng "Bearer <token>"
    const bearer = token.split(' ');
    const bearerToken = bearer[1];
    
    // Kiểm tra token với JWT_SECRET trong tệp .env
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token không hợp lệ.' });
  }
};