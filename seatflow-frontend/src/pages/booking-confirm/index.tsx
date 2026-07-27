import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import bookingApi from '../../services/apis/booking/booking.api';
import paymentApi from '../../services/apis/payment/payment.api';
import CountdownTimer from '../../components/CountdownTimer';
import { CheckCircle, CreditCard, ShieldCheck, AlertCircle, Home, Send } from 'lucide-react';

export const BookingConfirmPage: React.FC = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const userIdStr = localStorage.getItem('userId');
  const userId = userIdStr ? Number(userIdStr) : null;

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: async () => {
      const response = await bookingApi.getBooking({ pathVars: { bookingCode: bookingCode! } });
      return response.data;
    },
    enabled: !!bookingCode,
    refetchInterval: (query) => {
      // If booking is confirmed or expired, stop polling. Otherwise poll every 2s to catch background Kafka confirmations!
      const status = query.state.data?.status;
      return (status === 'PENDING') ? 2000 : false;
    }
  });

  const confirmDirectMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('REQUIRED_LOGIN');
      return bookingApi.confirmBooking({
        body: {
          bookingCode: bookingCode!,
          userId,
          paymentMethod: 'DIRECT_REST',
        },
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      refetch();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đặt vé.');
    }
  });

  const confirmPaymentServiceMutation = useMutation({
    mutationFn: async () => {
      return paymentApi.processPayment({
        body: {
          bookingCode: bookingCode!,
        },
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      // Wait for outbox processor and listener to sync, it will poll and update
      refetch();
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || 'Giao dịch qua Payment Service thất bại.');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Đang nạp thông tin đơn giữ ghế...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-rose-400 font-semibold mb-4">Không tìm thấy mã đặt vé: {bookingCode}</p>
        <Link to="/" className="text-xs text-cyan-400 underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED' || isSuccess;
  const isExpired = booking.status === 'EXPIRED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card rounded-3xl border border-slate-800 p-8 sm:p-10 space-y-8 bg-slate-950">
        {/* Status Header */}
        <div className="text-center space-y-3">
          {isConfirmed ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>
          ) : isExpired ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isConfirmed ? 'Thanh toán Thành Công!' : isExpired ? 'Đơn Đặt Vé Đã Hết Hạn' : 'Xác Nhận Đặt Vé & Thanh Toán'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Mã đơn hàng: <strong className="text-cyan-300 font-bold">{booking.bookingCode}</strong>
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex gap-3 items-start text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Countdown Timer Bar if Pending */}
        {!isConfirmed && !isExpired && (
          <div className="flex justify-center">
            <CountdownTimer expiresAt={booking.expiresAt} onExpire={() => refetch()} />
          </div>
        )}

        {/* Booking Details Card */}
        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-4 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Sự kiện:</span>
            <span className="font-bold text-white text-sm">{booking.eventTitle}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Ghế đã đặt:</span>
            <div className="flex gap-2">
              {booking.seats?.map((seat) => (
                <span key={seat.id} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold">
                  {seat.seatNumber}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Trạng thái:</span>
            <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] uppercase ${
              isConfirmed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
              isExpired ? 'bg-rose-950 text-rose-400 border border-rose-500/40' :
              'bg-amber-950 text-amber-400 border border-amber-500/40'
            }`}>
              {booking.status}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-sm">
            <span className="font-bold text-slate-200">Tổng thanh toán:</span>
            <span className="text-xl font-black text-cyan-400 font-mono">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        {!isConfirmed && !isExpired && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Service Option (simulates mock event-driven flow) */}
            <button
              disabled={confirmPaymentServiceMutation.isPending || confirmDirectMutation.isPending}
              onClick={() => confirmPaymentServiceMutation.mutate()}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {confirmPaymentServiceMutation.isPending ? 'Đang thanh toán...' : 'Thanh toán qua Payment Service (Kafka)'}
              </span>
            </button>

            {/* Direct REST confirmation option */}
            <button
              disabled={confirmPaymentServiceMutation.isPending || confirmDirectMutation.isPending}
              onClick={() => confirmDirectMutation.mutate()}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {confirmDirectMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận trực tiếp (REST API)'}
              </span>
            </button>
          </div>
        )}

        {isConfirmed && (
          <div className="text-center pt-4">
            <p className="text-xs text-emerald-400 mb-6 font-medium">Vé điện tử của bạn đã được khởi tạo và ghi vào hệ thống event outbox.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Trở về trang chủ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmPage;
