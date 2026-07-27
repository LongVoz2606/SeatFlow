import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../../services/apis/user/user.api';
import bookingApi from '../../services/apis/booking/booking.api';
import eventApi from '../../services/apis/event/event.api';
import CountdownTimer from '../../components/CountdownTimer';
import { 
  User, Ticket, History, ShoppingCart, LogOut, Save, ShieldAlert, CheckCircle, ExternalLink, Calendar, Wallet 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // Active tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'tickets' | 'transactions' | 'cart'>('profile');

  // Edit form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification banners
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if unauthorized
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const response = await userApi.getMyProfile();
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch bookings list
  const { data: bookings, isLoading: isBookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await bookingApi.getMyBookings();
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch events list to resolve event titles if empty
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventApi.getEvents();
      return response.data;
    },
    enabled: !!token,
  });

  // Populate edit fields when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (body: { fullName: string; phone: string; avatarUrl: string }) => {
      return userApi.updateProfile({ body });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['myProfile'], res.data);
      setSuccessMsg('Cập nhật thông tin cá nhân thành công!');
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
      setSuccessMsg(null);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ fullName, phone, avatarUrl });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper to map eventId to Title
  const resolveEventTitle = (eventId: number, backendTitle?: string) => {
    if (backendTitle && backendTitle !== "") return backendTitle;
    const match = events?.find(e => e.id === eventId);
    return match ? match.title : `Sự kiện #${eventId}`;
  };

  const isPageLoading = isProfileLoading || isBookingsLoading;

  if (isPageLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Filter bookings
  const pendingBookings = bookings?.filter(b => b.status === 'PENDING') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 glass-card border border-slate-800 rounded-3xl p-6 h-fit bg-slate-950 flex flex-col justify-between">
          <div className="space-y-6">
            {/* User card info */}
            <div className="text-center pb-6 border-b border-slate-800">
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-2xl mb-4 overflow-hidden border-2 border-cyan-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.username?.substring(0, 2).toUpperCase()
                )}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{profile?.fullName}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">@{profile?.username}</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('profile'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Thông tin cá nhân</span>
              </button>
              <button
                onClick={() => { setActiveTab('tickets'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'tickets' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4" />
                  <span>Vé của tôi</span>
                </div>
                {confirmedBookings.length > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${
                    activeTab === 'tickets' ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-950 text-cyan-300'
                  }`}>{confirmedBookings.length}</span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('cart'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'cart' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Giỏ hàng giữ chỗ</span>
                </div>
                {pendingBookings.length > 0 && (
                  <span className="px-2 py-0.5 text-[9px] bg-rose-500 text-slate-950 rounded-full font-bold animate-pulse">
                    {pendingBookings.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('transactions'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                  activeTab === 'transactions' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Lịch sử giao dịch</span>
              </button>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-8 py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-950 min-h-[50vh]">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex gap-3 items-start text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex gap-3 items-start text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Profile Edit */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Thông tin cá nhân</span>
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.username || ''}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Ngày tham gia</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : ''}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Đường dẫn ảnh đại diện (Avatar URL)</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu cập nhật</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Confirmed Tickets */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" />
                <span>Vé của tôi</span>
              </h2>
              {confirmedBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm italic">
                  Bạn chưa sở hữu tấm vé nào. Hãy chọn sự kiện và mua vé ngay nhé!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {confirmedBookings.map((b) => (
                    <div key={b.id} className="p-5 border border-slate-800 bg-slate-900/30 rounded-2xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest">{b.bookingCode}</span>
                          <span className="px-2 py-0.5 text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full font-bold uppercase">CONFIRMED</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{resolveEventTitle(b.eventId, b.eventTitle)}</h4>
                        
                        <div className="space-y-1.5 text-[11px] text-slate-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Mua ngày: {new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ghế: {b.seats?.map(s => s.seatNumber).join(', ') || 'Đang cập nhật'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                        <span className="text-cyan-400 font-mono font-bold text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}
                        </span>
                        <a
                          href={`/bookings/${b.bookingCode}`}
                          className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                        >
                          Xem chi tiết <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Transaction History */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <span>Lịch sử giao dịch</span>
              </h2>
              {!bookings || bookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm italic">
                  Chưa có giao dịch nào được ghi nhận.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 pr-4">Mã đơn</th>
                        <th className="pb-3 pr-4">Sự kiện</th>
                        <th className="pb-3 pr-4">Thời gian</th>
                        <th className="pb-3 pr-4">Tổng tiền</th>
                        <th className="pb-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-mono font-bold text-cyan-400">
                            <a href={`/bookings/${b.bookingCode}`} className="hover:underline">{b.bookingCode}</a>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-white truncate max-w-[150px]">{resolveEventTitle(b.eventId, b.eventTitle)}</td>
                          <td className="py-3 pr-4 text-slate-400">{new Date(b.createdAt).toLocaleString('vi-VN')}</td>
                          <td className="py-3 pr-4 font-mono">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                              b.status === 'EXPIRED' ? 'bg-rose-950 text-rose-400 border border-rose-500/40' :
                              'bg-amber-950 text-amber-400 border border-amber-500/40'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Cart (Pending Holds) */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <span>Giỏ hàng giữ chỗ</span>
              </h2>
              {pendingBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm italic">
                  Giỏ hàng trống. Không có ghế nào đang được giữ chỗ.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((b) => (
                    <div key={b.id} className="p-5 border border-slate-800 bg-slate-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest">{b.bookingCode}</span>
                          <span className="px-2 py-0.5 text-[8px] bg-amber-950 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase">PENDING</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{resolveEventTitle(b.eventId, b.eventTitle)}</h4>
                        <p className="text-xs text-slate-400">
                          Ghế đã giữ: <span className="text-cyan-300 font-mono font-bold">{b.seats?.map(s => s.seatNumber).join(', ')}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Countdown Timer */}
                        <div className="scale-95 origin-left">
                          <CountdownTimer expiresAt={b.expiresAt} onExpire={() => refetchBookings()} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-cyan-400 font-mono font-black text-base mb-1.5">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}
                          </span>
                          <button
                            onClick={() => navigate(`/bookings/${b.bookingCode}`)}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/10"
                          >
                            Thanh toán ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
