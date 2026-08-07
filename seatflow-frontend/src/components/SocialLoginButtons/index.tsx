import React, { useEffect, useRef } from 'react';
import authApi from '../../services/apis/auth/auth.api';
import { ITokenResponse } from '../../services/apis/auth/auth.interface';
import { IApiResponse } from '../../types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface ISocialLoginButtonsProps {
  onSuccess: (response: IApiResponse<ITokenResponse>) => void;
  onError: (message: string) => void;
}

function loadScriptOnce(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

export const SocialLoginButtons: React.FC<ISocialLoginButtonsProps> = ({ onSuccess, onError }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScriptOnce('https://accounts.google.com/gsi/client', 'google-identity-script')
      .then(() => {
        const google = (window as any).google;
        if (!google?.accounts?.id || !googleBtnRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (credentialResponse: { credential: string }) => {
            try {
              const response = await authApi.loginWithGoogle({ body: { idToken: credentialResponse.credential } });
              onSuccess(response);
            } catch (err) {
              onError('Đăng nhập bằng Google/Gmail thất bại. Vui lòng thử lại.');
            }
          },
        });
        const width = Math.min(googleBtnRef.current.offsetWidth || 320, 400);
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          logo_alignment: 'left',
          width,
        });
      })
      .catch(() => onError('Không thể tải dịch vụ đăng nhập Google.'));
  }, [onSuccess, onError]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-purple-900/20" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60">Hoặc đăng nhập với</span>
        <div className="h-px flex-1 bg-purple-900/20" />
      </div>

      <div className="flex justify-center">
        {GOOGLE_CLIENT_ID ? (
          <div ref={googleBtnRef} className="flex justify-center w-full" />
        ) : (
          <button
            type="button"
            onClick={() => onError('Tính năng đăng nhập Google/Gmail chưa được cấu hình Client ID.')}
            className="w-full py-3 rounded-full bg-slate-900/90 hover:bg-purple-950/60 text-white border border-purple-500/20 font-bold text-xs flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Tiếp tục với Gmail / Google</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialLoginButtons;
