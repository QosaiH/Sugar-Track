import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";

const LINKS = [
  {
    label: "עמוד זכויות משרד הבריאות",
    url: "https://www.health.gov.il/Subjects/chronic_diseases/diabetes/Pages/default.aspx",
  },
  {
    label: "עמותת סוכרת ישראל",
    url: "https://www.diabetes.org.il/",
  },
  {
    label: "מידע למעסיקים על זכויות חולי סוכרת",
    url: "https://www.gov.il/he/departments/publications/guides/diabetes_rights_employment",
  },
];

export default function DiabetesRights() {
  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("לא ניתן לפתוח את הקישור: " + url);
    }
  };

  return (
    <ImageBackground
      source={require("../Images/Vector.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>זכויות חולי סוכרת</Text>

        <Text style={styles.welcome}>
          אנחנו כאן כדי לתמוך בך. הכירו את הזכויות שלכם, והרגישו בטוחים ומעודכנים.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>הכרה ומודעות</Text>
          <Text style={styles.paragraph}>
            חולי סוכרת זכאים להכרה מלאה במצבם הרפואי ולקבלת תמיכה מספקי שירותי הבריאות, בתי הספר ומקומות העבודה.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>סיוע במקום העבודה</Text>
          <Text style={styles.paragraph}>
            ניתן לקבל סיוע כגון הפסקות למעקב מדדים, גישה למזון מתאים, וסביבה תומכת למניעת סיבוכים.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>זכויות רפואיות</Text>
          <Text style={styles.paragraph}>
            זכאים לקבל תרופות, טיפולים וייעוץ חינם או במחירים מופחתים, בתמיכה ממוסדות ממשלתיים ועמותות.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>חינוך והסברה</Text>
          <Text style={styles.paragraph}>
            קבלת מידע עדכני, הדרכה והכוונה לגבי ניהול המחלה ותחזוקה בריאה.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ליווי ותמיכה חברתית</Text>
          <Text style={styles.paragraph}>
            תמיכה ממשפחה, חברים וקהילה מסייעת לשיפור איכות החיים ולהתמודדות עם האתגרים היומיומיים.
          </Text>
        </View>

        <Text style={styles.linksTitle}>קישורים חשובים</Text>
        {LINKS.map(({ label, url }) => (
          <TouchableOpacity
            key={url}
            onPress={() => openLink(url)}
            style={styles.linkButton}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>{label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          זכויות אלו הן חלק מההתייחסות ההומנית והמקצועית אליך. אתה לא לבד!
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0a74da",
    textAlign: "right",
    marginBottom: 16,
    textShadowColor: "rgba(236, 231, 231, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    color:"white",
  },
  welcome: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
    textAlign: "right",
    fontWeight: "600",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a74da",
    marginBottom: 8,
    textAlign: "right",
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "right",
  },
  linksTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0a74da",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "right",
  },
  linkButton: {
    backgroundColor: "#0a74da",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  linkText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
  },
});
