import React, { useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView, ThemedText, CartItem } from "@/src/components";
import { useCartStore } from "@/src/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, Spacing, Shadow } from "@/src/theme";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const {
    items,
    isLoading,
    error,
    subtotal,
    shipping,
    tax,
    total,
    loadCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearError,
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("提示", "购物车是空的，请先添加商品");
      return;
    }
    Alert.alert("提示", "结账功能开发中...");
  };

  const handleClearCart = () => {
    Alert.alert(
      "确认清空",
      "确定要清空购物车吗？此操作不可撤销。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "清空",
          style: "destructive",
          onPress: async () => {
            await clearCart();
          },
        },
      ]
    );
  };

  const handleRemoveItem = (productId: string, productName?: string) => {
    Alert.alert(
      "确认删除",
      `确定要从购物车中删除"${productName ?? "该商品"}"吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    Alert.alert("错误", error, [
      { text: "确定", onPress: clearError },
      { text: "重试", onPress: loadCart },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          购物车
        </ThemedText>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <MaterialIcons name="more-vert" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        )}
      </ThemedView>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="shopping-cart"
            size={80}
            color={Colors.light.tabIconDefault}
          />
          <ThemedText type="subtitle" style={styles.emptyText}>
            购物车是空的
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>快去添加一些商品吧</ThemedText>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={(productId) =>
                  handleRemoveItem(productId, item.name)
                }
              />
            )}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 20 }
            ]}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <ThemedText>小计</ThemedText>
              <ThemedText>¥{subtotal.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>运费</ThemedText>
              <ThemedText style={shipping === 0 && styles.freeShipping}>
                {shipping === 0 ? "免费" : `¥${shipping.toFixed(2)}`}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>税费</ThemedText>
              <ThemedText>¥{tax.toFixed(2)}</ThemedText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>总计</ThemedText>
              <ThemedText style={styles.totalAmount}>
                ¥{total.toFixed(2)}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <ThemedText style={styles.checkoutButtonText}>
                立即结账
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xlarge,
  },
  emptyText: {
    marginTop: Spacing.medium,
    color: Colors.light.text,
  },
  emptySubtext: {
    marginTop: Spacing.small,
    color: Colors.light.tabIconDefault,
  },
  summary: {
    backgroundColor: "#fff",
    padding: Spacing.medium,
    paddingBottom: Spacing.medium,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Shadow.medium,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  freeShipping: {
    color: Colors.light.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: Spacing.small,
    paddingTop: Spacing.small,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.medium,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.medium,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

