import React from "react";
import { Text, View, Image, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function Welcome() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
        <View style={styles.upperSide}>
          <Image style={styles.image} source={require("../Images/logo.png")} />
          <Text style={{ fontSize: 24, marginTop: 20 }}>ברוכים הבאים!</Text>
        </View>
        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <View>
            <Link href="/LogIn" style={styles.button}>
              <Text style={styles.buttonText}>התחברות לחשבון</Text>
            </Link>
          </View>
          <View>
            <Link href="/SignUp" style={styles.button}>
              <Text style={styles.buttonText}>יצירת חשבון</Text>
            </Link>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    flex: 1,
    alignItems: "center",
  },
  upperSide: {
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    height: "50%",
  },
  image: {
    width: 220,
    height: 220,
    marginTop: 20,
  },
  background: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: "center", // Center the text inside the button
  },
  buttonText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
  },
});
