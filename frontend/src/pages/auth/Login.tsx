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
    <div  className="max-w-105! [margin:40px_auto]!">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-9!" >
        <div  className="text-center! mb-7!">
          <div
             className="w-14! h-14! bg-sky-100! rounded-full! flex! items-center! justify-center! [margin:0_auto_16px_auto]!"
          >
            <LogIn size={28} color="#0284c7" />
          </div>
          <h2  className="text-[22px]! text-slate-900!">
            Đăng Nhập Hệ Thống
          </h2>
          <p  className="text-slate-500! text-[14px]! mt-1!">
            Vui lòng nhập tài khoản được cấp để truy cập
          </p>
        </div>

        {error && (
          <div
             className="[background:#fef2f2]! [border:1px_solid_#fecaca]! [color:#991b1b]! p-3! rounded-[8px]! flex! items-center! gap-2! text-[14px]! mb-5!"
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
           className="flex! flex-col! gap-[18px]!"
        >
          <div>
            <label
               className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!"
            >
              Tên tài khoản
            </label>
            <div  className="relative!">
              <User
                size={18}
                color="#94a3b8"
                 className="absolute! [left:12px]! [top:50%]! [transform:translateY(-50%)]!"
              />
              <input
                type="text"
                name="TenTaiKhoan"
                value={credentials.TenTaiKhoan}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 pl-[38px]!"
                placeholder="Nhập username..."

              />
            </div>
          </div>

          <div>
            <label
               className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!"
            >
              Mật khẩu
            </label>
            <div  className="relative!">
              <Lock
                size={18}
                color="#94a3b8"
                 className="absolute! [left:12px]! [top:50%]! [transform:translateY(-50%)]!"
              />
              <input
                type="password"
                name="MatKhau"
                value={credentials.MatKhau}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 pl-[38px]!"
                placeholder="••••••••"

              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 w-full! p-3! text-[15px]! mt-2!"

          >
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>

        <div
           className="text-center! mt-6! text-[14px]! text-slate-500! [border-top:1px_solid_#e2e8f0]! pt-5!"
        >
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
             className="text-sky-600! font-semibold! no-underline!"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
