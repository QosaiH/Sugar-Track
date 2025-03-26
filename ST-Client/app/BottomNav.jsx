import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Chat from "./Chat";
import HomePage from "./Home";
import Statics from "./Statics";
import Forum from "./Forum";
import Menu from "./Menu"; // Import modal
import Header from "./Header";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaProvider>
      <Header />
      <Tab.Navigator
        initialRouteName="דף הבית"
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
          tabBarStyle: {
            backgroundColor: "transparent",
            position: "absolute",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            width: "100%",
            height: 60,
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "white",
          headerShown: false,
        })}>
        <Tab.Screen name="צ'אט" component={Chat} />
        <Tab.Screen name="פורום" component={Forum} />
        <Tab.Screen name="דף הבית" component={HomePage} />
        <Tab.Screen name="סטטיסטיקה" component={Statics} />

        {/* Fake screen for "תפריט" that triggers the modal */}
        <Tab.Screen
          name="תפריט"
          component={() => null}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Stop navigation
              setDrawerVisible(true); // Open modal
            },
          }}
        />
      </Tab.Navigator>

      {/* Custom Modal */}
      <Menu isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
