import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
} from "react-native";
import { Link } from "expo-router";

export default function Menu({ isVisible, onClose }) {
  const slideAnim = React.useRef(new Animated.Value(300)).current; // Start off-screen

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300, // Slide out
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      resizeMode="cover">
      <Modal transparent animationType="none" visible={isVisible}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={onClose}
          activeOpacity={1}>
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.title}>תפריט</Text>

            {/* Example Menu Items */}

            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Link href="/ProfileEdit">
                <Text style={styles.menuText}>פרופיל</Text>
              </Link>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuText}>התראות</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuText}>יציאה</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignSelf: "flex-end", // Align to right
    justifyContent: "flex-end",
    alignItems: "flex-start",
    width: "100%",
    height: "100%",
  },
  drawer: {
    alignSelf: "flex-end", // Align to right
    width: "35%",
    height: "90%",
    borderWidth: 1, // Border width
    borderColor: "white", // Border color
    borderRadius: 1, // Rounded corners
    marginTop: 140,
    marginBottom: 60,
  },
  title: {
    textAlign: "right",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    marginTop: 120,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    textAlign: "right",
    fontSize: 18,
    color: "white",
  },
});
