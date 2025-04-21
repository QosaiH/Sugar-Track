import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { db } from "../fireBaseConfig"; // Import Firestore instance
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore functions

const ProfileEdit = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const userObj = JSON.parse(userString);

        if (userObj?.email) {
          const response = await fetch(
            `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/${userObj.email}`
          );
          const data = await response.json();
          setUserData(data);
          setFormData({
            name: data.name,
            userName: data.userName,
            email: data.email,
            password: data.password,
            profilePicture: data.profilePicture,
          });
          setProfileImage(data.profilePicture);
        } else {
          Alert.alert("שגיאה", "לא נמצא משתמש");
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
        Alert.alert("שגיאה", "שגיאה בטעינת המשתמש");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Update Firestore document
      const userRef = doc(db, "user", userData.id); // Assuming userData.id is the document ID in Firestore
      await updateDoc(userRef, {
        name: formData.name,
        username: formData.userName,
        email: formData.email,
        password: formData.password,
        profilePicture: profileImage, // Update the profile picture if changed
      });

      Alert.alert("הצלחה", "הפרופיל עודכן בהצלחה");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("שגיאה", "שגיאה במהלך העדכון");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      handleChange("profilePicture", uri);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editIcon}>
          <Ionicons name="create-outline" size={28} color=" white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          style={styles.profileImageContainer}>
          <Image
            source={{
              uri: profileImage,
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <View style={styles.form}>
          {[
            { field: "name", icon: "person-outline", label: "שם מלא" },
            {
              field: "userName",
              icon: "person-circle-outline",
              label: "שם משתמש",
            },
            { field: "email", icon: "mail-outline", label: "אימייל" },
            { field: "password", icon: "lock-closed-outline", label: "סיסמה" },
          ].map(({ field, icon, label }) => (
            <View key={field} style={styles.inputRow}>
              <Ionicons
                name={icon}
                size={20}
                color="white"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                editable={isEditing}
                value={formData[field]}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={label}
                placeholderTextColor="white"
                secureTextEntry={field === "password"}
              />
            </View>
          ))}
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>שמור</Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    top: 40,
    left: 30,
    zIndex: 1,
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 75,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  form: {
    width: "80%",
    marginTop: 10,
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginBottom: 20,
    paddingVertical: 5,
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 18,
  },
});
