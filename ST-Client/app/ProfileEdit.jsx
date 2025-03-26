import React from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function ProfileEdit() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        <View>
          <Text style={styles.color}>עריכת פרופיל</Text>
          <TouchableOpacity>
            <Link href="/BottomNav">
              <Text style={styles.color}>X </Text>
            </Link>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  color: {
    color: "white",
    fontSize: 18, // Adjust font size as needed
    padding: 10, // Add padding for better touch area
  },
});
