import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const response = await fetch(
        "https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/admin",
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      const usersData = await response.json();
      if (!Array.isArray(usersData) || !usersData.length) {
        Alert.alert("שגיאה", "לא נמצאו משתמשים");
        setUsers([]);
      } else {
        const mappedUsers = usersData.map((u) => ({
          id: u.id,
          name: u.name || "לא זמין",
          email: u.email || "לא זמין",
          userName: u.userName || "לא זמין",
          role: u.role || "לא זמין",
          gender: u.gender || "לא זמין",
          coins: u.coins ?? 0,
          diabetesType: u.diabetesType || "לא זמין",
          isActive: u.isActive !== undefined ? u.isActive : false,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("getData error:", error);
      Alert.alert("שגיאה", "בעיה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const updateUserStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/${id}/${!currentStatus}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to update status");

      Alert.alert("הצלחה", "סטטוס עודכן בהצלחה");
      getData(); // Refresh the list
    } catch (error) {
      console.error("updateUserStatus error:", error);
      Alert.alert("שגיאה", "נכשל עדכון סטטוס");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userText}>שם: {item.name}</Text>
      <Text style={styles.userText}>אימייל: {item.email}</Text>
      <Text style={styles.userText}>שם משתמש: {item.userName}</Text>
      <Text style={styles.userText}>תפקיד: {item.role}</Text>
      <Text style={styles.userText}>מין: {item.gender}</Text>
      <Text style={styles.userText}>סוג סוכרת: {item.diabetesType}</Text>
      <Text style={styles.userText}>מטבעות: {item.coins}</Text>
      <Text style={styles.userText}>פעיל: {item.isActive ? "כן" : "לא"}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={item.isActive ? "השבת משתמש" : "הפעל משתמש"}
          color={item.isActive ? "#FF6B6B" : "#4CAF50"}
          onPress={() => updateUserStatus(item.id, item.isActive)}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover">
        <Text style={styles.title}>רשימת משתמשים</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : Platform.OS === "web" ? (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            {users.map((u) => renderItem({ item: u }))}
          </ScrollView>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={styles.flatList}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: "center",
  },
  flatList: { width: "100%" },
  userCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    width: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  userText: {
    color: "#333",
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 10,
  },
});
