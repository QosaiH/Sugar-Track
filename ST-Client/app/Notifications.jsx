import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
} from "react-native";
import { db } from "../fireBaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

export default function Notifications(props) {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(props.userId || null);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function fetchUserId() {
      let id = props.userId;
      if (!id && params.userId) id = params.userId;
      if (!id) {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            id = userObj.id;
          } catch {}
        }
      }
      setUserId(id);
    }
    fetchUserId();
  }, [props.userId, params.userId]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(
        notifs.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      );
    });
    return () => unsubscribe();
  }, [userId]);

  const handleNotificationPress = async (notif) => {
    if (notif && notif.id) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
    // No navigation
  };

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 28, color: "#007AFF" }}>
            {Platform.OS === "ios" ? "←" : "\u2190"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.header}>התראות</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                item.read ? styles.cardRead : styles.cardUnread,
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text
                    style={{
                      fontSize: 28,
                      color: item.read ? "#888" : "#007AFF",
                    }}
                  >
                    💬
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: item.read ? "#888" : "#007AFF",
                      }}
                    >
                      {item.commenterName}
                    </Text>
                    {" הגיב/ה על השאלה שלך"}
                  </Text>
                  <Text style={styles.cardTime}>
                    {item.timestamp.seconds
                      ? new Date(item.timestamp.seconds * 1000).toLocaleString(
                          "he-IL"
                        )
                      : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardComment}>"{item.commentText}"</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backArrow: {
    position: "absolute",
    left: 18,
    top: 18,
    zIndex: 10,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  background: {
    flex: 1,
    width: "100%",
    height: Platform.OS === "ios" ? "120%" : "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#007AFF",
    textAlign: "right",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 18,
    padding: 0,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e3f2fd",
    overflow: "hidden",
  },
  cardUnread: {
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.22,
    elevation: 8,
    transform: [{ scale: 1.03 }],
  },
  cardRead: {
    backgroundColor: "#f7f7f7",
    borderColor: "#e0e0e0",
    shadowColor: "#888",
    shadowOpacity: 0.08,
    elevation: 2,
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e3f2fd",
    backgroundColor: "#e3f2fd",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 17,
    color: "#222",
    textAlign: "right",
    marginBottom: 2,
    lineHeight: 22,
  },
  cardTime: {
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    marginTop: 2,
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e3f2fd",
  },
  cardComment: {
    fontSize: 16,
    color: "#222",
    textAlign: "right",
    lineHeight: 22,
  },
});
