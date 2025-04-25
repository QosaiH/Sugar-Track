import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity, // Import TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../fireBaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminHome() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reportList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportList);
      setFilteredReports(reportList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const query = text.toLowerCase();
    const filtered = reports.filter((report) =>
      (report.communityId || "").toLowerCase().includes(query) ||
      (report.messageId || "").toLowerCase().includes(query) ||
      (report.text || "").toLowerCase().includes(query)
    );
    setFilteredReports(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderReportItem = ({ item }) => {
    const isExpanded = expandedRows[item.id];

    return (
      <View style={styles.rowWrapper}>
        <TouchableOpacity 
          style={styles.row} 
          onPress={() => toggleExpand(item.id)} // Change onTouchEnd to onPress
          activeOpacity={0.7} // Add an active opacity effect when touched
        >
          <Text style={styles.cell}>{item.reportedBy}</Text>
          <Text style={styles.cell}>{item.communityId || "לא זמין"}</Text>
          <Text style={styles.expandText}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.dropdown}>
            <Text style={styles.detailText}>מזהה הודעה: {item.messageId}</Text>
            <Text style={styles.detailText}>שולח ההודעה: {item.senderId}</Text>
            <Text style={styles.detailText}>תוכן ההודעה: {item.text}</Text>
            <Text style={styles.detailText}>
              זמן הדיווח: {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover"
      >
        <Text style={styles.header}>ניהול דיווחים</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש לפי מזהה או תוכן"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />
        ) : filteredReports.length === 0 ? (
          <Text style={styles.noReports}>אין דיווחים התואמים לחיפוש.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>מזהה מדווח</Text>
              <Text style={styles.headerCell}>מזהה קהילה</Text>
              <Text style={styles.headerCell}>פרטים</Text>
            </View>
            <FlatList
              data={filteredReports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  },
  listContainer: {
    paddingBottom: 50,
  },
  rowWrapper: {
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "white",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  expandText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  dropdown: {
    padding: 10,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  detailText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
    textAlign: "right",
  },
  noReports: {
    fontSize: 18,
    color: "#fff",
    marginTop: 30,
    textAlign: "center",
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: "white",
  },
  headerCell: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
