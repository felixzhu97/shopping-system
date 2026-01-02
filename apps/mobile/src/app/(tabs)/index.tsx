import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView, ThemedText, Carousel, ProductCard } from "@/src/components";
import { useProductStore } from "@/src/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, Spacing, Shadow } from "@/src/theme";

// 轮播图数据
const carouselItems = [
  {
    image: Image.resolveAssetSource(require("@/src/assets/images/hero-apple-style.jpg")).uri,
    title: "新品上市",
    subtitle: "智能生活",
    description: "发现更多智能便捷的生活方式",
    primaryButtonText: "立即购买",
    secondaryButtonText: "了解更多",
  },
  {
    image: Image.resolveAssetSource(require("@/src/assets/images/hero_apple_event_september.jpg")).uri,
    title: "秋季新品",
    subtitle: "创新科技",
    description: "体验最新科技带来的无限可能",
    primaryButtonText: "立即购买",
    secondaryButtonText: "了解更多",
  },
  {
    image: Image.resolveAssetSource(require("@/src/assets/images/promo_iphone_tradein.jpg")).uri,
    title: "以旧换新",
    subtitle: "优惠活动",
    description: "新设备最高可享95折优惠",
    primaryButtonText: "立即参与",
    secondaryButtonText: "了解更多",
  },
  {
    image: Image.resolveAssetSource(require("@/src/assets/images/promo_macbook_air_avail.jpg")).uri,
    title: "MacBook Air",
    subtitle: "轻薄便携",
    description: "强大的性能，轻薄的设计",
    primaryButtonText: "立即购买",
    secondaryButtonText: "了解更多",
  },
];

const quickActions = [
  { icon: "local-offer", label: "优惠券" },
  { icon: "star", label: "收藏夹" },
  { icon: "history", label: "浏览记录" },
  { icon: "location-on", label: "收货地址" },
  { icon: "support-agent", label: "客服" },
  { icon: "settings", label: "设置" },
  { icon: "help", label: "帮助" },
  { icon: "info", label: "关于" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    recommendedProducts,
    isLoading,
    error,
    fetchRecommendedProducts,
    clearError,
  } = useProductStore();

  useEffect(() => {
    fetchRecommendedProducts();
  }, []);

  const handleRefresh = async () => {
    await fetchRecommendedProducts();
  };

  if (error) {
    Alert.alert("错误", error, [
      { text: "确定", onPress: clearError },
      { text: "重试", onPress: fetchRecommendedProducts },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          购物系统
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="search" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons
              name="notifications"
              size={24}
              color={Colors.light.text}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + insets.bottom }
        ]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 轮播图 */}
        <Carousel items={carouselItems} />

        {/* 商店标语 */}
        <ThemedView style={styles.headline}>
          <ThemedText style={styles.headlineText}>
            所有产品都经过精心设计，为您提供卓越的用户体验
          </ThemedText>
        </ThemedView>

        {/* 产品展示 */}
        {isLoading && recommendedProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : recommendedProducts.length > 0 ? (
          <View style={styles.productsSection}>
            {/* 主要产品展示（大卡片） */}
            {recommendedProducts[0] && (
              <View style={styles.heroCardContainer}>
                <ProductCard
                  product={recommendedProducts[0]}
                  variant="hero"
                />
              </View>
            )}

            {/* 双列产品展示 */}
            {recommendedProducts.length >= 3 && (
              <View style={styles.dualCardsContainer}>
                <View style={styles.dualCardWrapper}>
                  <ProductCard
                    product={recommendedProducts[1]}
                    variant="dual"
                  />
                </View>
                <View style={styles.dualCardWrapper}>
                  <ProductCard
                    product={recommendedProducts[2]}
                    variant="dual"
                  />
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText>暂无推荐商品</ThemedText>
          </View>
        )}

        {/* 促销活动区域 */}
        <View style={styles.promoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            特别活动
          </ThemedText>
          <View style={styles.promoCards}>
            <View style={styles.promoCard}>
              <ThemedText style={styles.promoTitle}>母亲节礼物</ThemedText>
              <ThemedText style={styles.promoDescription}>
                为您的母亲选择完美礼物
              </ThemedText>
              <TouchableOpacity style={styles.promoButton}>
                <ThemedText style={styles.promoButtonText}>
                  立即购买 →
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.promoCard}>
              <ThemedText style={styles.promoTitle}>以旧换新</ThemedText>
              <ThemedText style={styles.promoDescription}>
                新设备最高可享95折优惠
              </ThemedText>
              <TouchableOpacity style={styles.promoButton}>
                <ThemedText style={styles.promoButtonText}>
                  立即购买 →
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 快捷功能区域 */}
        <View style={styles.quickActionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快捷功能
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialIcons
                    name={action.icon as any}
                    size={24}
                    color={Colors.light.primary}
                  />
                </View>
                <ThemedText style={styles.quickActionLabel}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.small,
  },
  iconButton: {
    padding: Spacing.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headline: {
    backgroundColor: "#F5F5F7",
    paddingVertical: 40,
    paddingHorizontal: Spacing.large,
    alignItems: "center",
  },
  headlineText: {
    fontSize: 20,
    color: "#1D1D1F",
    textAlign: "center",
  },
  loadingContainer: {
    padding: Spacing.xlarge,
    alignItems: "center",
  },
  productsSection: {
    padding: Spacing.medium,
  },
  heroCardContainer: {
    marginBottom: Spacing.medium,
  },
  dualCardsContainer: {
    flexDirection: "row",
    gap: Spacing.medium,
  },
  dualCardWrapper: {
    flex: 1,
  },
  emptyContainer: {
    padding: Spacing.xlarge,
    alignItems: "center",
  },
  promoSection: {
    padding: Spacing.medium,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: Spacing.medium,
  },
  promoCards: {
    flexDirection: "row",
    gap: Spacing.medium,
  },
  promoCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 28,
    padding: Spacing.medium,
    ...Shadow.medium,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: Spacing.small,
  },
  promoDescription: {
    fontSize: 14,
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: Spacing.medium,
  },
  promoButton: {
    alignItems: "center",
  },
  promoButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
  quickActionsSection: {
    padding: Spacing.medium,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: Spacing.medium,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.small,
  },
  quickActionLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});
