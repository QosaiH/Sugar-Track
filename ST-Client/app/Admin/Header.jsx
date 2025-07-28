import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // יבוא AsyncStorage

export default function Header() {
  const [userName, setUserName] = useState(""); // משתנה לשם המשתמש

  useEffect(() => {
    const getUserName = async () => {
      try {
        const data = await AsyncStorage.getItem("user"); // שליפת נתוני המשתמש מ-AsyncStorage
        if (data !== null) {
          const user = JSON.parse(data); // המרת הנתונים לאובייקט
          setUserName(user.name); // עדכון שם המשתמש
        }
      } catch (e) {
        console.error("שגיאה בשליפת נתוני המשתמש:", e);
      }
    };
    getUserName();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Image style={styles.logo} source={require("../../Images/logo.png")} />
        <View style={styles.greetingContainer}>
          {userName ? (
            <Text style={styles.greeting}>היי, {userName}!</Text>
          ) : (
            <Text style={styles.greeting}>היי שם!</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 75,
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: Platform.OS === "web" ? 0 : -48,
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
  greetingContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});
