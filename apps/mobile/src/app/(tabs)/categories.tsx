import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, CategorySelector, ProductCard } from "@/src/components";
import { useProductStore } from "@/src/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, Spacing } from "@/src/theme";
import type { Category } from "@/src/components/CategorySelector";

const categories: Category[] = [
  {
    id: "all",
    name: "全部商品",
    description: "浏览所有精选商品",
    icon: "all-inclusive",
    color: "#007AFF",
  },
  {
    id: "electronics",
    name: "电子产品",
    description: "智能设备与科技产品",
    icon: "devices",
    color: "#5856D6",
  },
  {
    id: "clothing",
    name: "服装",
    description: "时尚服饰与配饰",
    icon: "checkroom",
    color: "#FF2D55",
  },
  {
    id: "home-kitchen",
    name: "家居厨房",
    description: "家居用品与厨房电器",
    icon: "home",
    color: "#FF9500",
  },
  {
    id: "books",
    name: "图书",
    description: "知识书籍与文学作品",
    icon: "book",
    color: "#34C759",
  },
];

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const { products, isLoading, error, fetchProducts, clearError } =
    useProductStore();

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    await fetchProducts(selectedCategory === "all" ? undefined : selectedCategory);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "featured":
      default:
        return 0;
    }
  });

  if (error) {
    Alert.alert("错误", error, [
      { text: "确定", onPress: clearError },
      { text: "重试", onPress: loadProducts },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          商品分类
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "排序",
              "选择排序方式",
              [
                { text: "推荐", onPress: () => handleSortChange("featured") },
                {
                  text: "价格从低到高",
                  onPress: () => handleSortChange("price-asc"),
                },
                {
                  text: "价格从高到低",
                  onPress: () => handleSortChange("price-desc"),
                },
                { text: "评分", onPress: () => handleSortChange("rating") },
                { text: "取消", style: "cancel" },
              ],
              { cancelable: true }
            );
          }}
        >
          <MaterialIcons name="sort" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </ThemedView>

      <CategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategoryChange}
      />

      {isLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : sortedProducts.length > 0 ? (
        <FlatList
          data={sortedProducts}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <ProductCard product={item} variant="dual" />
            </View>
          )}
          keyExtractor={(item) => item.id ?? `product-${item.name}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="inventory-2"
            size={64}
            color={Colors.light.tabIconDefault}
          />
          <ThemedText type="subtitle" style={styles.emptyText}>
            暂无商品
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            该分类下暂时没有商品
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProducts}
          >
            <ThemedText style={styles.retryButtonText}>重新加载</ThemedText>
          </TouchableOpacity>
        </View>
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
  row: {
    justifyContent: "space-between",
    gap: Spacing.medium,
  },
  productCard: {
    flex: 1,
    maxWidth: "48%",
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
  retryButton: {
    marginTop: Spacing.medium,
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.small,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

