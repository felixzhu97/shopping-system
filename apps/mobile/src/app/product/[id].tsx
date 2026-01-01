import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ProductImageCarousel,
  QuantitySelector,
  PriceDisplay,
  ProductCard,
} from "@/src/components";
import { useProductStore, useCartStore } from "@/src/store";
import { Product, ProductHelpers } from "@/src/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, Spacing, Shadow, BorderRadius } from "@/src/theme";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "reviews">("details");
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { fetchProductById, recommendedProducts, fetchRecommendedProducts } =
    useProductStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    const productData = await fetchProductById(id);
    if (productData) {
      setProduct(productData);
      // 加载相关产品
      await fetchRecommendedProducts();
    } else {
      Alert.alert("错误", "产品不存在", [
        { text: "确定", onPress: () => router.back() },
      ]);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.id) return;

    setIsAddToCartLoading(true);
    try {
      await addToCart(product, quantity);
      setAddedToCart(true);
      Alert.alert("成功", `${product.name} × ${quantity} 已添加到购物车`, [
        { text: "继续购物" },
        {
          text: "查看购物车",
          onPress: () => router.push("/(tabs)/cart"),
        },
      ]);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      Alert.alert("错误", `添加到购物车失败: ${error}`);
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    Alert.alert("提示", "立即购买功能开发中...");
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const images = ProductHelpers.getAllImages(product);
  const relatedProducts = recommendedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle">产品详情</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <MaterialIcons name="share" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons
              name="favorite-border"
              size={24}
              color={Colors.light.text}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProductImageCarousel product={product} />

        <View style={styles.content}>
          {/* 产品信息 */}
          <View style={styles.productHeader}>
            {product.category && (
              <View style={styles.categoryTag}>
                <ThemedText style={styles.categoryText}>
                  {product.category}
                </ThemedText>
              </View>
            )}
            <ThemedText type="title" style={styles.productName}>
              {product.name}
            </ThemedText>
            {product.rating && (
              <View style={styles.rating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name={i < Math.floor(product.rating!) ? "star" : "star-border"}
                    size={16}
                    color={i < Math.floor(product.rating!) ? "#FFD700" : "#ccc"}
                  />
                ))}
                <ThemedText style={styles.ratingText}>
                  {product.rating.toFixed(1)} ({product.reviewCount ?? 0} 评价)
                </ThemedText>
              </View>
            )}
          </View>

          {/* 价格 */}
          <View style={styles.priceSection}>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              size="large"
            />
            {ProductHelpers.discountPercentage(product) && (
              <View style={styles.discountTag}>
                <ThemedText style={styles.discountText}>
                  节省 ¥
                  {(
                    (product.originalPrice ?? 0) - product.price
                  ).toFixed(2)}{" "}
                  ({ProductHelpers.discountPercentage(product)}% 折扣)
                </ThemedText>
              </View>
            )}
          </View>

          {/* 库存和配送 */}
          <View style={styles.stockSection}>
            <View style={styles.stockRow}>
              <View
                style={[
                  styles.stockIndicator,
                  {
                    backgroundColor: ProductHelpers.hasStock(product)
                      ? "#34C759"
                      : "#FF3B30",
                  },
                ]}
              />
              <ThemedText
                style={{
                  color: ProductHelpers.hasStock(product) ? "#34C759" : "#FF3B30",
                }}
              >
                {ProductHelpers.hasStock(product) ? "有库存" : "缺货"}
              </ThemedText>
            </View>
            <View style={styles.shippingRow}>
              <MaterialIcons name="local-shipping" size={16} color="#34C759" />
              <ThemedText style={styles.shippingText}>
                满¥200包邮，预计1-3天送达
              </ThemedText>
            </View>
          </View>

          {/* 数量选择 */}
          <View style={styles.quantitySection}>
            <ThemedText style={styles.quantityLabel}>数量</ThemedText>
            <QuantitySelector
              quantity={quantity}
              max={product.stock ?? 99}
              onIncrease={() =>
                setQuantity((prev) =>
                  Math.min(prev + 1, product.stock ?? 99)
                )
              }
              onDecrease={() => setQuantity((prev) => Math.max(prev - 1, 1))}
            />
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                (!ProductHelpers.hasStock(product) ||
                  isAddToCartLoading) &&
                  styles.buttonDisabled,
                addedToCart && styles.addedButton,
              ]}
              onPress={handleAddToCart}
              disabled={
                !ProductHelpers.hasStock(product) || isAddToCartLoading
              }
            >
              {isAddToCartLoading ? (
                <ActivityIndicator color="#fff" />
              ) : addedToCart ? (
                <>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <ThemedText
                    style={styles.buttonText}
                    lightColor="#fff"
                    darkColor="#fff"
                  >
                    已添加到购物车
                  </ThemedText>
                </>
              ) : (
                <>
                  <MaterialIcons name="shopping-cart" size={20} color="#fff" />
                  <ThemedText
                    style={styles.buttonText}
                    lightColor="#fff"
                    darkColor="#fff"
                  >
                    添加到购物车
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buyNowButton,
                !ProductHelpers.hasStock(product) && styles.buttonDisabled,
              ]}
              onPress={handleBuyNow}
              disabled={!ProductHelpers.hasStock(product)}
            >
              <ThemedText style={styles.buyNowButtonText}>立即购买</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 详情选项卡 */}
          <View style={styles.tabs}>
            <View style={styles.tabHeader}>
              {(["details", "shipping", "reviews"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    activeTab === tab && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab === "details"
                      ? "详情"
                      : tab === "shipping"
                      ? "配送"
                      : "评价"}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tabContent}>
              {activeTab === "details" && (
                <View>
                  {product.description && (
                    <>
                      <ThemedText type="subtitle" style={styles.sectionTitle}>
                        产品描述
                      </ThemedText>
                      <ThemedText style={styles.description}>
                        {product.description}
                      </ThemedText>
                    </>
                  )}
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    产品特性
                  </ThemedText>
                  {["高品质材料", "精美设计", "多功能", "环保材质"].map(
                    (feature, i) => (
                      <View key={i} style={styles.featureItem}>
                        <MaterialIcons name="check" size={16} color="#007AFF" />
                        <ThemedText style={styles.featureText}>
                          {feature}
                        </ThemedText>
                      </View>
                    )
                  )}
                </View>
              )}

              {activeTab === "shipping" && (
                <View>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    配送信息
                  </ThemedText>
                  <ThemedText style={styles.description}>
                    我们提供全国配送服务。标准配送时间为1-3个工作日，偏远地区可能需要额外1-3天。订单满200元免费配送，配送费为15元。
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    退换政策
                  </ThemedText>
                  <ThemedText style={styles.description}>
                    商品签收后7天内，如发现质量问题，可申请退换货。退换货时请保持商品原包装完整，不影响二次销售。
                  </ThemedText>
                </View>
              )}

              {activeTab === "reviews" && (
                <View>
                  {[
                    {
                      name: "张先生",
                      rating: 5,
                      date: "2023年12月15日",
                      comment: "非常满意的购物体验，产品质量超出预期，快递很快，包装也很好，会继续支持！",
                    },
                    {
                      name: "李女士",
                      rating: 4,
                      date: "2023年11月28日",
                      comment: "整体不错，使用了一周感觉质量可靠，就是价格稍贵了点，希望有更多优惠活动。",
                    },
                    {
                      name: "王先生",
                      rating: 5,
                      date: "2023年10月17日",
                      comment: "朋友推荐购买的，确实名不虚传，各方面都很好，尤其是做工和质感，非常推荐！",
                    },
                  ].map((review, i) => (
                    <View key={i} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <ThemedText style={styles.reviewName}>
                          {review.name}
                        </ThemedText>
                        <ThemedText style={styles.reviewDate}>
                          {review.date}
                        </ThemedText>
                      </View>
                      <View style={styles.reviewRating}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <MaterialIcons
                            key={j}
                            name={j < review.rating ? "star" : "star-border"}
                            size={16}
                            color={j < review.rating ? "#FFD700" : "#ccc"}
                          />
                        ))}
                      </View>
                      <ThemedText style={styles.reviewComment}>
                        {review.comment}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* 相关产品 */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                相关推荐
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedProducts}
              >
                {relatedProducts.map((relatedProduct) => (
                  <View key={relatedProduct.id} style={styles.relatedProduct}>
                    <ProductCard product={relatedProduct} variant="dual" />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.medium,
  },
  productHeader: {
    marginBottom: Spacing.medium,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Spacing.small,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1976D2",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: Spacing.small,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  priceSection: {
    marginBottom: Spacing.medium,
  },
  discountTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#C62828",
  },
  stockSection: {
    marginBottom: Spacing.medium,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.small,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shippingText: {
    fontSize: 14,
    color: "#34C759",
  },
  quantitySection: {
    marginBottom: Spacing.large,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.small,
  },
  actionButtons: {
    marginBottom: Spacing.large,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: Spacing.medium,
    borderRadius: 24,
    marginBottom: Spacing.small,
  },
  addedButton: {
    backgroundColor: "#34C759",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buyNowButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
    paddingVertical: Spacing.medium,
    borderRadius: 24,
    alignItems: "center",
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  tabs: {
    marginBottom: Spacing.large,
  },
  tabHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F7",
    borderRadius: 24,
    padding: 4,
    marginBottom: Spacing.medium,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.small,
    alignItems: "center",
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "#fff",
    ...Shadow.small,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  tabTextActive: {
    color: Colors.light.text,
    fontWeight: "500",
  },
  tabContent: {
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacing.small,
  },
  description: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: Spacing.medium,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: "#F5F5F7",
    padding: Spacing.medium,
    borderRadius: 12,
    marginBottom: Spacing.medium,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.small,
  },
  reviewName: {
    fontWeight: "500",
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: Spacing.small,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  relatedSection: {
    marginTop: Spacing.large,
  },
  relatedProducts: {
    gap: Spacing.medium,
  },
  relatedProduct: {
    width: 150,
  },
});

