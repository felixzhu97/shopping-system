import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * GitHub OAuth 提供商
 */
export class GitHubProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userInfoUrl = 'https://api.github.com/user';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes || this.getDefaultScopes() || ['read:user', 'user:email'];
    const url = new URL(this.authUrl);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('scope', scopes.join(' '));
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
    const body = this.buildTokenExchangeBody({
      code,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      ...(codeVerifier && { codeVerifier }),
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
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
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    // 获取用户基本信息
    const userResponse = await fetch(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // 获取用户邮箱（可能需要单独请求）
    let email = userData.email;
    if (!email) {
      try {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (emailResponse.ok) {
          const emails = await emailResponse.json();
          const primaryEmail = emails.find((e: { primary: boolean }) => e.primary);
          email = primaryEmail?.email || emails[0]?.email;
        }
      } catch {
        // 忽略邮箱获取错误
      }
    }

    const nameParts = (userData.name || userData.login || '').split(' ');
    return {
      id: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      avatar: userData.avatar_url,
      provider: OAuthProvider.GITHUB,
      providerId: userData.id.toString(),
      raw: userData,
    };
  }
}
