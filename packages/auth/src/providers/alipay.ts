import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * 支付宝 OAuth 提供商
 * 注意：支付宝 OAuth 需要特殊处理，通常需要后端代理
 */
export class AlipayProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm';
  private readonly tokenUrl = 'https://openapi.alipay.com/gateway.do';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes || this.getDefaultScopes() || ['auth_user'];
    const url = new URL(this.authUrl);
    url.searchParams.append('app_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('scope', scopes.join(','));
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    return url.toString();
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<OAuthToken> {
    // 支付宝需要特殊的签名机制，这里简化处理
    // 实际使用时应该通过后端代理处理
    const params = {
      app_id: this.config.clientId,
      method: 'alipay.system.oauth.token',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      version: '1.0',
      grant_type: 'authorization_code',
      code: code,
    };

    // 注意：这里需要签名，实际应该由后端处理
    const url = new URL(this.tokenUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to exchange code for token: ${error.error_response?.msg || response.statusText}`
      );
    }

    const data = await response.json();
    const tokenData = data.alipay_system_oauth_token_response;
    
    if (data.error_response) {
      throw new Error(`Alipay OAuth error: ${data.error_response.msg}`);
    }

    return {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      refreshToken: tokenData.refresh_token,
      userId: tokenData.user_id,
    } as OAuthToken & { userId?: string };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    const userId = (token as OAuthToken & { userId?: string }).userId;
    if (!userId) {
      throw new Error('Alipay user_id is required');
    }

    // 支付宝获取用户信息需要特殊的 API 调用和签名
    // 这里简化处理，实际应该通过后端代理
    const params = {
      app_id: this.config.clientId,
      method: 'alipay.user.info.share',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      version: '1.0',
      auth_token: token.accessToken,
    };

    const url = new URL(this.tokenUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get user info: ${error.error_response?.msg || response.statusText}`
      );
    }

    const data = await response.json();
    const userData = data.alipay_user_info_share_response;
    
    if (data.error_response) {
      throw new Error(`Alipay API error: ${data.error_response.msg}`);
    }

    return {
      id: userData.user_id || userId,
      name: userData.nick_name,
      avatar: userData.avatar,
      email: userData.email,
      phone: userData.mobile,
      provider: OAuthProvider.ALIPAY,
      providerId: userData.user_id || userId,
      raw: userData,
    };
  }
}
