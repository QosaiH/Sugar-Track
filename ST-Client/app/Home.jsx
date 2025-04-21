import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // אייקון פלוס
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header"; // כותרת עמוד הבית

export default function Home({ userData }) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        <View style={styles.userInfoContainer}>
          {/* תמונת פרופיל של היוזר */}
          <Image
            style={styles.profileImage}
            source={{
              uri: `data:image/png;base64,${userData?.profilePicture}`,
            }}
          />
          <Text style={styles.greetingText}>שלום {userData?.name}!</Text>
        </View>

        {/* מלבן עם כפתור פלוס */}
        <TouchableOpacity
          style={styles.addButtonContainer}
          onPress={() => {
            // כאן תוכל להוסיף את הפעולה שתרצה כאשר נלחץ על כפתור הפלוס
            console.log("הזן ערך יומי נלחץ");
          }}>
          <View style={styles.addButton}>
            <Ionicons
              name="add-circle"
              size={30}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>הזן ערך יומי</Text>
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.quoteAuthor}>פיטר דרוקר</Text>
          <Text style={styles.quoteText}>
            "הדרך הטובה ביותר לחזות את העתיד היא להמציא אותו."
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // ממרכז את התוכן
    height: "100%",
    width: "100%",
  },
  background: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoContainer: {
    alignItems: "space-between",
    gap: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // פינות מעוגלות לתמונת פרופיל
    borderWidth: 1,
    borderColor: "#0001", // צבע של הגבול
    zIndex: 100,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white", // צבע של הטקסט
  },
  addButtonContainer: {
    width: "90%",
    marginTop: 40,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "lightgrey", // צבע הרקע של הכפתור
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // מאפשר לשים את האייקון בחצי העליון
  },
  icon: {
    position: "absolute",
    top: -15, // העברת האייקון למעלה, בחצי העליון של המלבן
    left: 10,
  },
  buttonText: {
    color: "black", // צבע טקסט של כפתור
    fontSize: 20, // גודל טקסט
  },
  quoteText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  quoteAuthor: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
