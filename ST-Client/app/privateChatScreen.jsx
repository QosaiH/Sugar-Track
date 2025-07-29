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
  SafeAreaView,
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
import { GoogleGenAI } from "@google/genai";
import { SafeAreaProvider } from "react-native-safe-area-context";

const API_KEY = "AIzaSyAonlahcFhubsUWuy1dRrsWcD9ERZBhPDY";

export default function PrivateChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = JSON.parse(params.sender);
  const otherUser = JSON.parse(params.receiver);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";
  let botResponseText = "";
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
      const prompt = `
האם אתה מזהה בהודעה זו תסמינים של מצב רוח שלילי, מצוקה רגשית, או רמזים לאובדנות? אם כן, ציין מה אתה מזה
ענה במבנה הבא:
1.  כן/לא
2. אילו רגשות או תסמנים אתה מזהה?

ההודעה: "${text}"
`;
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ text: prompt }],
      });

      botResponseText = response.text;
      console.log("Bot response:", botResponseText);
      return botResponseText.toLowerCase().includes("כן");
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return false; // Default if there's an error
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
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
      const messageToAnalyze = newMessage.trim();
      setNewMessage("");
      setTimeout(async () => {
        const isNegative = await analyzeSentiment(messageToAnalyze.trim());
        if (isNegative) {
          sendAlertToServer(user.id, newMessage.trim());
        }
      }, 0); // Run after the message is sent, non-blocking
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("שגיאה", "שליחת ההודעה נכשלה, נסה שוב.");
    }
  };

  const sendAlertToServer = async (userId, text) => {
    await addDoc(collection(db, "alerts"), {
      userId,
      text,
      timestamp: new Date().toISOString(),
      analyzedSentiment: botResponseText,
    });
  };

  // Delete chat function
  const deleteChat = async () => {
    try {
      await setDoc(doc(db, "privateChats", chatId), {
        users: [user.id, otherUser.id].sort(),
        messages: [],
        createdAt: new Date().toISOString(),
      });
      Alert.alert("הצ'אט נמחק בהצלחה");
      setShowProfileModal(false);
      router.back();
    } catch (err) {
      Alert.alert("שגיאה", "מחיקת הצ'אט נכשלה");
    }
  };

  return (
    <SafeAreaProvider style={{ flex: 1, width: "100%", marginTop: 35 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => setShowProfileModal(true)}>
          <Image
            source={
              otherUser.profilePicture
                ? otherUser.profilePicture.startsWith("data:image")
                  ? { uri: otherUser.profilePicture }
                  : {
                      uri: `data:image/png;base64,${otherUser.profilePicture}`,
                    }
                : require("../Images/placeholder.png")
            }
            style={styles.avatar}
          />

          <Text style={styles.username}>
            {otherUser.username || otherUser.userName}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 35 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
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
                    <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                      <Image
                        source={
                          otherUser.profilePicture
                            ? otherUser.profilePicture.startsWith("data:image")
                              ? { uri: otherUser.profilePicture }
                              : {
                                  uri: `data:image/png;base64,${otherUser.profilePicture}`,
                                }
                            : require("../Images/placeholder.png")
                        }
                        style={styles.avatar}
                      />
                    </TouchableOpacity>
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
                      source={
                        user.profilePicture
                          ? user.profilePicture.startsWith("data:image")
                            ? { uri: user.profilePicture }
                            : {
                                uri: `data:image/png;base64,${user.profilePicture}`,
                              }
                          : require("../Images/placeholder.png")
                      }
                      style={styles.avatar}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            width: '80%',
            maxWidth: 350,
          }}>
            <Image
              source={
                otherUser.profilePicture
                  ? otherUser.profilePicture.startsWith("data:image")
                    ? { uri: otherUser.profilePicture }
                    : { uri: `data:image/png;base64,${otherUser.profilePicture}` }
                  : require("../Images/placeholder.png")
              }
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 1, borderColor: '#ccc' }}
            />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>{otherUser.username || otherUser.userName}</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#ff4444', padding: 12, borderRadius: 10, width: '100%', marginBottom: 10 }}
              onPress={deleteChat}
            >
              <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', fontWeight: 'bold' }}>מחק צ'אט</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#eee', padding: 12, borderRadius: 10, width: '100%' }}
              onPress={() => setShowProfileModal(false)}
            >
              <Text style={{ color: 'black', fontSize: 16, textAlign: 'center' }}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 100,
  },

  backButton: {
    padding: 6,
    marginRight: 10, // שמרתי גם את המרווח מההגדרה השנייה
  },

  backButtonText: {
    fontSize: 24,
    color: "black",
  },

  userInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    maxWidth: "80%",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
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
    marginLeft: 10,
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

  inputContainer: {
    flexDirection: "row-reverse",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginBottom: Platform.select({
      ios: 3,
      web: -35,
      android: 0,
    }),
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

  sendButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "120%",
    paddingTop: 20,
  },
});
