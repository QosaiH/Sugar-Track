import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const LOG_TYPES = [
  { label: "בצום", value: "בצום" },
  { label: "אחרי אוכל", value: "אחרי אוכל" },
  { label: "אחרי אוכל לפני 4שעות", value: "אחרי אוכל לפני 4שעות" },
];

export default function GlucoseLog() {
  const { user } = useLocalSearchParams();

  let userData = {};
  try {
    userData = user ? JSON.parse(user) : {};
  } catch {
    userData = {};
  }

  const [value, setValue] = useState("");
  const [logType, setLogType] = useState("בצום");
  const [modalVisible, setModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  const determineLogStatus = (val, type) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "לא חוקי";

    switch (type) {
      case "בצום":
        if (num < 70) return "נמוך מאוד";
        if (num < 80) return "נמוך";
        if (num <= 100) return "סביר";
        if (num <= 125) return "גבוה";
        return "גבוה מאוד";
      case "אחרי אוכל":
        if (num < 90) return "נמוך מאוד";
        if (num < 100) return "נמוך";
        if (num <= 140) return "סביר";
        if (num <= 180) return "גבוה";
        return "גבוה מאוד";
      case "אחרי אוכל לפני 4שעות":
        if (num < 80) return "נמוך מאוד";
        if (num < 90) return "נמוך";
        if (num <= 120) return "סביר";
        if (num <= 160) return "גבוה";
        return "גבוה מאוד";
      default:
        return "סביר";
    }
  };

  const getCoinChangeByStatus = (status) => {
    switch (status) {
      case "סביר":
        return 10;
      case "נמוך":
      case "נמוך מאוד":
        return 5;
      case "גבוה":
        return -5;
      case "גבוה מאוד":
        return -10;
      default:
        return 0;
    }
  };

  const updateUserCoins = async (newCoinValue) => {
    try {
      const response = await fetch(
        `https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/coins/${userData.id}?coins=${newCoinValue}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coins: newCoinValue }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update coins");
      }
    } catch (error) {
      console.error("Coin update error:", error);
    }
  };

  const handleSubmit = async () => {
    const trimmedValue = value.trim();

    if (!trimmedValue || isNaN(trimmedValue)) {
      Alert.alert("שגיאה", "אנא הזן ערך גלוקוז חוקי (מספר)");
      return;
    }

    const logStatus = determineLogStatus(trimmedValue, logType);
    const coinChange = getCoinChangeByStatus(logStatus);
    const newCoinValue = (userData.coins || 0) + coinChange;

    const log = {
      userId: userData?.id,
      logValue: parseFloat(trimmedValue),
      logType,
      logStatus,
      logDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        "https://proj.ruppin.ac.il/igroup15/test2/tar1/api/GlucoseLogs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(log),
        }
      );

      if (response.ok) {
        // Update user coins
        await updateUserCoins(newCoinValue);

        // Update local userData coins
        userData.coins = newCoinValue;

        setStatusMessage(
          `נרשם ערך: ${trimmedValue} מ"ג/ד"ל\nסטטוס: ${logStatus}\nמטבעות: ${coinChange > 0 ? "+" : ""}${coinChange}`
        );
        setModalVisible(true);
        setValue("");
      } else {
        Alert.alert("שגיאה", "אירעה שגיאה בעת שמירת הערך");
      }
    } catch (error) {
      Alert.alert("שגיאה", "בעיה בחיבור לשרת");
      console.error(error);
    }
  };

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>הזן את ערך הסוכר שלך:</Text>

        <TextInput
          style={styles.largeInput}
          keyboardType="numeric"
          placeholder="הכנס ערך מ״ג/ד״ל"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={value}
          onChangeText={setValue}
          textAlign="center"
          selectionColor="#fff"
          cursorColor="#fff"
        />

        <Text style={styles.label}>מתי נמדד הערך?</Text>

        <View style={styles.radioGroup}>
          {LOG_TYPES.map((type) => {
            const selected = logType === type.value;
            return (
              <TouchableOpacity
                key={type.value}
                style={styles.radioContainer}
                onPress={() => setLogType(type.value)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioOuterSelected,
                  ]}
                >
                  {selected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    selected && styles.radioLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>הזנה</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            router.push("/BottomNav");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/BottomNav");
                }}
              >
                <Text style={styles.modalCloseText}>✖</Text>
              </TouchableOpacity>
              <Text style={styles.modalText}>{statusMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/BottomNav");
                }}
              >
                <Text style={styles.modalButtonText}>סיום</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginTop: 10,
    width: "90%",
    backgroundColor: "transparent",
    padding: 24,
    borderRadius: 18,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    color: "white",
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 28,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "white",
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "white",
    textAlign: "right",
    writingDirection: "rtl",
  },
  radioGroup: {
    marginTop: 20,
    marginBottom: 30,
  },
  radioContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "flex-start",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#4A90E2",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90E2",
  },
  radioLabel: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    textAlign: "right",
    writingDirection: "rtl",
  },
  radioLabelSelected: {
    color: "#4A90E2",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 18,
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalCloseText: {
    fontSize: 24,
    fontWeight: "700",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
