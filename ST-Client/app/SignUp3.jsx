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
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

export default function SignUp3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(params.diabetesType || null);
  const [items, setItems] = useState([
    { label: "סוכרת סוג 1", value: "סוכרת סוג 1" },
    { label: "סוכרת סוג 2", value: "סוכרת סוג 2" },
  ]);
  const [password, setPassword] = useState(params.password || "");
  const [confirmPassword, setConfirmPassword] = useState(
    params.confirmPassword || ""
  );
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!value) {
      newErrors.diabetesType = "סוג סוכרת הוא שדה חובה";
    }

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
        params: { ...params, diabetesType: value, password, confirmPassword },
      });
    } else {
      Alert.alert("שגיאה", "אנא מלא את כל השדות בצורה תקינה");
    }
  };

  const handlePrev = () => {
    router.push({
      pathname: "/SignUp2",
      params: { ...params, password, confirmPassword, diabetesType: value },
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.logo}>
        <View style={styles.upperSide}>
          <Image style={styles.image} source={require("../Images/logo.png")} />
          <View style={styles.container}>
            <View style={styles.timeline}>
              <View style={[styles.circle]}></View>
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
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="בחר סוג סוכרת"
              style={[
                styles.DropDown,
                errors.diabetesType && styles.inputError,
              ]}
              dropDownContainerStyle={[
                styles.dropDownContainer,
                errors.diabetesType && styles.inputError,
              ]}
              listItemContainerStyle={[
                styles.listItemContainer,
                errors.diabetesType && styles.inputError,
              ]}
              dropDownDirection="BOTTOM"
              labelStyle={{ textAlign: "right" }}
              placeholderStyle={{ textAlign: "right" }}
              listItemLabelStyle={{ textAlign: "right" }}
            />
            {errors.diabetesType && (
              <Text style={styles.errorText}>{errors.diabetesType}</Text>
            )}
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
