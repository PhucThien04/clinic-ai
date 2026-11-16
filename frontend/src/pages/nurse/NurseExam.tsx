import React, { useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { Search, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface VitalsForm {
  NhietDo: string;
  HuyetApTamThu: string;
  HuyetApTamTruong: string;
  NhipTim: string;
  NhipTho: string;
  CanNang: string;
  ChieuCao: string;
  TrieuChung: string;
  MucDo: string;
  GhiChu: string;
}

export default function NurseExam(): React.JSX.Element {
  const [idHoSoBenhNhan, setIdHoSoBenhNhan] = useState<string>("");
  const [vitals, setVitals] = useState<VitalsForm>({
    NhietDo: "",
    HuyetApTamThu: "",
    HuyetApTamTruong: "",
    NhipTim: "",
    NhipTho: "",
    CanNang: "",
    ChieuCao: "",
    TrieuChung: "",
    MucDo: "Trung bình",
    GhiChu: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    setLoading(true);

    try {
      // Yêu cầu phải gửi lên endpoint ghi nhận sinh hiệu
      const res = await API.put("/examinations/vitals", {
        idHoSoBenhNhan,
        ...vitals,
      });
      setStatus({
        type: "success",
        msg: res.data.message || "Cập nhật sinh hiệu lâm sàng thành công!",
      });
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật sinh hiệu!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", color: "#0f172a", marginBottom: "8px" }}>
          Bàn Làm Việc Y Tá
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
          Ghi nhận chỉ số sinh hiệu và triệu chứng khởi phát của bệnh nhân.
        </p>

        {status.msg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              background: status.type === "success" ? "#dcfce7" : "#fee2e2",
              color: status.type === "success" ? "#166534" : "#991b1b",
              border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              {status.msg}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Mã Hồ Sơ */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Nhập Mã Hồ Sơ Bệnh Nhân <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                value={idHoSoBenhNhan}
                onChange={(e) => setIdHoSoBenhNhan(e.target.value)}
                placeholder="VD: HS26100000001"
                required
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }}
          ></div>

          {/* Vitals Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
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
                Nhiệt độ (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="NhietDo"
                value={vitals.NhietDo}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 37.0"
              />
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
                Nhịp tim (lần/phút)
              </label>
              <input
                type="number"
                name="NhipTim"
                value={vitals.NhipTim}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 80"
              />
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
                Huyết áp tâm thu (mmHg)
              </label>
              <input
                type="number"
                name="HuyetApTamThu"
                value={vitals.HuyetApTamThu}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 120"
              />
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
                Huyết áp tâm trương (mmHg)
              </label>
              <input
                type="number"
                name="HuyetApTamTruong"
                value={vitals.HuyetApTamTruong}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 80"
              />
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
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="CanNang"
                value={vitals.CanNang}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 65.5"
              />
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
                Chiều cao (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="ChieuCao"
                value={vitals.ChieuCao}
                onChange={handleChange}
                className="input-field"
                placeholder="Ví dụ: 170"
              />
            </div>
          </div>

          <div
            style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }}
          ></div>

          {/* Triệu chứng & Ghi chú */}
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
              Triệu chứng khởi phát
            </label>
            <input
              type="text"
              name="TrieuChung"
              value={vitals.TrieuChung}
              onChange={handleChange}
              className="input-field"
              placeholder="Mô tả triệu chứng bệnh nhân khai báo..."
            />
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
              Mức độ đau / nghiêm trọng
            </label>
            <select
              name="MucDo"
              value={vitals.MucDo}
              onChange={handleChange}
              className="input-field"
              style={{ background: "#fff" }}
            >
              <option value="Nhẹ">Nhẹ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Nặng">Nặng</option>
            </select>
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
              Ghi chú lâm sàng
            </label>
            <textarea
              name="GhiChu"
              value={vitals.GhiChu}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Các lưu ý khác của Y tá..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: "12px",
              fontSize: "15px",
              justifyContent: "center",
            }}
          >
            <Save size={18} />{" "}
            {loading ? "Đang lưu dữ liệu..." : "Lưu Sinh Hiệu & Triệu Chứng"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
