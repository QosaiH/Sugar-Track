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
  Modal,
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

export default function chatScreen() {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const groupId = params.groupId;
  const user = JSON.parse(params.user);
  const [users, setUsers] = useState({}); // State to hold user data
  const [community, setCommunity] = useState({}); // State to hold community data
  const router = useRouter();
  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserOptionsModal, setShowUserOptionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
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
      setNewMessage("");
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
      description: description, // Add the report description
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
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowMembers(true)}
          style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.communityName}>{community.name}</Text>
          <Image
            source={{
              uri: `data:image/png;base64,${community.photo}`, // Use the profile picture from the users state
            }}
            style={styles.communityImage}
          />
        </TouchableOpacity>
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
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedUser(userData);
                        setShowUserOptionsModal(true);
                      }}>
                      <Image
                        source={{
                          uri: `data:image/png;base64,${userData.profilePicture}`,
                        }}
                        style={styles.userImage}
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
            <Text style={styles.modalTitle}>חברי הקהילה</Text>
            <FlatList
              data={Object.values(users)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <Image
                    source={{
                      uri: `data:image/png;base64,${item.profilePicture}`,
                    }}
                    style={styles.memberImage}
                  />
                  <Text style={styles.memberName}>{item.username}</Text>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      // Navigate to private chat screen with selectedUser
                      router.push({
                        pathname: "/privateChatScreen", // Adjust route
                        params: {
                          receiver: JSON.stringify(item),
                          sender: JSON.stringify(user),
                        },
                      });
                      setShowUserOptionsModal(false);
                    }}>
                    <Text
                      style={{
                        color: "black",
                        fontSize: 16,
                        marginLeft: 10,
                      }}>
                      שלח הודעה
                    </Text>{" "}
                  </TouchableOpacity>
                </View>
              )}
            />
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
              source={{
                uri: `data:image/png;base64,${selectedUser.profilePicture}`,
              }}
              style={[[styles.modalImage], { alignSelf: "center" }]}
            />
            <Text style={styles.modalTitle}>{selectedUser.username}</Text>
            {/*
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                // Navigate to profile page or show profile modal
                console.log("View profile of", selectedUser.username);
                setShowUserOptionsModal(false);
              }}>
              <Text style={styles.optionText}>צפה בפרופיל</Text>
            </TouchableOpacity>
*/}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                router.push({
                  pathname: "/privateChatScreen", // Adjust route
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
    marginTop: 15,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "Black",
    alignItems: "center",
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    color: "black",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 35,
    marginBottom: 5,
    marginHorizontal: 6,
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
    marginTop: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
  },

  closeButtonText: {
    color: "black",
    fontSize: 16,
  },
});
