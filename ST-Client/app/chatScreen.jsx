import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { db } from "../fireBaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
} from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function chatScreen() {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const groupId = params.groupId;
  const user = JSON.parse(params.user);
  const [users, setUsers] = useState({}); // State to hold user data
  const [community, setCommunity] = useState({}); // State to hold community data
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "community", groupId),
      async (docSnap) => {
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        setCommunity(data); // Set community data

        if (data?.messages) {
          const sortedMessages = [...data.messages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);

          // Fetch user data for each sender
          const userIds = sortedMessages.map((msg) => msg.senderId);
          const uniqueUserIds = [...new Set(userIds)]; // Get unique user IDs

          const usersData = {};
          const usersCollection = collection(db, "user"); // Assuming collection is named "user"
          const userDocs = await getDocs(usersCollection);

          userDocs.forEach((doc) => {
            const userData = doc.data();
            if (uniqueUserIds.includes(userData.id)) {
              usersData[userData.id] = userData; // Store the entire user data object
            }
          });
          setUsers(usersData); // Set the users state with fetched data
        } else {
          setMessages([]);
        }
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;

    const message = {
      text: newMessage.trim(),
      senderName: user.userName,
      senderId: user.id,
      timestamp: new Date().toISOString(),
    };

    const groupRef = doc(db, "community", groupId);
    try {
      await updateDoc(groupRef, {
        messages: arrayUnion(message),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error, message);
    }
  };
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.communityName}>{community.name}</Text>
        <Image
          source={{
            uri: `data:image/png;base64,${community.photo}`, // Use the profile picture from the users state
          }}
          style={styles.communityImage}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <FlatList
            data={messages}
            renderItem={({ item }) => {
              const isSender = item.senderId === user.id;
              const userData = users[item.senderId];

              return (
                <View
                  style={[
                    styles.messageContainer,
                    isSender ? styles.rightAlign : styles.leftAlign,
                  ]}>
                  {!isSender && userData && (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${userData.profilePicture}`,
                      }}
                      style={styles.userImage}
                    />
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isSender ? styles.senderBubble : styles.receiverBubble,
                    ]}>
                    <Text
                      style={[
                        styles.nameText,
                        isSender
                          ? styles.senderNameText
                          : styles.reciverNameText,
                      ]}>
                      {item.senderName}
                    </Text>
                    <Text
                      style={[
                        styles.messageText,
                        isSender
                          ? styles.senderMessageText
                          : styles.receiverMessageText,
                      ]}>
                      {item.text}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        isSender
                          ? styles.senderTimeText
                          : styles.reciverTimeText,
                      ]}>
                      {new Date(item.timestamp).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  {isSender && userData && (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${userData.profilePicture}`,
                      }}
                      style={styles.userImage}
                    />
                  )}
                </View>
              );
            }}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="כתוב הודעה..."
          />
          <Button title="שלח" onPress={sendMessage} />
        </ImageBackground>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    width: "100%",
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  communityImage: {
    width: 62,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  communityName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "flex-start",
  },
  leftAlign: {
    justifyContent: "flex-start",
  },
  rightAlign: {
    justifyContent: "flex-end",
  },
  userImage: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginTop: 0,
    marginHorizontal: 6,
  },
  messageBubble: {
    maxWidth: "70%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  senderBubble: {
    backgroundColor: "#dcf8c6",
    borderTopRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  senderMessageText: {
    textAlign: "right",
  },
  receiverMessageText: {
    textAlign: "left",
  },
  timeText: {
    fontSize: 11,
    color: "gray",
    marginTop: 5,
  },
  senderTimeText: {
    textAlign: "left",
    marginRight: 20,
  },
  reciverTimeText: {
    textAlign: "right",
    marginLeft: 20,
  },
  nameText: {
    fontSize: 11,
    color: "gray",
  },
  senderNameText: {
    textAlign: "right",
    marginLeft: 20,
  },
  reciverNameText: {
    textAlign: "left",
    marginRight: 20,
  },
  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    backgroundColor: "#fff",
  },
});
