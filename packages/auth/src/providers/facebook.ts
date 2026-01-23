import { BaseOAuthProvider } from './base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../types';
import { OAuthProvider } from '../types';

/**
 * Facebook OAuth 提供商
 */
export class FacebookProvider extends BaseOAuthProvider {
  private readonly authUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
  private readonly tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
  private readonly userInfoUrl = 'https://graph.facebook.com/v18.0/me';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes || this.getDefaultScopes() || ['email', 'public_profile'];
    const url = new URL(this.authUrl);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
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
    const body = this.buildTokenExchangeBody({
      code,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
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
        `Failed to exchange code for token: ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    const fields = 'id,name,email,first_name,last_name,picture';
    const url = new URL(this.userInfoUrl);
    url.searchParams.append('fields', fields);
    url.searchParams.append('access_token', token.accessToken);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get user info: ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.picture?.data?.url,
      provider: OAuthProvider.FACEBOOK,
      providerId: data.id,
      raw: data,
    };
  }
}
