const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const examinationRoutes = require('./routes/examinationRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Khai báo Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/ai', aiRoutes);

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ message: 'API hệ thống Nha khoa Đức Tín đang hoạt động bình thường.' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});