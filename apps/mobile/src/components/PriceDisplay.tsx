import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/src/components";
import { Colors } from "@/src/theme";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: "small" | "medium" | "large";
}

export function PriceDisplay({
  price,
  originalPrice,
  size = "medium",
}: PriceDisplayProps) {
  const priceSize = size === "small" ? 16 : size === "large" ? 28 : 20;
  const originalPriceSize = size === "small" ? 12 : size === "large" ? 16 : 14;

  return (
    <View style={styles.container}>
      <ThemedText
        style={[styles.price, { fontSize: priceSize }]}
        lightColor={size === "large" ? "#1D1D1F" : "#007AFF"}
        darkColor={size === "large" ? "#fff" : "#007AFF"}
      >
        ¥{price.toFixed(2)}
      </ThemedText>
      {originalPrice && originalPrice > price && (
        <ThemedText
          style={[styles.originalPrice, { fontSize: originalPriceSize }]}
          lightColor={Colors.light.tabIconDefault}
          darkColor={Colors.dark.tabIconDefault}
        >
          ¥{originalPrice.toFixed(2)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  price: {
    fontWeight: "bold",
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
});

