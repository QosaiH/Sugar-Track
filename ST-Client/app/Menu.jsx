import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Menu({ isVisible, onClose }) {
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(300)).current; // Start off-screen

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : 300, // Slide in or out
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Clear session
      onClose(); // Close menu
      router.replace("/LogIn"); // Navigate to login
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const backgroundStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: Platform.select({
      ios: 132,
      web: 75,
      android: 74,
    }),
  };

  return (
    <Modal transparent animationType="none" visible={isVisible}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}> 
          <ImageBackground
            source={require("../Images/Vector.png")}
            style={backgroundStyle}>
            <Text style={styles.title}>תפריט</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); router.push("/ProfileEdit"); }}>
              <Text style={styles.menuText}>פרופיל</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); router.push("/Notifications"); }}>
              <Text style={styles.menuText}>התראות</Text>
            </TouchableOpacity>

            {/* פריט חדש לתפריט */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); router.push("/DiabetesRights"); }}>
              <Text style={styles.menuText}>זכויות חולי סוכרת</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>יציאה</Text>
            </TouchableOpacity>
          </ImageBackground>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    height: "100%",
    width: "100%",
  },
  drawer: {
    alignSelf: "flex-end",
    justifyContent: "center",
    width: "40%",
    height: "100%",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 1,
  },
  title: {
    textAlign: "right",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    padding: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    textAlign: "right",
    fontSize: 18,
    color: "white",
  },
});
