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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { db } from "../fireBaseConfig"; // Import Firestore instance
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigation } from "@react-navigation/native";

const ProfileEdit = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setIsSaving(true);

    try {
      if (!userData?.id || typeof userData.id !== "number") {
        Alert.alert("שגיאה", "מזהה המשתמש אינו חוקי לעדכון ב-Firestore");
        return;
      }

      const userRef = doc(db, "user", String(userData.id));
      await updateDoc(userRef, {
        name: formData.name,
        username: formData.userName,
        email: formData.email,
        password: newPassword || formData.password,
        profilePicture: profileImage,
      });

      const updatedUser = {
        ...userData,
        name: formData.name,
        userName: formData.userName,
        email: formData.email,
        password: newPassword || formData.password,
        profilePicture: profileImage,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      const response = await fetch(
        `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...updatedUser,
            role: userData.role,
            coins: userData.coins,
            diabetesType: userData.diabetesType,
            gender: userData.gender,
            isActive: userData.isActive,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user on server");
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMismatch(false);
      setIsEditing(false);

      Alert.alert("הצלחה", "הפרופיל עודכן בהצלחה");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("שגיאה", "שגיאה במהלך העדכון");
    } finally {
      setIsSaving(false);
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
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          style={styles.profileImageContainer}>
          <Image
            source={{
              uri: `data:image/png;base64,${userData?.profilePicture}`,
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

          {/* Show password fields only when editing */}
          {isEditing && (
            <>
              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="white"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="סיסמה חדשה"
                  placeholderTextColor="white"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="white"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="אשר סיסמה חדשה"
                  placeholderTextColor="white"
                  secureTextEntry
                />
              </View>

              {passwordMismatch && (
                <Text style={styles.errorText}>הסיסמאות לא תואמות</Text>
              )}
            </>
          )}
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            {isSaving ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Text style={styles.saveText}>שמור</Text>
            )}
          </TouchableOpacity>
        )}

        {!isEditing && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>חזור</Text>
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
    marginTop: Platform.OS === "ios" ? -70 : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? -30 : 0,
  },
  editIcon: {
    position: "absolute",
    top: 40,
    left: 30,
    zIndex: 1,
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: -200,
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
    marginTop: 140,
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
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginTop: 7,
    width: "80%",
    alignItems: "center",
  },
  saveText: {
    color: "black",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    textAlign: "right",
    fontSize: 14,
    marginTop: 5,
  },
  backText: {
    color: "white",
    fontSize: 18,
  },
});
