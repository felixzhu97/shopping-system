import React, { useEffect, useState } from 'react';
import { useOAuth } from './OAuthProvider';
import type {
  OAuthProvider as OAuthProviderType,
  OAuthToken,
  OAuthUser,
} from '../types';

interface OAuthCallbackProps {
  provider?: OAuthProviderType;
  onSuccess?: (data: {
    provider: OAuthProviderType;
    token: OAuthToken;
    user: OAuthUser;
  }) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * OAuth 回调处理组件
 * 用于处理 OAuth 授权回调
 */
export function OAuthCallback({
  provider,
  onSuccess,
  onError,
  redirectTo,
  children,
}: OAuthCallbackProps) {
  const { handleCallback } = useOAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取当前 URL
        const currentUrl =
          typeof window !== 'undefined' ? window.location.href : '';

        // 获取存储的 state
        let storedState: string | undefined;
        if (typeof window !== 'undefined' && provider) {
          storedState = sessionStorage.getItem(
            `oauth_state_${provider}`
          ) || undefined;
        }

        // 处理回调
        const result = await handleCallback(currentUrl, storedState);

        // 清理 state
        if (typeof window !== 'undefined' && provider) {
          sessionStorage.removeItem(`oauth_state_${provider}`);
        }

        // 调用成功回调
        onSuccess?.(result);

        // 重定向
        if (redirectTo) {
          if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [handleCallback, provider, onSuccess, onError, redirectTo]);

  if (loading) {
    return (
      <div>
        {children || <p>正在处理登录...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>登录失败: {error.message}</p>
      </div>
    );
  }

  return null;
}
