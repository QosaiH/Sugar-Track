import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Link, useRouter, useLocalSearchParams } from "expo-router";

export default function SignUp2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Form state
  const [username, setUsername] = useState(params.username || "");
  const [email, setEmail] = useState(params.email || "");
  const [age, setAge] = useState(params.age || "");

  // Error state
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "שם משתמש הוא שדה חובה";
    }

    if (!email.trim()) {
      newErrors.email = "כתובת דואר אלקטרוני היא שדה חובה";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "כתובת דואר אלקטרוני לא תקינה";
    }

    if (!age.trim()) {
      newErrors.age = "גיל הוא שדה חובה";
    } else if (isNaN(age) || Number(age) < 1) {
      newErrors.age = "גיל חייב להיות מספר חיובי";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      // If everything is OK, move to SignUp3
      router.push({
        pathname: "/SignUp3",
        params: { ...params, username, email, age },
      });
    } else {
      Alert.alert("שגיאה", "אנא מלא את כל השדות בצורה תקינה");
    }
  };

  const handlePrev = () => {
    router.push({
      pathname: "/SignUp",
      params: { ...params, username, email, age },
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
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
            </View>
          </View>
        </View>

        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <View style={styles.form}>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="שם משתמש"
              value={username}
              onChangeText={setUsername}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="כתובת דואר אלקטרוני"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="גיל"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

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
  image: {
    width: 220,
    height: 220,
    marginTop: 20,
  },
  background: {
    height: "100%",
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
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
  buttonText: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 100,
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
  checkbox: {
    backgroundColor: "white", // Set the background color of the checkbox
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
    width: 30,
    height: 30,
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
