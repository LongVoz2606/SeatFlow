import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import authApi from '../../../services/apis/auth/auth.api';

export const UsersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () => {
      const response = await authApi.adminListUsers({ params: { search: search || undefined, page, size } });
      return response.data;
    },
  });

  const handleToggle = async (id: number, enabled: boolean) => {
    await authApi.adminSetUserStatus({ pathVars: { id }, body: { enabled: !enabled } });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Tìm theo username/email..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400">Đang tải...</div>
      ) : (
        <div className="space-y-2">
          {data?.content.map((user) => (
            <div key={user.id} className="glass-card border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-950">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  {user.username} <span className="text-slate-500 font-normal">({user.role})</span>
                  <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase border ${
                    user.provider === 'LOCAL'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {user.provider === 'LOCAL' ? 'SeatFlow' : user.provider}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">{user.email} {user.fullName && `• ${user.fullName}`}</p>
              </div>
              <button
                onClick={() => handleToggle(user.id, user.enabled)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                  user.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {user.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                <span>{user.enabled ? 'Đang hoạt động' : 'Đã khoá'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button disabled={data.first} onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400">Trang {data.page + 1}/{data.totalPages}</span>
          <button disabled={data.last} onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
