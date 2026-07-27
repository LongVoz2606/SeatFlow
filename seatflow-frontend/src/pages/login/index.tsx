import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/apis/auth/auth.api';
import {
  Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, CheckCircle,
  Ticket, Zap, ShieldCheck, TrendingUp, Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Đặt vé tức thì', desc: 'Redis Lock chống overselling, giữ ghế real-time.' },
  { icon: ShieldCheck, title: 'An toàn & bảo mật', desc: 'Xác thực JWT, mã hoá thông tin thanh toán.' },
  { icon: TrendingUp, title: 'Sự kiện HOT mỗi ngày', desc: 'Cập nhật liên tục từ hàng trăm nhà tổ chức.' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login({
          body: {
            usernameOrEmail: email,
            password: password,
          },
        });

        if (response.success && response.data) {
          const { accessToken, username: userUsername, userId, role } = response.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('username', userUsername);
          localStorage.setItem('userId', String(userId));
          localStorage.setItem('role', role);
          navigate('/');
        } else {
          setError(response.message || 'Đăng nhập không thành công.');
        }
      } else {
        const response = await authApi.register({
          body: {
            username: username,
            email: email,
            password: password,
            fullName: fullName,
          },
        });

        if (response.success) {
          setSuccessMessage('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
          setEmail(username); // Populate login email input with the registered username
          setPassword('');
          setUsername('');
          setFullName('');
        } else {
          setError(response.message || 'Đăng ký không thành công.');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem-73px)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left decorative panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 items-center justify-center p-12">
        <div className="absolute w-[28rem] h-[28rem] bg-cyan-500/20 rounded-full blur-3xl -top-32 -left-32 animate-blob" />
        <div className="absolute w-[24rem] h-[24rem] bg-blue-600/20 rounded-full blur-3xl -bottom-24 -right-16 animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute w-72 h-72 bg-purple-500/10 rounded-full blur-3xl top-1/3 right-1/4 animate-blob" style={{ animationDelay: '8s' }} />

        <Ticket className="absolute top-16 right-20 w-10 h-10 text-cyan-400/30 animate-float" />
        <Sparkles className="absolute bottom-24 left-16 w-8 h-8 text-blue-400/30 animate-float-delayed" />
        <ShieldCheck className="absolute top-1/2 left-10 w-9 h-9 text-cyan-300/20 animate-float" />

        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-8">
            <Ticket className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">
            Chào mừng đến với{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">SeatFlow</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Nền tảng đặt vé sự kiện hiệu năng cao — nơi hàng nghìn khán giả và nhà tổ chức gặp nhau mỗi ngày.
          </p>

          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-4 py-12 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="glass-card border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden bg-slate-950">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center mb-8 lg:hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
                <Ticket className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                {isLogin ? 'Chào mừng quay trở lại' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-slate-400 text-xs">
                Hệ thống đặt vé sự kiện hiệu năng cao SeatFlow
              </p>

              <div className="flex bg-slate-900/80 p-1 rounded-xl mt-6 border border-slate-800">
                <button
                  onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isLogin ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isLogin ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đăng Ký
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex gap-3 items-start text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex gap-3 items-start text-xs text-emerald-300">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">USERNAME</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập username"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">HỌ VÀ TÊN</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                  {isLogin ? 'USERNAME HOẶC EMAIL' : 'EMAIL'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLogin ? "Nhập username hoặc email" : "Nhập email của bạn"}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">MẬT KHẨU</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : isLogin ? (
                  <>
                    <span>Đăng Nhập Ngay</span>
                    <LogIn className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Đăng Ký Tài Khoản</span>
                    <UserPlus className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
