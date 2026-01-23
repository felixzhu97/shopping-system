import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/src/components";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius } from "@/src/theme";

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max = 99,
  onIncrease,
  onDecrease,
}: QuantitySelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.control}>
        <TouchableOpacity
          onPress={onDecrease}
          disabled={quantity <= min}
          style={[styles.button, quantity <= min && styles.buttonDisabled]}
        >
          <MaterialIcons
            name="remove"
            size={20}
            color={quantity <= min ? Colors.light.tabIconDefault : Colors.light.text}
          />
        </TouchableOpacity>
        <View style={styles.quantity}>
          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={onIncrease}
          disabled={quantity >= max}
          style={[styles.button, quantity >= max && styles.buttonDisabled]}
        >
          <MaterialIcons
            name="add"
            size={20}
            color={quantity >= max ? Colors.light.tabIconDefault : Colors.light.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.medium,
    alignSelf: "flex-start",
  },
  button: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    width: 40,
    alignItems: "center",
    paddingVertical: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

