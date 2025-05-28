import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // יבוא AsyncStorage

export default function header() {
    const [coins, setCoins] = useState(""); // משתנה לשם המשתמש

  useEffect(() => {
    const GetCoins = async () => {
      try {
        const data = await AsyncStorage.getItem("user"); // שליפת נתוני המשתמש מ-AsyncStorage
        if (data !== null) {
          const user = JSON.parse(data); // המרת הנתונים לאובייקט
          setCoins(user.coins); // עדכון שם המשתמש
        }
      } catch (e) {
        console.error("שגיאה בשליפת נתוני המשתמש:", e);
      }
    };
    GetCoins();
  }, []);
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.points}>
          {coins}<Icon name="star-outline" size={20} color="blue" />
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
  },
  logo: {
    marginTop: 2,
    width: 70,
    height: 70,
  },
});
