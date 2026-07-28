import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertCircle, X } from 'lucide-react';

interface IOtpModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onClose: () => void;
}

export const OtpModal: React.FC<IOtpModalProps> = ({ isOpen, title, description, onSubmit, onResend, onClose }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(Array(6).fill(''));
      setError(null);
      setCooldown(60);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(code);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã OTP không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || cooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      await onResend();
      setCooldown(60);
      setDigits(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm glass-card border border-slate-800 rounded-3xl p-6 bg-slate-950 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-1.5">{description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex gap-2 items-start text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl text-slate-100 outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all mb-3"
        >
          {loading ? 'Đang xác thực...' : 'Xác nhận'}
        </button>

        {onResend && (
          <p className="text-center text-[11px] text-slate-500">
            Không nhận được mã?{' '}
            {cooldown > 0 ? (
              <span className="text-slate-600">Gửi lại sau {cooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-cyan-400 font-bold hover:underline disabled:opacity-50"
              >
                {resending ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default OtpModal;
