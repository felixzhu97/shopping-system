import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/src/components";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius, Shadow, Spacing } from "@/src/theme";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
}: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelect(category.id)}
              style={[
                styles.categoryCard,
                isSelected && {
                  backgroundColor: category.color,
                },
              ]}
            >
              <MaterialIcons
                name={category.icon as any}
                size={28}
                color={isSelected ? "#fff" : category.color}
              />
              <ThemedText
                style={[
                  styles.categoryName,
                  isSelected && { color: "#fff" },
                ]}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.small,
  },
  content: {
    paddingHorizontal: Spacing.medium,
    gap: Spacing.medium,
    paddingVertical: Spacing.small,
  },
  categoryCard: {
    width: 90,
    minHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.small,
    ...Shadow.small,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: Spacing.small,
    textAlign: "center",
    lineHeight: 18,
  },
});

