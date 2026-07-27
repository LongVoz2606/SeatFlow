import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEventDetail, holdSeats } from '../services/api';
import { SeatMap } from '../components/SeatMap';
import { Seat } from '../types';
import { Calendar, MapPin, Ticket, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = Number(id);

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: event, isLoading, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventDetail(eventId),
    enabled: !isNaN(eventId),
  });

  const holdMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = `HOLD-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      return holdSeats(
        {
          eventId,
          userId: 2, // Default user John Doe
          seatIds: selectedSeats.map((s) => s.id),
        },
        idempotencyKey
      );
    },
    onSuccess: (booking) => {
      navigate(`/bookings/${booking.bookingCode}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể giữ ghế. Vui lòng chọn lại.';
      setErrorMessage(msg);
      refetch(); // Refresh seat map
    },
  });

  const handleToggleSeat = (seat: Seat) => {
    setErrorMessage(null);
    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMessage('Tối đa 6 ghế mỗi lần đặt.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalAmount = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Đang tải sơ đồ ghế sự kiện...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center">
        <p className="text-rose-400 font-semibold mb-4">Không tìm thấy sự kiện.</p>
        <Link to="/" className="text-xs text-cyan-400 underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách sự kiện</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Seat Map Area */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{event.title}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{event.location}</span>
              </p>
            </div>

            <button
              onClick={() => refetch()}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Làm mới sơ đồ
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <SeatMap
            seats={event.seats || []}
            selectedSeatIds={selectedSeats.map((s) => s.id)}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        {/* Sidebar Summary & Action */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 h-fit space-y-6">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-4">
            Thông tin đặt vé
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{new Date(event.eventDate).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>Ghế đang chọn: <strong className="text-cyan-300 font-mono">{selectedSeats.length}</strong></span>
            </div>
          </div>

          {/* Selected Seat List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Danh sách ghế:</span>
            {selectedSeats.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Chưa chọn ghế nào trên sơ đồ.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Tổng tiền:</span>
            <span className="text-lg font-black text-cyan-400 font-mono">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
            </span>
          </div>

          <button
            disabled={selectedSeats.length === 0 || holdMutation.isPending}
            onClick={() => holdMutation.mutate()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {holdMutation.isPending ? (
              <span>Đang khoá giữ ghế bằng Redis Lock...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Giữ ghế & Thanh toán (5 phút)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
