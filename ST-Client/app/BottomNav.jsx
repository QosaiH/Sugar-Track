import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Chat from "./Chat";
import HomePage from "./Home";
import Statics from "./Statics";
import Forum from "./Forum";
import Menu from "./Menu"; // Import modal
import Header from "./Header";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data !== null) {
          setUserData(JSON.parse(data));
        } else {
          console.log("No user data found");
        }
      } catch (e) {
        console.error("Error retrieving user data:", e);
      }
    };

    const checkAndPromoteTopUsers = async () => {
      const today = new Date();
      const currentDate = today.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

      if (today.getDate() === 1) {
        try {
          const lastRun = await AsyncStorage.getItem("lastPromotionRun");

          if (lastRun !== currentDate) {
            const res = await fetch("https://proj.ruppin.ac.il/igroup15/test2/tar1/api/User/admin/promote", {
              method: "POST",
            });

            const text = await res.text();
            console.log("Promotion response:", text);

            await AsyncStorage.setItem("lastPromotionRun", currentDate);
          }
        } catch (e) {
          console.error("Error promoting top users:", e);
        }
      }
    };

    getData();
    checkAndPromoteTopUsers();
  }, []);

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
            marginBottom: Platform.OS === "ios" ? 30 : 0,
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "white",
          headerShown: false,
        })}
      >
        <Tab.Screen name="צ'אט">
          {() => <Chat userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="פורום">
          {() => <Forum userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="דף הבית">
          {() => <HomePage userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="סטטיסטיקה">
          {() => <Statics userData={userData} />}
        </Tab.Screen>

        {/* Fake screen for menu modal */}
        <Tab.Screen
          name="תפריט"
          component={() => null}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Prevent default navigation
              setDrawerVisible(true); // Open custom modal
            },
          }}
        />
      </Tab.Navigator>

      {/* Menu Modal */}
      <Menu isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
