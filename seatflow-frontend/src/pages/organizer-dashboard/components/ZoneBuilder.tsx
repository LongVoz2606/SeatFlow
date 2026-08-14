import React, { useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Move } from 'lucide-react';
import { IZoneBody } from '../../../services/apis/event/event.interface';
import { computeCombinedBounds, computeSeatAbsolutePosition } from '../../../utils/seatLayout';

interface IZoneBuilderProps {
  zones: IZoneBody[];
  onChange: (zones: IZoneBody[]) => void;
}

const PALETTE = ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6'];

const emptyZone = (index: number): IZoneBody => ({
  name: index === 0 ? 'VIP' : `Khu vực ${index + 1}`,
  seatType: index === 0 ? 'VIP' : 'REGULAR',
  price: index === 0 ? 800000 : 300000,
  rowCount: 5,
  colCount: 10,
  rowSpacing: 36,
  colSpacing: 32,
  curveAngle: 0,
  positionX: 0,
  positionY: index * 260,
  rotation: 0,
  color: PALETTE[index % PALETTE.length],
});

const fieldClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500/60';
const labelClass = 'text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1';

export const ZoneBuilder: React.FC<IZoneBuilderProps> = ({ zones, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<{ index: number; startClientX: number; startClientY: number; startX: number; startY: number } | null>(null);

  const updateZone = (index: number, patch: Partial<IZoneBody>) => {
    onChange(zones.map((z, i) => (i === index ? { ...z, ...patch } : z)));
  };

  const addZone = () => {
    const next = [...zones, emptyZone(zones.length)];
    onChange(next);
    setSelectedIndex(next.length - 1);
  };

  const removeZone = (index: number) => {
    const next = zones.filter((_, i) => i !== index);
    onChange(next);
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, next.length - 1)));
  };

  const bounds = useMemo(() => (zones.length > 0 ? computeCombinedBounds(zones) : { minX: 0, minY: 0, maxX: 100, maxY: 100 }), [zones]);
  const padding = 40;
  const viewMinX = bounds.minX - padding;
  const viewMinY = bounds.minY - padding * 2;
  const viewWidth = Math.max(200, bounds.maxX - bounds.minX + padding * 2);
  const viewHeight = Math.max(200, bounds.maxY - bounds.minY + padding * 3);

  const clientToSvgScale = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 1;
    return viewWidth / rect.width;
  };

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    dragState.current = {
      index,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: zones[index].positionX,
      startY: zones[index].positionY,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const scale = clientToSvgScale();
    const dx = (e.clientX - dragState.current.startClientX) * scale;
    const dy = (e.clientY - dragState.current.startClientY) * scale;
    updateZone(dragState.current.index, {
      positionX: Math.round(dragState.current.startX + dx),
      positionY: Math.round(dragState.current.startY + dy),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const selectedZone = zones[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Khu vực & sơ đồ ghế</label>
        <button type="button" onClick={addZone} className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300">
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm khu vực</span>
        </button>
      </div>

      {zones.length === 0 ? (
        <p className="text-xs text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-xl text-center">
          Chưa có khu vực nào. Bấm "Thêm khu vực" để bắt đầu vẽ sơ đồ.
        </p>
      ) : (
        <>
          {/* Canvas preview - drag zones to reposition */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-500">
              <Move className="w-3.5 h-3.5" />
              <span>Kéo khu vực để định vị trên sơ đồ. Sân khấu ở phía trên.</span>
            </div>
            <div className="w-full text-center mb-3">
              <div className="h-1.5 w-2/3 mx-auto bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">SÂN KHẤU</span>
            </div>
            <svg
              ref={svgRef}
              viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
              className="w-full select-none"
              style={{ height: 380, touchAction: 'none' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {zones.map((zone, zIndex) => {
                const seatsPreview: React.ReactNode[] = [];
                const maxPreviewRows = Math.min(zone.rowCount, 8);
                const maxPreviewCols = Math.min(zone.colCount, 20);
                for (let r = 0; r < maxPreviewRows; r++) {
                  for (let c = 0; c < maxPreviewCols; c++) {
                    const pos = computeSeatAbsolutePosition(zone, r, c);
                    seatsPreview.push(
                      <circle key={`${r}-${c}`} cx={pos.x} cy={pos.y} r={3.2} fill={zone.color || '#06b6d4'} opacity={0.85} />
                    );
                  }
                }
                const isSelected = zIndex === selectedIndex;
                const labelPos = computeSeatAbsolutePosition(zone, -1.4, (zone.colCount - 1) / 2);

                return (
                  <g
                    key={zIndex}
                    onPointerDown={(e) => handlePointerDown(zIndex, e)}
                    style={{ cursor: 'grab' }}
                  >
                    {isSelected && (
                      <rect
                        x={zone.positionX - ((zone.colCount - 1) * zone.colSpacing) / 2 - 14}
                        y={zone.positionY - 14}
                        width={(zone.colCount - 1) * zone.colSpacing + 28}
                        height={(zone.rowCount - 1) * zone.rowSpacing + 28}
                        rx={10}
                        fill="none"
                        stroke={zone.color || '#06b6d4'}
                        strokeDasharray="4 3"
                        strokeWidth={1.5}
                        opacity={0.5}
                      />
                    )}
                    <text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize={11} fontWeight={700} fill={zone.color || '#06b6d4'}>
                      {zone.name || `Khu vực ${zIndex + 1}`}
                    </text>
                    {seatsPreview}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Zone tabs */}
          <div className="flex flex-wrap gap-2">
            {zones.map((zone, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  index === selectedIndex
                    ? 'bg-slate-800 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color || '#06b6d4' }} />
                {zone.name || `Khu vực ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Selected zone editor */}
          {selectedZone && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Chỉnh sửa: {selectedZone.name || `Khu vực ${selectedIndex + 1}`}</span>
                <button
                  type="button"
                  onClick={() => removeZone(selectedIndex)}
                  disabled={zones.length === 1}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xoá khu vực</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Tên khu vực</label>
                  <input value={selectedZone.name} onChange={(e) => updateZone(selectedIndex, { name: e.target.value })} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Loại ghế</label>
                  <select value={selectedZone.seatType} onChange={(e) => updateZone(selectedIndex, { seatType: e.target.value })} className={fieldClass}>
                    <option value="REGULAR">REGULAR</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Giá vé (VNĐ)</label>
                  <input type="number" min={0} value={selectedZone.price} onChange={(e) => updateZone(selectedIndex, { price: Number(e.target.value) })} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Màu hiển thị</label>
                  <input type="color" value={selectedZone.color || '#06b6d4'} onChange={(e) => updateZone(selectedIndex, { color: e.target.value })} className={`${fieldClass} h-9 p-1`} />
                </div>

                <div>
                  <label className={labelClass}>Số hàng ghế</label>
                  <input type="number" min={1} max={50} value={selectedZone.rowCount} onChange={(e) => updateZone(selectedIndex, { rowCount: Number(e.target.value) })} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Số ghế / hàng</label>
                  <input type="number" min={1} max={100} value={selectedZone.colCount} onChange={(e) => updateZone(selectedIndex, { colCount: Number(e.target.value) })} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Khoảng cách hàng</label>
                  <input type="number" min={20} max={100} value={selectedZone.rowSpacing} onChange={(e) => updateZone(selectedIndex, { rowSpacing: Number(e.target.value) })} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Khoảng cách ghế</label>
                  <input type="number" min={16} max={80} value={selectedZone.colSpacing} onChange={(e) => updateZone(selectedIndex, { colSpacing: Number(e.target.value) })} className={fieldClass} />
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>
                    Độ cong ({selectedZone.curveAngle}°) — 0 = thẳng, càng lớn càng cong (vòng cung / hình quạt)
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedZone.curveAngle}
                    onChange={(e) => updateZone(selectedIndex, { curveAngle: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Xoay khu vực ({selectedZone.rotation}°)</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedZone.rotation}
                    onChange={(e) => updateZone(selectedIndex, { rotation: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Tổng ghế khu vực này: <strong className="text-slate-300">{selectedZone.rowCount * selectedZone.colCount}</strong> ghế
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ZoneBuilder;
