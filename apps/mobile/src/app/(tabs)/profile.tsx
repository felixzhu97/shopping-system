import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText } from "@/src/components";
import { Colors, Spacing } from "@/src/theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          个人中心
        </ThemedText>
      </ThemedView>
      <View style={styles.content}>
        <ThemedText>个人中心页面 - 开发中</ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

