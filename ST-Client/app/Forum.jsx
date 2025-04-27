import React from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Forum() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        <View>
          <Text style={styles.color}> שלום פורום</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? -30 : 0,
  },
  color: {
    color: "white",
    fontSize: 18, // Adjust font size as needed
    padding: 10, // Add padding for better touch area
  },
});
