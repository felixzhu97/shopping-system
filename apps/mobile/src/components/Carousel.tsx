import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { ThemedText } from "@/src/components";

const { width } = Dimensions.get("window");

interface CarouselItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

interface CarouselProps {
  items: CarouselItem[];
  height?: number;
  autoPlayInterval?: number;
}

export function Carousel({
  items,
  height = 300,
  autoPlayInterval = 4000,
}: CarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;

    const startAutoPlay = () => {
      timerRef.current = setInterval(() => {
        setCurrentPage((prev) => {
          const next = prev < items.length - 1 ? prev + 1 : 0;
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, autoPlayInterval);
    };

    startAutoPlay();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [items.length, autoPlayInterval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentPage(index);
  };

  const renderItem = ({ item }: { item: CarouselItem }) => (
    <View style={[styles.page, { width, height }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ThemedText
            style={styles.title}
            lightColor="rgba(255,255,255,0.7)"
            darkColor="rgba(255,255,255,0.7)"
          >
            {item.title}
          </ThemedText>
          <ThemedText
            style={styles.subtitle}
            lightColor="#fff"
            darkColor="#fff"
          >
            {item.subtitle}
          </ThemedText>
          <ThemedText
            style={styles.description}
            lightColor="rgba(255,255,255,0.7)"
            darkColor="rgba(255,255,255,0.7)"
          >
            {item.description}
          </ThemedText>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonSecondary}>
              <ThemedText
                style={styles.buttonText}
                lightColor="#fff"
                darkColor="#fff"
              >
                {item.secondaryButtonText}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonPrimary}>
              <ThemedText
                style={styles.buttonText}
                lightColor="#000"
                darkColor="#000"
              >
                {item.primaryButtonText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      {items.length > 1 && (
        <View style={styles.indicators}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  subtitle: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 8,
    color: "#fff",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
    color: "rgba(255,255,255,0.7)",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 32,
    gap: 16,
  },
  buttonSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  indicators: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
  },
});

