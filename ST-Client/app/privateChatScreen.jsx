import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../fireBaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  addDoc,
  collection,
} from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";

export default function PrivateChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = JSON.parse(params.sender);
  const otherUser = JSON.parse(params.receiver);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const initializeChat = async () => {
      const sortedIds = [user.id, otherUser.id].sort();
      const generatedChatId = `${sortedIds[0]}_${sortedIds[1]}`;
      setChatId(generatedChatId);

      const chatRef = doc(db, "privateChats", generatedChatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          users: sortedIds,
          messages: [],
          createdAt: new Date().toISOString(),
        });
      }

      const unsubscribe = onSnapshot(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const sorted = [...(data.messages || [])].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sorted);
        }
      });

      return () => unsubscribe();
    };

    initializeChat();
  }, [user.id, otherUser.id]);

  const analyzeSentiment = async (text) => {
    try {
      const response = await fetch("https://sugar-track.onrender.com", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      });

      const result = await response.json();
      if (!Array.isArray(result) || result.length === 0) return null;

      const { label, score } = result[0];
      return label === "NEGATIVE" && score > 0.85;
    } catch (err) {
      console.error("Sentiment analysis error:", err);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const isNegative = await analyzeSentiment(newMessage.trim());
    if (isNegative) {
      sendAlertToServer(user.id, newMessage.trim());
    }
    const sortedIds = [user.id, otherUser.id].sort();
    const generatedChatId = `${sortedIds[0]}_${sortedIds[1]}`;
    const chatRef = doc(db, "privateChats", generatedChatId);

    const message = {
      text: newMessage.trim(),
      senderId: user.id,
      senderName: user.username || user.userName,
      timestamp: new Date().toISOString(),
    };

    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(message),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("שגיאה", "שליחת ההודעה נכשלה, נסה שוב.");
    }
  };

  const sendAlertToServer = async (userId, text) => {
    await addDoc(collection(db, "alerts"), {
      userId,
      text,
      timestamp: new Date(),
      severity: "danger",
    });
  };
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: `data:image/png;base64,${otherUser.profilePicture}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {otherUser.username || otherUser.userName}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ImageBackground
          style={styles.background}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <FlatList
            data={messages}
            renderItem={({ item }) => {
              const isSender = item.senderId === user.id;

              return (
                <View
                  style={[
                    styles.messageContainer,
                    isSender ? styles.rightAlign : styles.leftAlign,
                  ]}>
                  {!isSender && (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${otherUser.profilePicture}`,
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
                  {isSender && (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${user.profilePicture}`,
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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="כתוב הודעה..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <AntDesign name="arrowleft" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  backText: {
    fontSize: 18,
    color: "black",
    marginHorizontal: 10,
  },
  userInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messageBubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  senderName: {
    fontSize: 12,
    color: "gray",
  },
  time: {
    fontSize: 10,
    color: "gray",
    textAlign: "left",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
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
    color: "black",
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
    color: "#black",
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
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    fontSize: 16,
    marginHorizontal: 8,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  sendButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
