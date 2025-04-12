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
} from "react-native";
import { db } from "../fireBaseConfig";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const groupId = params.groupId;
  const user = JSON.parse(params.user);
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onSnapshot(doc(db, "community", groupId), (docSnap) => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      if (data?.messages) {
        const sortedMessages = [...data.messages].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;

    const message = {
      text: newMessage.trim(),
      senderName: user.username,
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
      console.error("Failed to send message:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.messageText}>{item.text}</Text>
            <View style={styles.messageMeta}>
              <Text style={styles.senderText}>
                נשלח על ידי: {item.senderName}
              </Text>
              <Text style={styles.timeText}>
                {new Date(item.timestamp).toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#e1ffc7",
    borderRadius: 5,
  },
  senderText: {
    fontSize: 12,
    color: "gray",
    textAlign: "right",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  messageText: {
    fontSize: 16,
    color: "black",
  },

  messageMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 5,
  },

  timeText: {
    fontSize: 12,
    color: "gray",
    textAlign: "left",
  },
});

export default ChatScreen;
