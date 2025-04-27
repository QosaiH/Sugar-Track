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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Menu({ isVisible, onClose }) {
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(300)).current; // Start off-screen

  // Slide animation to show/hide the menu
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : 300, // Slide in or out
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Handle the logout process
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Clear user session from AsyncStorage
      onClose(); // Close the menu after logging out
      router.replace("/LogIn"); // Navigate to login screen (use correct route)
    } catch (error) {
      console.error("Logout error:", error); // Handle any errors during logout
    }
  };

  const backgroundStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: Platform.OS === "web" ? 138 : 130,
  };

  return (
    <Modal transparent animationType="none" visible={isVisible}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={onClose}
          activeOpacity={1}>
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <ImageBackground
              source={require("../../Images/Vector.png")}
              style={backgroundStyle}>
              <Text style={styles.title}>תפריט</Text>

              {/* Logout option */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={styles.menuText}>יציאה</Text>
              </TouchableOpacity>
            </ImageBackground>
          </Animated.View>
        </TouchableOpacity>
      </View>
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
