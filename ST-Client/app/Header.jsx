import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header() {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const getCoins = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const user = JSON.parse(data);
          setCoins(user?.coins ?? 0); // fallback to 0 if coins undefined
        }
      } catch (e) {
        console.error("Error retrieving user data:", e);
      }
    };
    getCoins();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.points}>
          {coins}{" "}
          <Icon name="star-outline" size={20} color="blue" />
        </Text>
        <Image style={styles.logo} source={require("../Images/logo.png")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 75,
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: Platform.OS === "ios" ? -35 : 0,
    paddingHorizontal: 10,
  },
  points: {
    color: "black",
    fontSize: 18,
    flexShrink: 1, // prevent overflow if number gets large
  },
  logo: {
    marginTop: 2,
    width: 70,
    height: 70,
  },
});
