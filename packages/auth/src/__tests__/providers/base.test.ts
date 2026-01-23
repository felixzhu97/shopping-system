import { describe, it, expect, beforeEach } from 'vitest';
import { BaseOAuthProvider } from '../../providers/base';
import type { OAuthConfig, OAuthToken, OAuthUser } from '../../types';
import { OAuthProvider } from '../../types';

// 创建测试用的提供商实现
class TestProvider extends BaseOAuthProvider {
  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(params: {
    state?: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const url = new URL('https://example.com/oauth/authorize');
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    if (params.codeChallenge) {
      url.searchParams.append('code_challenge', params.codeChallenge);
    }
    return url.toString();
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<OAuthToken> {
    return {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
    };
  }

  async getUserInfo(token: OAuthToken): Promise<OAuthUser> {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      provider: OAuthProvider.GOOGLE,
      providerId: 'test-user-id',
    };
  }
}

describe('BaseOAuthProvider', () => {
  let provider: TestProvider;
  let config: OAuthConfig;

  beforeEach(() => {
    // Given
    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
      scopes: ['read', 'write'],
    };
    provider = new TestProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      // Then
      expect((provider as any).config).toEqual(config);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL with client ID and redirect URI', () => {
      // When
      const url = provider.getAuthorizationUrl({});

      // Then
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
    });

    it('should include state parameter when provided', () => {
      // Given
      const state = 'test-state-123';

      // When
      const url = provider.getAuthorizationUrl({ state });

      // Then
      expect(url).toContain(`state=${state}`);
    });

    it('should include code challenge when provided', () => {
      // Given
      const codeChallenge = 'test-code-challenge';

      // When
      const url = provider.getAuthorizationUrl({ codeChallenge });

      // Then
      expect(url).toContain(`code_challenge=${codeChallenge}`);
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for token', async () => {
      // Given
      const code = 'test-code';

      // When
      const token = await provider.exchangeCodeForToken(code);

      // Then
      expect(token.accessToken).toBe('test-access-token');
      expect(token.refreshToken).toBe('test-refresh-token');
      expect(token.expiresIn).toBe(3600);
    });

    it('should accept code verifier', async () => {
      // Given
      const code = 'test-code';
      const codeVerifier = 'test-verifier';

      // When
      const token = await provider.exchangeCodeForToken(code, codeVerifier);

      // Then
      expect(token).toBeDefined();
    });
  });

  describe('getUserInfo', () => {
    it('should get user info from token', async () => {
      // Given
      const token: OAuthToken = {
        accessToken: 'test-token',
      };

      // When
      const user = await provider.getUserInfo(token);

      // Then
      expect(user.id).toBe('test-user-id');
      expect(user.email).toBe('test@example.com');
      expect(user.provider).toBe(OAuthProvider.GOOGLE);
    });
  });

  describe('refreshToken', () => {
    it('should throw error when not implemented', async () => {
      // Given
      const refreshToken = 'test-refresh-token';

      // When & Then
      await expect(provider.refreshToken(refreshToken)).rejects.toThrow(
        'does not support token refresh'
      );
    });
  });

  describe('getDefaultScopes', () => {
    it('should return scopes from config', () => {
      // When
      const scopes = (provider as any).getDefaultScopes();

      // Then
      expect(scopes).toEqual(['read', 'write']);
    });

    it('should return empty array when no scopes in config', () => {
      // Given
      const configWithoutScopes: OAuthConfig = {
        clientId: 'test-id',
        redirectUri: 'https://example.com/callback',
      };
      const providerWithoutScopes = new TestProvider(configWithoutScopes);

      // When
      const scopes = (providerWithoutScopes as any).getDefaultScopes();

      // Then
      expect(scopes).toEqual([]);
    });
  });
});
