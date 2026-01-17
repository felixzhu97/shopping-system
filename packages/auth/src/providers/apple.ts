import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * Apple OAuth 提供商
 * 注意：Apple Sign In 需要特殊的配置和实现
 */
export class AppleProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://appleid.apple.com/auth/authorize';
  private readonly tokenUrl = 'https://appleid.apple.com/auth/token';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes || this.getDefaultScopes() || ['name', 'email'];
    const url = new URL(this.authUrl);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes.join(' '));
    url.searchParams.append('response_mode', 'form_post');
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    if (params.codeChallenge) {
      url.searchParams.append('code_challenge', params.codeChallenge);
      url.searchParams.append('code_challenge_method', 'S256');
    }
    return url.toString();
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<OAuthToken> {
    // Apple 需要 JWT 格式的 client_secret
    // 这里简化处理，实际使用时需要生成 JWT
    const body = this.buildTokenExchangeBody({
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
      ...(codeVerifier && { code_verifier: codeVerifier }),
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to exchange code for token: ${error.error || response.statusText}`
      );
    }

    const data = await response.json();
    
    // 解析 id_token 获取用户信息
    let userInfo: Record<string, unknown> = {};
    if (data.id_token) {
      try {
        const payload = data.id_token.split('.')[1];
        userInfo = JSON.parse(atob(payload));
      } catch {
        // 忽略解析错误
      }
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      idToken: data.id_token,
    };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    // Apple 的用户信息在 id_token 中
    if (!token.idToken) {
      throw new Error('Apple id_token is required to get user info');
    }

    try {
      const payload = token.idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      // Apple 可能不返回 name，需要从第一次授权时获取
      const name = (token as unknown as { name?: { firstName?: string; lastName?: string } }).name;
      
      return {
        id: decoded.sub,
        email: decoded.email,
        name: name ? `${name.firstName || ''} ${name.lastName || ''}`.trim() : undefined,
        firstName: name?.firstName,
        lastName: name?.lastName,
        provider: OAuthProvider.APPLE,
        providerId: decoded.sub,
        raw: decoded,
      };
    } catch (error) {
      throw new Error(`Failed to decode Apple id_token: ${error}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    const body = this.buildTokenExchangeBody({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      idToken: data.id_token,
    };
  }
}
