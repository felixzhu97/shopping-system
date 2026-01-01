import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/src/components";
import { CartItem as CartItemType, CartItemHelpers } from "@/src/types";
import { QuantitySelector } from "./QuantitySelector";
import { PriceDisplay } from "./PriceDisplay";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius, Shadow, Spacing } from "@/src/theme";
import { useRouter } from "expo-router";

interface CartItemComponentProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemComponentProps) {
  const router = useRouter();

  const handlePress = () => {
    if (item.productId) {
      router.push(`/product/${item.productId}`);
    }
  };

  const price = item.product?.price ?? item.price ?? 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.imageContainer}
        activeOpacity={0.9}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons
              name="image"
              size={32}
              color={Colors.light.tabIconDefault}
            />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <ThemedText style={styles.name} numberOfLines={2}>
            {item.name ?? "未知商品"}
          </ThemedText>
          <PriceDisplay price={price} size="small" />
        </TouchableOpacity>

        <View style={styles.actions}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          />
          <TouchableOpacity
            onPress={() => onRemove(item.productId)}
            style={styles.deleteButton}
          >
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={Colors.light.tabIconDefault}
            />
          </TouchableOpacity>
          <ThemedText style={styles.subtotal}>
            ¥{CartItemHelpers.subtotal(item).toFixed(2)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: BorderRadius.large,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    ...Shadow.medium,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    backgroundColor: Colors.light.background,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.medium,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.small,
  },
  deleteButton: {
    padding: Spacing.small,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
});

