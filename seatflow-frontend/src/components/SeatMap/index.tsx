import React from 'react';
import { ISeat, IZone } from '../../types';
import { Check } from 'lucide-react';
import { computeCombinedBounds, computeSeatAbsolutePosition } from '../../utils/seatLayout';

interface ISeatMapProps {
  seats: ISeat[];
  zones?: IZone[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: ISeat) => void;
}

const SEAT_SIZE = 22;

function seatColorClasses(seat: ISeat, isSelected: boolean): { fill: string; stroke: string; text: string } {
  if (seat.status === 'BOOKED') return { fill: '#0f172a', stroke: '#1e293b', text: '#475569' };
  if (seat.status === 'HELD') return { fill: '#451a03', stroke: '#f59e0b', text: '#fbbf24' };
  if (isSelected) return { fill: '#06b6d4', stroke: '#a5f3fc', text: '#020617' };
  if (seat.seatType === 'VIP') return { fill: '#3b0764', stroke: '#a855f7', text: '#d8b4fe' };
  return { fill: '#1e293b', stroke: '#334155', text: '#e2e8f0' };
}

const SeatMap: React.FC<ISeatMapProps> = ({ seats, zones, selectedSeatIds, onToggleSeat }) => {
  const hasZoneLayout = !!zones && zones.length > 0 && seats.some((s) => s.zoneId != null);

  if (hasZoneLayout) {
    return <ZonedSeatMap seats={seats} zones={zones!} selectedSeatIds={selectedSeatIds} onToggleSeat={onToggleSeat} />;
  }
  return <LegacyGridSeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggleSeat={onToggleSeat} />;
};

const Legend: React.FC = () => (
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
);

/** Sơ đồ ghế theo zone tùy biến (thẳng hoặc uốn cong) — render dạng SVG theo toạ độ tính từ hình học zone. */
const ZonedSeatMap: React.FC<ISeatMapProps> = ({ seats, zones, selectedSeatIds, onToggleSeat }) => {
  const zoneById = React.useMemo(() => {
    const map = new Map<number, IZone>();
    (zones || []).forEach((z) => map.set(z.id, z));
    return map;
  }, [zones]);

  const bounds = React.useMemo(() => computeCombinedBounds(zones || []), [zones]);

  const padding = SEAT_SIZE * 1.5;
  const viewMinX = bounds.minX - padding;
  const viewMinY = bounds.minY - padding * 2; // extra room on top for the stage bar
  const viewWidth = bounds.maxX - bounds.minX + padding * 2;
  const viewHeight = bounds.maxY - bounds.minY + padding * 3;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-3xl mb-6 text-center">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-2" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">STAGE / SÂN KHẤU</span>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <svg
          viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
          className="mx-auto"
          style={{ minWidth: Math.max(320, Math.min(viewWidth, 900)), height: 'auto', maxHeight: 560 }}
        >
          {seats.map((seat) => {
            if (seat.zoneId == null || seat.rowIndex == null || seat.colIndex == null) return null;
            const zone = zoneById.get(seat.zoneId);
            if (!zone) return null;
            const pos = computeSeatAbsolutePosition(zone, seat.rowIndex, seat.colIndex);
            const isSelected = selectedSeatIds.includes(seat.id);
            const isAvailable = seat.status === 'AVAILABLE';
            const disabled = !isAvailable;
            const colors = seatColorClasses(seat, isSelected);

            return (
              <g
                key={seat.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => !disabled && onToggleSeat(seat)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                <title>
                  {`Ghế ${seat.seatNumber} (${seat.seatType}) - ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(seat.price)}`}
                </title>
                <rect
                  x={-SEAT_SIZE / 2}
                  y={-SEAT_SIZE / 2}
                  width={SEAT_SIZE}
                  height={SEAT_SIZE}
                  rx={5}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={seat.status === 'BOOKED' ? 0.6 : 1}
                />
                {isSelected ? (
                  <text textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill={colors.text}>
                    ✓
                  </text>
                ) : (
                  <text textAnchor="middle" dominantBaseline="central" fontSize={8} fontWeight={600} fill={colors.text}>
                    {seat.seatNumber}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chú thích khu vực + khoảng giá */}
      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {(zones || []).map((z) => (
          <div key={z.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: z.color || '#06b6d4' }} />
            <span className="font-semibold truncate flex-1">{z.name}</span>
            <span className="text-cyan-300 font-mono">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(z.price)}</span>
          </div>
        ))}
      </div>

      <Legend />
    </div>
  );
};

/** Sơ đồ ghế kiểu cũ (đơn giản, gom theo seatRow) — dùng cho các sự kiện tạo trước khi có Zone Builder. */
const LegacyGridSeatMap: React.FC<Omit<ISeatMapProps, 'zones'>> = ({ seats, selectedSeatIds, onToggleSeat }) => {
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
      <div className="w-full max-w-xl mb-10 text-center">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-2" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">STAGE / SÂN KHẤU</span>
      </div>

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

      <Legend />
    </div>
  );
};

export default SeatMap;
