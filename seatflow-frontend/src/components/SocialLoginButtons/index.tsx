import React, { useEffect, useRef, useState } from 'react';
import { Facebook } from 'lucide-react';
import authApi from '../../services/apis/auth/auth.api';
import { ITokenResponse } from '../../services/apis/auth/auth.interface';
import { IApiResponse } from '../../types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;

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
  const [facebookReady, setFacebookReady] = useState(false);

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
              onError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
            }
          },
        });
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          width: 320,
        });
      })
      .catch(() => onError('Không thể tải dịch vụ đăng nhập Google.'));
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    loadScriptOnce('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk')
      .then(() => {
        const FB = (window as any).FB;
        if (!FB) return;
        FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
        setFacebookReady(true);
      })
      .catch(() => onError('Không thể tải dịch vụ đăng nhập Facebook.'));
  }, [onError]);

  const handleFacebookLogin = () => {
    const FB = (window as any).FB;
    if (!FB) return;
    FB.login(
      async (response: any) => {
        const accessToken = response?.authResponse?.accessToken;
        if (!accessToken) {
          onError('Bạn đã huỷ đăng nhập bằng Facebook.');
          return;
        }
        try {
          const apiResponse = await authApi.loginWithFacebook({ body: { accessToken } });
          onSuccess(apiResponse);
        } catch (err) {
          onError('Đăng nhập bằng Facebook thất bại. Vui lòng thử lại.');
        }
      },
      { scope: 'email' }
    );
  };

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hoặc tiếp tục với</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="space-y-3">
        {GOOGLE_CLIENT_ID && <div ref={googleBtnRef} className="flex justify-center" />}

        {FACEBOOK_APP_ID && (
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={!facebookReady}
            className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Facebook className="w-4 h-4" />
            <span>Tiếp tục với Facebook</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialLoginButtons;
