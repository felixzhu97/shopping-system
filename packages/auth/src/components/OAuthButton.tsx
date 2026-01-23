import React, { useState, useCallback } from 'react';
import { useOAuth } from './OAuthProvider';
import type { OAuthProvider as OAuthProviderType } from '../types';

interface OAuthButtonProps {
  provider: OAuthProviderType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  scopes?: string[];
  pkce?: boolean;
  disabled?: boolean;
}

/**
 * OAuth 登录按钮组件
 */
export function OAuthButton({
  provider,
  children,
  className,
  style,
  onClick,
  onSuccess,
  onError,
  scopes,
  pkce = false,
  disabled = false,
}: OAuthButtonProps) {
  const { getAuthorizationUrl } = useOAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled || loading) {
      return;
    }

    try {
      setLoading(true);
      onClick?.();

      const { url, state } = await getAuthorizationUrl(provider, {
        scopes,
        pkce,
      });

      // 保存 state 到 sessionStorage（用于回调验证）
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`oauth_state_${provider}`, state);
      }

      onSuccess?.(url);
      
      // 跳转到授权页面
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [
    provider,
    getAuthorizationUrl,
    scopes,
    pkce,
    disabled,
    loading,
    onClick,
    onSuccess,
    onError,
  ]);

  const defaultChildren = children || `使用 ${provider} 登录`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={style}
    >
      {loading ? '加载中...' : defaultChildren}
    </button>
  );
}
