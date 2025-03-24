import View, { StyleSheet } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Chat from "./Chat";
import HomePage from "./Home";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Statics from "./Statics";
import Forum from "./Forum";
import Menu from "./Menu";
import Header from "./Header";

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  return (
    <>
      <Header />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "דף הבית") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "צ'אט") {
              iconName = focused ? "chat" : "chat-outline";
            } else if (route.name === "פורום") {
              iconName = focused ? "forum" : "forum-outline";
            } else if (route.name === "סטטיסטיקה") {
              iconName = focused ? "chart-box" : "chart-box-outline";
            } else if (route.name === "תפריט") {
              iconName = focused ? "menu" : "menu";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          // Custom styles for the tab bar
          tabBarStyle: {
            backgroundColor: "transparent", // Transparent background
            position: "absolute", // Optional: floats the tab bar
            borderTopWidth: 0, // Removes border
            elevation: 0, // Android shadow gone
            shadowOpacity: 0, // iOS shadow gone
            width: "100%", // Full width
            height: 60, // Adjust height
          },

          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "white",
          headerShown: false, // Hide header if not needed
        })}>
        <Tab.Screen name="צ'אט" component={Chat} />
        <Tab.Screen name="פורום" component={Forum} />
        <Tab.Screen name="דף הבית" component={HomePage} />
        <Tab.Screen name="סטטיסטיקה" component={Statics} />
        <Tab.Screen name="תפריט" component={Menu} />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  // You can remove this if it's not used elsewhere
});
