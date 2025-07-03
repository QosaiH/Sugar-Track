import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native"; // חשוב

export default function Header() {
  const [coins, setCoins] = useState(0);
  const isFocused = useIsFocused(); // זה מאפשר לזהות מתי המסך מקבל פוקוס מחדש

  useEffect(() => {
    const getCoins = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const user = JSON.parse(data);
          setCoins(user?.coins ?? 0);
        }
      } catch (e) {
        console.error("שגיאה בשליפת נתוני משתמש:", e);
      }
    };

    getCoins(); // קריאה ראשונית
  }, [isFocused]); // נשלף מחדש בכל פעם שהמסך חוזר לפוקוס

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.points}>
          {coins} <Icon name="star-outline" size={20} color="blue" />
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
    fontWeight: "600",
  },
  logo: {
    width: 70,
    height: 70,
  },
});
