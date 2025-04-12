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

  // Define styles based on the platform
  const backgroundStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: Platform.OS === "web" ? 138 : 130, // Different margin for web and mobile
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
              source={require("../Images/Vector.png")}
              style={backgroundStyle}>
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
    alignSelf: "flex-end", // Align to right
    justifyContent: "center",
    width: "40%",
    height: "100%",
    borderWidth: 1, // Border width
    borderColor: "white", // Border color
    borderRadius: 1, // Rounded corners
  },
  title: {
    textAlign: "right",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
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
