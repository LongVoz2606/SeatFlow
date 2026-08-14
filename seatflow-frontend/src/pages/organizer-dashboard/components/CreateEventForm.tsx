import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ICreateEventBody, IZoneBody } from '../../../services/apis/event/event.interface';
import { ZoneBuilder } from './ZoneBuilder';

interface ICreateEventFormProps {
  onSubmit: (body: ICreateEventBody) => Promise<void>;
  onCancel: () => void;
}

const defaultZone: IZoneBody = {
  name: 'VIP',
  seatType: 'VIP',
  price: 800000,
  rowCount: 5,
  colCount: 10,
  rowSpacing: 36,
  colSpacing: 32,
  curveAngle: 0,
  positionX: 0,
  positionY: 0,
  rotation: 0,
  color: '#06b6d4',
};

const inputClass = 'w-full bg-slate-900/90 border-b-2 border-b-purple-500/80 border-x-0 border-t-0 focus:border-b-purple-400 rounded-t-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200';

export const CreateEventForm: React.FC<ICreateEventFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [category, setCategory] = useState('Music');
  const [sessionDates, setSessionDates] = useState<string[]>(['']);
  const [zones, setZones] = useState<IZoneBody[]>([{ ...defaultZone }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateSessionDate = (index: number, value: string) => {
    setSessionDates((prev) => prev.map((d, i) => (i === index ? value : d)));
  };
  const addSessionDate = () => setSessionDates((prev) => [...prev, '']);
  const removeSessionDate = (index: number) => setSessionDates((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validDates = sessionDates.filter((d) => d.trim() !== '');
    if (validDates.length === 0) {
      setError('Cần ít nhất 1 suất diễn.');
      return;
    }
    if (zones.length === 0) {
      setError('Cần ít nhất 1 khu vực ghế.');
      return;
    }
    const invalidZone = zones.find((z) => !z.name.trim() || z.rowCount < 1 || z.colCount < 1 || z.price < 0);
    if (invalidZone) {
      setError('Vui lòng kiểm tra lại thông tin khu vực ghế (tên, số hàng/cột, giá vé).');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        location,
        bannerUrl,
        category,
        sessionDates: validDates.map((d) => new Date(d).toISOString()),
        zones,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const totalSeats = zones.reduce((acc, z) => acc + z.rowCount * z.colCount, 0);

  return (
    <div className="rounded-3xl border border-slate-800/80 p-6 bg-slate-900/60 backdrop-blur-md mb-8 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Tạo sự kiện mới</h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex gap-2 items-start text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên sự kiện" className={inputClass} />
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả sự kiện (giới thiệu, nội dung chương trình...)" rows={4} className={inputClass} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm (VD: Sân vận động Mỹ Đình, Hà Nội)" className={inputClass} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="Music">Concert Ca Nhạc</option>
            <option value="Tech & Seminar">Hội Thảo & Công Nghệ</option>
            <option value="Arts & Theater">Kịch Nghệ & Triển Lãm</option>
            <option value="Sports">Giải Đấu Thể Thao</option>
            <option value="Entertainment">Lễ Hội & Giải Trí</option>
          </select>
        </div>
        <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="Banner URL hình ảnh sự kiện" className={inputClass} />

        {/* Session dates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Các suất diễn</label>
            <button type="button" onClick={addSessionDate} className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm suất diễn</span>
            </button>
          </div>
          <div className="space-y-2">
            {sessionDates.map((date, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500 font-mono">Suất {index + 1}</span>
                <input
                  required
                  type="datetime-local"
                  value={date}
                  onChange={(e) => updateSessionDate(index, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSessionDate(index)}
                  disabled={sessionDates.length === 1}
                  className="p-2 rounded-lg border border-slate-800 text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <ZoneBuilder zones={zones} onChange={setZones} />
          <p className="text-[11px] text-slate-500 mt-2">
            Tổng số ghế mỗi suất diễn: <strong className="text-cyan-300">{totalSeats}</strong> ghế
            {sessionDates.filter((d) => d).length > 1 && (
              <> — nhân {sessionDates.filter((d) => d).length} suất diễn = <strong className="text-cyan-300">{totalSeats * sessionDates.filter((d) => d).length}</strong> vé</>
            )}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold text-xs transition-all">
            Huỷ
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all">
            {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
