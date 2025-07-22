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

// פונקציה לחישוב תאריך התחלה לפי טאב ו-offset (מספר תקופות לאחור/קדימה)
const getPeriodStartDate = (selectedTab, offset) => {
  const now = new Date();

  if (selectedTab === "שנתי") {
    return new Date(now.getFullYear() + offset, 0, 1);
  }

  if (selectedTab === "חודשי") {
    const totalMonths = now.getMonth() + offset;
    const year = now.getFullYear() + Math.floor(totalMonths / 12);
    const month = ((totalMonths % 12) + 12) % 12; // תיקון מודולו למקרה שלילי
    return new Date(year, month, 1);
  }

  if (selectedTab === "שבועי") {
    // שבוע מתחיל ביום ראשון
    const dayOfWeek = now.getDay(); // 0=ראשון
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek + offset * 7);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  }

  return now;
};

const Statics = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedTab, setSelectedTab] = useState("חודשי");
  const [periodOffset, setPeriodOffset] = useState(0);
  const [logDetails, setLogDetails] = useState(null);
  const [average, setAverage] = useState(null);
  const [stdDeviation, setStdDeviation] = useState(null);
  const [trend, setTrend] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showChart, setShowChart] = useState(true);

  const filterData = (data) => {
    const periodStart = getPeriodStartDate(selectedTab, periodOffset);
    let periodEnd;

    if (selectedTab === "שנתי") {
      periodEnd = new Date(periodStart.getFullYear() + 1, 0, 1);
    } else if (selectedTab === "חודשי") {
      periodEnd = new Date(
        periodStart.getFullYear(),
        periodStart.getMonth() + 1,
        1
      );
    } else if (selectedTab === "שבועי") {
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 7);
    } else {
      periodEnd = new Date();
    }

    return data.filter((log) => {
      const logDate = new Date(log.logDate);
      return logDate >= periodStart && logDate < periodEnd;
    });
  };

  const generateDataWithLabels = (filtered) => {
    if (selectedTab === "שנתי") {
      const monthly = Array(12)
        .fill()
        .map(() => []);
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        monthly[date.getMonth()].push(log.logValue);
      });
      const labels = [];
      const values = [];
      monthly.forEach((monthData, idx) => {
        if (monthData.length > 0) {
          labels.push(hebrewMonths[idx]);
          values.push(mean(monthData));
        }
      });
      return { labels, values };
    }

    if (selectedTab === "שבועי") {
      const daily = Array(7)
        .fill()
        .map(() => []);
      const startDate = getPeriodStartDate(selectedTab, periodOffset);
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          daily[diffDays].push(log.logValue);
        }
      });
      const labels = [];
      const values = [];
      for (let i = 0; i < 7; i++) {
        if (daily[i].length > 0) {
          const dayIndex = (startDate.getDay() + i) % 7;
          labels.push(hebrewDays[dayIndex]);
          values.push(mean(daily[i]));
        }
      }
      return { labels, values };
    }

    if (selectedTab === "חודשי") {
      const grouped = {};
      filtered.forEach((log) => {
        const date = new Date(log.logDate);
        const day = date.getDate();
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(log.logValue);
      });

      const sortedDays = Object.keys(grouped)
        .map((d) => parseInt(d))
        .sort((a, b) => a - b);

      const labels = [];
      const values = [];
      sortedDays.forEach((day) => {
        labels.push(day.toString());
        values.push(mean(grouped[day]));
      });
      return { labels, values };
    }

    return { labels: [], values: [] };
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

        const { labels, values } = generateDataWithLabels(filtered);

        const filteredValues = values.filter(
          (v) => v !== 0 && v !== null && v !== undefined
        );

        setAverage(
          filteredValues.length ? mean(filteredValues).toFixed(1) : null
        );
        setStdDeviation(
          filteredValues.length
            ? standardDeviation(filteredValues).toFixed(1)
            : null
        );

        if (filteredValues.length >= 2) {
          const diff =
            filteredValues[filteredValues.length - 1] -
            filteredValues[filteredValues.length - 2];
          setTrend(diff > 0 ? "עלייה" : diff < 0 ? "ירידה" : "יציב");
        } else {
          setTrend(null);
        }

        setChartData({
          labels,
          datasets: [
            {
              data: values,
            },
          ],
        });

        setLogs(filtered);
      } catch (error) {
        console.error("שגיאה בטעינת הנתונים:", error);
      }
    };

    fetchData();
  }, [selectedTab, periodOffset]);

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
                setPeriodOffset(0); // אפס את ה-offset כשמשנים טאב
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

        {/* חיצים לניווט תקופה */}
        <View style={styles.periodNavigation}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setPeriodOffset((prev) => prev - 1);
              setLogDetails(null);
            }}>
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>

          <Text style={styles.periodLabel}>
            {(() => {
              const start = getPeriodStartDate(selectedTab, periodOffset);
              if (selectedTab === "שנתי") return start.getFullYear();
              if (selectedTab === "חודשי")
                return `${
                  hebrewMonths[start.getMonth()]
                } ${start.getFullYear()}`;
              if (selectedTab === "שבועי") {
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                return `${start.getDate()}/${
                  start.getMonth() + 1
                } - ${end.getDate()}/${end.getMonth() + 1}`;
              }
              return "";
            })()}
          </Text>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setPeriodOffset((prev) => Math.min(prev + 1, 0));
              setLogDetails(null);
            }}
            disabled={periodOffset >= 0}>
            <Text
              style={[
                styles.arrowText,
                periodOffset >= 0 && styles.disabledArrow,
              ]}>
              ←
            </Text>
          </TouchableOpacity>
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
                  onDataPointClick={({ index }) => {
                    const log = logs[index];
                    if (log) {
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
                  }}
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
    marginBottom: 10,
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
  periodNavigation: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  arrowButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  arrowText: {
    fontSize: 28,
    color: "white",
  },
  disabledArrow: {
    color: "rgba(255,255,255,0.3)",
  },
  periodLabel: {
    fontSize: 16,
    color: "white",
    marginHorizontal: 12,
    minWidth: 140,
    textAlign: "center",
  },
  chartWrapper: {
    width: "100%",
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
