import React from "react";
import { Text, View, Image, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function header() {
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.points}>
          0 <Icon name="star-outline" size={20} color="blue" />
        </Text>
        <Image style={styles.logo} source={require("../Images/logo.png")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 75,
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: Platform.OS === "ios" ? -35 : 0,
    paddingHorizontal: 10,
  },
  points: {
    color: "black",
    fontSize: 18,
  },
  logo: {
    marginTop: 2,
    width: 70,
    height: 70,
  },
});
