import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageBackground,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

export default function SignUp4() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(params.diabetesType || null);
  const [items, setItems] = useState([
    { label: "סוכרת סוג 1", value: "סוכרת סוג 1" },
    { label: "סוכרת סוג 2", value: "סוכרת סוג 2" },
  ]);
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState(params.gender || "");
  const [genderItems, setGenderItems] = useState([
    { label: "זכר", value: "זכר" },
    { label: "נקבה", value: "נקבה" },
    { label: "אחר", value: "אחר" },
  ]);
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!value) {
      newErrors.diabetesType = "סוג סוכרת הוא שדה חובה";
    }
    if (!genderValue) {
      newErrors.gender = "מגדר הוא שדה חובה";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      router.push({
        pathname: "/SignUp5",
        params: { ...params, diabetesType: value, gender: genderValue },
      });
    } else {
      Alert.alert("שגיאה", "אנא מלא את כל השדות בצורה תקינה");
    }
  };

  const handlePrev = () => {
    router.push({
      pathname: "/SignUp3",
      params: { ...params, diabetesType: value, gender: genderValue },
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
              <View style={[styles.circle, styles.filled]}></View>
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
            <View style={styles.diabetesType}>
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
            </View>
            <View style={styles.gender}>
              <DropDownPicker
                open={genderOpen}
                value={genderValue}
                items={genderItems}
                setOpen={setGenderOpen}
                setValue={setGenderValue}
                setItems={setGenderItems}
                placeholder="מגדר"
                style={[styles.DropDown, errors.gender && styles.inputError]}
                dropDownContainerStyle={[
                  styles.dropDownContainer,
                  errors.gender && styles.inputError,
                ]}
                listItemContainerStyle={[
                  styles.listItemContainer,
                  errors.gender && styles.inputError,
                ]}
                dropDownDirection="BOTTOM"
                labelStyle={{ textAlign: "right" }}
                placeholderStyle={{ textAlign: "right" }}
                listItemLabelStyle={{ textAlign: "right" }}
              />
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

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
  diabetesType: {
    zIndex: 2000,
    width: "100%",
  },
  gender: {
    zIndex: 1000,
    width: "100%",
  },
  DropDown: {
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
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
