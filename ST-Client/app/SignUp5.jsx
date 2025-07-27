import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SignUp5() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [image, setImage] = useState(params.image || null);
  const [imageBase64, setImageBase64] = useState(params.imageBase64 || null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    const pickedImage = result.assets[0];
    setImage(pickedImage.uri);
    const imageBase64 = pickedImage.base64;
    setImageBase64(imageBase64);
  };
  const deleteImage = () => {
    setImage(null);
    setImageBase64(null);
  };

  const handleNext = () => {
    router.push({
      pathname: "/SignUp6",
      params: {
        ...params,
        imageBase64, // שולח את הבייס64 למסך הבא
      },
    });
  };

  const handlePrev = () => {
    router.push({
      pathname: "/SignUp4",
      params: {
        ...params,
        image,
        imageBase64,
      },
    });
  };

  return (
    <SafeAreaProvider style={styles.logo}>
      <View style={styles.upperSide}>
        <Image style={styles.image} source={require("../Images/logo.png")} />
        <View style={styles.container}>
          <View style={styles.timeline}>
            <View style={[styles.circle, styles.filled]}></View>
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
        <TouchableOpacity style={styles.profileContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.plusContainer}>
              <Text style={styles.plus}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.instruction}>הוסף תמונת פרופיל</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity onPress={deleteImage}>
            <Text style={styles.instruction}>מחק תמונה</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNext}>
            <Text style={styles.color}>הבא</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrev}>
            <Text style={styles.color}>הקודם</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
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
  profileContainer: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  plusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 48,
    color: "Black",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  instruction: {
    marginTop: 20,
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});
