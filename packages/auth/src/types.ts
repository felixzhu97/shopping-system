/**
 * OAuth 提供商枚举
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  APPLE = 'apple',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

/**
 * OAuth 配置接口
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes?: string[];
  [key: string]: unknown;
}

/**
 * OAuth Token 信息
 */
export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
}

/**
 * 统一用户信息接口
 */
export interface OAuthUser {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  provider: OAuthProvider;
  providerId: string;
  raw?: Record<string, unknown>;
}

/**
 * OAuth 选项
 */
export interface OAuthOptions {
  provider: OAuthProvider;
  config: OAuthConfig;
  state?: string;
  pkce?: boolean;
}

/**
 * 授权 URL 参数
 */
export interface AuthorizationUrlParams {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  [key: string]: string | undefined;
}

/**
 * Token 交换参数
 */
export interface TokenExchangeParams {
  code: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  grantType?: string;
  codeVerifier?: string;
  [key: string]: string | undefined;
}

/**
 * 用户信息获取错误
 */
export class OAuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}
