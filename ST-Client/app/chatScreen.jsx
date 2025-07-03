
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db } from "../fireBaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyAonlahcFhubsUWuy1dRrsWcD9ERZBhPDY";

export default function chatScreen() {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const groupId = params.groupId;
  const user = JSON.parse(params.user);
  const [users, setUsers] = useState({});
  const [community, setCommunity] = useState({});
  const router = useRouter();
  const [showCommunityDetails, setShowCommunityDetails] = useState(false);

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "community", groupId),
      async (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        setCommunity(data);
        if (data?.messages) {
          const sorted = [...data.messages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sorted);
          const userIds = [...new Set(sorted.map((m) => m.senderId))];
          const userDocs = await getDocs(collection(db, "user"));
          const usersData = {};
          userDocs.forEach((d) => {
            const u = d.data();
            if (userIds.includes(u.id)) usersData[u.id] = u;
          });
          setUsers(usersData);
        } else setMessages([]);
      }
    );
    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const newId = doc(collection(db, "community", groupId, "messages")).id;
    const msg = {
      id: newId,
      text: newMessage.trim(),
      senderName: user.userName,
      senderId: user.id,
      timestamp: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, "community", groupId), {
        messages: arrayUnion(msg),
      });
      setNewMessage("");
    } catch (e) {
      console.error("Error sending:", e);
    }
  };

  const leaveCommunity = async () => {
    try {
      const updatedMembers = community.members?.filter((id) => id !== user.id);
      await updateDoc(doc(db, "community", groupId), {
        members: updatedMembers,
      });
      alert("עזבת את הקהילה");
      router.back();
    } catch (err) {
      console.error("Leave error:", err);
      alert("שגיאה בעזיבה");
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowCommunityDetails(true)}
          style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.communityName}>{community.name}</Text>
          <Image
            source={{ uri: `data:image/png;base64,${community.photo}` }}
            style={styles.communityImage}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
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
                <View style={[styles.messageContainer, isSender ? styles.rightAlign : styles.leftAlign]}>
                  <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
                    <Text>{item.senderName}</Text>
                    <Text>{item.text}</Text>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="...כתוב הודעה"
              style={styles.input}
              textAlign="right"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <AntDesign name="arrowleft" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>

      {showCommunityDetails && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCommunityDetails}
          onRequestClose={() => setShowCommunityDetails(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>פרטי הקהילה</Text>
              <Image
                source={{ uri: `data:image/png;base64,${community.photo}` }}
                style={styles.modalCommunityImage}
              />
              <Text style={{ textAlign: "center" }}>{community.name}</Text>
              <Text style={{ textAlign: "center", marginBottom: 20 }}>
                {community.description || "אין תיאור זמין"}
              </Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "red" }]}
                onPress={leaveCommunity}>
                <Text style={styles.submitButtonText}>עזוב קהילה</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCommunityDetails(false)}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
  },
  backButtonText: { fontSize: 24, color: "black" },
  communityName: { fontSize: 20, fontWeight: "bold", color: "black" },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#ccc",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  rightAlign: { justifyContent: "flex-end" },
  leftAlign: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  senderBubble: { backgroundColor: "#dcf8c6" },
  receiverBubble: { backgroundColor: "#ffffff" },
  inputContainer: {
    flexDirection: "row-reverse",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalCommunityImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  submitButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "red",
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontSize: 16 },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 10,
    width: "80%",
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
  },
  closeButtonText: { color: "black", fontSize: 16 },
});
