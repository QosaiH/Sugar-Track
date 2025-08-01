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
  TextInput,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  const [searchTerm, setSearchTerm] = useState("");

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
              <Text style={styles.messageSender}>
                {item.senderName || "לא ידוע"}:
              </Text>
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

  const filteredChats = (
    showType === "community" ? communityChats : privateChats
  ).filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaProvider style={styles.container}>
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

        <TextInput
          style={styles.searchInput}
          placeholder="...חפש לפי שם צ'אט"
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <FlatList
          data={filteredChats}
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
    height: "120%",
  },
  container: {
    flex: 1,
    height: "100%",
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
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "right",
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    alignSelf: "center",
    height: 50,
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
