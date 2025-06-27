import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { mean, std } from "mathjs";
import { mean, standardDeviation } from "simple-statistics";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 60, 255, ${opacity})`,
  labelColor: () => "#003cff",
  style: { borderRadius: 16 },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#003cff",
  },
};

const hebrewDays = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const hebrewMonths = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

const Statics = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedTab, setSelectedTab] = useState("חודשי");
  const [logDetails, setLogDetails] = useState(null);
  const [average, setAverage] = useState(null);
  const [stdDeviation, setStdDeviation] = useState(null);
  const [trend, setTrend] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showChart, setShowChart] = useState(true);

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
          weekAgo.setDate(now.getDate() - 6);
          return logDate >= weekAgo;
        default:
          return true;
      }
    });
  };

  const generateLabels = (filtered) => {
    if (selectedTab === "שנתי") {
      return hebrewMonths;
    }

    if (selectedTab === "שבועי") {
      const now = new Date();
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        labels.push(hebrewDays[day.getDay()]);
      }
      return labels;
    }

    if (selectedTab === "חודשי") {
      const grouped = {};
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        const day = date.getDate();
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(log.logValue);
      });
      return Object.keys(grouped).map((d) => d);
    }

    return [];
  };

  const generateValues = (filtered) => {
    if (selectedTab === "שנתי") {
      const monthly = Array(12)
        .fill()
        .map(() => []);
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        monthly[date.getMonth()].push(log.logValue);
      });
      return monthly.map((m) => (m.length ? mean(m) : 0));
    }

    if (selectedTab === "שבועי") {
      const daily = Array(7)
        .fill()
        .map(() => []);
      const now = new Date();
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          daily[6 - diff].push(log.logValue);
        }
      });
      return daily.map((d) => (d.length ? mean(d) : 0));
    }

    if (selectedTab === "חודשי") {
      const grouped = {};
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        const day = date.getDate();
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(log.logValue);
      });
      return Object.values(grouped).map((group) => mean(group));
    }

    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        const response = await fetch(
          `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/GlucoseLogs/${user.id}`
        );
        let data = await response.json();
        let filtered = filterData(data);

        filtered.sort(
          (a, b) =>
            new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
        );

        const values = generateValues(filtered);
        const labels = generateLabels(filtered);

        setAverage(values.length ? mean(values).toFixed(1) : null);
        setStdDeviation(
          values.length ? standardDeviation(values).toFixed(1) : null
        );

        if (values.length >= 2) {
          const diff = values[values.length - 1] - values[values.length - 2];
          setTrend(diff > 0 ? "עלייה" : diff < 0 ? "ירידה" : "יציב");
        } else {
          setTrend(null);
        }

        setChartData({
          labels,
          datasets: [
            {
              data: values,
              onDataPointClick: ({ index }) => {
                if (filtered[index]) {
                  const log = filtered[index];
                  const date = new Date(log.logDate);
                  setLogDetails({
                    value: log.logValue,
                    date: `${date.getDate()}/${
                      date.getMonth() + 1
                    }/${date.getFullYear()}`,
                    type: log.logType,
                    status: log.logStatus,
                  });
                }
              },
            },
          ],
        });

        setLogs(filtered);
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
      resizeMode="cover">
      <TouchableOpacity
        onPress={() => {
          setShowChart(!showChart);
          setLogDetails(null);
        }}
        style={styles.iconToggle}>
        <Text style={styles.iconText}>{showChart ? "📃" : "📈"}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>ההתקדמות שלי</Text>

        <View style={styles.tabs}>
          {["שנתי", "חודשי", "שבועי"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => {
                setSelectedTab(tab);
                setLogDetails(null);
              }}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData.datasets[0].data.length > 0 ? (
          <>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>ממוצע: {average} mg/dL</Text>
              <Text style={styles.summaryText}>סטיית תקן: {stdDeviation}</Text>
              <Text style={styles.summaryText}>מגמה: {trend}</Text>
            </View>

            {showChart ? (
              <View style={styles.chartWrapper}>
                <LineChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={250}
                  chartConfig={chartConfig}
                  bezier
                  withInnerLines={false}
                  withOuterLines={false}
                  fromZero
                  style={styles.chart}
                />
              </View>
            ) : (
              <View style={styles.logsList}>
                {logs.map((log, index) => {
                  const date = new Date(log.logDate);
                  return (
                    <View key={index} style={styles.logItem}>
                      <Text style={styles.logText}>
                        תאריך: {date.getDate()}/{date.getMonth() + 1}/
                        {date.getFullYear()}
                      </Text>
                      <Text style={styles.logText}>
                        ערך: {log.logValue} mg/dL
                      </Text>
                      <Text style={styles.logText}>סוג: {log.logType}</Text>
                      <Text style={styles.logText}>מצב: {log.logStatus}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {logDetails && showChart && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>תאריך: {logDetails.date}</Text>
                <Text style={styles.tooltipText}>
                  ערך: {logDetails.value} mg/dL
                </Text>
                <Text style={styles.tooltipText}>
                  סוג מדידה: {logDetails.type}
                </Text>
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
    height: "100%",
    width: "100%",
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  container: {
    padding: 10,
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 24,
  },
  tabs: {
    flexDirection: "row-reverse",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeTab: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tabText: {
    fontSize: 14,
    color: "white",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  chartWrapper: {
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  tooltip: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  tooltipText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
    textAlign: "right",
  },
  summaryBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
  summaryText: {
    fontSize: 16,
    color: "#003cff",
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "right",
  },
  loading: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 30,
  },
  logsList: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  logItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  logText: {
    fontSize: 15,
    textAlign: "right",
    color: "#333",
    marginBottom: 4,
  },
  iconToggle: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  iconText: {
    fontSize: 18,
  },
});

export default Statics;
