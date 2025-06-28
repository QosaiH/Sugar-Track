import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userexists, setUserExists] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const emailCheck = async () => {
    if (loading) return;
    if (!email) {
      setErrors({ email: "אימייל הוא שדה חובה" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await response.json();
      console.log("Data received:", userData);

      if (userData !== null && userData.id) {
        setData(userData);
        setUserExists(true);
      } else {
        Alert.alert("שגיאה", "לא נמצא משתמש עם אימייל זה");
      }
    } catch (error) {
      console.error("Error sending password reset request:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בשליחת הבקשה");
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "סיסמא חדשה היא שדה חובה";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "הסיסמא חייבת להכיל לפחות 6 תווים";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "אימות סיסמא הוא שדה חובה";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const updatedData = { ...data, password: newPassword };

      const response = await fetch(
        `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/${updatedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        Alert.alert("הצלחה", "הסיסמא שונתה בהצלחה");
        setData(updatedData);
        await storeData(updatedData);
      } else {
        Alert.alert("שגיאה", "לא הצלחנו לשנות את הסיסמא");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בשינוי הסיסמא");
    } finally {
      setLoading(false);
    }
  };

  const storeData = async (data) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(data));
      if (data.role?.toLowerCase() === "admin") {
        router.replace("./Admin/AdminBottomNav");
      } else {
        router.replace("/BottomNav");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
        <View style={styles.upperSide}>
          <Image style={styles.image} source={require("../Images/logo.png")} />
          <Text style={{ fontSize: 24, marginTop: 20 }}>
            בקשה לשחזר את הסיסמא
          </Text>
        </View>

        {!userexists && (
          <ImageBackground
            style={styles.background}
            source={require("../Images/Vector.png")}
            resizeMode="cover">
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="אימייל"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={emailCheck}>
              <Text style={styles.buttonText}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  "שלח בקשה לשחזור"
                )}
              </Text>
            </TouchableOpacity>
            <Link href="/LogIn" style={styles.options}>
              <Text style={styles.color}>חזרה להתחברות</Text>
            </Link>
          </ImageBackground>
        )}

        {userexists && (
          <ImageBackground
            style={styles.background}
            source={require("../Images/Vector.png")}
            resizeMode="cover">
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              placeholder="סיסמא חדשה"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="אימות סיסמא חדשה"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={setPassword}>
              <Text style={styles.buttonText}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  "שנה סיסמא"
                )}
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    marginBottom: Platform.OS === "ios" ? -35 : 0,
  },
  upperSide: {
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    height: "40%",
  },
  background: {
    height: "125%",
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
    textAlign: "right",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  color: {
    color: "white",
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    alignSelf: "center",
  },
});
