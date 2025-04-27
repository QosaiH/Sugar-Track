import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../fireBaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function AdminChats() {
  const [privateChats, setPrivateChats] = useState([]);
  const [communityChats, setCommunityChats] = useState([]);
  const [showType, setShowType] = useState("private");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

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

  const confirmDeleteChat = (chatId, type) => {
    setChatToDelete({ chatId, type });
    setDeleteConfirmVisible(true);
  };

  const performDeleteChat = async () => {
    try {
      const { chatId, type } = chatToDelete;
      const collectionName =
        type === "community" ? "community" : "privateChats";
      const chatRef = doc(db, collectionName, chatId);
      await deleteDoc(chatRef);
      console.log(`${type} chat deleted successfully!`);
      setDeleteConfirmVisible(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Error deleting chat: ", error);
    }
  };

  const openModal = (chat, type) => {
    setSelectedChat(chat);
    setSelectedType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChat(null);
  };

  const renderModalContent = () => {
    if (!selectedChat) return null;

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {selectedType === "community" ? "קהילת" : "שיחה בין"}:{" "}
          {selectedChat?.name || selectedChat?.id}
        </Text>
        <FlatList
          data={selectedChat?.messages || []}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}>
                <Text style={styles.messageSender}>
                  {item.senderName || "לא ידוע"}:
                </Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => alert(`צפייה בפרטים של ${item.senderName}`)}>
                  <Text style={styles.viewButtonText}>צפה</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
        <Pressable onPress={closeModal} style={styles.closeModalBtn}>
          <Text style={styles.closeText}>סגור</Text>
        </Pressable>
      </View>
    );
  };

  const renderChatItem = (item, type) => (
    <View style={styles.chatItem}>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>
          {type === "community" ? "קהילה" : "שיחה"}: {item.name || item.id}
        </Text>
        <Text style={styles.chatMessage}>
          {item.messages?.[item.messages.length - 1]?.text ||
            "אין הודעות עדיין"}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewChatButton}
          onPress={() => openModal(item, type)}>
          <Text style={styles.buttonText}>צפייה</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteChat(item.id, type)}>
          <Text style={styles.buttonText}>מחיקה</Text>
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
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showType === "private" && styles.toggleButtonActive,
            ]}
            onPress={() => setShowType("private")}>
            <Text style={styles.toggleButtonText}>צ'אטים פרטיים </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showType === "community" && styles.toggleButtonActive,
            ]}
            onPress={() => setShowType("community")}>
            <Text style={styles.toggleButtonText}>קהילות</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={showType === "community" ? communityChats : privateChats}
          renderItem={({ item }) => renderChatItem(item, showType)}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}>
          <View style={styles.modalBackground}>{renderModalContent()}</View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteConfirmVisible}
          onRequestClose={() => setDeleteConfirmVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                האם אתה בטוח שברצונך למחוק את השיחה הזו?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  style={[styles.viewChatButton, { paddingHorizontal: 20 }]}
                  onPress={performDeleteChat}>
                  <Text style={styles.buttonText}>כן, מחק</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: "#999", paddingHorizontal: 20 },
                  ]}
                  onPress={() => setDeleteConfirmVisible(false)}>
                  <Text style={styles.buttonText}>ביטול</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingTop: 20,
  },
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  toggleButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: "#rgba(0,0,0,0.3)",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  chatList: {
    width: "90%",
  },
  chatItem: {
    backgroundColor: "#rgba(238, 230, 230, 0.75)",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chatDetails: {
    marginBottom: 10,
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
    justifyContent: "flex-end",
    gap: 10,
  },
  viewChatButton: {
    backgroundColor: "#rgba(0,0,0,0.3)",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  messageItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  messageSender: {
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  messageText: {
    fontSize: 14,
    color: "#555",
  },
  viewButton: {
    marginLeft: 10,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  closeModalBtn: {
    backgroundColor: "#4A90E2",
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
