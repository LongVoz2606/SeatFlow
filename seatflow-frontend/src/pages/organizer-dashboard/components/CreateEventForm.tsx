import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ICreateEventBody, ISeatSectionBody } from '../../../services/apis/event/event.interface';

interface ICreateEventFormProps {
  onSubmit: (body: ICreateEventBody) => Promise<void>;
  onCancel: () => void;
}

const emptySection: ISeatSectionBody = { rowLabel: 'A', seatCount: 10, seatType: 'REGULAR', price: 500000 };

export const CreateEventForm: React.FC<ICreateEventFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [seatSections, setSeatSections] = useState<ISeatSectionBody[]>([{ ...emptySection }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState('Music');

  const inputClass = 'w-full bg-slate-900/90 border-b-2 border-b-purple-500/80 border-x-0 border-t-0 focus:border-b-purple-400 rounded-t-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200';

  const updateSection = (index: number, patch: Partial<ISeatSectionBody>) => {
    setSeatSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSection = () => setSeatSections((prev) => [...prev, { ...emptySection, rowLabel: '' }]);
  const removeSection = (index: number) => setSeatSections((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        location,
        eventDate: new Date(eventDate).toISOString(),
        bannerUrl,
        category,
        seatSections,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả sự kiện" rows={3} className={inputClass} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm (VD: Sân vận động Mỹ Đình, Hà Nội)" className={inputClass} />
          <input required type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="Music">Concert Ca Nhạc</option>
            <option value="Tech & Seminar">Hội Thảo & Công Nghệ</option>
            <option value="Arts & Theater">Kịch Nghệ & Triển Lãm</option>
            <option value="Sports">Giải Đấu Thể Thao</option>
            <option value="Entertainment">Lễ Hội & Giải Trí</option>
          </select>
        </div>
        <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="Banner URL hình ảnh sự kiện" className={inputClass} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Khu vực ghế</label>
            <button type="button" onClick={addSection} className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm khu vực</span>
            </button>
          </div>

          <div className="space-y-3">
            {seatSections.map((section, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center p-3 rounded-xl border border-slate-800 bg-slate-900/50">
                <input required value={section.rowLabel} onChange={(e) => updateSection(index, { rowLabel: e.target.value })}
                  placeholder="Ký hiệu (VD: A)" className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 outline-none" />
                <input required type="number" min={1} value={section.seatCount} onChange={(e) => updateSection(index, { seatCount: Number(e.target.value) })}
                  placeholder="Số lượng ghế" className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 outline-none" />
                <select value={section.seatType} onChange={(e) => updateSection(index, { seatType: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 outline-none">
                  <option value="REGULAR">REGULAR</option>
                  <option value="VIP">VIP</option>
                </select>
                <input required type="number" min={0} value={section.price} onChange={(e) => updateSection(index, { price: Number(e.target.value) })}
                  placeholder="Giá vé" className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 outline-none" />
                <button type="button" onClick={() => removeSection(index)} disabled={seatSections.length === 1}
                  className="flex items-center justify-center p-2 rounded-lg border border-slate-800 text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
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
