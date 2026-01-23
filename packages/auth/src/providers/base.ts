import type {
  OAuthConfig,
  OAuthToken,
  OAuthUser,
  AuthorizationUrlParams,
  TokenExchangeParams,
} from '../types';

/**
 * 基础 OAuth 提供商抽象类
 * 所有 OAuth 提供商必须实现此接口
 */
export abstract class BaseOAuthProvider {
  protected config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * 获取授权 URL
   */
  abstract getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string;

  /**
   * 用授权码交换 Token
   */
  abstract exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<OAuthToken>;

  /**
   * 获取用户信息
   */
  abstract getUserInfo(token: OAuthToken): Promise<OAuthUser>;

  /**
   * 刷新 Token（如果支持）
   */
  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    throw new Error(
      `Provider ${this.constructor.name} does not support token refresh`
    );
  }

  /**
   * 构建授权 URL 参数
   */
  protected buildAuthorizationParams(
    params: AuthorizationUrlParams
  ): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams;
  }

  /**
   * 构建 Token 交换请求体
   */
  protected buildTokenExchangeBody(
    params: Partial<TokenExchangeParams> & Record<string, string | undefined>
  ): URLSearchParams {
    const body = new URLSearchParams();
    // Map camelCase to snake_case for OAuth standard
    const keyMap: Record<string, string> = {
      clientId: 'client_id',
      clientSecret: 'client_secret',
      redirectUri: 'redirect_uri',
      grantType: 'grant_type',
      codeVerifier: 'code_verifier',
      refreshToken: 'refresh_token',
    };
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const oauthKey = keyMap[key] || key;
        body.append(oauthKey, value);
      }
    });
    return body;
  }

  /**
   * 获取默认作用域
   */
  protected getDefaultScopes(): string[] {
    return this.config.scopes || [];
  }
}
