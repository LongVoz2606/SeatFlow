import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import organizerApi from '../../../services/apis/organizer/organizer.api';

export const PendingOrganizersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['organizers', 'pending'],
    queryFn: async () => {
      const response = await organizerApi.listPending();
      return response.data;
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['organizers', 'pending'] });

  const handleApprove = async (id: number) => {
    await organizerApi.approve({ pathVars: { id } });
    refresh();
  };

  const handleReject = async (id: number) => {
    await organizerApi.reject({ pathVars: { id }, body: { reason } });
    setRejectingId(null);
    setReason('');
    refresh();
  };

  if (isLoading) {
    return <div className="text-sm text-slate-400">Đang tải...</div>;
  }

  if (!pending || pending.length === 0) {
    return <div className="text-sm text-slate-400 py-8 text-center">Không có hồ sơ nào đang chờ duyệt.</div>;
  }

  return (
    <div className="space-y-3">
      {pending.map((org) => (
        <div key={org.id} className="glass-card border border-slate-800 rounded-2xl p-4 bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-sm">{org.organizationName}</h4>
              <p className="text-xs text-slate-400">{org.contactEmail} {org.contactPhone && `• ${org.contactPhone}`}</p>
              {org.description && <p className="text-xs text-slate-500 mt-1">{org.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleApprove(org.id)}
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Duyệt</span>
              </button>
              <button onClick={() => setRejectingId(rejectingId === org.id ? null : org.id)}
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold">
                <X className="w-3.5 h-3.5" />
                <span>Từ chối</span>
              </button>
            </div>
          </div>

          {rejectingId === org.id && (
            <div className="mt-3 flex gap-2">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Lý do từ chối..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              />
              <button onClick={() => handleReject(org.id)} className="py-2 px-4 rounded-lg bg-rose-500 text-white text-xs font-bold">
                Xác nhận
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PendingOrganizersTab;
