import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../fireBaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function AdminHome() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reportList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportText}>
        community ID: {item.communityId || 1}
      </Text>
      <Text style={styles.reportText}>Message ID: {item.messageId}</Text>
      <Text style={styles.reportText}>
        Reported By user ID: {item.reportedBy}
      </Text>
      <Text style={styles.reportText}>Message Sender ID: {item.senderId}</Text>
      <Text style={styles.reportText}>Message: {item.text}</Text>
      <Text style={styles.reportText}>
        Reported at: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover">
        <View>
          <Text style={styles.color}>Admin Home</Text>
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  color: {
    color: "white",
    fontSize: 18,
    padding: 10,
  },
  reportItem: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 10,
    padding: 15,
    borderRadius: 5,
    width: "90%",
  },
  reportText: {
    color: "black",
    fontSize: 14,
  },
});
