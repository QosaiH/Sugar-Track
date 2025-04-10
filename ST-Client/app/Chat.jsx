import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  FlatList,
  Button,
  Image,
} from "react-native";
import { db } from "../fireBaseConfig"; // Import Firestore instance
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

export default function Chat() {
  const [activeTab, setActiveTab] = useState("private");

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "private" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("private")}>
            <Text style={styles.tabText}>צ'אט פרטי</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "communities" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("communities")}>
            <Text style={styles.tabText}>קהילות</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === "private" ? <PrivateChats /> : <Communities />}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function PrivateChats() {
  return (
    <View>
      <Text style={styles.sectionTitle}>רשימת צ'אטים פרטיים</Text>
      {/* Display private chats from Firebase */}
    </View>
  );
}

function Communities() {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const userId = 1; // Replace with actual user ID
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Fetch all groups
    const unsubscribeAllGroups = onSnapshot(
      collection(db, "community"),
      (querySnapshot) => {
        const allGroupsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(allGroupsData);
        setFilteredGroups(allGroupsData); // Initialize filtered groups
      }
    );

    // Fetch user's groups
    const unsubscribeUserGroups = onSnapshot(
      collection(db, "community"),
      (querySnapshot) => {
        const userGroupsData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((group) => group.members && group.members.includes(userId)); // Filter groups where user is a member

        setUserGroups(userGroupsData);
      }
    );

    return () => {
      unsubscribeAllGroups();
      unsubscribeUserGroups();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  };

  const joinGroup = async (groupId) => {
    const groupRef = doc(db, "community", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="...חפש קהילה"
      />
      <FlatList
        data={filteredGroups}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/chatScreen",
                params: { groupId: item.id },
              });
            }}>
            <View style={styles.groupItem}>
              <Image
                source={{ uri: `data:image/png;base64,${item.photo}` }} // Use the base64 string directly
                style={styles.groupImage}
              />
              <Text style={styles.groupName}>{item.name}</Text>
              {!userGroups.some((group) => group.id === item.id) && ( // Check if user is not a member
                <Button title="Join" onPress={() => joinGroup(item.id)} />
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "center",
    gap: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeTab: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    textAlign: "right",
    color: "white",
    fontSize: 18,
    marginBottom: 10,
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
  groupItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "white",
    borderRadius: 10,
  },
  groupName: {
    textAlign: "right",
    flex: 1,
    fontSize: 16,
    marginRight: 10, // Add some space between the text and the image
    color: "black",
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 10, // Make the image circular
  },
});
