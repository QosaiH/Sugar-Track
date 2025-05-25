import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  CheckBox,
  Image,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../fireBaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Use Link from expo-router for navigation

export default function Forum({ userData }) {
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // newest | popular

  // State for list items
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  // Mock current user
  const currentUser = {
    id: userData.id,
    name: userData.name,
    profilePicture: userData.profilePicture,
  };
  const [userVotes, setUserVotes] = useState({}); // { postId: "liked" | "disliked" }
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "forumItems"), (snapshot) => {
      const updatedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let sortedItems = [...updatedItems];

      if (sortOption === "popular") {
        sortedItems.sort(
          (a, b) => b.likes + b.comments.length - (a.likes + a.comments.length)
        );
      } else {
        sortedItems.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      }

      setItems(sortedItems);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [sortOption]);

  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Handle toggle item expansion
  const handleToggleItem = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Submit new post
  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    await addDoc(collection(db, "forumItems"), {
      title: newPostTitle,
      description: newPostContent,
      author: currentUser.name,
      authorId: currentUser.id,
      avatar: currentUser.profilePicture,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      comments: [],
    });

    setNewPostTitle("");
    setNewPostContent("");
    setModalVisible(false);
  };

  // Comment handler
  const handleComment = async (item, commentText) => {
    const itemRef = doc(db, "forumItems", item.id);
    const newComment = {
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText,
      timestamp: new Date(),
    };

    await updateDoc(itemRef, {
      comments: arrayUnion(newComment),
    });
  };
  const handleLike = async (item) => {
    const itemRef = doc(db, "forumItems", item.id);

    const currentVote = userVotes[item.id];

    if (currentVote === "liked") return; // Already liked

    let updateData = {};

    if (currentVote === "disliked") {
      // Switch from dislike to like
      updateData = {
        likes: item.likes + 1,
        dislikes: item.dislikes - 1,
      };
    } else {
      // First like
      updateData = {
        likes: item.likes + 1,
      };
    }

    await updateDoc(itemRef, updateData);
    setUserVotes((prev) => ({ ...prev, [item.id]: "liked" }));
  };

  const handleDislike = async (item) => {
    const itemRef = doc(db, "forumItems", item.id);

    const currentVote = userVotes[item.id];

    if (currentVote === "disliked") return; // Already disliked

    let updateData = {};

    if (currentVote === "liked") {
      // Switch from like to dislike
      updateData = {
        dislikes: item.dislikes + 1,
        likes: item.likes - 1,
      };
    } else {
      // First dislike
      updateData = {
        dislikes: item.dislikes + 1,
      };
    }

    await updateDoc(itemRef, updateData);
    setUserVotes((prev) => ({ ...prev, [item.id]: "disliked" }));
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Modal for Creating New Post */}
      {modalVisible && (
        <ImageBackground
          style={styles.modalOverlay}
          source={require("../Images/Vector.png")}
          resizeMode="cover">
          <View>
            <View style={styles.modalContent}>
              <TextInput
                placeholder="כותרת השאלה"
                placeholderTextColor="white"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="הקלד את התוכן כאן..."
                multiline
                numberOfLines={4}
                value={newPostContent}
                onChangeText={setNewPostContent}
                style={[styles.modalInput, { height: 200 }]}
                placeholderTextColor="white"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleCreatePost}
                  style={styles.submitButton}>
                  <Text style={{ fontWeight: "bold" }}>פרסם</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}>
                  <Text>בטל</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      )}
      <ImageBackground
        style={styles.background}
        source={require("../Images/Vector.png")}
        resizeMode="cover">
        {/* Header Section */}
        <View style={styles.header}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Icon
              style={{ marginRight: 15 }}
              name="text-search"
              size={20}
              color="white"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש"
              placeholderTextColor="white"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <Text style={{ color: "white", fontSize: 18 }}>מיון לפי:</Text>
            <View style={styles.filterItem}>
              <TouchableOpacity
                onPress={() => handleSortChange("newest")}
                style={styles.filterInput}>
                <Icon name="sort-calendar-ascending" size={20} color="white" />
                <Text style={{ color: "white" }}>תאריך</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterItem}>
              <TouchableOpacity
                onPress={() => handleSortChange("popular")}
                style={styles.filterInput}>
                <Icon name="account-group" size={20} color="white" />
                <Text style={{ color: "white" }}>פופלריות</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* New Post Button */}
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setModalVisible(true)}>
            <Text style={{ color: "white" }}>שאלת חדשה</Text>
            <Icon name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" || "ios" ? "padding" : "height"}
          keyboardVerticalOffset={230} // Adjust based on your nav bar height
          style={{ flex: 1 }}>
          <ScrollView style={styles.listContainer}>
            {items.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.listHeader}>
                  <Image
                    source={{ uri: `data:image/png;base64,${item.avatar}` }}
                    style={styles.avatar}
                  />
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <TouchableOpacity onPress={() => handleToggleItem(item.id)}>
                    <Icon
                      name={expandedItems[item.id] ? "menu-up" : "menu-down"}
                      size={24}
                      color="white"
                      style={{}}
                    />
                  </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {expandedItems[item.id] && (
                  <View style={styles.expandedContent}>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "right",
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                      {"  "}•{"  "}
                      {item.author}
                    </Text>

                    <Text style={styles.listDescription}>
                      {item.description}
                    </Text>

                    {/* Interactions */}
                    <View style={styles.interactions}>
                      <TouchableOpacity onPress={() => handleLike(item)}>
                        <Icon
                          name={
                            userVotes[item.id] === "liked"
                              ? "thumb-up"
                              : "thumb-up-outline"
                          }
                          size={20}
                          color="white"
                        />
                        <Text style={{ color: "white" }}>{item.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDislike(item)}>
                        <Icon
                          name={
                            userVotes[item.id] === "disliked"
                              ? "thumb-down"
                              : "thumb-down-outline"
                          }
                          size={20}
                          color="white"
                        />
                        <Text style={{ color: "white" }}>{item.dislikes}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Comments */}
                    <View style={styles.commentsSection}>
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        תגובות ({item.comments.length}):
                      </Text>
                      {item.comments.map((comment, index) => (
                        <Text
                          key={index}
                          style={{ color: "white", textAlign: "right" }}>
                          {comment.text}
                          <Text
                            style={{ fontWeight: "bold", textAlign: "right" }}>
                            {" "}
                            :{comment.userName}
                          </Text>
                        </Text>
                      ))}
                    </View>

                    {/* Add Comment Input */}
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        placeholder="כתוב תגובה..."
                        placeholderTextColor="black"
                        onSubmitEditing={({ nativeEvent }) => {
                          handleComment(item, nativeEvent.text);
                          Keyboard.dismiss(); // Dismiss keyboard after sending
                        }}
                        blurOnSubmit
                        multiline={true}
                        style={styles.commentInput}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? -30 : 0,
  },
  header: {
    width: "90%",
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "white",
    marginTop: 10,
  },
  searchInput: {
    color: "white",
    textAlign: "right",
    fontSize: 16,
    width: "100%",
    outlineStyle: "none",
    marginRight: 10,
    height: 40,
  },
  filterSection: {
    flexDirection: "row-reverse",
    justifyContent: "right",
    alignItems: "center",
    alignSelf: "center",
    gap: 5,
    marginTop: 10,
    width: "90%",
  },
  filterItem: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 2,
    borderColor: "white",
    width: "32%",
  },
  filterInput: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "100%",
    color: "white",
    fontSize: 16,
    borderRadius: 20,
    padding: 10,
  },
  newPostButton: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20,
    marginTop: 10,
    height: 40,
  },
  listContainer: {
    flex: 1,
    padding: 10,
    width: "100%",
  },
  listItem: {
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    textAlign: "right",
    width: "100%",
  },
  listHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row-reverse",
    width: "100%",
  },
  listTitle: {
    color: "white",
    fontSize: 18,
    alignSelf: "flex-end",
    flex: 1,
    marginRight: 10,
    textAlign: "right",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  expandedContent: {
    marginTop: 10,
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  listDescription: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
    textAlign: "right",
    width: "100%",
  },
  interactions: {
    gap: 15,
    marginTop: 10,
    textAlign: "right",
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  commentsSection: {
    marginTop: 10,
    gap: 5,
    alignItems: "flex-end",
    width: "100%",
    flexDirection: "column",
  },
  commentInputContainer: {
    marginTop: 10,
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white",
    width: "100%",
    borderRadius: 8,
  },
  commentInput: {
    color: "black",
    textAlign: "right",
  },
  modalOverlay: {
    height: "150%",
    width: "100%",
    marginBottom: 100,
    paddingBottom: 100,
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: "white",
    marginBottom: 10,
    color: "white",
    textAlign: "right",
    paddingRight: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
});
