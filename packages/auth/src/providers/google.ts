import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * Google OAuth 提供商
 */
export class GoogleProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes || this.getDefaultScopes() || [
      'openid',
      'profile',
      'email',
    ];
    const url = new URL(this.authUrl);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes.join(' '));
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    if (params.codeChallenge) {
      url.searchParams.append('code_challenge', params.codeChallenge);
      url.searchParams.append('code_challenge_method', 'S256');
    }
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'consent');
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
      grantType: 'authorization_code',
      ...(codeVerifier && { codeVerifier }),
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
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      idToken: data.id_token,
    };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    const response = await fetch(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json();
    const nameParts = (data.name || '').split(' ');
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      firstName: nameParts[0] || data.given_name,
      lastName: nameParts.slice(1).join(' ') || data.family_name,
      avatar: data.picture,
      provider: OAuthProvider.GOOGLE,
      providerId: data.id,
      raw: data,
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    const body = this.buildTokenExchangeBody({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      refreshToken,
      grantType: 'refresh_token',
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
      scope: data.scope,
      idToken: data.id_token,
    };
  }
}
