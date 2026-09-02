import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

type RootErrorBoundaryProps = { children: React.ReactNode };
type RootErrorBoundaryState = { hasError: boolean };

export class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]}>
        <View style={styles.container}>
          <View style={styles.icon}><Text style={styles.iconText}>!</Text></View>
          <Text style={styles.title}>PDF Studio could not open</Text>
          <Text style={styles.message}>The workspace encountered an unexpected problem. Your saved documents were not changed.</Text>
          <Pressable onPress={this.handleRetry} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  icon: { alignItems: "center", backgroundColor: "#DBEAFE", borderRadius: 28, height: 56, justifyContent: "center", marginBottom: 18, width: 56 },
  iconText: { color: "#2563EB", fontSize: 30, fontWeight: "800" },
  title: { color: "#0B1F3A", fontSize: 22, fontWeight: "800", textAlign: "center" },
  message: { color: "#64748B", fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 360, textAlign: "center" },
  button: { backgroundColor: "#0B1F3A", borderRadius: 12, marginTop: 24, paddingHorizontal: 24, paddingVertical: 13 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
