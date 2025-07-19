import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home({ userData }) {
  const [userdata, setUserData] = useState(userData || null);
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        let userStr = await AsyncStorage.getItem("user");
        let user = JSON.parse(userStr);
        setUserData(user);
      };
      loadUser();
    }, [])
  );
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const plusScale = React.useRef(new Animated.Value(1)).current;
  const bellScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.spring(plusScale, {
        toValue: 1.15,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(plusScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBellPress = () => {
    Animated.sequence([
      Animated.spring(bellScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(bellScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    console.log("Bell icon pressed");
  };

  const handleLogPress = () => {
    router.push({
      pathname: "/GlucoseLog",
      params: { user: JSON.stringify(userData) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        {/* Bell Icon */}
        <Animated.View
          style={[styles.bellButton, { transform: [{ scale: bellScale }] }]}>
          <TouchableOpacity onPress={handleBellPress} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={32} color="white" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Section */}
        <View style={styles.topSection}>
          <Image
            style={styles.profileImage}
            source={
              userdata?.profilePicture
                ? userdata.profilePicture.startsWith("data:image")
                  ? { uri: userdata.profilePicture } // כבר Base64 עם prefix מתאים
                  : userdata.profilePicture.length > 100 // ניחוש אם זה Base64 בלי prefix
                  ? { uri: `data:image/png;base64,${userdata.profilePicture}` }
                  : { uri: userdata.profilePicture } // כנראה URL תקין
                : require("../Images/placeholder.png") // תמונת ברירת מחדל אם אין תמונה
            }
          />

          <Text style={styles.greetingText}>
            שלום {userdata?.name || userdata?.Name || userdata?.Firstname}!
          </Text>

          {/* ברכה למשתמש מוביל */}
          {userdata?.role === "משתמש מוביל" && (
            <Text style={styles.leaderGreeting}>
              כל הכבוד על ההתקדמות! 👏{"\n"} עכשיו אתה/את חלק מהמשתמשים המובילים
              שלנו
            </Text>
          )}
        </View>

        {/* Main Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              activeOpacity={0.94}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogPress}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>הזן ערך יומי</Text>
              <Animated.View
                style={[
                  styles.plusIconContainer,
                  { transform: [{ scale: plusScale }] },
                ]}>
                <View style={styles.plusIconBackground}>
                  <Ionicons name="add" size={28} color="black" />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "הדרך הטובה ביותר לחזות את העתיד היא להמציא אותו."
          </Text>
          <Text style={styles.quoteAuthor}>- פיטר דרוקר</Text>
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
  bellButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
    padding: 8,
  },
  bellBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#FF3B30",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "white",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 5,
    marginTop: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#f5f5f5",
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 28,
    paddingTop: 20,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  leaderGreeting: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "white", // זהב בוהק
    textAlign: "center",
    //textShadowColor: "rgba(255, 255, 255, 0.8)", // צל צהוב-זהוב עדין
    // textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    paddingHorizontal: 15,
    // lineHeight: 24,
    //  backgroundColor: "rgba(255,255,255,0.15)",
    // borderRadius: 12,
    //borderWidth: 1.2,
    // borderColor: "rgba(255,255,255,0.2)",
    // shadowColor: "white",
    // shadowOpacity: 0.4,
    // shadowOffset: { width: 0, height: 1 },
    //shadowRadius: 1,
    elevation: 6,
  },
  buttonContainer: {
    position: "relative",
    paddingBottom: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 25,
    paddingHorizontal: 45,
    borderRadius: 18,
    elevation: 10,
    shadowColor: "rgba(79,172,254,0.4)",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    width: "100%",
    minWidth: 240,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  addButtonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  plusIconContainer: {
    position: "absolute",
    bottom: -18,
    alignSelf: "center",
    marginTop: 5,
  },
  plusIconBackground: {
    backgroundColor: "#ffffff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "black",
    elevation: 8,
    shadowColor: "rgba(90,103,216,0.4)",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  quoteContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 70,
    width: "95%",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  quoteText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontWeight: "300",
    fontStyle: "italic",
  },
  backButton: {
    backgroundColor: "#6c757d",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    width: "80%",
    alignItems: "center",
  },
  backText: {
    color: "white",
    fontSize: 18,
  },
});
