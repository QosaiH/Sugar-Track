import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../fireBaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function AdminChats() {
  const [privateChats, setPrivateChats] = useState([]);
  const [communityChats, setCommunityChats] = useState([]);

  useEffect(() => {
    const unsubscribePrivateChats = onSnapshot(
      collection(db, "privateChats"),
      (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrivateChats(chatList);
      }
    );

    const unsubscribeCommunityChats = onSnapshot(
      collection(db, "community"),
      (snapshot) => {
        const communityList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunityChats(communityList);
      }
    );

    return () => {
      unsubscribePrivateChats();
      unsubscribeCommunityChats();
    };
  }, []);

  const handleDeleteChat = async (chatId, type) => {
    try {
      const collectionName =
        type === "community" ? "communities" : "privateChats";
      const chatRef = doc(db, collectionName, chatId);
      await deleteDoc(chatRef);
      console.log(
        `${
          type === "community" ? "Community" : "Private"
        } chat deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting chat: ", error);
    }
  };

  const renderPrivateChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>Chat with: {item.id}</Text>
        <Text style={styles.chatMessage}>
          {item.messages?.[item.messages.length - 1]?.text || "No messages yet"}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteChat(item.id, "private")}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunityChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>Community: {item.name || item.id}</Text>
        <Text style={styles.chatMessage}>
          {item.messages?.[item.messages.length - 1]?.text || "No messages yet"}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteChat(item.id, "community")}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover">
        <Text style={styles.sectionTitle}>Private Chats</Text>
        <FlatList
          data={privateChats}
          renderItem={renderPrivateChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
        />

        <Text style={styles.sectionTitle}>Community Chats</Text>
        <FlatList
          data={communityChats}
          renderItem={renderCommunityChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  chatList: {
    width: "100%",
  },
  chatItem: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  chatDetails: {
    flex: 1,
    paddingRight: 15,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chatMessage: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
