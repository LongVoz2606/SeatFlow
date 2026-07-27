import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import bookingApi from '../../../services/apis/booking/booking.api';

const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CANCELLED: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  EXPIRED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const AdminBookingsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: async () => {
      const response = await bookingApi.adminListBookings({ params: { page, size } });
      return response.data;
    },
  });

  return (
    <div>
      <div className="glass-card border border-cyan-500/30 rounded-2xl p-5 mb-6 bg-slate-950 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Tổng doanh thu (đã xác nhận)</p>
          <p className="text-xl font-black text-white">{formatPrice(data?.totalRevenue ?? 0)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400">Đang tải...</div>
      ) : (
        <div className="space-y-2">
          {data?.page.content.map((booking) => (
            <div key={booking.id} className="glass-card border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-950">
              <div>
                <h4 className="font-bold text-white text-sm">{booking.bookingCode}</h4>
                <p className="text-xs text-slate-400">
                  User #{booking.userId} • Event #{booking.eventId} • {new Date(booking.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-cyan-300">{formatPrice(booking.totalAmount)}</span>
                <span className={`py-1 px-3 rounded-full border text-[10px] font-bold ${statusStyles[booking.status] ?? ''}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.page.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400">Trang {data.page.page + 1}/{data.page.totalPages}</span>
          <button disabled={page + 1 >= data.page.totalPages} onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsTab;
