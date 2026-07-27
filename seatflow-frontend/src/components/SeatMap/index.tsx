import React from 'react';
import { ISeat } from '../../types';
import { Check } from 'lucide-react';

interface ISeatMapProps {
  seats: ISeat[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: ISeat) => void;
}

const SeatMap: React.FC<ISeatMapProps> = ({ seats, selectedSeatIds, onToggleSeat }) => {
  // Group seats by row
  const rows = React.useMemo(() => {
    const map: Record<string, ISeat[]> = {};
    seats.forEach((seat) => {
      if (!map[seat.seatRow]) map[seat.seatRow] = [];
      map[seat.seatRow].push(seat);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Screen Visualization */}
      <div className="w-full max-w-xl mb-10 text-center">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-2" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">STAGE / SÂN KHẤU</span>
      </div>

      {/* Seat Rows Grid */}
      <div className="space-y-4 max-w-full overflow-x-auto pb-4">
        {rows.map(([rowName, rowSeats]) => (
          <div key={rowName} className="flex items-center gap-3">
            <span className="w-6 text-center font-bold text-xs text-slate-400">{rowName}</span>

            <div className="flex items-center gap-2">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                const isAvailable = seat.status === 'AVAILABLE';
                const isHeld = seat.status === 'HELD';
                const isBooked = seat.status === 'BOOKED';

                let bgClass = 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700';
                if (isBooked) {
                  bgClass = 'bg-slate-900 text-slate-600 border border-slate-800 opacity-60 cursor-not-allowed';
                } else if (isHeld) {
                  bgClass = 'bg-amber-950/80 text-amber-400 border border-amber-500/40 cursor-not-allowed';
                } else if (isSelected) {
                  bgClass = 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105';
                } else if (isAvailable) {
                  bgClass = seat.seatType === 'VIP'
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:bg-purple-900/60 hover:scale-105'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:scale-105';
                }

                return (
                  <button
                    key={seat.id}
                    disabled={!isAvailable || isBooked || isHeld}
                    onClick={() => onToggleSeat(seat)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-200 ${bgClass}`}
                    title={`Ghế ${seat.seatNumber} (${seat.seatType}) - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}`}
                  >
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : seat.seatNumber}
                  </button>
                );
              })}
            </div>

            <span className="w-6 text-center font-bold text-xs text-slate-400">{rowName}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 glass-card px-6 py-3 rounded-full border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700" />
          <span>Thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-950/60 border border-purple-500/40" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">✓</div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/80 border border-amber-500/40" />
          <span>Đang giữ (HELD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-900 border border-slate-800 opacity-60" />
          <span>Đã bán</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
