import React, { useState } from 'react';
import { Building2, Mail, Phone, Image, AlertCircle } from 'lucide-react';
import { IOrganizer } from '../../../types';
import { IRegisterOrganizerBody } from '../../../services/apis/organizer/organizer.interface';

interface IOrganizerRegisterFormProps {
  mode: 'register' | 'resubmit';
  initialValues?: IOrganizer | null;
  onSubmit: (body: IRegisterOrganizerBody) => Promise<void>;
}

export const OrganizerRegisterForm: React.FC<IOrganizerRegisterFormProps> = ({ mode, initialValues, onSubmit }) => {
  const [organizationName, setOrganizationName] = useState(initialValues?.organizationName ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [contactEmail, setContactEmail] = useState(initialValues?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(initialValues?.contactPhone ?? '');
  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = 'w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ organizationName, description, contactEmail, contactPhone, logoUrl });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4">
      <div className="glass-card border border-slate-800 rounded-3xl p-8 bg-slate-950">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            {mode === 'register' ? 'Đăng ký trở thành Nhà tổ chức' : 'Gửi lại hồ sơ Nhà tổ chức'}
          </h2>
          <p className="text-slate-400 text-xs">
            Điền thông tin tổ chức của bạn để bắt đầu tạo và quản lý sự kiện trên SeatFlow.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex gap-3 items-start text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Tên tổ chức</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Công ty / Đơn vị tổ chức sự kiện" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu ngắn về đơn vị của bạn" rows={3}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Email liên hệ</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@to-chuc.com" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Số điện thoại liên hệ</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                placeholder="09xx xxx xxx" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Logo URL</label>
            <div className="relative">
              <Image className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Đang gửi...' : mode === 'register' ? 'Gửi đăng ký' : 'Gửi lại hồ sơ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizerRegisterForm;
