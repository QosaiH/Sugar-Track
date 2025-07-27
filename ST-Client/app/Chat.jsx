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
  ActivityIndicator,
} from "react-native";
import { db } from "../fireBaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Chat({ userData }) {
  const [activeTab, setActiveTab] = useState("private");

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}

function PrivateChats({ userData }) {
  const [privateChats, setPrivateChats] = useState([]);
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribePrivateChats = onSnapshot(
      collection(db, "privateChats"),
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const userChats = chats.filter((chat) =>
          chat.users.includes(userData.id)
        );

        const uniqueChats = [
          ...new Map(userChats.map((c) => [c.id, c])).values(),
        ];

        setPrivateChats(uniqueChats);
        setLoading(false);
      }
    );

    const unsubscribeUsers = onSnapshot(collection(db, "user"), (snapshot) => {
      const usersData = {};
      snapshot.docs.forEach((doc) => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    });

    return () => {
      unsubscribePrivateChats();
      unsubscribeUsers();
    };
  }, [userData.id]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = privateChats.filter((chat) => {
        const otherId = chat.users.find((id) => id !== userData.id);
        const other = users[otherId];
        return (
          other &&
          other.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(privateChats);
    }
  }, [searchQuery, privateChats, users, userData.id]);

  return (
    <View>
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="...חפש צ'אט פרטי"
      />
      <Text style={styles.sectionTitle}>רשימת צ'אטים פרטיים</Text>

      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => {
              router.push({
                pathname: "/mySugar",
                params: {
                  sender: JSON.stringify(userData),
                },
              });
            }}>
            <Image
              source={require("../Images/logo.png")}
              style={styles.BotProfileImage}
            />
            <Text style={styles.chatText}>My Sugar Bot</Text>
          </TouchableOpacity>

          <FlatList
            data={filteredChats}
            renderItem={({ item }) => {
              const otherId = item.users.find((id) => id !== userData.id);
              const other = users[otherId];
              if (!other) return null;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.chatItem}
                  onPress={() =>
                    router.push({
                      pathname: "/privateChatScreen",
                      params: {
                        sender: JSON.stringify(userData),
                        receiver: JSON.stringify(other),
                      },
                    })
                  }>
                  <Image
                    source={
                      other.profilePicture
                        ? other.profilePicture.startsWith("data:image")
                          ? { uri: other.profilePicture }
                          : {
                              uri: `data:image/png;base64,${other.profilePicture}`,
                            }
                        : require("../Images/placeholder.png")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.chatText}>{other.username}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
          />
        </>
      )}
    </View>
  );
}

function Communities({ userData }) {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = userData.id;
  const router = useRouter();

  const showCreateButton = userData?.role === "משתמש מוביל";

  useEffect(() => {
    const unsubscribeAll = onSnapshot(collection(db, "community"), (snap) => {
      const allGroups = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(allGroups);
      setFilteredGroups(allGroups);
      setLoading(false);
    });

    const unsubscribeUser = onSnapshot(collection(db, "community"), (snap) => {
      const myGroups = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((group) => group.members?.includes(userId));

      setUserGroups(myGroups);
      setLoading(false);
    });

    return () => {
      unsubscribeAll();
      unsubscribeUser();
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
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="...חפש קהילה"
      />

      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/chatScreen",
                  params: {
                    groupId: item.id,
                    user: JSON.stringify(userData),
                  },
                })
              }>
              <View style={styles.groupItem}>
                <Image
                  source={{ uri: `data:image/png;base64,${item.photo}` }}
                  style={styles.groupImage}
                />
                <Text style={styles.groupName}>{item.name}</Text>
                {!userGroups.some((g) => g.id === item.id) && (
                  <Button title="הצטרף" onPress={() => joinGroup(item.id)} />
                )}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* כפתור צף ליצירת קהילה */}
      {showCreateButton && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() =>
            router.push({
              pathname: "/CreateCommunity",
              params: { user: JSON.stringify(userData) },
            })
          }>
          <Text style={styles.floatingButtonText}>יצירת קהילה +</Text>
        </TouchableOpacity>
      )}
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
  button: {
    borderRadius: 20,
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
    marginRight: 10,
    color: "black",
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
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
    borderRadius: 25,
    marginRight: 10,
  },
  BotProfileImage: {
    width: 77,
    height: 77,
    borderRadius: 10,
    marginRight: 10,
  },
  chatText: {
    fontSize: 16,
    color: "black",
  },
  sectionTitle: {
    textAlign: "right",
    color: "white",
    fontSize: 18,
    marginBottom: 10,
  },

  floatingButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  floatingButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
