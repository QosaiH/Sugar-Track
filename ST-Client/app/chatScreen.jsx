import React, { useEffect, useState, useRef } from "react";
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
  SafeAreaView,
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
// Picker removed; using ActionSheet for iOS compatibility
import { SafeAreaProvider } from "react-native-safe-area-context";

const API_KEY = "AIzaSyAonlahcFhubsUWuy1dRrsWcD9ERZBhPDY";

export default function ChatScreen() {
  const flatListRef = useRef(null);
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const groupId = params.groupId;
  const user = JSON.parse(params.user);
  const [users, setUsers] = useState({});
  const [community, setCommunity] = useState({});
  const router = useRouter();
  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserOptionsModal, setShowUserOptionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedReportReason, setSelectedReportReason] = useState(""); // הוספת סטייט לסיבת הדיווח
  const [showReasonSheet, setShowReasonSheet] = useState(false); // fix for ActionSheet
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";
  let botResponseText = "";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "community", groupId),
      async (docSnap) => {
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        setCommunity(data);

        if (data?.messages) {
          const sortedMessages = [...data.messages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);

          const userIds = sortedMessages.map((msg) => msg.senderId);
          const uniqueUserIds = [...new Set(userIds)];

          const usersData = {};
          const usersCollection = collection(db, "user");
          const userDocs = await getDocs(usersCollection);

          userDocs.forEach((doc) => {
            const userData = doc.data();
            if (uniqueUserIds.includes(userData.id)) {
              usersData[userData.id] = userData;
            }
          });
          setUsers(usersData);
        } else {
          setMessages([]);
        }
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  // Remove previous scroll-to-end useEffect

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
      return false;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;
    const newId = doc(collection(db, "community", groupId, "messages")).id;
    const message = {
      id: newId,
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
      const messageToAnalyze = newMessage.trim();
      setNewMessage("");
      setTimeout(async () => {
        const isNegative = await analyzeSentiment(messageToAnalyze.trim());
        if (isNegative) {
          sendAlertToServer(user.id, newMessage.trim());
        }
      }, 0);
    } catch (error) {
      console.error("Failed to send message:", error, message);
    }
  };

  const reportMessage = async (message, description) => {
    if (!message?.id) {
      alert("לא ניתן לדווח על ההודעה הזו. אין לה מזהה.");
      return;
    }
    const report = {
      messageId: message.id,
      senderId: message.senderId,
      communityId: groupId,
      text: message.text,
      reportedBy: user.id,
      description: description,
      reason: selectedReportReason,
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "reports"), report);
      alert("הדיווח נשלח בהצלחה.");
    } catch (error) {
      console.error("Error reporting message:", error);
      alert("נכשל בשליחת הדיווח.");
    }
  };

  const sendAlertToServer = async (userId, text) => {
    await addDoc(collection(db, "alerts"), {
      userId,
      text,
      timestamp: new Date(),
      analyzedSentiment: botResponseText,
    });
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
    <SafeAreaProvider style={{ flex: 1, width: "100%", marginTop: 35 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowMembers(true)}
          style={styles.communityInfoContainer}>
          <Image
            source={{ uri: `data:image/png;base64,${community.photo}` }}
            style={styles.communityImage}
          />
          <Text numberOfLines={1} style={styles.communityName}>
            {community.name}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 35 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 220 : 0}>
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
                  {/* ...existing code for rendering each message... */}
                  {!isSender && userData && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedUser(userData);
                        setShowUserOptionsModal(true);
                      }}>
                      <Image
                        source={
                          userData.profilePicture
                            ? {
                                uri: userData.profilePicture.startsWith(
                                  "data:image"
                                )
                                  ? userData.profilePicture
                                  : `data:image/png;base64,${userData.profilePicture}`,
                              }
                            : require("../Images/placeholder.png")
                        }
                        style={styles.userImage}
                      />
                    </TouchableOpacity>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isSender ? styles.senderBubble : styles.receiverBubble,
                    ]}>
                    <Text style={styles.nameText}>{item.senderName}</Text>
                    <Text style={styles.messageText}>{item.text}</Text>
                    <Text style={styles.timeText}>
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </View>
                  {!isSender && (
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => {
                        setSelectedMessage(item);
                        setShowReportModal(true);
                      }}>
                      <Text style={styles.reportButtonText}>!</Text>
                    </TouchableOpacity>
                  )}
                  {isSender && userData && (
                    <Image
                      source={
                        userData.profilePicture
                          ? {
                              uri: userData.profilePicture.startsWith(
                                "data:image"
                              )
                                ? userData.profilePicture
                                : `data:image/png;base64,${userData.profilePicture}`,
                            }
                          : require("../Images/placeholder.png") // ברירת מחדל
                      }
                      style={styles.userImage}
                    />
                  )}
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            ref={flatListRef}
            onContentSizeChange={() => {
              if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="...כתוב הודעה"
              placeholderTextColor="#aaa"
              style={styles.input}
              textAlign="right"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <AntDesign name="arrowleft" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>

      {showMembers && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ניהול קהילה</Text>
            {/* Community image edit */}
            <TouchableOpacity
              onPress={async () => {
                // Open image picker (expo-image-picker or similar)
                if (window && window.ImagePicker) {
                  const result =
                    await window.ImagePicker.launchImageLibraryAsync({
                      mediaTypes: window.ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.5,
                      base64: true,
                    });
                  if (!result.cancelled) {
                    setCommunity({ ...community, photo: result.base64 });
                  }
                } else {
                  alert("Image picker not available in this environment.");
                }
              }}
              style={{ alignSelf: "center", marginBottom: 10 }}>
              <Image
                source={{ uri: `data:image/png;base64,${community.photo}` }}
                style={[
                  styles.communityImage,
                  { width: 80, height: 80, borderRadius: 40 },
                ]}
              />
              <Text
                style={{ textAlign: "center", color: "#007AFF", marginTop: 4 }}>
                שנה תמונה
              </Text>
            </TouchableOpacity>
            {/* Community name edit */}
            <TextInput
              value={community.name || ""}
              onChangeText={(text) =>
                setCommunity({ ...community, name: text })
              }
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                textAlign: "right",
                fontSize: 18,
                fontWeight: "bold",
              }}
              placeholder="שם קהילה"
              placeholderTextColor="#aaa"
            />
            <Text
              style={[styles.modalTitle, { fontSize: 16, marginBottom: 4 }]}>
              חברי הקהילה
            </Text>
            <FlatList
              data={(() => {
                const allUsers = Object.values(users);
                const currentUser = allUsers.find((u) => u.id === user.id);
                const others = allUsers.filter((u) => u.id !== user.id);
                return currentUser ? [currentUser, ...others] : others;
              })()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.memberItem, { paddingVertical: 6 }]}> 
                  <Image
                    source={
                      item.profilePicture
                        ? item.profilePicture.startsWith("data:image")
                          ? { uri: item.profilePicture }
                          : {
                              uri: `data:image/png;base64,${item.profilePicture}`,
                            }
                        : require("../Images/placeholder.png")
                    }
                    style={styles.memberImage}
                  />
                  <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', marginRight: 8 }}>
                    <Text style={styles.memberName}>{item.username}</Text>
                    {item.id !== user.id && (
                      <TouchableOpacity
                        style={[styles.optionButton, { marginTop: 4, borderRadius: 8, backgroundColor: '#007AFF' }]}
                        onPress={() => {
                          router.push({
                            pathname: "/privateChatScreen",
                            params: {
                              receiver: JSON.stringify(item),
                              sender: JSON.stringify(user),
                            },
                          });
                          setShowUserOptionsModal(false);
                        }}>
                        <Text style={[styles.optionText, { color: 'white', fontWeight: 'bold' }]}>שלח הודעה פרטית</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              style={{ maxHeight: 180 }}
            />
            {/* Save and Leave buttons */}
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: 10 }]}
              onPress={async () => {
                try {
                  await updateDoc(doc(db, "community", groupId), {
                    name: community.name,
                    photo: community.photo,
                  });
                  alert("הקהילה עודכנה בהצלחה");
                  setShowMembers(false);
                } catch (err) {
                  alert("שגיאה בעדכון הקהילה");
                }
              }}>
              <Text style={styles.submitButtonText}>שמור שינויים</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: "#ffdddd", borderColor: "#ff4444" },
              ]}
              onPress={leaveCommunity}>
              <Text style={[styles.closeButtonText, { color: "#ff4444" }]}>
                עזוב קהילה
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMembers(false)}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showUserOptionsModal && selectedUser && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={
                selectedUser.profilePicture
                  ? selectedUser.profilePicture.startsWith("data:image")
                    ? { uri: selectedUser.profilePicture }
                    : { uri: `data:image/png;base64,${selectedUser.profilePicture}` }
                  : require("../Images/placeholder.png")
              }
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>{selectedUser.username}</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                router.push({
                  pathname: "/privateChatScreen",
                  params: {
                    receiver: JSON.stringify(selectedUser),
                    sender: JSON.stringify(user),
                  },
                });
                setShowUserOptionsModal(false);
              }}>
              <Text style={styles.optionText}>שלח הודעה</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUserOptionsModal(false)}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showReportModal && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showReportModal}
          onRequestClose={() => setShowReportModal(false)}>
          <View style={styles.modalReportContainer}>
            <View style={styles.modalReportContent}>
              <Text style={styles.modalReportTitle}>
                האם אתה בטוח שברצונך לדווח על ההודעה הזו?
              </Text>
              {/* Custom ActionSheet for reason selection */}
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => setShowReasonSheet(true)}>
                <Text style={{ color: '#007AFF', fontSize: 16 }}>
                  {selectedReportReason ? selectedReportReason : 'בחר סיבה'}
                </Text>
              </TouchableOpacity>
              {showReasonSheet && (
                <View style={styles.actionSheetContainer}>
                  {["שפה פוגענית", "הטרדה", "תוכן לא הולם", "אחר"].map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={styles.actionSheetItem}
                      onPress={() => {
                        setSelectedReportReason(reason);
                        setShowReasonSheet(false);
                      }}>
                      <Text style={{ fontSize: 16, textAlign: 'center' }}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.actionSheetCancel}
                    onPress={() => setShowReasonSheet(false)}>
                    <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>ביטול</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                placeholder="תיאור הדיווח"
                placeholderTextColor="#aaa"
                style={styles.reportInput}
                value={reportDescription}
                onChangeText={setReportDescription}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  reportMessage(selectedMessage, reportDescription);
                  setShowReportModal(false);
                }}>
                <Text style={styles.submitButtonText}>שלח דיווח</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReportModal(false)}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaProvider>
  );
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday) {
    return (
      "אתמול " +
      date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else {
    return (
      date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" }) +
      " " +
      date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    );
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "120%",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 100,
  },

  backButton: {
    padding: 6,
  },

  communityInfoContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    maxWidth: "80%",
  },

  communityImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  communityName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    maxWidth: "65%",
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderBubble: {
    backgroundColor: "#dcf8c6",
    borderTopRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  nameText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  timeText: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-start",
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
    marginBottom: Platform.select({
      ios: 3,
      web: -35,
      android: 0,
    }),
  },
  sendButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    maxHeight: "70%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
    color: "black",
  },
  memberItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginVertical: 10,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  memberName: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "black",
    alignSelf: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
    alignSelf: "center",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "black",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 35,
    marginBottom: 5,
    marginHorizontal: 6,
    alignSelf: "center",
  },
  reportButton: {
    padding: 5,
    borderRadius: 5,
    alignSelf: "center",
    marginLeft: 5,
  },
  reportButtonText: {
    color: "white",
    borderRadius: 5,
    fontSize: 14,
  },
  modalReportContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalReportContent: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 20,
    padding: 20,
  },
  modalReportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "black",
    alignSelf: "center",
  },
  closeButtonText: { color: "black", fontSize: 16, alignSelf: "center" },
  // ...existing styles...
  actionSheetButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  actionSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    elevation: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  actionSheetItem: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  actionSheetCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
  },
});
