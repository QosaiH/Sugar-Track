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
  Platform,
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
export default function Chat({ userData }) {
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
          {activeTab === "private" ? (
            <PrivateChats userData={userData} />
          ) : (
            <Communities userData={userData} />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function PrivateChats({ userData }) {
  const [privateChats, setPrivateChats] = useState([]); // Store private chats
  const [users, setUsers] = useState({}); // To store user data by userId
  const router = useRouter(); // Use router for navigation

  useEffect(() => {
    // Fetch private chats
    const unsubscribePrivateChats = onSnapshot(
      collection(db, "privateChats"),
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter chats to include only those that the current user is a part of
        const userChats = chats.filter((chat) =>
          chat.users.includes(userData.id)
        );

        // Filter unique chats using a Map
        const uniqueChatsMap = new Map();
        userChats.forEach((chat) => {
          // Use chat ID as the key in the Map
          if (!uniqueChatsMap.has(chat.id)) {
            uniqueChatsMap.set(chat.id, chat);
          }
        });

        // Convert the Map values back to an array
        const uniqueChats = Array.from(uniqueChatsMap.values());

        // Update state only if there’s a change
        setPrivateChats((prevChats) => {
          if (
            prevChats.length === uniqueChats.length &&
            prevChats.every((prevChat, index) =>
              isEqual(prevChat, uniqueChats[index])
            )
          ) {
            return prevChats; // No change, avoid re-render
          }
          return uniqueChats;
        });
      }
    );

    // Fetch users
    const unsubscribeUsers = onSnapshot(
      collection(db, "user"), // Assuming you have a users collection
      (snapshot) => {
        const usersData = {};
        snapshot.docs.forEach((doc) => {
          usersData[doc.id] = doc.data(); // Store user data by userId
        });
        setUsers(usersData);
      }
    );

    return () => {
      unsubscribePrivateChats();
      unsubscribeUsers();
    };
  }, [userData.id]); // Add userData.id as a dependency

  // Helper function to compare objects for equality
  const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>רשימת צ'אטים פרטיים</Text>
      {privateChats.length === 0 ? (
        <Text style={styles.noChatsText}>אין צ'אטים פרטיים זמינים</Text>
      ) : (
        <FlatList
          data={privateChats}
          renderItem={({ item }) => {
            // Get the other user's ID
            const otherUserId = item.users.find((id) => id !== userData.id);

            // Check if otherUser Id is valid
            if (!otherUserId) {
              console.warn(`No valid other user ID found for chat: ${item.id}`);
              return null; // Skip rendering this item
            }

            const otherUser = users[otherUserId]; // Get the other user's data

            // Check if otherUser  exists
            if (!otherUser) {
              return null; // Skip rendering this item
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.chatItem}
                onPress={() => {
                  // Navigate to the private chat screen with chat ID and other user data
                  router.push({
                    pathname: "/privateChatScreen",
                    params: {
                      sender: JSON.stringify(userData),
                      receiver: JSON.stringify(otherUser),
                    },
                  });
                }}>
                <Image
                  source={{
                    uri: `data:image/png;base64,${otherUser.profilePicture}`,
                  }} // Assuming profilePicture is a field in user data
                  style={styles.profileImage}
                />
                <Text style={styles.chatText}>{otherUser.username}</Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

function Communities({ userData }) {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const userId = userData.id;
  const router = useRouter();

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
                params: {
                  groupId: item.id,
                  user: JSON.stringify(userData),
                },
              });
            }}>
            <View style={styles.groupItem}>
              <Image
                source={{ uri: `data:image/png;base64,${item.photo}` }} // Use the base64 string directly
                style={styles.groupImage}
              />
              <Text style={styles.groupName}>{item.name}</Text>
              {!userGroups.some((group) => group.id === item.id) && ( // Check if user is not a member
                <Button title="הצטרף" onPress={() => joinGroup(item.id)} />
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
    marginTop: Platform.OS === "ios" ? 0 : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginBottom: Platform.OS === "ios" ? -30 : 0,
  },
  tabContainer: {
    paddingTop: 30,
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
  chatItem: {
    flexDirection: "row-reverse",
    gap: 10,
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "white",
    borderRadius: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make the image circular
    marginRight: 10,
  },
  chatText: {
    fontSize: 16,
    color: "black",
  },
  noChatsText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
});
