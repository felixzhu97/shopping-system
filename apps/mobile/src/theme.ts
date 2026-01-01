import { StyleSheet } from "react-native";

export const Colors = {
  light: {
    text: "#1D1D1F",
    background: "#fff",
    tint: "#007AFF",
    icon: "#1D1D1F",
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#007AFF",
    primary: "#007AFF", // 蓝色主题色，对应 Flutter 的 Color(0xFF2563EB)
    secondary: "#fff",
    highlight: "rgba(0,0,0,0.7)",
    glass: "rgba(255,255,255,0.7)",
    blackTransparent: "rgba(0,0,0,0.7)",
    whiteTransparent: "rgba(255,255,255,0.7)",
    border: "rgba(0,0,0,0.1)",
    gradientStart: "#FF2D55",
    gradientEnd: "#5856D6",
    // 购物系统特定颜色
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    info: "#007AFF",
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#0A84FF",
    icon: "#fff",
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#0A84FF",
    primary: "#0A84FF",
    secondary: "#000",
    highlight: "rgba(255,255,255,0.7)",
    glass: "rgba(0,0,0,0.7)",
    blackTransparent: "rgba(0,0,0,0.7)",
    whiteTransparent: "rgba(255,255,255,0.7)",
    border: "rgba(255,255,255,0.1)",
    gradientStart: "#FF375F",
    gradientEnd: "#5E5CE6",
    // 购物系统特定颜色
    success: "#30D158",
    error: "#FF453A",
    warning: "#FF9F0A",
    info: "#0A84FF",
  },
};

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
};

export const Shadow = StyleSheet.create({
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});

export const Typography = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export const Components = StyleSheet.create({
  // 购物系统组件样式将在后续步骤中添加
});
export const textStyles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
