// 导出类型
export * from './types';

// 导出提供商
export { BaseOAuthProvider } from './providers/base';
export { GoogleProvider } from './providers/google';
export { FacebookProvider } from './providers/facebook';
export { GitHubProvider } from './providers/github';
export { AppleProvider } from './providers/apple';
export { WeChatProvider } from './providers/wechat';
export { AlipayProvider } from './providers/alipay';

// 导出核心逻辑
export { OAuthClient, oauthClient } from './core/oauth-client';
export { TokenManager, tokenManager } from './core/token-manager';
export { UserInfoMapper } from './core/user-info';

// 导出 React 组件
export { OAuthProvider, useOAuth } from './components/OAuthProvider';
export { OAuthButton } from './components/OAuthButton';
export { OAuthCallback } from './components/OAuthCallback';

// 导出工具函数
export * from './utils/storage';
export * from './utils/url';
