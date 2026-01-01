import { Text, View, type TextProps, type ViewProps } from "react-native";
import { textStyles } from "./theme";
import { useThemeColor } from "./hooks";
import { ThemedTextProps, ThemedViewProps } from "@/src/types";

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text",
  );

  return (
    <Text style={[textStyles[type], { color: textColor }, style]} {...rest} />
  );
}

// 导出购物系统组件
export { ProductCard } from "./components/ProductCard";
export { Carousel } from "./components/Carousel";
export { CategorySelector } from "./components/CategorySelector";
export { QuantitySelector } from "./components/QuantitySelector";
export { PriceDisplay } from "./components/PriceDisplay";
export { ProductImageCarousel } from "./components/ProductImageCarousel";
export { CartItem } from "./components/CartItem";
