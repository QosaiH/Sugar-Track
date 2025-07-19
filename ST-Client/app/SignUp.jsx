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

export default function SignUp() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Form states
  const [firstName, setFirstName] = useState(params.firstName || "");
  const [lastName, setLastName] = useState(params.lastName || "");
  const [location, setLocation] = useState(params.location || "");

  // Error states
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "שם פרטי הוא שדה חובה";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "שם משפחה הוא שדה חובה";
    }

    if (!location.trim()) {
      newErrors.location = "אזור מגורים הוא שדה חובה";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      // If everything is OK, move to SignUp2
      router.push({
        pathname: "/SignUp2",
        params: {
          ...params,
          name: String(`${firstName} ${lastName}`),
          location,
        },
      });
    } else {
      Alert.alert("שגיאה", "אנא מלא את כל השדות בצורה תקינה");
    }
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
              <View style={styles.circle}></View>
              <View style={styles.line}></View>
              <View style={styles.circle}></View>
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
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="שם פרטי"
              value={firstName}
              onChangeText={setFirstName}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="שם משפחה"
              value={lastName}
              onChangeText={setLastName}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="אזור מגורים"
              value={location}
              onChangeText={setLocation}
            />
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}

            <View style={styles.rememberMeContainer}>
              <TouchableOpacity onPress={handleNext}>
                <Text style={styles.color}>הבא</Text>
              </TouchableOpacity>
              <Link href="/LogIn">
                <Text style={styles.color}>הקודם</Text>
              </Link>
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
    textAlign: "right",
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
    fontSize: 16,
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
