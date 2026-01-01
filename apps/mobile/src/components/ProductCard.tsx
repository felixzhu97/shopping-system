import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Product } from "@/src/types";
import { ThemedText } from "@/src/components";
import { Colors, Shadow, BorderRadius, Spacing } from "@/src/theme";
import { useRouter } from "expo-router";

interface ProductCardProps {
  product: Product;
  variant?: "hero" | "dual";
}

const { width } = Dimensions.get("window");

export function ProductCard({ product, variant = "dual" }: ProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (product.id) {
      router.push(`/product/${product.id}`);
    }
  };

  if (variant === "hero") {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <ThemedText
              style={styles.heroTitle}
              lightColor="#fff"
              darkColor="#fff"
            >
              {product.name}
            </ThemedText>
            {product.description && (
              <ThemedText
                style={styles.heroDescription}
                lightColor="rgba(255,255,255,0.7)"
                darkColor="rgba(255,255,255,0.7)"
              >
                {product.description}
              </ThemedText>
            )}
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.heroButtonSecondary}>
                <ThemedText
                  style={styles.heroButtonText}
                  lightColor="#fff"
                  darkColor="#fff"
                >
                  了解更多
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButtonPrimary}>
                <ThemedText
                  style={styles.heroButtonText}
                  lightColor="#000"
                  darkColor="#000"
                >
                  购买
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          {product.image && (
            <Image
              source={{ uri: product.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Dual card variant
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.dualCard}>
        <View style={styles.dualContent}>
          <ThemedText style={styles.dualTitle}>{product.name}</ThemedText>
          {product.description && (
            <ThemedText style={styles.dualDescription}>
              {product.description}
            </ThemedText>
          )}
          <TouchableOpacity style={styles.dualButton}>
            <ThemedText style={styles.dualButtonText}>了解更多 →</ThemedText>
          </TouchableOpacity>
        </View>
        {product.image && (
          <Image
            source={{ uri: product.image }}
            style={styles.dualImage}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#000",
    borderRadius: 28,
    overflow: "hidden",
    ...Shadow.medium,
  },
  heroContent: {
    padding: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },
  heroDescription: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
    color: "rgba(255,255,255,0.7)",
  },
  heroButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 16,
  },
  heroButtonSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  heroButtonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#fff",
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  heroImage: {
    width: "100%",
    height: 200,
  },
  dualCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 28,
    overflow: "hidden",
    ...Shadow.medium,
  },
  dualContent: {
    padding: 20,
  },
  dualTitle: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: "#1D1D1F",
  },
  dualDescription: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    color: "#1D1D1F",
  },
  dualButton: {
    marginTop: 16,
  },
  dualButtonText: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
  },
  dualImage: {
    width: "100%",
    height: 150,
  },
});

