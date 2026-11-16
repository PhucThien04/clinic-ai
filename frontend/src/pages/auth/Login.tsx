import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";

export default function Login(): React.JSX.Element {
  const [credentials, setCredentials] = useState({
    TenTaiKhoan: "",
    MatKhau: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(credentials);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Tên tài khoản hoặc mật khẩu không chính xác!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "40px auto" }}>
      <div className="card" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#e0f2fe",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <LogIn size={28} color="#0284c7" />
          </div>
          <h2 style={{ fontSize: "22px", color: "#0f172a" }}>
            Đăng Nhập Hệ Thống
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Vui lòng nhập tài khoản được cấp để truy cập
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Tên tài khoản
            </label>
            <div style={{ position: "relative" }}>
              <User
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
                name="TenTaiKhoan"
                value={credentials.TenTaiKhoan}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nhập username..."
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <Lock
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
                type="password"
                name="MatKhau"
                value={credentials.MatKhau}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              marginTop: "8px",
            }}
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "#64748b",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "20px",
          }}
        >
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{
              color: "#0284c7",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
