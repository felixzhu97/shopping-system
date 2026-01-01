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
                size={32}
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
    height: 120,
    paddingVertical: Spacing.medium,
  },
  content: {
    paddingHorizontal: Spacing.medium,
    gap: Spacing.small,
  },
  categoryCard: {
    width: 100,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.large,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.medium,
    ...Shadow.small,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: Spacing.small,
    textAlign: "center",
  },
});

