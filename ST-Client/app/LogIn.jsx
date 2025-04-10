import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Checkbox } from "react-native-paper";
import React, { useState, useEffect } from "react";
import { Link, useRouter } from "expo-router"; // Use Link from expo-router for navigation
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogIn() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendData = async () => {
    try {
      const response = await fetch(
        `https://localhost:7256/api/User/Login/${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(password),
        }
      );
      const data = await response.json();
      if (response.ok) {
        getData(); // Fetch user data after successful login
        // Move to BottomNav after successful signup
      } else {
        // Show error message from the backend response
        console.error("Login failed", data);
        Alert.alert("שגיאה", data.message || "משהו השתבש בהרשמה");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("שגיאה", "בעיה בחיבור לשרת");
    }
  };
  const getData = async () => {
    try {
      const response = await fetch(`https://localhost:7256/api/User/${email}`, {
        method: "GET",
      });
      const data = await response.json();
      await storeData(data);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("שגיאה", "בעיה בחיבור לשרת");
    }
  };
  const storeData = async (data) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(data)); // Store user data as a string
      router.replace("/BottomNav");
    } catch (e) {
      // saving error
      console.error(e);
    }
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
        <View style={styles.upperSide}>
          <Image
            style={{ width: 180, height: 180, marginTop: 20 }}
            source={require("../Images/logo.png")}
          />
          <Image
            style={{ width: 100, height: 100, marginTop: 20 }}
            source={require("../Images/LogIn.png")}
          />
        </View>
        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <TextInput
            style={styles.input}
            placeholder="אימייל"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="סיסמא"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.rememberMeContainer}>
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
              color="white" // Color of the checkmark
              uncheckedColor="white" // Color of the checkbox when unchecked
              style={styles.checkbox} // Custom style for the checkbox
            />
            <Text style={styles.color}>זכור אותי</Text>
          </View>
          <View>
            <TouchableOpacity style={styles.button} onPress={sendData}>
              <Text style={styles.buttonText}>התחברות</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.options}>
            <Link href="/SignUp">
              <Text style={styles.color}>צור משתמש</Text>
            </Link>
            <Text style={styles.color}>שכחתי סיסמא</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    flex: 1,
    alignItems: "center",
  },
  upperSide: {
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    height: "50%",
  },
  background: {
    height: "100%",
    width: "100%",
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    width: 300,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    width: 300,
  },
  buttonText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 100,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 200,
  },
  color: {
    color: "white",
    fontSize: 16,
  },
  checkbox: {
    backgroundColor: "white", // Set the background color of the checkbox
  },
});
