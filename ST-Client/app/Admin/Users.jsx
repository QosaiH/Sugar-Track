import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Button,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Checkbox } from "react-native-paper";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // חדש: סינון לפי סטטוס

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
          image: u.image || "../../Images/Vector.png",
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
      setModalVisible(false);
      getData();
    } catch (error) {
      console.error("updateUserStatus error:", error);
      Alert.alert("שגיאה", "נכשל עדכון סטטוס");
    }
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const toggleUserDetails = (userId) => {
    setExpandedUserId((prevId) => (prevId === userId ? null : userId));
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return user.isActive && matchesSearch;
    if (filterStatus === "inactive") return !user.isActive && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover"
      >
        <TextInput
          style={styles.searchInput}
          placeholder="...חיפוש משתמשים"
          placeholderTextColor="#ccc"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* חדש: כפתורי סינון פעילים */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <Text style={styles.filterButtonText}>הכל</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "active" && styles.activeFilterButton,
            ]}
            onPress={() => setFilterStatus("active")}
          >
            <Text style={styles.filterButtonText}>פעילים</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "inactive" && styles.activeFilterButton,
            ]}
            onPress={() => setFilterStatus("inactive")}
          >
            <Text style={styles.filterButtonText}>לא פעילים</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>רשימת משתמשים</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <ScrollView contentContainerStyle={styles.tableContainer}>
            <View style={styles.stickyHeader}>
              <BlurView intensity={50} style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>פעולות</Text>
                <Text style={styles.tableHeaderText}>סטטוס</Text>
                <Text style={styles.tableHeaderText}>שם</Text>
              </BlurView>
            </View>

            {filteredUsers.map((user) => (
              <View key={user.id}>
                <TouchableOpacity
                  style={styles.tableRow}
                  onPress={() => toggleUserDetails(user.id)}
                >
                  <View style={styles.tableCell}>
                    <Checkbox
                      status={user.isActive ? "checked" : "unchecked"}
                      onPress={() => openStatusModal(user)}
                      color="white"
                      uncheckedColor="white"
                    />
                  </View>
                  <View style={styles.tableCell}>
                    <Text
                      style={[
                        styles.tableCellText,
                        {
                          color: "white",
                          fontWeight: "bold",
                          backgroundColor: user.isActive ? "green" : "red",
                          borderRadius: 5,
                          paddingHorizontal: 5,
                        },
                      ]}
                    >
                      {user.isActive ? "פעיל" : "לא פעיל"}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{user.name}</Text>
                  </View>
                </TouchableOpacity>

                {expandedUserId === user.id && (
                  <View style={styles.userDetailsContainer}>
                    <View style={styles.userDetailsTextContainer}>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>שם משתמש:</Text> {user.userName}
                      </Text>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>אימייל:</Text> {user.email}
                      </Text>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>תפקיד:</Text> {user.role}
                      </Text>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>מין:</Text> {user.gender}
                      </Text>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>סוג סוכרת:</Text> {user.diabetesType}
                      </Text>
                      <Text style={styles.userDetailsText}>
                        <Text style={styles.detailsLabel}>כמות מטבעות:</Text> {user.coins}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>האם אתה בטוח לשנות את הסטטוס?</Text>
              <View style={styles.modalButtons}>
                <Button
                  title="בטל"
                  color="#FF6B6B"
                  onPress={() => setModalVisible(false)}
                />
                <Button
                  title="אשר"
                  color="#4CAF50"
                  onPress={() =>
                    selectedUser &&
                    updateUserStatus(selectedUser.id, selectedUser.isActive)
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
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
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchInput: {
    height: 40,
    width: "90%",
    textAlign: "right",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "gray",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeFilterButton: {
    backgroundColor: "#4CAF50",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tableContainer: {
    width: "100%",
    paddingBottom: 100,
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "transparent",
    elevation: 1,
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    width: "100%",
    borderRadius: 8,
  },
  tableHeaderText: {
    flex: 1,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "100%",
  },
  tableCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCellText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  userDetailsContainer: {
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userDetailsTextContainer: {
    marginBottom: 10,
  },
  userDetailsText: {
    fontSize: 14,
    color: "white",
    marginVertical: 5,
    textAlign: "right",
  },
  detailsLabel: {
    fontWeight: "bold",
    color: "white",
    textAlign: "right",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
