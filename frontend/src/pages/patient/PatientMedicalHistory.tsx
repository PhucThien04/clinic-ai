import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  usePatientHistory,
  type ChronicDiseaseRecord,
} from "../../hooks/usePatientHistory";
import {
  User,
  Users,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Stethoscope,
  Activity,
  FileWarning,
  ClipboardCheck,
  X,
  ShieldAlert,
} from "lucide-react";
import "./PatientMedicalHistory.css";

export default function PatientMedicalHistory(): React.JSX.Element {
  const {
    profiles,
    chronicDiseases,
    examHistory,
    selectedProfileId,
    setSelectedProfileId,
    loading,
    currentUser,
    addRelativeProfile,
    updateRelativeProfile,
    deleteProfile,
    addMedicalHistory,
    updateMedicalHistory,
    deleteMedicalHistory,
  } = usePatientHistory();

  // Modal Người thân
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  const [selectedRelativeId, setSelectedRelativeId] = useState<string>("");
  const [formData, setFormData] = useState({
    HoTen: "",
    MoiQuanHe: "Cha",
    CCCD: "",
    NgaySinh: "",
    GioiTinh: "Nam",
    SoDienThoai: "",
    DiaChi: "",
  });

  // Modal Bệnh nền (Thêm & Sửa)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState({
    TenBenh: "",
    MoTa: "",
    ThoiDiemMac: "",
    TrangThai: "Đang điều trị",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Xử lý Hồ sơ người thân ---
  const handleOpenAddRelative = () => {
    setIsEditingRelative(false);
    setErrorMsg("");
    setFormData({
      HoTen: "",
      MoiQuanHe: "Cha",
      CCCD: "",
      NgaySinh: "",
      GioiTinh: "Nam",
      SoDienThoai: "",
      DiaChi: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditRelative = (profile: any) => {
    setIsEditingRelative(true);
    setErrorMsg("");
    setSelectedRelativeId(
      profile.IdThongTinNguoiThan || profile.IdHoSoBenhNhan,
    );
    setFormData({
      HoTen: profile.HoTen || "",
      MoiQuanHe: profile.MoiQuanHe || "Cha",
      CCCD: profile.CCCD || "",
      NgaySinh: profile.NgaySinh ? profile.NgaySinh.split("T")[0] : "",
      GioiTinh: profile.GioiTinh || "Nam",
      SoDienThoai: profile.SoDienThoai || "",
      DiaChi: profile.DiaChi || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (id: string, isSelf: boolean) => {
    if (isSelf) return;
    if (
      window.confirm("Bạn có chắc chắn muốn xóa hồ sơ người thân này không?")
    ) {
      const res = await deleteProfile(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleSubmitRelative = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const res = isEditingRelative
      ? await updateRelativeProfile({
          IdThongTinNguoiThan: selectedRelativeId,
          ...formData,
        })
      : await addRelativeProfile(formData);

    setSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra");
    }
  };

  // --- Xử lý Bệnh nền (Thêm & Cập nhật) ---
  const handleOpenAddHistory = () => {
    setEditingHistoryId(null);
    setHistoryData({
      TenBenh: "",
      MoTa: "",
      ThoiDiemMac: "",
      TrangThai: "Đang điều trị",
    });
    setIsHistoryModalOpen(true);
  };

  const handleOpenEditHistory = (item: ChronicDiseaseRecord) => {
    setEditingHistoryId(item.IdTienSuBenh);
    setHistoryData({
      TenBenh: item.TenBenh || "",
      MoTa: item.MoTa || "",
      ThoiDiemMac: item.ThoiDiemMac ? item.ThoiDiemMac.split("T")[0] : "",
      TrangThai: item.TrangThai || "Đang điều trị",
    });
    setIsHistoryModalOpen(true);
  };

  const handleSubmitHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = editingHistoryId
      ? await updateMedicalHistory(editingHistoryId, historyData)
      : await addMedicalHistory(historyData);
    setSubmitting(false);

    if (res.success) {
      setIsHistoryModalOpen(false);
      setEditingHistoryId(null);
      setHistoryData({
        TenBenh: "",
        MoTa: "",
        ThoiDiemMac: "",
        TrangThai: "Đang điều trị",
      });
    } else {
      alert(res.error);
    }
  };

  const handleDeleteHistory = async (idTienSu: string) => {
    if (window.confirm("Bạn có chắc muốn xóa thông tin bệnh nền này không?")) {
      const res = await deleteMedicalHistory(idTienSu);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <DashboardLayout>
      <div className="history-container">
        <div>
          <h1 className="history-header-title">
            Hồ Sơ Sức Khỏe & Lịch Sử Khám Bệnh
          </h1>
          <p className="history-header-subtitle">
            Quản lý hồ sơ người thân, khai báo bệnh nền trước khi khám và theo
            dõi chẩn đoán từ bác sĩ.
          </p>
        </div>

        <div className="history-layout">
          {/* CỘT TRÁI: DANH SÁCH HỒ SƠ */}
          <aside className="profiles-sidebar">
            <h2 className="profiles-title">
              Danh sách hồ sơ <span className="badge">{profiles.length}</span>
            </h2>

            <div className="profiles-list">
              {profiles.map((p) => (
                <div
                  key={p.IdHoSoBenhNhan}
                  className={`profile-card ${selectedProfileId === p.IdHoSoBenhNhan ? "active" : ""}`}
                  onClick={() => setSelectedProfileId(p.IdHoSoBenhNhan)}
                >
                  <div className="profile-icon">
                    {p.LoaiThongTin === 0 ? (
                      <User size={20} />
                    ) : (
                      <Users size={20} />
                    )}
                  </div>
                  <div className="profile-info">
                    <h4>
                      {p.LoaiThongTin === 0 ? currentUser?.HoTen : p.HoTen}
                    </h4>
                    <p>
                      {p.LoaiThongTin === 0
                        ? "Bản thân"
                        : `Người thân (${p.MoiQuanHe})`}
                    </p>
                  </div>
                  {p.LoaiThongTin === 1 && (
                    <div
                      className="profile-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Sửa hồ sơ"
                        onClick={() => handleOpenEditRelative(p)}
                      >
                        <Edit size={14} color="#0284c7" />
                      </button>
                      <button
                        title="Xóa hồ sơ"
                        onClick={() =>
                          handleDeleteProfile(p.IdHoSoBenhNhan, false)
                        }
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="add-relative-btn"
              onClick={handleOpenAddRelative}
            >
              <Plus size={16} /> Thêm hồ sơ người thân
            </button>
          </aside>

          {/* CỘT PHẢI: KHU VỰC 1 (BỆNH NỀN) & KHU VỰC 2 (LỊCH SỬ KHÁM) */}
          <section className="history-content">
            {/* PHẦN 1: TIỀN SỬ BỆNH / BỆNH NỀN */}
            <div className="chronic-section">
              <div className="section-header-row">
                <h2
                  className="history-content-title"
                  style={{ border: "none", margin: 0, padding: 0 }}
                >
                  <ShieldAlert size={22} color="#d97706" /> Tiền Sử Bệnh & Bệnh
                  Nền
                </h2>
                <button
                  className="btn-primary"
                  style={{
                    fontSize: "0.85rem",
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onClick={handleOpenAddHistory}
                >
                  <Plus size={16} /> Khai báo bệnh nền
                </button>
              </div>

              {loading ? (
                <div className="history-empty" style={{ padding: "20px" }}>
                  Đang tải dữ liệu...
                </div>
              ) : chronicDiseases.length === 0 ? (
                <div className="chronic-empty-box">
                  Chưa có thông tin bệnh nền hoặc dị ứng thuốc nào được khai báo
                  cho hồ sơ này.
                </div>
              ) : (
                <div className="chronic-grid">
                  {chronicDiseases.map((item) => (
                    <div key={item.IdTienSuBenh} className="chronic-card">
                      <div className="chronic-card-top">
                        <div>
                          <div className="chronic-title">{item.TenBenh}</div>
                          <span className="chronic-badge">
                            {item.TrangThai || "Đang điều trị"}
                          </span>
                        </div>
                        <div className="profile-actions">
                          <button
                            title="Sửa bệnh nền"
                            onClick={() => handleOpenEditHistory(item)}
                          >
                            <Edit size={14} color="#0284c7" />
                          </button>
                          <button
                            title="Xóa bệnh nền"
                            onClick={() =>
                              handleDeleteHistory(item.IdTienSuBenh)
                            }
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </div>

                      {item.MoTa && <p className="chronic-desc">{item.MoTa}</p>}

                      <div className="chronic-meta">
                        {item.ThoiDiemMac && (
                          <span>
                            Phát hiện:{" "}
                            {new Date(item.ThoiDiemMac).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                        <span>Ghi nhận: {item.TenNguoiGhiNhan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #e2e8f0",
                margin: "24px 0",
              }}
            />

            {/* PHẦN 2: LỊCH SỬ CÁC LẦN KHÁM BỆNH */}
            <div>
              <h2 className="history-content-title">
                <FileText size={22} color="#0284c7" /> Lịch Sử Khám Bệnh Tại
                Phòng Khám
              </h2>

              {loading ? (
                <div className="history-empty">Đang tải lịch sử khám...</div>
              ) : examHistory.length === 0 ? (
                <div className="history-empty">
                  <FileWarning
                    size={44}
                    color="#cbd5e1"
                    style={{ marginBottom: "10px" }}
                  />
                  <p>Hồ sơ này chưa có lượt khám bệnh nào tại phòng khám.</p>
                </div>
              ) : (
                <div>
                  {examHistory.map((record) => (
                    <div
                      key={record.IdChiTietLD || record.IdLichDat}
                      className="record-card"
                    >
                      <div className="record-header">
                        <div className="record-date">
                          <Calendar size={16} /> Ngày khám: {record.NgayKham}
                          {record.GioBatDau
                            ? ` (${record.GioBatDau.slice(0, 5)})`
                            : ""}
                        </div>
                        <div className="record-doctor">
                          <Stethoscope size={16} color="#0d9488" /> BS Điều trị:{" "}
                          <strong>{record.TenBacSi}</strong>
                        </div>
                      </div>

                      <div className="record-body">
                        <div>
                          <div className="record-section">
                            <div className="record-label">Lý do khám</div>
                            <div className="record-value">
                              {record.LiDoKham || "Khám nha khoa tổng quát"}
                            </div>
                          </div>
                          {record.TrieuChung && (
                            <div className="record-section">
                              <div className="record-label">
                                Triệu chứng lâm sàng
                              </div>
                              <div className="record-value">
                                {record.TrieuChung}
                              </div>
                            </div>
                          )}
                          {(record.NhietDo || record.HuyetAp) && (
                            <div className="vitals-box">
                              {record.NhietDo && (
                                <div className="vital-item">
                                  <Activity size={14} /> Nhiệt độ:{" "}
                                  {record.NhietDo}°C
                                </div>
                              )}
                              {record.HuyetAp && (
                                <div className="vital-item">
                                  <Activity size={14} /> Huyết áp:{" "}
                                  {record.HuyetAp}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="record-section">
                            <div className="record-label">
                              Chẩn đoán (Bác sĩ)
                            </div>
                            <div
                              className="record-value"
                              style={{ color: "#b45309", fontWeight: 600 }}
                            >
                              {record.ChuanDoan || "Chưa có chẩn đoán"}
                            </div>
                          </div>
                          <div className="record-section">
                            <div className="record-label">
                              Kết luận & Hướng điều trị
                            </div>
                            <div
                              className="record-value"
                              style={{ display: "flex", gap: "6px" }}
                            >
                              <ClipboardCheck
                                size={16}
                                color="#16a34a"
                                style={{ flexShrink: 0, marginTop: "2px" }}
                              />
                              <span>
                                {record.KetLuan || "Chưa có kết luận"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL THÊM / SỬA HỒ SƠ NGƯỜI THÂN */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {isEditingRelative
                  ? "Cập nhật hồ sơ người thân"
                  : "Thêm hồ sơ người thân"}
              </h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRelative}>
              {errorMsg && <div className="error-banner">{errorMsg}</div>}

              <div className="form-group">
                <label>Họ và tên người thân (*)</label>
                <input
                  type="text"
                  value={formData.HoTen}
                  onChange={(e) =>
                    setFormData({ ...formData, HoTen: e.target.value })
                  }
                  placeholder="Nhập họ tên đầy đủ"
                  required
                />
              </div>

              <div
                className="form-row"
                style={{ display: "flex", gap: "12px" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Mối quan hệ (*)</label>
                  <select
                    value={formData.MoiQuanHe}
                    onChange={(e) =>
                      setFormData({ ...formData, MoiQuanHe: e.target.value })
                    }
                  >
                    <option value="Cha">Cha</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Vợ">Vợ</option>
                    <option value="Chồng">Chồng</option>
                    <option value="Con">Con</option>
                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giới tính</label>
                  <select
                    value={formData.GioiTinh}
                    onChange={(e) =>
                      setFormData({ ...formData, GioiTinh: e.target.value })
                    }
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: "flex", gap: "12px" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.NgaySinh}
                    onChange={(e) =>
                      setFormData({ ...formData, NgaySinh: e.target.value })
                    }
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.SoDienThoai}
                    onChange={(e) =>
                      setFormData({ ...formData, SoDienThoai: e.target.value })
                    }
                    placeholder="Số điện thoại"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>CCCD / CMND</label>
                <input
                  type="text"
                  value={formData.CCCD}
                  onChange={(e) =>
                    setFormData({ ...formData, CCCD: e.target.value })
                  }
                  placeholder="Số căn cước công dân"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={formData.DiaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, DiaChi: e.target.value })
                  }
                  placeholder="Địa chỉ cư trú"
                />
              </div>

              <div
                className="modal-actions"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / CẬP NHẬT BỆNH NỀN (TIỀN SỬ BỆNH) */}
      {isHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingHistoryId
                  ? "Cập nhật thông tin bệnh nền"
                  : "Khai báo bệnh nền (Tiền sử bệnh)"}
              </h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitHistory}>
              <div className="form-group">
                <label>Tên bệnh / Tình trạng (*)</label>
                <input
                  type="text"
                  value={historyData.TenBenh}
                  onChange={(e) =>
                    setHistoryData({ ...historyData, TenBenh: e.target.value })
                  }
                  placeholder="VD: Tiểu đường, Cao huyết áp, Dị ứng thuốc tê..."
                  required
                />
              </div>

              <div
                className="form-row"
                style={{ display: "flex", gap: "12px" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Trạng thái</label>
                  <select
                    value={historyData.TrangThai}
                    onChange={(e) =>
                      setHistoryData({
                        ...historyData,
                        TrangThai: e.target.value,
                      })
                    }
                  >
                    <option value="Đang điều trị">Đang điều trị</option>
                    <option value="Ổn định">Ổn định</option>
                    <option value="Đã khỏi">Đã khỏi</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Thời điểm phát hiện (nếu nhớ)</label>
                  <input
                    type="date"
                    value={historyData.ThoiDiemMac}
                    onChange={(e) =>
                      setHistoryData({
                        ...historyData,
                        ThoiDiemMac: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết / Lưu ý cho bác sĩ</label>
                <textarea
                  rows={3}
                  value={historyData.MoTa}
                  onChange={(e) =>
                    setHistoryData({ ...historyData, MoTa: e.target.value })
                  }
                  placeholder="Nhập ghi chú thuốc đang dùng hoặc mức độ bệnh..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                className="modal-actions"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsHistoryModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Đang lưu..."
                    : editingHistoryId
                      ? "Cập nhật"
                      : "Lưu bệnh nền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
