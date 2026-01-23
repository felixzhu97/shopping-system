# OAuth 认证工具包

统一的第三方登录集成解决方案，支持多个 OAuth 提供商，包含核心认证逻辑和 React 组件。

## 支持的提供商

- Google
- Facebook
- GitHub
- Apple
- 微信
- 支付宝

## 安装

```bash
pnpm add auth
```

## 快速开始

### 1. 配置 OAuth 提供商

```typescript
import { OAuthProvider } from 'auth';
import { OAuthProvider as ProviderType } from 'auth';

const providers = {
  [ProviderType.GOOGLE]: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['openid', 'profile', 'email'],
  },
  [ProviderType.GITHUB]: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['read:user', 'user:email'],
  },
};
```

### 2. 在应用中添加 OAuthProvider

```tsx
import { OAuthProvider } from 'auth';

function App() {
  return (
    <OAuthProvider providers={providers}>
      <YourApp />
    </OAuthProvider>
  );
}
```

### 3. 使用 OAuthButton 组件

```tsx
import { OAuthButton } from 'auth';
import { OAuthProvider as ProviderType } from 'auth';

function LoginPage() {
  return (
    <div>
      <OAuthButton provider={ProviderType.GOOGLE}>
        使用 Google 登录
      </OAuthButton>
      <OAuthButton provider={ProviderType.GITHUB}>
        使用 GitHub 登录
      </OAuthButton>
    </div>
  );
}
```

### 4. 处理 OAuth 回调

```tsx
import { OAuthCallback } from 'auth';

function CallbackPage() {
  return (
    <OAuthCallback
      onSuccess={(data) => {
        console.log('登录成功:', data.user);
        // 跳转到主页
        window.location.href = '/';
      }}
      onError={(error) => {
        console.error('登录失败:', error);
      }}
    />
  );
}
```

## 高级用法

### 使用 OAuthClient 直接调用

```typescript
import { OAuthClient, OAuthProvider } from 'auth';

const client = new OAuthClient();

// 注册提供商
client.registerProvider(OAuthProvider.GOOGLE, {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
});

// 获取授权 URL
const { url, state } = await client.getAuthorizationUrl(OAuthProvider.GOOGLE, {
  pkce: true,
});

// 处理回调
const { token, user } = await client.handleCallback(callbackUrl, state);

// 获取用户信息
const userInfo = await client.getUserInfo(OAuthProvider.GOOGLE);
```

### React Native 集成

```typescript
import { storage } from 'auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 设置 React Native 存储适配器
storage.setReactNativeAdapter(AsyncStorage);
```

### 使用 PKCE

PKCE (Proof Key for Code Exchange) 提供额外的安全性，特别适用于移动应用和单页应用。

```tsx
<OAuthButton
  provider={ProviderType.GOOGLE}
  pkce={true}
  onSuccess={(url) => {
    // 授权 URL 已生成，将自动跳转
  }}
/>
```

## API 参考

### OAuthProvider (React Context)

提供 OAuth 功能的 React 上下文。

**Props:**
- `providers`: `Record<OAuthProvider, OAuthConfig>` - 提供商配置对象

### OAuthButton

OAuth 登录按钮组件。

**Props:**
- `provider`: `OAuthProvider` - 提供商类型
- `children?`: `ReactNode` - 按钮内容
- `className?`: `string` - CSS 类名
- `style?`: `CSSProperties` - 内联样式
- `onClick?`: `() => void` - 点击回调
- `onSuccess?`: `(url: string) => void` - 成功回调
- `onError?`: `(error: Error) => void` - 错误回调
- `scopes?`: `string[]` - 请求的作用域
- `pkce?`: `boolean` - 是否启用 PKCE
- `disabled?`: `boolean` - 是否禁用

### OAuthCallback

OAuth 回调处理组件。

**Props:**
- `provider?`: `OAuthProvider` - 提供商类型（可选）
- `onSuccess?`: `(data) => void` - 成功回调
- `onError?`: `(error: Error) => void` - 错误回调
- `redirectTo?`: `string` - 成功后的重定向 URL
- `children?`: `ReactNode` - 加载时显示的内容

### OAuthClient

OAuth 客户端类。

**Methods:**
- `registerProvider(provider, config)`: 注册 OAuth 提供商
- `getAuthorizationUrl(provider, options?)`: 获取授权 URL
- `handleCallback(callbackUrl, storedState?)`: 处理 OAuth 回调
- `getToken(provider)`: 获取已保存的 Token
- `refreshToken(provider)`: 刷新 Token
- `getUserInfo(provider)`: 获取用户信息
- `logout(provider)`: 登出

### TokenManager

Token 管理器。

**Methods:**
- `saveToken(token, provider?)`: 保存 Token
- `getToken(provider?)`: 获取 Token
- `removeToken(provider?)`: 删除 Token
- `isTokenExpired(provider?)`: 检查 Token 是否过期
- `getTokenRemainingTime(provider?)`: 获取 Token 剩余有效时间

## 环境变量

建议使用环境变量存储 OAuth 配置：

```env
# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Facebook
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your-client-id
FACEBOOK_CLIENT_SECRET=your-client-secret

# Apple
NEXT_PUBLIC_APPLE_CLIENT_ID=your-client-id
APPLE_CLIENT_SECRET=your-client-secret

# 微信
NEXT_PUBLIC_WECHAT_CLIENT_ID=your-app-id
WECHAT_CLIENT_SECRET=your-app-secret

# 支付宝
NEXT_PUBLIC_ALIPAY_CLIENT_ID=your-app-id
ALIPAY_CLIENT_SECRET=your-app-secret
```

## 注意事项

1. **安全性**: 
   - 永远不要在前端代码中暴露 `clientSecret`
   - 使用环境变量存储敏感信息
   - 生产环境建议使用 HTTPS

2. **微信和支付宝**:
   - 微信和支付宝的 OAuth 流程可能需要后端代理
   - 某些 API 调用需要服务器端签名

3. **Token 存储**:
   - Web 环境使用 `localStorage`
   - React Native 环境需要提供 `AsyncStorage` 实例

4. **回调 URL**:
   - 确保回调 URL 与 OAuth 应用配置中的重定向 URI 完全匹配
   - 包括协议、域名、端口和路径

5. **跨域问题**:
   - 某些提供商可能需要在后端代理 OAuth 请求
   - 检查 CORS 设置

## 许可证

MIT
