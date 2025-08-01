import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

export default function SignUp3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [password, setPassword] = useState(params.password || "");
  const [confirmPassword, setConfirmPassword] = useState(
    params.confirmPassword || ""
  );
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "סיסמא היא שדה חובה";
    } else if (password.length < 6) {
      newErrors.password = "סיסמא חייבת להיות באורך של לפחות 6 תווים";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "אימות סיסמא הוא שדה חובה";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      router.push({
        pathname: "/SignUp4",
        params: { ...params, password, confirmPassword },
      });
    } else {
      Alert.alert("שגיאה", "אנא מלא את כל השדות בצורה תקינה");
    }
  };

  const handlePrev = () => {
    router.push({
      pathname: "/SignUp2",
      params: { ...params, password, confirmPassword },
    });
  };

  return (
    <SafeAreaProvider style={styles.logo}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <View style={styles.upperSide}>
          <Image style={styles.image} source={require("../Images/logo.png")} />
          <View style={styles.container}>
            <View style={styles.timeline}>
              <View style={styles.circle}></View>
              <View style={styles.line}></View>
              <View style={styles.circle}></View>
              <View style={styles.line}></View>
              <View style={[styles.circle, styles.filled]}></View>
              <View style={styles.line}></View>
              <View style={[styles.circle, styles.filled]}></View>
              <View style={styles.line}></View>
              <View style={[styles.circle, styles.filled]}></View>
            </View>
          </View>
        </View>
        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <View style={styles.form}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="בחר סיסמא"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="בחר סיסמא"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="אמת סיסמא"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              accessibilityLabel="אמת סיסמא"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            <View style={styles.rememberMeContainer}>
              <TouchableOpacity onPress={handleNext}>
                <Text style={styles.color}>הבא</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrev}>
                <Text style={styles.color}>הקודם</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
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
    marginTop: 50,
  },
  background: {
    height: "125%",
    width: "100%",
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  form: {
    width: "80%",
    alignItems: "center",
  },
  input: {
    height: 40,
    marginBottom: 8,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    textAlign: "right",
  },
  DropDown: {
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    textAlign: "right",
  },

  dropDownContainer: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
  },

  listItemContainer: {
    height: 40,
    justifyContent: "center",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  rememberMeContainer: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
  },
  color: {
    color: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "50%",
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  filled: {
    backgroundColor: "black",
  },
  line: {
    height: 2,
    width: 100,
    backgroundColor: "black",
    flex: 1,
  },
});
