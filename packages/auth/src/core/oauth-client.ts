import type {
  OAuthProvider as OAuthProviderType,
  OAuthConfig,
  OAuthToken,
  OAuthUser,
  OAuthOptions,
} from '../types';
import { OAuthProvider } from '../types';
import { BaseOAuthProvider } from '../providers/base';
import { GoogleProvider } from '../providers/google';
import { FacebookProvider } from '../providers/facebook';
import { GitHubProvider } from '../providers/github';
import { AppleProvider } from '../providers/apple';
import { WeChatProvider } from '../providers/wechat';
import { AlipayProvider } from '../providers/alipay';
import { tokenManager } from './token-manager';
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  extractCodeFromUrl,
  extractStateFromUrl,
  extractErrorFromUrl,
} from '../utils/url';

/**
 * OAuth 客户端
 * 统一管理多个 OAuth 提供商
 */
export class OAuthClient {
  private providers: Map<OAuthProviderType, BaseOAuthProvider> = new Map();
  private stateStorage: Map<string, { provider: OAuthProviderType; codeVerifier?: string }> =
    new Map();

  /**
   * 注册 OAuth 提供商
   */
  registerProvider(provider: OAuthProviderType, config: OAuthConfig): void {
    let providerInstance: BaseOAuthProvider;

    switch (provider) {
      case OAuthProvider.GOOGLE:
        providerInstance = new GoogleProvider(config);
        break;
      case OAuthProvider.FACEBOOK:
        providerInstance = new FacebookProvider(config);
        break;
      case OAuthProvider.GITHUB:
        providerInstance = new GitHubProvider(config);
        break;
      case OAuthProvider.APPLE:
        providerInstance = new AppleProvider(config);
        break;
      case OAuthProvider.WECHAT:
        providerInstance = new WeChatProvider(config);
        break;
      case OAuthProvider.ALIPAY:
        providerInstance = new AlipayProvider(config);
        break;
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    this.providers.set(provider, providerInstance);
  }

  /**
   * 获取授权 URL
   */
  async getAuthorizationUrl(
    provider: OAuthProviderType,
    options?: {
      state?: string;
      scopes?: string[];
      pkce?: boolean;
    }
  ): Promise<{ url: string; state: string; codeVerifier?: string }> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not registered`);
    }

    const state = options?.state || generateState();
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    // 如果启用 PKCE
    if (options?.pkce) {
      codeVerifier = generateCodeVerifier();
      codeChallenge = await generateCodeChallenge(codeVerifier);
    }

    // 存储 state 和 codeVerifier 的映射
    this.stateStorage.set(state, { provider, codeVerifier });

    const url = providerInstance.getAuthorizationUrl({
      state,
      scopes: options?.scopes,
      codeChallenge,
    });

    return { url, state, codeVerifier };
  }

  /**
   * 处理 OAuth 回调
   */
  async handleCallback(
    callbackUrl: string,
    storedState?: string
  ): Promise<{
    provider: OAuthProviderType;
    token: OAuthToken;
    user: OAuthUser;
  }> {
    // 检查错误
    const error = extractErrorFromUrl(callbackUrl);
    if (error) {
      throw new Error(
        `OAuth error: ${error.error} - ${error.errorDescription || ''}`
      );
    }

    // 提取授权码和 state
    const code = extractCodeFromUrl(callbackUrl);
    if (!code) {
      throw new Error('Authorization code not found in callback URL');
    }

    const state = extractStateFromUrl(callbackUrl);
    if (!state) {
      throw new Error('State parameter not found in callback URL');
    }

    // 验证 state
    if (storedState && state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // 获取存储的 provider 和 codeVerifier
    const stored = this.stateStorage.get(state);
    if (!stored) {
      throw new Error('State not found or expired');
    }

    const { provider, codeVerifier } = stored;
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not registered`);
    }

    // 交换 token
    const token = await providerInstance.exchangeCodeForToken(code, codeVerifier);

    // 获取用户信息
    const user = await providerInstance.getUserInfo(token);

    // 保存 token
    await tokenManager.saveToken(token, provider);

    // 清理 state
    this.stateStorage.delete(state);

    return { provider, token, user };
  }

  /**
   * 获取已保存的 Token
   */
  async getToken(provider: OAuthProviderType): Promise<OAuthToken | null> {
    return tokenManager.getToken(provider);
  }

  /**
   * 刷新 Token
   */
  async refreshToken(provider: OAuthProviderType): Promise<OAuthToken> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not registered`);
    }

    const token = await tokenManager.getToken(provider);
    if (!token || !token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newToken = await providerInstance.refreshToken(token.refreshToken);
    await tokenManager.saveToken(newToken, provider);

    return newToken;
  }

  /**
   * 获取用户信息（使用已保存的 Token）
   */
  async getUserInfo(provider: OAuthProviderType): Promise<OAuthUser> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not registered`);
    }

    let token = await tokenManager.getToken(provider);
    if (!token) {
      throw new Error('No token available');
    }

    // 检查 token 是否过期，如果过期则尝试刷新
    const isExpired = await tokenManager.isTokenExpired(provider);
    if (isExpired && token.refreshToken) {
      try {
        token = await this.refreshToken(provider);
      } catch {
        throw new Error('Token expired and refresh failed');
      }
    }

    return providerInstance.getUserInfo(token);
  }

  /**
   * 登出（删除 Token）
   */
  async logout(provider: OAuthProviderType): Promise<void> {
    await tokenManager.removeToken(provider);
  }
}

// 导出单例实例
export const oauthClient = new OAuthClient();
