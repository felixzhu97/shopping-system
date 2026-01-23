// 环境变量类型声明
declare var process: {
  env: {
    // Expo 公共环境变量
    EXPO_PUBLIC_API_URL?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
};
