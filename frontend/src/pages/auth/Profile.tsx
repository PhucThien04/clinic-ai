import React, { useState, useEffect } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { User, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface UserProfile {
  IdTaiKhoan: string;
  TenTaiKhoan: string;
  HoTen: string;
  CCCD: string;
  NgaySinh: string | null;
  GioiTinh: string | null;
  Email: string | null;
  SoDienThoai: string;
  DiaChi: string | null;
  VaiTro: string;
}

export default function Profile(): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profile");

      // Xử lý map dữ liệu chữ thường/PascalCase từ PostgreSQL
      const rawData = res.data;
      const normalizedProfile: UserProfile = {
        IdTaiKhoan: rawData.IdTaiKhoan || rawData.idtaikhoan,
        TenTaiKhoan: rawData.TenTaiKhoan || rawData.tentaikhoan,
        HoTen: rawData.HoTen || rawData.hoten,
        CCCD: rawData.CCCD || rawData.cccd,
        NgaySinh:
          rawData.NgaySinh || rawData.ngaysinh
            ? new Date(rawData.NgaySinh || rawData.ngaysinh)
                .toISOString()
                .split("T")[0]
            : "", // Chuyển đổi để hiển thị trên input type="date"
        GioiTinh: rawData.GioiTinh || rawData.gioitinh || "",
        Email: rawData.Email || rawData.email || "",
        SoDienThoai: rawData.SoDienThoai || rawData.sodienthoai,
        DiaChi: rawData.DiaChi || rawData.diachi || "",
        VaiTro: rawData.VaiTro || rawData.vaitro,
      };

      setProfile(normalizedProfile);
    } catch (err: any) {
      setStatus({ type: "error", msg: "Lỗi khi tải thông tin cá nhân." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setStatus({ type: "", msg: "" });
    setSaving(true);

    try {
      const res = await API.put("/profile", {
        HoTen: profile.HoTen,
        NgaySinh: profile.NgaySinh || null,
        GioiTinh: profile.GioiTinh || null,
        Email: profile.Email || null,
        SoDienThoai: profile.SoDienThoai,
        DiaChi: profile.DiaChi || null,
      });

      setStatus({ type: "success", msg: res.data.message });

      // Cập nhật lại thông tin lưu trên localStorage để Header/Sidebar hiển thị đúng
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.HoTen = profile.HoTen;
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật thông tin cá nhân.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", color: "#0f172a", marginBottom: "8px" }}>
          Thông Tin Cá Nhân
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
          Quản lý và cập nhật thông tin tài khoản của bạn trên hệ thống.
        </p>

        {loading ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            Đang tải dữ liệu...
          </div>
        ) : profile ? (
          <div className="card" style={{ padding: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "30px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "#e0f2fe",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={32} color="#0284c7" />
              </div>
              <div>
                <h2 style={{ fontSize: "20px", color: "#0f172a", margin: 0 }}>
                  {profile.HoTen}
                </h2>
                <div
                  style={{
                    display: "inline-block",
                    background: "#f1f5f9",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    marginTop: "6px",
                  }}
                >
                  Vai trò: {profile.VaiTro}
                </div>
              </div>
            </div>

            {status.msg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "24px",
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
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Các trường Không cho phép sửa */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
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
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    value={profile.TenTaiKhoan}
                    disabled
                    className="input-field"
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
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
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    value={profile.CCCD}
                    disabled
                    className="input-field"
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "#e2e8f0",
                  margin: "4px 0",
                }}
              ></div>

              {/* Các trường Cho phép sửa */}
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
                  Họ và Tên <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="HoTen"
                  value={profile.HoTen}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
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
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="NgaySinh"
                    value={profile.NgaySinh || ""}
                    onChange={handleChange}
                    className="input-field"
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
                    Giới tính
                  </label>
                  <select
                    name="GioiTinh"
                    value={profile.GioiTinh || ""}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
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
                    Số điện thoại <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="SoDienThoai"
                    value={profile.SoDienThoai}
                    onChange={handleChange}
                    required
                    className="input-field"
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={profile.Email || ""}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
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
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="DiaChi"
                  value={profile.DiaChi || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: "12px 30px" }}
                >
                  <Save size={18} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}
          >
            Không tải được thông tin tài khoản!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
