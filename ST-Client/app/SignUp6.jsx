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
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../fireBaseConfig"; // Import Firestore instance

export default function SignUp6() {
  const router = useRouter();
  const params = useLocalSearchParams(); // These are the params from previous screens
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // Use state to store users

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          "https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User",
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setUsers(data); // Set users state
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("שגיאה", "בעיה בחיבור לשרת");
      } finally {
        setLoading(false); // Stop loading after fetching
      }
    };
    getData();
  }, []); // Fetch users from the backend -- [] means it runs only once when the component mounts

  useEffect(() => {
    setLoading(true);
    const sendData = async () => {
      if (users.length === 0) return; // Ensure users are fetched before sending data

      try {
        const response = await fetch(
          "https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // Generate a unique ID for the new user
              id: 1, // Consider using a more reliable ID generation method
              name: `${params.firstName} ${params.lastName}`,
              email: params.email,
              password: params.password,
              role: "משתמש רגיל",
              coins: 0,
              diabetesType: params.diabetesType,
              gender: params.gender,
              profilePicture: params.imageBase64 || "default_image_base64",
              isActive: true,
              userName: params.username,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // Successfully signed up!
          await storeData(data); // Store user data in AsyncStorage
        } else {
          // Show error message from the backend response
          console.error("Signup failed", data);
          Alert.alert("שגיאה", data.message || "משהו השתבש בהרשמה");
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("שגיאה", "בעיה בחיבור לשרת");
      } finally {
        setLoading(false); // Stop loading after sending data
      }
    };

    sendData();
  }, [users]); // Run when users change

  const storeData = async (data) => {
    setLoading(true);
    try {
      const userData = {
        ...params,
        isActive: true,
        coins: 0,
        role: "משתמש רגיל",
        id: data, // Use the ID returned from the API
      };
      await AsyncStorage.setItem("user", JSON.stringify(userData)); // Store user data as a string
      await joinGroup(userData.id); // Call joinGroup with the user ID
      router.replace("/BottomNav"); // Navigate to BottomNav after storing data
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  const joinGroup = async (userId) => {
    setLoading(true);
    const groupRef = doc(db, "community", "1");
    await updateDoc(groupRef, {
      members: arrayUnion(userId), // Add the new user ID to the community members
    });
  };

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
