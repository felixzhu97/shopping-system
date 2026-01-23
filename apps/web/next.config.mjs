import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let userConfig = undefined;
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs');
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import('./v0-user-next.config');
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Configure module resolution for workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      'monitoring/client': path.resolve(__dirname, '../../packages/monitoring/src/client.ts'),
    };

    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        util: false,
      };

      // Ignore dd-trace and related packages in client bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(dd-trace|@datadog\/libdatadog)$/,
        })
      );

      // Exclude dd-trace and related packages from client bundle
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        ({ request }, callback) => {
          // Exclude dd-trace and related Node.js-only packages
          if (
            request === 'dd-trace' ||
            request === '@datadog/libdatadog' ||
            request?.startsWith('dd-trace/') ||
            request?.startsWith('@datadog/libdatadog/')
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig;

  for (const key in config) {
    if (typeof nextConfig[key] === 'object' && !Array.isArray(nextConfig[key])) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      };
    } else {
      nextConfig[key] = config[key];
    }
  }
}

export default nextConfig;
