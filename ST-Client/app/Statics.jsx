import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#d0e2ff",
  backgroundGradientTo: "#a1c9ff",
  color: (opacity = 1) => `rgba(0, 60, 255, ${opacity})`,
  labelColor: () => "transparent",
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#003cff",
  },
};

const Statics = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedTab, setSelectedTab] = useState("חודשי");
  const [logDetails, setLogDetails] = useState(null);

  const filterData = (data) => {
    const now = new Date();
    return data.filter((log) => {
      const logDate = new Date(log.logDate);
      switch (selectedTab) {
        case "שנתי":
          return logDate.getFullYear() === now.getFullYear();
        case "חודשי":
          return (
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear()
          );
        case "שבועי":
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return logDate >= weekAgo;
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        const response = await fetch(
          `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/GlucoseLogs/${user.id}`
        );
        const data = await response.json();
        const filtered = filterData(data);

        const labels = filtered.map((log) => {
          const date = new Date(log.logDate);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const values = filtered.map((log) => log.logValue);

        setChartData({
          labels,
          datasets: [
            {
              data: values,
              onDataPointClick: ({ index }) => {
                const log = filtered[index];
                const date = new Date(log.logDate);
                setLogDetails({
                  value: log.logValue,
                  date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                  type: log.logType,
                  status: log.logStatus,
                });
              },
            },
          ],
        });
      } catch (error) {
        console.error("שגיאה בטעינת הנתונים:", error);
      }
    };

    fetchData();
  }, [selectedTab]);

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>ההתקדמות שלי</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["שנתי", "חודשי", "שבועי"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab,
              ]}
              onPress={() => {
                setSelectedTab(tab);
                setLogDetails(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData.datasets[0].data.length > 0 ? (
          <>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={240}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              fromZero
              style={styles.chart}
            />
            {logDetails && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>תאריך: {logDetails.date}</Text>
                <Text style={styles.tooltipText}>ערך: {logDetails.value} mg/dL</Text>
                <Text style={styles.tooltipText}>סוג מדידה: {logDetails.type}</Text>
                <Text style={styles.tooltipText}>מצב: {logDetails.status}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.loading}>אין נתונים להצגה</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
  },
  container: {
    paddingTop: 60,
    flex:1,
    paddingBottom: 100,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003cff",
    marginBottom: 16,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginVertical: 20,
  },
  loading: {
    marginTop: 30,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#003cff",
  },
  activeTab: {
    backgroundColor: "#003cff",
  },
  tabText: {
    fontSize: 16,
    color: "#003cff",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tooltip: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  tooltipText: {
    fontSize: 16,
    color: "#003cff",
    marginBottom: 4,
  },
});

export default Statics;
