// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 配置 watchman 忽略根目录的 node_modules
config.watchFolders = [
  __dirname,
];

config.resolver = {
  ...config.resolver,
  // 确保只从当前应用的 node_modules 解析模块
  nodeModulesPaths: [
    require('path').resolve(__dirname, 'node_modules'),
  ],
};

module.exports = config;

