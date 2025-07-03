import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db } from "../fireBaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function CreateCommunity() {
  const { user } = useLocalSearchParams();
  const userData = JSON.parse(user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !imageBase64) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות כולל תמונה");
      return;
    }

    try {
      await addDoc(collection(db, "community"), {
        name: name.trim(),
        description: description.trim(),
        photo: imageBase64,
        members: [userData.id],
        creatorId: userData.id,
        createdAt: new Date(),
      });

      Alert.alert("הצלחה", "הקהילה נוצרה בהצלחה!");
      router.back();
    } catch (error) {
      console.error("שגיאה ביצירת קהילה:", error);
      Alert.alert("שגיאה", "אירעה תקלה בעת יצירת הקהילה");
    }
  };

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>יצירת קהילה חדשה</Text>

          <TextInput
            style={styles.input}
            placeholder="שם הקהילה"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />

          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="תיאור קצר על מטרת הקהילה"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#888"
          />

          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>
              {imageBase64 ? "📷 שנה תמונה" : "בחר תמונה לקהילה"}
            </Text>
          </TouchableOpacity>

          {imageBase64 && (
            <Image
              source={{ uri: `data:image/png;base64,${imageBase64}` }}
              style={styles.preview}
            />
          )}

          <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
            <Text style={styles.createButtonText}>+ יצירת קהילה</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    width: "100%",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    textAlign: "right",
    marginBottom: 15,
    borderWidth: 1.2,
    borderColor: "#ccc",
  },
  imageButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  imageButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
