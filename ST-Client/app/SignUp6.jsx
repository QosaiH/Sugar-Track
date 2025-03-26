import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";

export default function SignUp5() {
  const router = useRouter();
  const params = useLocalSearchParams(); // These are the params from previous screens
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sendData = async () => {
      try {
        const response = await fetch("https://localhost:7256/api/User", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: 1,
            name: params.firstName + " " + params.lastName,
            email: params.email,
            password: params.password,
            role: "משתמש רגיל",
            coins: 0,
            diabetesType: params.diabetesType,
            gender: params.gender,
            profilePicture: params.imageBase64 || null,
            isActive: true,
            userName: params.username,
          }),
        });
        /* console.log(
          JSON.stringify({
            id: 1,
            name: params.firstName + " " + params.lastName,
            email: params.email,
            password: params.password,
            role: "משתמש רגיל",
            coins: 0,
            diabetesType: params.diabetesType,
            gender: "Male",
            profilePicture: params.imageBase64 || "null",
            isActive: true,
            username: params.username,
          })
        );
*/
        const data = await response.json();

        if (response.ok) {
          // Successfully signed up!
          console.log("Signup successful", data);
          // Move to BottomNav after successful signup
          router.replace("/BottomNav");
        } else {
          // Show error message from the backend response
          console.error("Signup failed", data);
          Alert.alert("שגיאה", data.message || "משהו השתבש בהרשמה");
          setLoading(false); // Stop loading if error happens
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("שגיאה", "בעיה בחיבור לשרת");
        setLoading(false); // Stop loading if error happens
      }
    };

    sendData();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
        <View style={styles.upperSide}>
          <Image style={styles.image} source={require("../Images/logo.png")} />
          <Text style={styles.buttonText}>
            {loading ? "כבר מחברים אותך למערכת..." : "התרחשה שגיאה, נסה שוב"}
          </Text>
          {loading ? (
            <ActivityIndicator
              style={{ marginTop: 10 }}
              size="large"
              color="black"
            />
          ) : null}
        </View>

        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          {!loading && (
            <View style={styles.rememberMeContainer}>
              <Link href="/BottomNav">
                <Text style={styles.color}>הבא</Text>
              </Link>
              <Link href="/SignUp5">
                <Text style={styles.color}>הקודם</Text>
              </Link>
            </View>
          )}
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
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: "50%",
  },
  image: {
    width: 170,
    height: 170,
    marginTop: 5,
  },
  background: {
    height: "100%",
    width: "100%",
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
  },
  rememberMeContainer: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 250,
  },
  color: {
    color: "white",
  },
});
