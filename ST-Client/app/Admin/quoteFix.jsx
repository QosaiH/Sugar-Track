import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function QuoteFix() {
  const router = useRouter();

  const [quote, setQuote] = useState({
    text: "הדרך הטובה ביותר לחזות את העתיד היא להמציא אותו.",
    author: "- פיטר דרוקר",
  });

  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputAuthor, setInputAuthor] = useState("");

  // אנימציית לחיצה לכפתורים
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const storedQuote = await AsyncStorage.getItem("homeQuote");
        if (storedQuote) {
          setQuote(JSON.parse(storedQuote));
        }
      } catch (error) {
        console.error("Error loading quote:", error);
      }
    };
    loadQuote();
  }, []);

  const startEdit = () => {
    setInputText(quote.text);
    setInputAuthor(quote.author);
    setEditing(true);
  };

  const saveQuote = async () => {
    if (!inputText.trim()) {
      Alert.alert("שגיאה", "הציטוט לא יכול להיות ריק");
      return;
    }
    try {
      const newQuote = { text: inputText.trim(), author: inputAuthor.trim() || "-" };
      await AsyncStorage.setItem("homeQuote", JSON.stringify(newQuote));
      setQuote(newQuote);
      setEditing(false);
      Alert.alert("הצלחה", "הציטוט עודכן");
    } catch (error) {
      Alert.alert("שגיאה", "שגיאה בשמירת הציטוט");
    }
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require("../../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
              <Text style={styles.backButtonText}>חזרה</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>עריכת ציטוט</Text>
            <View style={{ width: 70 }} />
          </View>

          {!editing ? (
            <>
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                <Text style={styles.quoteAuthor}>{quote.author}</Text>
              </View>

              <AnimatedTouchable
                onPress={startEdit}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={[styles.editButton, { transform: [{ scale: scaleAnim }] }]}
              >
                <Text style={styles.editButtonText}>ערוך ציטוט</Text>
              </AnimatedTouchable>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, styles.inputLarge]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="ציטוט"
                placeholderTextColor="#ccc"
                multiline
                textAlignVertical="top"
                autoFocus
              />
              <TextInput
                style={styles.input}
                value={inputAuthor}
                onChangeText={setInputAuthor}
                placeholder="מחבר (אופציונלי)"
                placeholderTextColor="#ccc"
              />
              <View style={styles.buttonRow}>
                <AnimatedTouchable
                  style={[styles.button, styles.cancelButton]}
                  onPress={cancelEdit}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Text style={styles.buttonText}>בטל</Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  style={[styles.button, styles.saveButton]}
                  onPress={saveQuote}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Text style={styles.buttonText}>שמור</Text>
                </AnimatedTouchable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  backButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  quoteBox: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 18,
    padding: 25,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  quoteText: {
    fontSize: 23,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 14,
    color: "white",
    lineHeight: 32,
  },
  quoteAuthor: {
    fontSize: 17,
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
  },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  editButtonText: {
    color: "#333",
    fontSize: 19,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 18,
    color: "#222",
  },
  inputLarge: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 100, 100, 0.9)",
  },
  saveButton: {
    backgroundColor: "rgba(79, 172, 254, 0.9)",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
  },
});
