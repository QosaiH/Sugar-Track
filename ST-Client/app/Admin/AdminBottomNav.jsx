import { View, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import AdminHome from "./AdminHome";
import Users from "./Users";
import AdminChats from "./AdminChats";
import Menu from "./Menu";
import Header from "./Header";

const Tab = createBottomTabNavigator();

export default function AdminBottomNav() {
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
    getData();
  }, []);
  const storeData = async (data) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(data)); // Store user data
      console.log("User role:", data.role);
      if (data.role?.toLowerCase() === "admin") {
        router.replace("./Admin/AdminBottomNav");
      } else {
        router.replace("/BottomNav");
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <SafeAreaProvider>
      <Header />

      <Tab.Navigator
        initialRouteName="AdminHome"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case "Users":
                iconName = focused ? "account-group" : "account-group-outline";
                break;
              case "AdminHome":
                iconName = focused
                  ? "view-dashboard"
                  : "view-dashboard-outline";
                break;
              case "AdminChats":
                iconName = focused ? "chat" : "chat-outline";
                break;
              case "Menu":
                iconName = "menu";
                break;
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
        <Tab.Screen name="Users">
          {() => <Users userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="AdminHome">
          {() => <AdminHome userData={userData} />}
        </Tab.Screen>
        <Tab.Screen name="AdminChats">
          {() => <AdminChats userData={userData} />}
        </Tab.Screen>
        <Tab.Screen
          name="Menu"
          component={() => null}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setDrawerVisible(true);
            },
          }}
        />
      </Tab.Navigator>

      <Menu isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
