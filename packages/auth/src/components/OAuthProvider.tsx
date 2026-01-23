import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { OAuthClient } from '../core/oauth-client';
import type {
  OAuthProvider as OAuthProviderType,
  OAuthConfig,
} from '../types';

interface OAuthContextValue {
  client: OAuthClient;
  getAuthorizationUrl: (
    provider: OAuthProviderType,
    options?: {
      state?: string;
      scopes?: string[];
      pkce?: boolean;
    }
  ) => Promise<{ url: string; state: string; codeVerifier?: string }>;
  handleCallback: (
    callbackUrl: string,
    storedState?: string
  ) => Promise<{
    provider: OAuthProviderType;
    token: import('../types').OAuthToken;
    user: import('../types').OAuthUser;
  }>;
}

const OAuthContext = createContext<OAuthContextValue | null>(null);

interface OAuthProviderProps {
  children: ReactNode;
  providers: Record<OAuthProviderType, OAuthConfig>;
}

/**
 * OAuth 上下文提供者
 * 用于在应用中提供 OAuth 功能
 */
export function OAuthProvider({ children, providers }: OAuthProviderProps) {
  const client = useMemo(() => {
    const oauthClient = new OAuthClient();
    
    // 注册所有提供商
    Object.entries(providers).forEach(([provider, config]) => {
      oauthClient.registerProvider(provider as OAuthProviderType, config);
    });

    return oauthClient;
  }, [providers]);

  const value = useMemo<OAuthContextValue>(
    () => ({
      client,
      getAuthorizationUrl: (provider, options) =>
        client.getAuthorizationUrl(provider, options),
      handleCallback: (callbackUrl, storedState) =>
        client.handleCallback(callbackUrl, storedState),
    }),
    [client]
  );

  return (
    <OAuthContext.Provider value={value}>{children}</OAuthContext.Provider>
  );
}

/**
 * 使用 OAuth 上下文
 */
export function useOAuth(): OAuthContextValue {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuth must be used within OAuthProvider');
  }
  return context;
}
