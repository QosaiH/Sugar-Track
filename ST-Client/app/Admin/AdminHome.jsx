import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../fireBaseConfig";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("alerts");

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.background}
        source={require("../../Images/Vector.png")}
        resizeMode="cover">
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "alerts" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("alerts")}>
            <Text style={styles.tabText}>התראות חריגות</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "reports" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("reports")}>
            <Text style={styles.tabText}>דיווחים</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === "alerts" ? <Alerts /> : <Reports />}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [userMap, setUserMap] = useState({});
  const [communityMap, setCommunityMap] = useState({});

  useEffect(() => {
    // נטען את כל המשתמשים
    const loadUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const users = {};
        querySnapshot.forEach((doc) => {
          users[doc.id] =
            doc.data().fullName || doc.data().name || "שם לא ידוע";
        });
        setUserMap(users);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    const loadCommunities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "community"));
        const communities = {};
        querySnapshot.forEach((doc) => {
          communities[doc.id] = doc.data().name || "קהילה לא ידועה";
        });
        setCommunityMap(communities);
      } catch (error) {
        console.error("Failed to load communities:", error);
      }
    };

    // נטען הכל במקביל
    const loadData = async () => {
      await Promise.all([loadUsers(), loadCommunities()]);

      const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
        const reportList = snapshot.docs.map((docSnap) => {
          const reportData = docSnap.data();
          return {
            id: docSnap.id,
            ...reportData,
          };
        });
        setReports(reportList);
        setFilteredReports(reportList);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = loadData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const query = text.toLowerCase();
    const filtered = reports.filter(
      (report) =>
        // Search by reporter name or ID
        `${userMap[report.reportedBy]} (${report.reportedBy})`
          .toLowerCase()
          .includes(query) ||
        // Search by community name or ID
        `${communityMap[report.communityId]} (${report.communityId})`
          .toLowerCase()
          .includes(query) ||
        // Search by sender name or ID
        `${userMap[report.senderId]} (${report.senderId})`
          .toLowerCase()
          .includes(query) ||
        // Search by message content
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

    // Get user and community names/IDs
    const reporterName = userMap[item.reportedBy] || "לא ידוע";
    const senderName = userMap[item.senderId] || "לא ידוע";
    const communityName = communityMap[item.communityId] || "לא ידוע";

    return (
      <View style={styles.rowWrapper}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => toggleExpand(item.id)}
          accessibilityLabel={`פרטים נוספים עבור דיווח ${item.id}`}
          activeOpacity={0.7}>
          {/* Reporter */}
          <Text style={styles.cell}>
            {`${reporterName} (${item.reportedBy})`}
          </Text>
          {/* Community */}
          <Text style={styles.cell}>
            {`${communityName} (${item.communityId})`}
          </Text>
          {/* Expand/Collapse Indicator */}
          <Text style={styles.expandText}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.dropdown}>
            {/* Sender Details */}
            <Text style={styles.detailText}>
              שולח ההודעה: {`${senderName} (${item.senderId})`}
            </Text>
            {/* Message Content */}
            <Text style={styles.detailText}>תוכן ההודעה: {item.text}</Text>
            {/* Timestamp */}
            <Text style={styles.detailText}>
              זמן הדיווח:{" "}
              {item.timestamp
                ? (typeof item.timestamp.toDate === "function"
                    ? item.timestamp.toDate()
                    : new Date(item.timestamp)
                  ).toLocaleString()
                : "אין תאריך"}
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
        resizeMode="cover">
        <Text style={styles.header}>ניהול דיווחים</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש לפי מזהה, שם או תוכן"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 30 }}
          />
        ) : filteredReports.length === 0 ? (
          <Text style={styles.noReports}>אין דיווחים התואמים לחיפוש.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>מזהה ושם מדווח</Text>
              <Text style={styles.headerCell}>מזהה ושם קהילה</Text>
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
export function Alerts() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [userMap, setUserMap] = useState({});
  const [communityMap, setCommunityMap] = useState({});

  useEffect(() => {
    // נטען את כל המשתמשים
    const loadUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const users = {};
        querySnapshot.forEach((doc) => {
          users[doc.id] =
            doc.data().fullName || doc.data().name || "שם לא ידוע";
        });
        setUserMap(users);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    // נטען הכל במקביל
    const loadData = async () => {
      await Promise.all([loadUsers()]);

      const unsubscribe = onSnapshot(collection(db, "alerts"), (snapshot) => {
        const reportList = snapshot.docs.map((docSnap) => {
          const reportData = docSnap.data();
          return {
            id: docSnap.id,
            ...reportData,
          };
        });
        setReports(reportList);
        setFilteredReports(reportList);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = loadData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const query = text.toLowerCase();
    const filtered = reports.filter((report) =>
      // Search by reporter name or ID
      `${userMap[report.userID]} (${report.userID})`
        .toLowerCase()
        .includes(query)
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

    // Get user and community names/IDs
    const senderName = userMap[item.userId] || "לא ידוע";
    const AlertFor = userMap[item.analyzedSentiment] || "לא ידוע";
    console.log(item);
    return (
      <View style={styles.rowWrapper}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => toggleExpand(item.id)}
          accessibilityLabel={`פרטים נוספים עבור דיווח ${item.id}`}
          activeOpacity={0.7}>
          {/* sender */}
          <Text style={styles.cell}>{`${senderName} (${item.userId})`}</Text>
          {/* Expand/Collapse Indicator */}
          <Text style={styles.expandText}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.dropdown}>
            {/* Sender Details */}
            <Text style={styles.detailText}>
              שולח ההודעה: {`${senderName} (${item.userId})`}
            </Text>
            {/* Message Content */}
            <Text style={styles.detailText}>תוכן ההודעה: {item.text}</Text>
            {/* Alert For */}
            <Text style={styles.detailText}>
              התראה עבור: {item.analyzedSentiment.substring(9).trim()}
            </Text>
            {/* Timestamp */}

            <Text style={styles.detailText}>
              זמן הדיווח:{" "}
              {item.timestamp
                ? (typeof item.timestamp.toDate === "function"
                    ? item.timestamp.toDate()
                    : new Date(item.timestamp)
                  ).toLocaleString()
                : "אין תאריך"}
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
        resizeMode="cover">
        <Text style={styles.header}>ניהול התראות חריגות</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש לפי מזהה, שם או תוכן"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 30 }}
          />
        ) : filteredReports.length === 0 ? (
          <Text style={styles.noReports}>אין דיווחים התואמים לחיפוש.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>מזהה ושם משתמש</Text>
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
  container: { flex: 1, width: "100%" },
  background: {
    flex: 1,
    width: "100%",
  },
  tabContainer: {
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "center",
    gap: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeTab: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
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
    width: "90%",
    alignSelf: "center",
    height: 50,
  },
  listContainer: {
    width: "100%",
    paddingBottom: 20,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
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
    width: "100%",
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
    marginBottom: 50,
  },
  detailText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "right",
    marginBottom: 5,
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
    marginTop: 12,
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
