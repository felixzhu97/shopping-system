import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * 微信 OAuth 提供商
 * 注意：微信 OAuth 需要特殊处理，通常需要后端代理
 */
export class WeChatProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://open.weixin.qq.com/connect/qrconnect';
  private readonly tokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
  private readonly userInfoUrl = 'https://api.weixin.qq.com/sns/userinfo';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const url = new URL(this.authUrl);
    url.searchParams.append('appid', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'snsapi_login');
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    return `${url.toString()}#wechat_redirect`;
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<OAuthToken> {
    const url = new URL(this.tokenUrl);
    url.searchParams.append('appid', this.config.clientId);
    url.searchParams.append('secret', this.config.clientSecret || '');
    url.searchParams.append('code', code);
    url.searchParams.append('grant_type', 'authorization_code');

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to exchange code for token: ${error.errmsg || error.errcode || response.statusText}`
      );
    }

    const data = await response.json();
    
    if (data.errcode) {
      throw new Error(`WeChat OAuth error: ${data.errmsg || data.errcode}`);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      openid: data.openid,
    } as OAuthToken & { openid?: string };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    const openid = (token as OAuthToken & { openid?: string }).openid;
    if (!openid) {
      throw new Error('WeChat openid is required');
    }

    const url = new URL(this.userInfoUrl);
    url.searchParams.append('access_token', token.accessToken);
    url.searchParams.append('openid', openid);
    url.searchParams.append('lang', 'zh_CN');

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get user info: ${error.errmsg || error.errcode || response.statusText}`
      );
    }

    const data = await response.json();
    
    if (data.errcode) {
      throw new Error(`WeChat API error: ${data.errmsg || data.errcode}`);
    }

    return {
      id: data.openid,
      name: data.nickname,
      avatar: data.headimgurl,
      provider: OAuthProvider.WECHAT,
      providerId: data.openid,
      raw: data,
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    const url = new URL('https://api.weixin.qq.com/sns/oauth2/refresh_token');
    url.searchParams.append('appid', this.config.clientId);
    url.searchParams.append('grant_type', 'refresh_token');
    url.searchParams.append('refresh_token', refreshToken);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to refresh token: ${error.errmsg || error.errcode || response.statusText}`
      );
    }

    const data = await response.json();
    
    if (data.errcode) {
      throw new Error(`WeChat refresh error: ${data.errmsg || data.errcode}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      openid: data.openid,
    } as OAuthToken & { openid?: string };
  }
}
