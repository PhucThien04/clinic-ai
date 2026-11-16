import React, { useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  Search,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Activity,
  Stethoscope,
} from "lucide-react";

interface PatientRecord {
  IdHoSoBenhNhan: string;
  NhietDo?: string;
  HuyetApTamThu?: string;
  HuyetApTamTruong?: string;
  NhipTim?: string;
  NhipTho?: string;
  CanNang?: string;
  ChieuCao?: string;
  TrieuChung?: string;
  MucDo?: string;
  GhiChu?: string;
}

interface DiagnosisForm {
  ChuanDoan: string;
  KetLuan: string;
}

export default function DoctorExam(): React.JSX.Element {
  const [idHoSoBenhNhan, setIdHoSoBenhNhan] = useState<string>("");
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(
    null,
  );
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisForm>({
    ChuanDoan: "",
    KetLuan: "",
  });

  const [searchStatus, setSearchStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Hàm tìm kiếm hồ sơ bệnh nhân do Y tá đã cập nhật sinh hiệu
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchStatus({ type: "", msg: "" });
    setSaveStatus({ type: "", msg: "" });
    setLoadingSearch(true);
    setPatientRecord(null);

    try {
      // Gọi API lấy thông tin hồ sơ theo ID
      const res = await API.get(`/examinations/patient/${idHoSoBenhNhan}`);

      const rawData = res.data;

      // Xử lý đồng bộ chữ thường/PascalCase từ PostgreSQL
      const normalizedRecord: PatientRecord = {
        IdHoSoBenhNhan: rawData.IdHoSoBenhNhan || rawData.idhosobenhnhan,
        NhietDo: rawData.NhietDo || rawData.nhietdo,
        HuyetApTamThu: rawData.HuyetApTamThu || rawData.huyetaptamthu,
        HuyetApTamTruong: rawData.HuyetApTamTruong || rawData.huyetaptamtruong,
        NhipTim: rawData.NhipTim || rawData.nhiptim,
        NhipTho: rawData.NhipTho || rawData.nhiptho,
        CanNang: rawData.CanNang || rawData.cannang,
        ChieuCao: rawData.ChieuCao || rawData.chieucao,
        TrieuChung: rawData.TrieuChung || rawData.trieuchung,
        MucDo: rawData.MucDo || rawData.mucdo,
        GhiChu: rawData.GhiChu || rawData.ghichu,
      };

      setPatientRecord(normalizedRecord);

      setDiagnosisData({
        ChuanDoan: rawData.ChuanDoan || rawData.chuandoan || "",
        KetLuan: rawData.KetLuan || rawData.ketluan || "",
      });

      setSearchStatus({
        type: "success",
        msg: "Đã tải hồ sơ bệnh nhân thành công.",
      });
    } catch (err: any) {
      setSearchStatus({
        type: "error",
        msg:
          err.response?.data?.error ||
          "Không tìm thấy hồ sơ bệnh nhân hoặc có lỗi xảy ra!",
      });
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiagnosisData({ ...diagnosisData, [e.target.name]: e.target.value });
  };

  // Hàm lưu chẩn đoán của Bác sĩ
  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientRecord) return;

    setSaveStatus({ type: "", msg: "" });
    setLoadingSave(true);

    try {
      const res = await API.put("/examinations/diagnosis", {
        idHoSoBenhNhan: patientRecord.IdHoSoBenhNhan,
        ...diagnosisData,
      });
      setSaveStatus({
        type: "success",
        msg: res.data.message || "Cập nhật chẩn đoán và kết luận thành công!",
      });
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật chẩn đoán!",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header Title */}
        <div>
          <h1
            style={{ fontSize: "24px", color: "#0f172a", marginBottom: "8px" }}
          >
            Phòng Khám Bác Sĩ
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Tra cứu sinh hiệu từ Y tá, thực hiện chẩn đoán và tham khảo Trợ lý
            AI.
          </p>
        </div>

        {/* 1. Khu vực tìm kiếm hồ sơ */}
        <div className="card">
          <h2
            style={{
              fontSize: "16px",
              color: "#1e293b",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search size={18} color="#0284c7" /> Tìm Kiếm Hồ Sơ Khám
          </h2>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "12px" }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                value={idHoSoBenhNhan}
                onChange={(e) => setIdHoSoBenhNhan(e.target.value)}
                placeholder="Nhập Mã Hồ Sơ Bệnh Nhân (VD: HS26100000001)..."
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="btn btn-primary"
              style={{ padding: "10px 24px", whiteSpace: "nowrap" }}
            >
              {loadingSearch ? "Đang tìm..." : "Tra cứu"}
            </button>
          </form>

          {searchStatus.msg && (
            <div
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: searchStatus.type === "success" ? "#166534" : "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {searchStatus.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {searchStatus.msg}
            </div>
          )}
        </div>

        {/* 2. Khu vực hiển thị thông tin nếu tìm thấy hồ sơ */}
        {patientRecord && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Cột trái: Thông tin khám bệnh (Sinh hiệu + Chẩn đoán) */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Thông tin Sinh hiệu từ Y tá */}
              <div className="card" style={{ borderLeft: "4px solid #0ea5e9" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    color: "#0f172a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Activity size={18} color="#0ea5e9" /> Dữ liệu sinh hiệu lâm
                  sàng (Từ Y tá)
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Huyết áp
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {patientRecord.HuyetApTamThu || "--"}/
                      {patientRecord.HuyetApTamTruong || "--"} mmHg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Nhịp tim
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {patientRecord.NhipTim || "--"} bpm
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Nhiệt độ
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {patientRecord.NhietDo || "--"} °C
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Cân nặng/Chiều cao
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {patientRecord.CanNang || "--"} kg /{" "}
                      {patientRecord.ChieuCao || "--"} cm
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "16px", fontSize: "14px" }}>
                  <strong style={{ color: "#334155" }}>
                    Triệu chứng khởi phát:
                  </strong>{" "}
                  <span style={{ color: "#ef4444", fontWeight: 500 }}>
                    {patientRecord.TrieuChung || "Không có ghi nhận"} (Mức độ:{" "}
                    {patientRecord.MucDo || "--"})
                  </span>
                </div>
                {patientRecord.GhiChu && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    * Ghi chú Y tá: {patientRecord.GhiChu}
                  </div>
                )}
              </div>

              {/* Form Chẩn đoán của Bác sĩ */}
              <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    color: "#0f172a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Stethoscope size={18} color="#10b981" /> Cập nhật Chẩn đoán &
                  Kết luận
                </h3>

                {saveStatus.msg && (
                  <div
                    style={{
                      marginBottom: "16px",
                      fontSize: "13px",
                      color:
                        saveStatus.type === "success" ? "#166534" : "#991b1b",
                      background:
                        saveStatus.type === "success" ? "#dcfce7" : "#fee2e2",
                      padding: "10px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {saveStatus.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {saveStatus.msg}
                  </div>
                )}

                <form
                  onSubmit={handleSaveDiagnosis}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "6px",
                      }}
                    >
                      Chẩn đoán Y khoa <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      name="ChuanDoan"
                      value={diagnosisData.ChuanDoan}
                      onChange={handleChange}
                      rows={3}
                      required
                      placeholder="Nhập chẩn đoán chuyên môn..."
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                      }}
                    ></textarea>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "6px",
                      }}
                    >
                      Kết luận & Hướng điều trị{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      name="KetLuan"
                      value={diagnosisData.KetLuan}
                      onChange={handleChange}
                      rows={4}
                      required
                      placeholder="Đưa ra phác đồ điều trị, đơn thuốc hoặc lời khuyên..."
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                      }}
                    ></textarea>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={loadingSave}
                      className="btn"
                      style={{
                        background: "#10b981",
                        color: "white",
                        padding: "10px 24px",
                      }}
                    >
                      <Save size={18} />{" "}
                      {loadingSave ? "Đang lưu..." : "Lưu Hồ Sơ Khám"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Cột phải: Khu vực Trợ lý AI (Placeholder cho Tuần 11-12) */}
            <div
              className="card"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#ccfbf1",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={16} color="#0d9488" />
                </div>
                <h3 style={{ fontSize: "16px", color: "#0f172a" }}>
                  Phân Tích AI
                </h3>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  marginBottom: "20px",
                }}
              >
                Trợ lý AI giúp tổng hợp tiền sử bệnh án, phân tích chỉ số lâm
                sàng hiện tại và đưa ra cảnh báo sớm. (Tính năng sẽ được kích
                hoạt vào giai đoạn sau theo kế hoạch đồ án).
              </div>

              <button
                className="btn btn-outline"
                disabled
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: "13px",
                  opacity: 0.6,
                }}
              >
                <Sparkles size={14} /> Tóm tắt tiền sử bệnh
              </button>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                AI hỗ trợ lâm sàng, không thay thế quyết định chuyên môn của bác
                sĩ.
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
